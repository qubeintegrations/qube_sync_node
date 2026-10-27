-- QuBe Sync's tables (qubesync/kit): your customers' connections, the runs your app starts, the
-- notifications each run's handler has taken, the QuickBooks ids your app learns, each sync's mark,
-- and any plain requests with the deliveries they've taken, each against its connection. Your own
-- tables need nothing. The same tables as qube_rails' migrations, so an app moving between the two
-- keeps its data.
--
-- PostgreSQL as written. For MySQL: `bigint NOT NULL AUTO_INCREMENT PRIMARY KEY` for each id,
-- `varchar(255)` where a column says `varchar` with no length, `datetime(6)` for `timestamp`, and
-- `ENGINE=InnoDB` (the foreign keys and row locks need it). For SQLite: `integer PRIMARY KEY
-- AUTOINCREMENT` for each id, and the rest as written (SQLite takes the types as affinities); turn
-- on `PRAGMA foreign_keys = ON` for the foreign keys, and expect one writer at a time in place of
-- row locks.
--
-- The polymorphic ids (owner_id, record_id) are strings, so integer and UUID keys both fit.
-- input (what the run was started with, so a start can be resent unchanged), error (a failed
-- run's, as its event carried it), question, links and a request's params are JSON kept as
-- text: JSON.stringify on the way in and JSON.parse on the way out, the same on every database,
-- since nothing queries inside them. The 100-character limits keep the composite indexes inside MySQL's 3072-byte key
-- limit under utf8mb4.
--
-- A store's locks (withRunLock, withConnectionLock, withRequestLock) are a row lock in a
-- transaction. On PostgreSQL take it with `SELECT ... FOR NO KEY UPDATE`: plain FOR UPDATE also
-- blocks the foreign-key check of a run or QuickBooks id inserted against that connection from
-- another transaction.

CREATE TABLE qube_connections (
  id bigserial PRIMARY KEY,
  owner_type varchar(100) NOT NULL,
  owner_id varchar NOT NULL,
  qube_id varchar,
  name varchar,
  status varchar NOT NULL DEFAULT 'pending',
  stall_reason varchar,
  revision integer,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);
CREATE UNIQUE INDEX index_qube_connections_on_qube_id ON qube_connections (qube_id);
CREATE INDEX index_qube_connections_on_owner ON qube_connections (owner_type, owner_id);

CREATE TABLE qube_runs (
  id bigserial PRIMARY KEY,
  connection_id bigint NOT NULL,
  operation varchar(100) NOT NULL,
  record_type varchar(100) NOT NULL,
  record_id varchar NOT NULL,
  reference varchar NOT NULL,
  qube_run_id varchar,
  input text,
  revision integer NOT NULL DEFAULT 0,
  state varchar NOT NULL DEFAULT 'starting',
  outcome varchar,
  error text,
  cancel_reason text,
  ended_at timestamp,
  question text,
  links text,
  run_url varchar,
  cancel_url varchar,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  CONSTRAINT fk_qube_runs_connection_id FOREIGN KEY (connection_id) REFERENCES qube_connections (id)
);
CREATE UNIQUE INDEX index_qube_runs_on_reference ON qube_runs (reference);
CREATE INDEX index_qube_runs_on_connection_id ON qube_runs (connection_id);
CREATE INDEX index_qube_runs_on_record_and_operation ON qube_runs (record_type, record_id, operation, created_at);
-- For sync status and its list-page conditions (needingAnswerSql, sendingSql).
CREATE INDEX index_qube_runs_on_connection_record_and_state ON qube_runs (connection_id, record_type, record_id, operation, state);

-- The notifications a run's handler has taken, by delivery_id, so a redelivery runs it once.
-- Written in the same transaction as the handler, and deleted with the run.
CREATE TABLE qube_notifications (
  id bigserial PRIMARY KEY,
  run_id bigint NOT NULL,
  delivery_id varchar(100) NOT NULL,
  created_at timestamp NOT NULL,
  CONSTRAINT fk_qube_notifications_run_id FOREIGN KEY (run_id) REFERENCES qube_runs (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX index_qube_notifications_on_run_and_delivery ON qube_notifications (run_id, delivery_id);

CREATE TABLE qube_quickbooks_records (
  id bigserial PRIMARY KEY,
  connection_id bigint NOT NULL,
  kind varchar(100) NOT NULL,
  list varchar(100) NOT NULL,
  qb_id varchar(100) NOT NULL,
  edit_sequence varchar,
  name varchar,
  record_type varchar(100),
  record_id varchar,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  CONSTRAINT fk_qube_quickbooks_records_connection_id FOREIGN KEY (connection_id) REFERENCES qube_connections (id)
);
-- A ListID is unique within its list family (familyFor), not within one kind: every item type
-- shares a counter, and so do customers, vendors, employees and other names.
CREATE UNIQUE INDEX index_qube_quickbooks_records_on_qb_id ON qube_quickbooks_records (connection_id, list, qb_id);
CREATE UNIQUE INDEX index_qube_quickbooks_records_on_record ON qube_quickbooks_records (connection_id, kind, record_type, record_id);
-- A record's links on a connection whatever their kind: sync status, inQuickbooksSql.
CREATE INDEX index_qube_quickbooks_records_on_connection_and_record ON qube_quickbooks_records (connection_id, record_type, record_id);

-- When each connection's last completed run of a workflow started: a sync's next since
-- (lastSyncedAt), kept apart from qube_runs so pruning runs never loses it.
CREATE TABLE qube_sync_marks (
  id bigserial PRIMARY KEY,
  connection_id bigint NOT NULL,
  workflow varchar(100) NOT NULL,
  started_at timestamp NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  CONSTRAINT fk_qube_sync_marks_connection_id FOREIGN KEY (connection_id) REFERENCES qube_connections (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX index_qube_sync_marks_on_connection_and_workflow ON qube_sync_marks (connection_id, workflow);

-- Plain v2 requests your app queues (PlainRequest), and the deliveries each has taken, by
-- page_request_id:state, written in the handler's transaction. Never a response body.
CREATE TABLE qube_requests (
  id bigserial PRIMARY KEY,
  connection_id bigint NOT NULL,
  operation varchar(100) NOT NULL,
  record_type varchar(100) NOT NULL,
  record_id varchar NOT NULL,
  reference varchar NOT NULL,
  qube_id varchar,
  state varchar(50) NOT NULL DEFAULT 'queued',
  params text,
  error text,
  pages_answered integer NOT NULL DEFAULT 0,
  last_page integer,
  ended_at timestamp,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  CONSTRAINT fk_qube_requests_connection_id FOREIGN KEY (connection_id) REFERENCES qube_connections (id)
);
CREATE UNIQUE INDEX index_qube_requests_on_reference ON qube_requests (reference);
CREATE INDEX index_qube_requests_on_connection_and_record ON qube_requests (connection_id, record_type, record_id, operation, created_at);

CREATE TABLE qube_request_deliveries (
  id bigserial PRIMARY KEY,
  request_id bigint NOT NULL,
  dedupe_key varchar(200) NOT NULL,
  page integer,
  state varchar(50) NOT NULL,
  created_at timestamp NOT NULL,
  CONSTRAINT fk_qube_request_deliveries_request_id FOREIGN KEY (request_id) REFERENCES qube_requests (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX index_qube_request_deliveries_on_request_and_key ON qube_request_deliveries (request_id, dedupe_key);
