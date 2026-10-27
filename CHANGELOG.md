# Changelog

## 0.3.0 (2026-10-27)

Adds the integration kit (`qubesync/kit` and `qubesync/express`), typed workflow starts,
simulated connections and resending a run's latest event. Nothing existing changes: the 0.2.0
client and webhook functions work as they did.

### Added

**Client**
- **Typed workflow starts.** `npx qubesync workflows [--drafts] [--check] [--output PATH]` (the
  package's `bin`) fetches your app's workflow input types and writes `qube-workflows.js` and
  `qube-workflows.d.ts`: an export per workflow (`addTransaction`), a start method and an input
  builder per branch of its input (`addTransaction.invoice(connection, params, { adds, reference,
  webhookUrl })`, `invoiceInput`), or `start` and `input`, and `start(connection, input, options)`
  for any branch; `setClient`, `client`, `connectionId`. Each branch's input
  (`AddTransactionInvoiceInput`) and each workflow's (`AddTransactionInput`) is typed, every
  operation body as `qubesync/operations/<entity>`'s params, with fields the workflow sets
  itself optional (`RecordPaymentPaymentBody`). `--check` exits 1 when the file is out of date or
  the key is refused, and warns and exits 0 when QuBe Sync can't be reached.
  `qubesync/workflow-types` (`render`, `check`, `header`, `changes`, `cli`) does the work from code.
- **`client.workflowTypes({ includeDrafts, etag })`**: `GET /workflows/types`, resolving to
  `NOT_MODIFIED` on a 304.
- **`client.createConnection({ webhookUrl, name, type })`**: `type: "simulated"` makes a
  connection to a simulated QuickBooks company file, connected as soon as it's made, for trying
  an integration without QuickBooks Desktop.
- **`client.redeliverRun(connectionId, runId)`**: `POST .../workflow-runs/{id}/redeliver` has QuBe
  Sync send the run's latest event to your webhook again, for when your endpoint was down longer
  than QuBe Sync's retries. It resolves to `{ run_id, event, revision, webhook_url }`, and rejects
  with a 409 when there's nothing to send yet or a 429 when asked too soon.
- **`client.search(url, { field, q, row })`**: `row` names the row of a question's rows field, for
  a search whose kind depends on that row (the missing-records question's per-record search).
- **`DIGEST`** (`qubesync/operations/index`): the sha256 of the QuickBooks operations manifest
  this version was generated from, compared with the served `operations_digest`.

**Integration kit (`qubesync/kit`)**

The code QuBe Sync's integration kit used to generate into every Node app, the same design as
the qube_rails engine, so your app keeps only its own code (a config, a store, operation classes,
a connection events class) and gets fixes with `npm update`. Connections are records (an account
can have several), runs and QuickBooks ids live in the kit's own tables, and your tables need no
QuBe Sync columns.

- **The store**: an async interface (`transaction`; `createConnection`, `getConnection`,
  `updateConnection`, `ownedBy`, `withConnectionLock`; `createRun`, `getRun`, `updateRun`,
  `latestRun`, `withRunLock`; `once`; `findQuickbooksRecords`, `createQuickbooksRecord`,
  `updateQuickbooksRecord`, `deleteQuickbooksRecord`; `deleteConnection`, `hasWorkGoing`; sync
  marks, requests and pruning), with `memoryStore()` for tests,
  `qubesync/kit/schema.sql` (`qube_connections`, `qube_runs`, `qube_notifications`,
  `qube_quickbooks_records`, `qube_sync_marks`, `qube_requests`, `qube_request_deliveries`, with their keys and indexes; PostgreSQL, with notes for MySQL and
  SQLite), `STORE_COLUMNS`, and a conformance suite for your own store,
  `qubesync/kit/store-tests`. A unique-key clash throws `StoreConflict`.
- **`Connection`** (`get`, `ownedBy`, `create`, `webhookUrl`, `connected`, `notCheckingIn`,
  `owner`, `update`, `adoptQubeConnection`, `latestRun`) and its QuickBooks ids (`link`,
  `qbIdFor`, `findLinked`, `quickbooksRecord`), kept per connection and list family
  (`familyFor`).
- **`Run`** (`get`, `load`, `latestFor`, `retryStart`, `looksStuck`, `ended`, `failed`,
  `cancelled`, `unconfirmed`, `summaryText`, `cancelReasonText`, `errorMessage`, `errorDetail`,
  `openQuestion`), with every ending kept on the row before your handler runs.
- **`Operation`**: `start(record, connection)` writes the run first, refuses a connection with
  no `qubeId` (`NotConnected`), and returns the record's run that hasn't ended on that connection
  (`run.reused`) rather than starting another, so a double click can't add an invoice twice; an
  unconfirmed one is sent again with the same reference (the Idempotency-Key) and input. A start
  with no answer stays "starting" for `retryStart`; only a 4xx or a throwing input marks it
  failed. `handle` checks each event against the run, takes a notification once, and applies
  anything else only when it's newer, under the run's lock. `quickbooksRef`, `linkReferences`,
  `answered`, `withoutNils` (typed as what it returns, `WithoutNils<T>`) and `logEvent`; `input`
  may return a generated workflow input builder's result.
- **Realtime connections**: onboarding creates connections with the `connectionType` setting's
  type, `"realtime"` (the default) or `"standard"`, since workflows run only on realtime
  connections. A start refused as `realtime_required` marks the run failed and throws
  `RealtimeRequired`, whose message says how to upgrade.
- **An answer QuBe Sync took** puts the run back to `running` at once (`operation.answered(token,
  { taken: true })`), rather than waiting for the Web Connector's next poll.
- **`MissingReference`**, thrown from `input` when a reference QuickBooks requires has no link
  and no name, so the start fails before anything is sent.
- **`ConnectionEvents`** (`connected`, `setupCancelled`, `stalled`, `resumed`; `connection`,
  `owner()`): a row with no `qubeId` yet adopts the QuBe Sync connection made for it or throws
  `NotReady` for a retry.
- **Disconnect**: `DELETE quickbooks/connections/:id`, and `POST .../:id/disconnect` for an HTML
  form (`disconnectQuickbooks`). QuBe Sync deletes its connection first, then, in one
  transaction, `ConnectionEvents#disconnected()` (delete your own rows that point at it) and
  `connection.disconnect()` delete the row with its runs, requests, QuickBooks ids and sync marks.
  It's refused while a run or request hasn't ended.
- **Plain v2 requests**: `PlainRequest` (static `operation` and `slug`, `params()`, and the
  handlers `answered`, `done`, `failed`, `retrying`, `timedOut`). `PlainRequest.queue(record,
  connection)` resolves to a `QueuedRequest` (one at a time per record, slug and connection; its
  `reference` is the Idempotency-Key; `retryQueue()`), and their webhooks arrive at
  `POST webhooks/qube/requests/:id`. Each delivery is taken once by `page_request_id:state`, and
  `done` fires once every page is in.
- **Opt-in pruning and sync marks**: the `pruneRunsAfter` setting (at least a day) and
  `pruneRuns()`, which your app schedules, delete ended runs and requests, never within a day of
  their end; links stay. `connection.lastSyncedAt(workflow)` and `operation.lastSyncedAt()` read
  when each connection's last completed run of a workflow started, so a sync's next `since`
  outlives pruned runs.
- **Settings**: `store`, `operations`, `connectionEvents`, `currentAccount`, `authorizeQuestion`
  (default: the signed-in account owns the run's connection), `recordType`, `findRecord`,
  `enqueue` (default: `job()` in this process), `jobAttempts` (10), `apiKey`, `baseUrl`,
  `webhookSecret`, `webhookUrl`. An unset one throws `NotConfigured` naming the config file; the
  secrets never show.
- **Sync status**, derived from the runs and links and never stored:
  `connection.syncStatus(record, operation)` and `SyncStatus.latest(record, operation)`:
  `not_sent`, `sending`, `needs_answer`, `in_quickbooks` (with `qbId`), `done`, `failed` or
  `cancelled`, with `error`, `retry`, `unconfirmed` and `summaryText`. `inQuickbooksSql`,
  `notInQuickbooksSql`, `needingAnswerSql` and `sendingSql` write an `EXISTS` condition for list
  pages (PostgreSQL, MySQL, SQLite), using indexes in `schema.sql`.
- **The routes' work**, framework-free: `receiveWebhook` (200, 400, 401, 404, 413, 503), `run`,
  `job` (retries with a growing wait), `connectQuickbooks`, `resendOnboarding`, `answerQuestion`,
  `searchQuestion`, `retryStart`, `redeliver`; `renderQuestion` and `renderRunStatus` with
  `escapeHtml`; the mapping helpers; `client()`; `isNoAnswer(err)` for your own routes.
- **The screens**: the run status is a few words for a pill ("Sending to QuickBooks", "Needs your
  answer", "Couldn't sync"...) with why below it (`run.reasonText()`), "Try sending again" for an
  unconfirmed start, "Check for updates" for a run that looks stuck, and "Waiting for
  QuickBooks", with why and what to do, while the connection is stalled
  (`renderRunStatus(..., { connection })`). A question's choices show by kind: suggested records
  as option rows ending "Use this one", a form per section with the one filled button, and the
  exits in a footer. A rows field (the missing-records question) is a block per record: its
  choice as a segmented control, only the fields that choice needs, and "Set all to" and "Use for
  all N"; it never scrolls sideways. A fixed list shows as a select.
- **Styling**: both renders are made of pieces from view-models (`QuestionView`, `ChoiceView`,
  `FieldView`, `RowsView`, `RowView`, `CellView`, `RunStatusView`), and the `pieces` setting
  replaces any of them. The `uiClasses` setting adds your CSS framework's classes by piece. The
  behaviour script and the opt-in stylesheet (`qubesync/kit/question.js`,
  `qubesync/kit/qubesync.css`, themed by `--qube-*` variables) are files, which `questions()`
  serves and `renderAssets({ mount, stylesheet, nonce })` writes tags for; no inline script.
- **Wording**: every word the screens and routes say has a key (`MESSAGES`, `t`), reworded by the
  `messages` setting, and none names QuBe Sync.
- **The storyboard**: `storyboard({ layout, csrfToken })` (`qubesync/express`) serves
  `GET qube/storyboard` and `qube/storyboard/:screen`, every screen from sample data in your
  layout, while the `storyboard` setting is true (by default when `NODE_ENV` is
  `"development"`). Nothing is sent.
- An answer, retry or redelivery that can't go through resolves to `{ status: 303, error }`, and
  the templates show the message (`.qube-error`). An answer to a question that changed since the
  page showed it isn't sent, and the page says where it stands now.
- Connect with `simulated: true` (`simulated=1`), outside production (`NODE_ENV`), makes a
  connection to a simulated QuickBooks company file and goes back to the page; in production it
  answers 404.
- A refused webhook's log line names the reason, the path and what to check (`SIGNATURE_HINTS`:
  the webhook secret, the clock, or a sender that isn't QuBe Sync).

**`qubesync/express`**, for Express 4 and 5 (an optional peer dependency)
- `webhooks()` (`POST webhooks/qube/runs/:id`, `POST webhooks/qube/connections/:id`), `connect()`
  (`POST quickbooks/connections`, `POST quickbooks/connections/:id/onboarding`) and `questions()`
  (`POST qube/questions/runs/:id`, `GET qube/questions/runs/:id/search`,
  `POST qube/runs/:id/retry_start`, `POST qube/runs/:id/redeliver`).
- An error goes back to the page and is kept (`req.flash`, the session, or a `qube_error`
  cookie) for `takeError(req, res)`; `redirectBack(req, res, error)` does the same for your own
  routes, such as a start button's.

### Changed
- The operation docs now say a QuickBooks `list_id` is unique within a list family, not across
  the company file: customers, vendors, employees and other names share one sequence, every item
  type shares another, and each other list has its own. Key stored ids by connection and record
  kind, never by `list_id` alone.

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
