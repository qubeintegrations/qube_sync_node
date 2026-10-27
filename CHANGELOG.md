# Changelog

## 0.3.0 (unreleased)

From qube_rails' styling, storyboard and design pass (2026-10-27, qube_rails 3ce8ea6):

- **Pieces on view-models**: `renderQuestion` and `renderRunStatus` are made of pieces (`question`,
  `message`, `details`, `picks`, `pick`, `choice`, `footer`, `field`, `fields/text|number|boolean|select|search|rows`,
  `rows/row|cell|segmented`, `run_status/status|summary|detail|stall|retry|redeliver`, `error`), each
  `(view, ctx) → HTML` from a view-model: `QuestionView`, `ChoiceView`, `FieldView`, `RowsView`,
  `RowView`, `CellView`, `RunStatusView`, the override contract (qube_rails' fields, camelCase). The
  `pieces` setting, or a render's `pieces` option, replaces any of them; `PIECES` are the kit's.
- **Choices by kind**: picks as option rows ending "Use this one", each form choice its own section
  ("or" between), exits in a footer; at most one filled button (`data-qube-button`,
  `data-qube-choice-kind`).
- **Rows without a table**: a block per record, a segmented choice for a short enum, only the
  fields its answers call for, "Set all to:" and "Use for all N". The table, its "Set selected" bar
  and `ROWS_SCRIPT`/`SEARCH_SCRIPT` are gone; the answer's names (`data[<field>][<row key>][<column>]`)
  are unchanged.
- **Class hooks**: the `uiClasses` setting (and option), with qube_rails' pieces (`UI_PIECES`); an
  unknown piece throws, naming them.
- **The behaviour script and the stylesheet**: qube_rails' `question.js` and `qube_rails.css`, as the
  package's `qubesync/kit/question.js` and `qubesync/kit/qubesync.css` (`QUESTION_SCRIPT_PATH`,
  `STYLESHEET_PATH`), served by `questions()` at `qube/assets/question.js` and
  `qube/assets/qubesync.css`; `renderAssets({ mount, stylesheet, nonce })` writes their tags. No
  inline script any more (`renderQuestion`'s `nonce` is unused).
- **Wording**: every word the screens and routes say has a key (`MESSAGES`, `MESSAGE_KEYS`, `t`),
  reworded by the `messages` setting or a render's `messages` option, and none names QuBe Sync.
  `run.summaryText()` is a few words ("Couldn't sync", "Cancelled", "Sending to QuickBooks", "Still
  waiting for QuickBooks", "Syncing with QuickBooks", "Needs your answer"); why is the new
  `run.reasonText()`, shown below it. `QUESTION_CHANGED`, `NOT_STARTING`, `NOT_QUIET`,
  `REDELIVERY_REFUSED`, `NO_ANSWER`, `RUNS_GOING` and `DISCONNECT_NO_ANSWER` are message keys now; the
  results carry their words.
- **Stalled connections**: `renderRunStatus(..., { connection })`; while the connection is stalled, a
  sending status reads "Waiting for QuickBooks", says why (`run_status/stall`) and offers no redelivery.
- **The storyboard**: `storyboard({ layout, csrfToken })` (`qubesync/express`) serves
  `GET qube/storyboard` and `qube/storyboard/:screen`, every screen from qube_rails' samples in your
  layout, with a sample search and a no-op answer, while the `storyboard` setting is true (default:
  `NODE_ENV` is `"development"`). `kit.storyboard` has the screens for other frameworks.

From qube_rails' second round (2026-10-27):

- **Rows questions**: `renderQuestion` shows a rows field as a table (`add_transaction`'s one
  question for every missing record): the columns each row asks, inputs named
  `data[<field>][<row key>][<column>]`, a search per record column sent with its row, and "Set
  selected" for many rows, with its script `ROWS_SCRIPT`. A field's `enum` shows as a select.
  `answerData` answers a rows field as `{ <row key>: { <column>: value } }`; `client.search(url,
  { field, q, row })` and `searchQuestion({ ..., row })` (the search route's `row`, at most 200
  characters, `SEARCH_LIMITS.maxRow`) send the row. The search script is rendered once per question.

- **Realtime connections**: workflows run only on realtime connections. Onboarding creates
  connections with the `connectionType` setting's type, `"realtime"` (the default) or
  `"standard"` (anything else throws); simulated connections stay simulated. A start or
  `retryStart()` refused with 422 `realtime_required` marks the run `failed` and throws
  `RealtimeRequired` (from `qubesync/kit`), with QuBe Sync's detail as its message.

- **Disconnect**: `DELETE quickbooks/connections/:id`, and `POST quickbooks/connections/:id/disconnect`
  for an HTML form (`disconnectQuickbooks({ request, id })`), deletes QuBe Sync's connection (a 404
  counts as gone), then, in one transaction, calls `ConnectionEvents#disconnected()` (delete your own
  rows that point at it) and deletes the row with its runs, requests, QuickBooks ids and sync marks
  (`connection.disconnect()`). The signed-in account's connections only (404 otherwise); refused with
  `RUNS_GOING` while a run or request hasn't ended, and `DISCONNECT_NO_ANSWER` when QuBe Sync doesn't
  answer.
- **Sync marks**: `qube_sync_marks`, moved to a run's `createdAt` by every `workflow_run.completed`
  the kit applies, never back: `connection.lastSyncedAt(workflow)` and `operation.lastSyncedAt()`,
  a sync's next `since` that outlives pruned runs.
- **Opt-in pruning**: the `pruneRunsAfter` setting (milliseconds, at least `DAY_MS`; `null`, the
  default, never prunes) and `pruneRuns()`, which your app schedules: ended runs by
  `COALESCE(ended_at, updated_at)` and ended requests, never within a day of their end, 500 at a
  time. Links and sync marks stay.
- **Plain v2 requests**: `PlainRequest` (static `operation` and `slug`, `params()`, and the handlers
  `answered`, `done`, `failed`, `retrying`, `timedOut`), listed in `operations`;
  `PlainRequest.queue(record, connection)` resolves to a `QueuedRequest` (one at a time per record,
  slug and connection under the connection lock; its `reference` is the `Idempotency-Key`; stored
  `params`; `retryQueue()`), with their webhook route `POST webhooks/qube/requests/:id` (kind
  `"request"`). Deliveries are taken once by `page_request_id:state`, in the handler's transaction,
  and `done` fires once every page 1..N is in. `settings().requestClass(slug)`;
  `operationClass(slug)` now finds only `Operation`s.
- **An answer QuBe Sync took** puts the run back to `running` at once (`operation.answered(token, {
  taken: true })`), so the sync status reads `sending`, not `needs_answer`, until the Web Connector's
  next poll.
- **The store** has `deleteConnection`, `hasWorkGoing`, `getSyncMark`, `advanceSyncMark`,
  `pruneRuns`, `pruneRequests`, `createRequest`, `getRequest`, `updateRequest`, `latestRequest`,
  `withRequestLock`, `takeRequestDelivery` and `findRequestDeliveries`; `schema.sql` adds
  `qube_sync_marks`, `qube_requests` and `qube_request_deliveries` (qube_rails' tables), and
  `qubesync/kit/store-tests` checks them.

From the qube_rails walkthrough and the owner's review (2026-10-26):

- **`Client#createConnection({ webhookUrl, name, type })`**: `type: "simulated"` makes a connection to
  a simulated QuickBooks company file, connected as it's made.
- **`Client#redeliverRun(connectionId, runId)`**: `POST .../workflow-runs/{id}/redeliver`, which has
  QuBe Sync send the run's latest event again; resolves to `{ run_id, event, revision, webhook_url }`
  (409 nothing to send yet, 429 asked too soon).
- **A changed question's message** no longer asks for a reload: "This question changed since the
  page showed it, so that answer was not sent: the page now shows where it stands."
- **`redirectBack(req, res, error)`** (`qubesync/express`) and **`isNoAnswer(err)`** (`qubesync/kit`):
  for your own routes, such as a start button's, to go back with a message the page shows once.
- **Simulated connect**: `POST quickbooks/connections` with `simulated=1` (`connectQuickbooks({
  simulated: true })`), outside production (`NODE_ENV`), makes a new row, a simulated connection with
  its webhook URL, saves its `qubeId` and goes back to the page; 404 in production.
- **A start reuses its run**: while the record's last run of the operation on that connection hasn't
  ended, `Operation.start` returns that run (`run.reused`), resending an unconfirmed start with the
  same reference and stored input. The check and the new row (with its input) happen under the
  connection row's lock; an input that throws leaves a `failed` row; a 409 leaves the run
  `starting`. The store's `latestRun` takes `{ connectionId }`; `connection.latestRun(record,
  operation)`.
- **Refused webhooks say what to check**: the log line has the reason, the path and the hint
  (`SIGNATURE_HINTS`): the webhook secret and `qube env --write .env`, the clock, or not from QuBe
  Sync. `receiveWebhook` takes `path`.
- **Errors reach the page**: an answer, retry or redelivery that can't go through resolves to
  `{ status: 303, error }` (was a plain-text 409 or 422); `qubesync/express` redirects back and keeps
  the message (`req.flash`, the session, or a `qube_error` cookie) for `takeError(req, res)`, and
  `renderRunStatus` and `renderQuestion` take `error` and show it as `.qube-error`.
- **Sync status**: `connection.syncStatus(record, operation)` and `SyncStatus.latest(record,
  operation)`: `not_sent`, `sending`, `needs_answer`, `in_quickbooks` (with `qbId`), `done`, `failed`
  or `cancelled`, with `error`, `retry`, `unconfirmed` and `summaryText`, derived from the runs and
  the link, never stored. `inQuickbooksSql`, `notInQuickbooksSql`, `needingAnswerSql` and
  `sendingSql` write an `EXISTS` condition for list pages (PostgreSQL, MySQL, SQLite). `schema.sql`
  adds two indexes for them; the store suite checks the conditions with `options.query`.
  `renderRunStatus` takes a `SyncStatus` (`.qube-sync-<status>`, `data-qube-sync-status`).
- **A stuck run's latest news, again**: `run.looksStuck()` (confirmed, not ended, quiet for 10
  minutes, running or awaiting a question never received); `renderRunStatus` offers "Send its latest
  news again", posting to `POST qube/runs/:id/redeliver` (`redeliver`), which calls `redeliverRun`.
- No page refresh: qube_rails' Turbo refresh has no equivalent in Express.

The integration kit's foundation, so an Express app keeps only its own code (a config, a store,
operation classes, a connection events class) and updates the rest with `npm update`. The same
design as the qube_rails engine: connections are records (an account can have several), runs and
QuickBooks ids live in the kit's own tables, and the app's tables need no QuBe columns.

- **`MissingReference`** (`qubesync/kit`), which the kit's mapped operations throw from `input`
  when a reference QuickBooks requires has no link and no name, so the start fails before anything
  is sent.
- **The store.** `qubesync/kit` defines a store interface (async: `transaction`;
  `createConnection`, `getConnection`, `updateConnection`, `ownedBy`, `withConnectionLock`;
  `createRun`, `getRun`, `updateRun`, `latestRun`, `withRunLock`; `once`; `findQuickbooksRecords`,
  `createQuickbooksRecord`, `updateQuickbooksRecord`, `deleteQuickbooksRecord`), with
  `memoryStore()` for tests, `qubesync/kit/schema.sql` (qube_rails' four tables:
  `qube_connections`, `qube_runs`, `qube_notifications`, `qube_quickbooks_records`, with their
  unique keys and indexes; PostgreSQL, with notes for MySQL and SQLite), `STORE_COLUMNS`, and the
  conformance suite `qubesync/kit/store-tests`. A unique-key clash throws `StoreConflict`.
- **`Connection`** (`get`, `ownedBy`, `create`, `webhookUrl`, `connected`, `notCheckingIn`,
  `owner`, `update`, `adoptQubeConnection`) and its QuickBooks ids (`link`, `qbIdFor`,
  `findLinked`, `quickbooksRecord`), unique per connection and list family (`familyFor`): an id
  linked to another record moves (logged), the record's old link gives way, and the item family
  falls back across item kinds but the name family never does.
- **`Run`** (`get`, `load`, `latestFor`, `retryStart`, `ended`, `failed`, `cancelled`,
  `unconfirmed`, `summaryText`, `cancelReasonText`, `errorMessage`, `errorDetail`, `openQuestion`),
  with every ending kept on the row before the handler runs.
- **`Operation`**: `start(record, connection)` writes the run first ("starting"), refuses a
  connection with no `qubeId` (`NotConnected`), marks a 4xx or a throwing input "failed", and
  leaves a start with no answer "starting" for `retryStart` (the same reference as the
  Idempotency-Key). `handle` checks the reference and `connection_id` against the run, takes a
  notification once (`once`, in the run lock's transaction) and applies anything else when it's
  newer, under `withRunLock`. `quickbooksRef`, `linkReferences`, `answered`, `withoutNils`,
  `logEvent`; handlers see `record`, `run`, `connection` and `store`.
- **`ConnectionEvents`** (`connected`, `setupCancelled`, `stalled`, `resumed`; `connection`,
  `owner()`): status, stall reason and revision applied under `withConnectionLock`; a row with no
  `qubeId` adopts QuBe Sync's connection made for it (its webhook URL, never connected or
  simulated, made at or after the row, five minutes' clock difference allowed) or throws
  `NotReady` for a retry.
- **Settings**: `store`, `operations`, `connectionEvents`, `currentAccount`, `authorizeQuestion`
  (default: the signed-in account owns the run's connection, by type and id; with neither it nor
  `currentAccount` set, `NotConfigured` naming the config file), `recordType`, `findRecord`, `enqueue` (default: `job()` in
  this process), `jobAttempts` (10), `apiKey`, `baseUrl`, `webhookSecret`, `webhookUrl`. An unset
  one throws `NotConfigured` naming the config file; the secrets never show.
- **The routes' work**, framework-free: `receiveWebhook` (200, 400, 401, 404, 413, 503), `run`,
  `job` (retries with a growing wait), `connectQuickbooks`, `resendOnboarding`, `answerQuestion`,
  `searchQuestion`, `retryStart`; `renderQuestion(run)` and `renderRunStatus(run)` with
  `escapeHtml` and `SEARCH_SCRIPT`; the mapping helpers; `client()`.
- **Typed workflow starts.** `npx qubesync workflows [--drafts] [--check] [--output PATH]` (the
  package's `bin`) fetches the app's workflow input types and writes `qube-workflows.js` and
  `qube-workflows.d.ts`: an export per workflow (`addTransaction`), a start method and an input
  builder per branch of its input (`addTransaction.invoice(connection, params, { adds, reference,
  webhookUrl })`, `invoiceInput`), or `start` and `input`, and `start(connection, input, options)`
  for any branch; `setClient`, `client`, `connectionId`. Types per branch's input
  (`AddTransactionInvoiceInput`) and per workflow's (`AddTransactionInput`), each operation body
  typed as `qubesync/operations/<entity>`'s params, a field the workflow sets itself optional
  (`RecordPaymentPaymentBody`). The header records the digest and the drafts flag; `--check`
  exits 1 when the file is out of date or on a 401, and warns and exits 0 when QuBe Sync can't be
  reached. `qubesync/workflow-types` (`render`, `check`, `header`, `changes`, `cli`) does the work;
  `client.workflowTypes({ includeDrafts, etag })` fetches the document (`GET /workflows/types`),
  resolving to `NOT_MODIFIED` on a 304; `operations/index.js` carries `DIGEST`, the operations
  manifest's sha256, to compare with the served `operations_digest`. The kit's `Operation#input`
  may return a generated builder's input, and `withoutNils` (the function and the method) is typed
  as what it returns, `WithoutNils<T>`: at every depth a property that may be null or undefined is
  optional without them, and an array's elements lose them.
- **`qubesync/express`**, for Express 4 and 5 (an optional peer dependency): `webhooks()`
  (`POST webhooks/qube/runs/:id`, `POST webhooks/qube/connections/:id`), `connect()`
  (`POST quickbooks/connections`, `POST quickbooks/connections/:id/onboarding`) and `questions()`
  (`POST qube/questions/runs/:id`, `GET qube/questions/runs/:id/search`,
  `POST qube/runs/:id/retry_start`).

## 0.2.0 (2026-10-25)

The v2 API client.

- `new Client({ apiKey, baseUrl = "https://qubesync.com", connectTimeout = 5000, timeout = 30000, maxRetries = 2 })`:
  Basic auth with the key passed in (the environment is never read), and the key never in
  `util.inspect`, `JSON.stringify` or an error.
- Connections: `createConnection`, `getConnection`, `listConnections`, `updateConnection`,
  `deleteConnection`, `regenerateOnboarding`, `setPassword`, `getQwc`.
- Runs: `startRun` (the `reference` is the Idempotency-Key), `getRun` by link or ids, `listRuns`,
  `cancelRun`, `runEvents`. Questions: `answer`, `search`.
- Every QuickBooks operation as a method, entity then action: `qube.customer.create(connectionId,
  params, { webhookUrl, idempotencyKey })`, `qube.customerMsg.query(...)`, `qube.txnVoid.execute(...)`
  (261 operations on 124 entities). Each entity's module loads on first use, and can be imported
  alone (`qubesync/operations/<entity>`). Generated from the QuBe Sync operations manifest
  (`test/fixtures/operations.json`, served at https://qubesync.com/libraries/operations.json) by
  `node scripts/generate-operations.js`, with full nested param types and every field's description
  in `operations/*.d.ts`; CI fails when the generated files or the vendored manifest drift.
- Query params: nested objects go bracketed (`name_range[from]=A`), arrays of scalars as a repeated key.
- `queue(operationId, connectionId, params, { webhookUrl, idempotencyKey, method, path })` queues by
  operation id; an id this version doesn't know needs `method` and `path`.
- Requests: `queueQbxml`, `getRequest`, `requestPages`, `listRequests`, `eachRequest` (an async
  iterator over every page), `discardRequest`; `request` for anything else.
- Links are refused unless they're on the client's own origin.
- Retries for retry-safe requests on a failed connection, a timeout, 429, 502, 503 and 504, with
  `Retry-After` honoured up to 30 s. `answer` is retried when its link has a `prompt_token`.
- `totalTimeout` (60000 ms): a call returns or rejects within it, retries and waits included; each
  attempt's timeouts are cut to the time left, and a retry that would leave under 1 s isn't made.
- `onRetry({ attempt, maxRetries, delayMs, elapsedMs, method, url, status, error })` before each
  retry's wait; the URL without its query, never the key; a throw stops the call.
- A retried DELETE that gets a 404 after an earlier attempt's answer was lost (a read timeout, a
  reset after connecting, a 502 or 504) resolves to `null`, as a 204 would.
- `APIError` with `status`, `code`, `message`, `errors`, `body` and `requestId`.
- Releases publish through npm trusted publishing, from `release.yml`'s OIDC token; no npm
  token is stored.

## 0.1.0 (2026-10-24)

First version: webhooks only.

- `verify(rawBody, header, { secrets, tolerance = 300, now })` checks the `X-QUBE-Signature`
  header (HMAC-SHA256 of `"<t>." + raw body`, constant-time compare, one or more secrets while
  one rotates) and returns a typed event, or throws `SignatureError` with `reason` `missing`,
  `malformed`, `stale` or `mismatch`.
- `parse(rawBody)` builds the typed event without verifying.
- Events: `RequestEvent`, `WorkflowRunEvent`, `NotificationEvent`, `ConnectionEvent`,
  `NameIndexEvent` and `UnknownEvent`, each with `type`, `event`, `timestamp`, `appId`,
  `sandbox`, `body`, `revision`, `reference` and `dedupeKey`; `newerThan(storedRevision)` on
  workflow runs and connections.
- CommonJS and ESM entry points, TypeScript declarations, zero dependencies, Node 16.17 and later.
- Tested against the server's own test vectors (`test/fixtures/test_vectors.json`), and CI checks
  that copy against https://qubesync.com/webhooks/test_vectors.json.
- A `v*` tag publishes to npm (`release.yml`).
