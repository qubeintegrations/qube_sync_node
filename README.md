# qubesync (Node)

The [QuBe Sync](https://qubesync.com) v2 API client, and webhook verification and parsing:
QuickBooks Desktop through qubesync.com. Plain JavaScript, zero dependencies, Node 16.17 and
later, CommonJS and ESM, TypeScript declarations included. API docs: https://docs.qubesync.com.
For an Express app, [the integration kit](#the-integration-kit-qubesynckit-and-qubesyncexpress) is
the webhook endpoint, onboarding, the question routes and the tables behind them, ready to mount.

```bash
npm install qubesync
```

## The v2 client

Make one client with your app's API key. The library never reads the environment, so pass the
key in (and hold a sandbox and a production client at once if you need both):

```js
const { Client, APIError } = require("qubesync"); // or: import { Client, APIError } from "qubesync";

const qube = new Client({ apiKey: process.env.QUBE_API_KEY });
```

`new Client({ apiKey, baseUrl = "https://qubesync.com", connectTimeout = 5000, timeout = 30000, maxRetries = 2, totalTimeout = 60000, onRetry })`.
Timeouts are in milliseconds: `connectTimeout` to open the connection, `timeout` for the socket to
sit idle waiting for the answer, and `totalTimeout` for the whole call (see below). Every method returns a Promise of the response's `data`, with
the API's own snake_case keys (`webhook_url`, `total_pages`), or `null` for an empty answer.

### Onboarding a customer

```js
const connection = await qube.createConnection({ webhookUrl: "https://app.example.com/webhooks/qube", name: "Acme" });
// Store connection.id, and send your customer to connection.links.onboarding.
// A connection.connected webhook arrives once their Web Connector checks in.

const fresh = await qube.regenerateOnboarding(connection.id); // a new onboarding link
```

Also `getConnection(id)`, `listConnections()`, `updateConnection(id, { webhookUrl, name })`,
`deleteConnection(id)`, and for setup without hosted onboarding `setPassword(id, { password })`
(leave `password` out to have one generated) and `getQwc(id)` (the QWC file's XML, a string).

### Starting a run and answering its question

```js
const run = await qube.startRun(connectionId, "customer_sync", { customer: { name: "Acme" } }, {
  reference: "customer-1042", // your own id for the run, and its Idempotency-Key
  webhookUrl: "https://app.example.com/webhooks/qube",
});

// Later, in the workflow_run.awaiting_input webhook (event.prompt), answer by choice:
await qube.answer(event.prompt.links.decisions, { choice: "use_existing", data: { customer: "80000001-1700000000" } });
// A question's record field: search QuickBooks with the prompt's search link.
const matches = await qube.search(event.prompt.links.search, { field: "customer", q: "Acm" });
```

Also `getRun(runUrl)` (a run's `links.run`) or `getRun(connectionId, runId)`,
`listRuns(connectionId, { reference, state, outcome })`, `cancelRun(run.links.cancel, { reason })` and
`runEvents(connectionId, runId, { after, limit })`, which returns the whole body,
`{ data, next_after }`.

Links (`links.run`, `links.decisions`, `links.search`, `links.cancel`) are used as they come, query
string included. A link on another origin than the client's `baseUrl` (scheme, host and port) is
refused with a `TypeError` before any request, so the API key only ever goes to QuBe Sync.

### Typed workflow starts

`npx qubesync workflows` fetches your app's workflow input types (`GET /api/v2/workflows/types`)
and writes them as a module you check in, `qube-workflows.js` with its types in
`qube-workflows.d.ts`: a start method per workflow, and per branch of its input, whose operation
bodies have the same types and field docs as the operation methods below.

```sh
QUBE_API_KEY=... npx qubesync workflows           # qube-workflows.js, qube-workflows.d.ts
QUBE_API_KEY=... npx qubesync workflows --check   # in CI: exits 1 when the file is out of date
```

```js
const { Client } = require("qubesync");
const { setClient, addTransaction } = require("./qube-workflows");

setClient(new Client({ apiKey: process.env.QUBE_API_KEY })); // once, at boot

await addTransaction.invoice(connectionId, {
  customer_ref: { list_id: "80000001-1700000000" },
  invoice_line_add: [{ item_ref: { full_name: "Consulting" }, amount: 100 }],
}, {
  adds: [{ kind: "customer", add: { name: "Acme Ltd" } }],
  reference: `invoice-${invoice.id}`,
  webhookUrl: "https://myapp.example/qube/runs",
});

// The input alone, for start or a qubesync/kit Operation's input (an AddTransactionInvoiceInput):
addTransaction.invoiceInput(params, { adds });
```

- A workflow whose input has branches (add_transaction's `operation`, upsert's `kind`) gets one
  method per branch, named by the branch (camelCased: `upsert.itemService`), with the
  discriminator filled in. A workflow's one operation body (add_transaction's `params`) comes
  second in every branch; the other inputs go in the options object, camelCased (`txnId` for
  `txn_id`; the input keeps the snake_case key), and so does every input of a workflow with two
  bodies (upsert's `add` and `update`). `start(connection, input, options)` takes any branch's
  input. A workflow without branches gets `start(connection, { ...inputs, reference, webhookUrl })`
  and `input({ ...inputs })`. Each `*Input` leaves out null and undefined values. `connection` may
  be anything with a `qubeId` (a qubesync/kit `Connection`).
- Each start takes `reference`, `webhookUrl`, `version` (the published one unless given) and
  `client` (the one `setClient` set unless given), and resolves to the run as `startRun` does. An
  input named like one of those (`version`) is `version_` in the options, and a name JavaScript
  reserves takes a trailing underscore where it would be a variable (`class_` for a workflow named
  `class`).
- The `.d.ts` exports a type per branch's input (`AddTransactionInvoiceInput`) and per workflow's
  (`AddTransactionInput`, the union of its branches'), each operation body that operation's params
  type (`InvoiceCreateParams`, from `qubesync/operations/invoice`), and a nested entry with
  branches (an `adds` item) a union of an interface per branch. An operation newer than your
  qubesync is `Record<string, unknown>`, with a warning when the served operations aren't the
  package's. A field the workflow sets itself (QuBe Sync lists them as `set_by_workflow`: upsert's
  `list_id` and `edit_sequence`) is optional in that body, which then gets a type of its own
  (`RecordPaymentPaymentBody`, `UpsertCustomerUpdateBody`), and its docs say a value given for it
  is overwritten.
- QuBe Sync still checks every start: a field the operation doesn't take is a 422 at the call, its
  error's `path` the body (`input.params`) and its `message` naming the field (`unknown parameter:
  "customer_rf"`).
- `--drafts` types each workflow's draft where it has one, so you can build against a workflow
  before publishing it. The header records the digest and the flag, and `--check` fetches with the
  same flag, sending the digest as `If-None-Match`. When QuBe Sync can't be reached or answers 5xx,
  `--check` warns and exits 0; a 401 exits 1.
- `--output PATH` chooses the module (its types go beside it; a `.cjs`, for a package with
  `"type": "module"`, gets a `.d.cts`); `QUBE_BASE_URL` another host, with or without `/api/v2`.
- The generated module requires nothing and runs on Node 16. `qubesync/workflow-types` has the
  renderer (`render(document, { source })`) and `check` for a script of your own; the client call
  is `qube.workflowTypes({ includeDrafts, etag })`, which resolves to `NOT_MODIFIED` on a 304.

### Queueing an operation

Every QuickBooks operation is a method, entity then action: `create`, `update`, `query`, `delete` or
`execute`. Each takes the connection id, the params (the API's own snake_case fields) and
`{ webhookUrl, idempotencyKey }`, and resolves to the queued request; the answer arrives at
`webhookUrl`.

```js
// POST /connections/{id}/customers
const queued = await qube.customer.create(connectionId, {
  name: "Acme",
  bill_address: { addr1: "1 Main St", city: "Austin", state: "TX", postal_code: "78701" },
}, { webhookUrl: "https://app.example.com/webhooks/qube" });

// GET /connections/{id}/invoices: a query's params go in the query string.
await qube.invoice.query(connectionId, {
  modified_date_range_filter: { from_modified_date: "2026-10-01T00:00:00Z" },
  include_line_items: true,
}, { webhookUrl: "https://app.example.com/webhooks/qube" });

await qube.customerMsg.query(connectionId, {}, { webhookUrl: "https://app.example.com/webhooks/qube" });
await qube.txnVoid.execute(connectionId, { txn_id: "1A2B-1700000000", txn_void_type: "Invoice" }, {
  webhookUrl: "https://app.example.com/webhooks/qube",
});
```

Each entity's module loads the first time you use it (`qube.customer`), so the 124 of them cost
nothing until then. A bundled app can import one alone:
`const { Customer } = require("qubesync/operations/customer"); new Customer(qube).create(...)`.

The types are in `operations/<entity>.d.ts` (and nested ones shared between entities in
`operations/types.d.ts`): every field with its description, required where QuickBooks requires it,
enums as literal unions, so an editor completes and checks the params. Each method's doc says whether
QuickBooks answers in pages (each page comes as its own webhook) and links its
[API reference](https://docs.qubesync.com) page. They're generated from the QuBe Sync operations
manifest (`node scripts/generate-operations.js`), not written by hand.

`queue(operationId, connectionId, params, { webhookUrl, idempotencyKey, method, path })` queues an
operation by its id, the same as the method: `qube.queue("customer.create", connectionId, params, options)`.
For an operation newer than this version, pass `method` and `path` (relative to the connection):
`qube.queue("widget.create", connectionId, params, { webhookUrl, method: "POST", path: "widgets" })`.

qbXML as written:

```js
await qube.queueQbxml(connectionId, requestXml, { webhookUrl: "https://app.example.com/webhooks/qube" });
```

Also `getRequest(connectionId, id)`, `requestPages(connectionId, id)`, `discardRequest(connectionId, id)`,
and `listRequests(connectionId, { page, pageSize, state, webhookState, sort, sortDirection, searchPhrase })`,
which returns the whole body, `{ data, meta: { page, total_pages } }`. To walk every page:

```js
for await (const request of qube.eachRequest(connectionId, { state: "errored" })) {
  console.log(request.id);
}
```

### Anything else

`request(method, pathOrUrl, body, { query, headers })` sends any v2 call, a path under `/api/v2`
(`"/workflows"`) or a same-origin URL, and returns the parsed body whole.

### Retries and idempotency

A request that's safe to send again (a GET, PUT or DELETE, or one with an `Idempotency-Key`) is
retried up to `maxRetries` times, 0.5 s then 1 s apart, when the connection fails or times out, or
QuBe Sync answers 429, 502, 503 or 504 (a 429 or 503's `Retry-After` is honoured, up to 30 s).

- `startRun` sends `reference` as the Idempotency-Key, so a retried start never starts two runs.
- Every operation method, `queue` and `queueQbxml` take `idempotencyKey`; left out, the client makes
  a UUID per call and sends it again on that call's retries, so a retry never queues a request twice.
- `answer` is retried when its link has a `prompt_token` (a run's `links.decisions` always does
  while it asks). A retry after a lost answer may reject with a `409` whose `code` is
  `prompt_changed`: the question has been answered, by the first attempt or by someone else.
  Without a `prompt_token` it's sent once, since a repeat could be taken for the run's next question.
- The other POSTs (`createConnection`, `cancelRun`, `setPassword`, `getQwc`,
  `regenerateOnboarding`, `discardRequest`) are sent once.
- A retried DELETE (`deleteConnection`, or `request("DELETE", ...)`) that gets a `404` resolves to
  `null`, as a 204 would, when an earlier attempt's answer was lost after the request could have
  arrived (a read timeout, a connection reset after it opened, a 502 or 504): that attempt may have
  deleted it. Any other 404 still rejects, including a retry's after a refused connection, a
  connect timeout, a 429 or a 503.

A call returns or rejects within `totalTimeout` (60 s), retries and their waits included: each
attempt's timeouts are cut to the time left, and a retry is skipped (the last answer or error
rejects) when its wait, a `Retry-After` included, would leave under a second. Pass `maxRetries: 0`
for calls made while a user waits on a page, if 60 s is too long.

`onRetry` is called before each retry's wait with a frozen object: `attempt` (1, 2...),
`maxRetries`, `delayMs`, `elapsedMs`, `method`, `url` (without its query string), and `status` for
a retried status or `error` for a network failure or timeout (the other is `null`). It's never
given the API key, headers or body, and it isn't called when no retry is made. Anything it throws
stops the call, which rejects with that error:

```js
const qube = new Client({
  apiKey: process.env.QUBE_API_KEY,
  onRetry: ({ attempt, maxRetries, delayMs, method, url, status, error }) =>
    console.warn(`QuBe Sync retry ${attempt}/${maxRetries} in ${Math.round(delayMs)} ms: ${method} ${url} (${status ?? error.code})`),
});
```

### Errors

Any answer outside 2xx rejects with `APIError`:

```js
try {
  await qube.answer(decisionsUrl, { choice: "create" });
} catch (error) {
  if (!(error instanceof APIError)) throw error; // Node's own error: the connection failed after the retries
  error.status;    // 409
  error.code;      // "prompt_changed", when errors carries a code
  error.errors;    // the body's errors as parsed: a sentence, { detail, code }, fields, or [{ path, message }]
  error.message;   // "QuBe Sync answered 409: ...", one line, safe to log
  error.body;      // the raw body
  error.requestId; // the x-request-id header, for support
}
```

A connection that still fails after the retries rejects with Node's own error (`ECONNREFUSED`,
`ECONNRESET`, or `ETIMEDOUT` for a timeout), unchanged. Neither ever holds the API key, and
`util.inspect(client)` and `JSON.stringify(client)` show only the `baseUrl`. See
[error handling](https://docs.qubesync.com/error_handling).

## Webhooks

Every delivery carries an `X-QUBE-Signature` header: `t=<unix seconds>,v1=<hex>[,v1=<hex>...]`,
one `v1` per active secret while you rotate. `verify` checks it against the **raw** body, then
parses the body into a typed event:

```js
const { verify, SignatureError } = require("qubesync"); // or: import { verify, SignatureError } from "qubesync";

const SECRETS = [process.env.QUBE_WEBHOOK_SECRET]; // add the new secret here while you rotate

function handleDelivery(rawBody, signatureHeader) {
  let event;
  try {
    event = verify(rawBody, signatureHeader, { secrets: SECRETS });
  } catch (error) {
    if (error instanceof SignatureError) return 401; // error.reason: missing | malformed | stale | mismatch
    throw error;
  }

  switch (event.type) {
    case "request":
      // A queued request's answer. Dedupe on (page_request_id, state): event.dedupeKey.
      // A paginated query is done when you hold pages 1..N for the page_request_id.
      if (alreadyProcessed(event.dedupeKey)) return 200;
      saveAnswer(event.pageRequestId, event.page, event.state, event.responseJson, event.error);
      break;

    case "workflow_run":
      // awaiting_input, completed, failed or cancelled. Deliveries can arrive out of order:
      // apply one only when it's newer than the revision you stored for the run.
      if (!event.newerThan(storedRunRevision(event.runId))) return 200;
      saveRun(event.runId, event.reference, event.revision, event.runState, event.output, event.prompt);
      break;

    case "notification":
      // Data a run sends along the way. Dedupe on event.dedupeKey (the delivery id);
      // never skip one by revision.
      if (alreadyProcessed(event.dedupeKey)) return 200;
      saveNotification(event.runId, event.name, event.seq, event.data);
      break;

    case "connection":
      // connected, setup_cancelled, stalled, resumed. Dedupe on the delivery id and apply
      // only when newer than the connection's stored revision.
      if (alreadyProcessed(event.dedupeKey) || !event.newerThan(storedConnectionRevision(event.connectionId))) return 200;
      saveConnection(event.connectionId, event.event, event.revision, event.stallReason);
      break;

    case "name_index":
      saveNameIndex(event.connectionId, event.nameIndex);
      break;

    default:
      // "unknown": an event newer than this library. Accept it; event.body has everything.
      break;
  }
  return 200;
}
```

`verify(rawBody, header, { secrets, tolerance = 300, now })`:

- `rawBody` is the body exactly as received, as a `Buffer` or string (a string is signed as its
  UTF-8 bytes). A parsed object throws a `TypeError`: re-serialized JSON never matches.
- `header` is the `X-QUBE-Signature` value. Node lowercases header names, so read
  `req.headers["x-qube-signature"]`.
- `secrets` is one secret or an array of them. An empty or missing list throws a `TypeError`. The
  library never reads the environment.
- `tolerance` is how many seconds the timestamp may be off either way. `now` is unix seconds or a
  `Date` and defaults to the current time.
- On failure it throws `SignatureError`, whose `reason` is `missing`, `malformed`, `stale` or
  `mismatch`, checked in that order. Its message is safe to log: it never holds the secret, the
  signatures or the body.

`parse(rawBody)` builds the same typed event without verifying, for tests and for code that
verified elsewhere.

### Events

Every event has `type`, `event` (or `null` for a request's answer), `timestamp`, `appId`,
`sandbox`, `revision`, `reference`, `dedupeKey` and `body` (the whole parsed body). Missing keys
read as `null`; nothing throws.

| `type` | when | also |
| --- | --- | --- |
| `request` | no `event`, has `page_request_id` | `id`, `pageRequestId`, `state`, `page`, `iterationState`, `responseJson`, `error`; `dedupeKey` is `"<page_request_id>:<state>"` |
| `workflow_run` | `workflow_run.awaiting_input`, `.completed`, `.failed`, `.cancelled` | `runId`, `reference`, `revision`, `runState`, `workflow`, `connectionId`, `prompt`, `outcome`, `output`, `error`, `summary`, `cancelReason`, `links`, `newerThan(stored)` |
| `notification` | `workflow_run.notification` | `runId`, `reference`, `revision`, `deliveryId`, `seq`, `name`, `state`, `from`, `data`; `dedupeKey` is the delivery id; no `newerThan` |
| `connection` | `connection.*` | `deliveryId`, `revision`, `connection`, `connectionId`, `stallReason`, `newerThan(stored)`; `dedupeKey` is the delivery id |
| `name_index` | `name_index.*` | `connectionId`, `nameIndex` |
| `unknown` | anything else | the common fields only |

`newerThan(stored)` is `true` when `stored` is `null` or `undefined`, else `revision > stored`.

### Express

Verify before any JSON body parser touches the request: mount `express.raw` on the webhook route
so `req.body` is the raw `Buffer`.

```js
const express = require("express");
const { verify, SignatureError } = require("qubesync");

const app = express();

app.post("/webhooks/qube", express.raw({ type: "application/json" }), (req, res) => {
  let event;
  try {
    event = verify(req.body, req.get("X-QUBE-Signature"), { secrets: [process.env.QUBE_WEBHOOK_SECRET] });
  } catch (error) {
    if (error instanceof SignatureError) return res.sendStatus(401);
    throw error;
  }
  // Route by event.type as above, then answer quickly.
  res.sendStatus(200);
});
```

## The integration kit: `qubesync/kit` and `qubesync/express`

Everything an Express app's QuBe Sync integration has that's the same in every app:

- tables of its own, kept through your app's **store**: your customers' **connections** (an
  account can have several, one per company file), the **runs** your app starts, the
  notifications each run has taken, and the **QuickBooks ids** it learns, each kept against its
  connection;
- onboarding: make a connection for the signed-in account, or send one of its connections back
  through QuBe Sync's setup;
- the webhook endpoint (verify the signature, find the row, enqueue) and its job (check the event
  is that run's or that connection's, apply it, call your handler);
- the question routes (answer by choice, search a record field), a start sent again, and their
  HTML;
- `Operation` and `ConnectionEvents`, the bases of your classes.

Your app keeps its own code, which this package never names, in `quickbooks-desktop/`: one config
file, a store, an operation class per way it starts a workflow, and a class for a connection's
events. Your own tables need no QuBe columns. `npm update qubesync` updates the rest; don't copy it
into your app. `qubesync/kit` is framework-free; `qubesync/express` mounts it in Express 4 or 5.

```bash
npm install "qubesync@>=0.3.0" express
```

The environment, read at first use: `QUBE_API_KEY`, `QUBE_URL` (default `https://qubesync.com`) and
`QUBE_WEBHOOK_SECRET`, which `qube env --write .env` writes, and `QUBE_WEBHOOK_URL`, the base of
every run's and connection's webhook URL: `qube listen --write-env .env` writes it in development,
and in production it's your app's `/webhooks/qube`.

### The store: `quickbooks-desktop/store.js`

Node has no standard ORM, so the kit says what a store does and your app's store does it, on your
database and your query builder. The integration kit generates one for your stack; `memoryStore()`
is one for tests. A store is plain reads and writes, each async; what they mean (an id that moves
between records, the item family's fallback, a notification taken once) is the kit's, above the
store, so every store behaves alike.

The tables are `qubesync/kit/schema.sql` (PostgreSQL, with notes for MySQL and SQLite):
`qube_connections`, `qube_runs`, `qube_notifications` and `qube_quickbooks_records`, the same as
qube_rails' migration. Rows are camelCase in JavaScript (`STORE_COLUMNS` maps each field to its
column); `input`, `error`, `question` and `links` are JSON kept as text; times are `Date`s.

| Method | What it does |
| --- | --- |
| `transaction(fn)` | `fn(tx)` in a transaction, with the store bound to it (a savepoint when called on `tx`); rolled back when `fn` throws |
| `createConnection(fields)` / `getConnection(id)` / `updateConnection(id, changes)` | a `qube_connections` row; `update` answers the row as written, or `null` |
| `ownedBy(ownerType, ownerId)` | an owner's connections, newest first |
| `withConnectionLock(id, fn)` | `fn(tx, row)` in a transaction holding the row's lock (`SELECT ... FOR NO KEY UPDATE`), with the row as it is now or `null`; re-entrant in its own transaction |
| `createRun(fields)` / `getRun(id)` / `updateRun(id, changes)` | a `qube_runs` row |
| `latestRun(recordType, recordId, operation)` | a record's newest run of an operation, or `null` |
| `withRunLock(id, fn)` | as `withConnectionLock`, for a run |
| `once(runId, deliveryId, fn)` | runs `fn` unless the run has taken that delivery id (`qube_notifications`), in the same transaction, and answers whether it ran |
| `findQuickbooksRecords(where, { limit, lock })` | `qube_quickbooks_records` rows by `connectionId` and any of `kind`, `list`, `qbId`, `recordType`, `recordId`, in id order |
| `createQuickbooksRecord(fields)` / `updateQuickbooksRecord(id, changes)` / `deleteQuickbooksRecord(id)` | |

A write that breaks one of `schema.sql`'s unique keys throws `StoreConflict`. An id from a URL
that isn't a valid id (`"abc"`) finds nothing. Check your store with the suite, from a test file of
its own:

```js
// test/qube-store.test.js
const storeTests = require("qubesync/kit/store-tests");
const { makeStore } = require("../quickbooks-desktop/store");

storeTests(async () => makeStore(await freshTestDatabase()));
```

### The config file: `quickbooks-desktop/config.js`

The only place the kit reads your app from. A setting it needs and you haven't written throws
`NotConfigured` the first time it's needed, naming this file, so nothing silently passes.

```js
const { configure } = require("qubesync/kit"); // or: import { configure } from "qubesync/kit";

const { Account, Customer, Invoice } = require("../models");
const store = require("./store");
const CreateInvoice = require("./create-invoice");
const ConnectionEvents = require("./connection-events");

const MODELS = { Account, Customer, Invoice };

module.exports = configure({
  store,
  operations: { create_invoice: CreateInvoice },
  connectionEvents: ConnectionEvents,
  currentAccount: (req) => (req.user ? Account.findByPk(req.user.accountId) : null),
  // Your record of a type the kit kept (a run's, a connection's owner, a linked QuickBooks id).
  findRecord: (type, id) => (MODELS[type] ? MODELS[type].findByPk(id) : null),
  // Optional: a durable queue (below).
  // enqueue: (delivery) => queue.add("webhook", delivery, { attempts: 10 }),
});
```

| Setting | What it is | Default |
| --- | --- | --- |
| `store` | your store | none: throws |
| `operations` | slug → operation class (each class's static `slug` is its key) | none: throws |
| `connectionEvents` | your `ConnectionEvents` class | none: throws |
| `currentAccount` | `(req) → account`: the signed-in customer's account, which owns its connections. `null` answers 401. | none: throws |
| `authorizeQuestion` | `(req, record, run) → true` when the signed-in user may answer or search that run's question, or send its start again. The run carries its `operation` and its `connection` (whose `ownerType` and `ownerId` say who connected it). Only `true` allows; anything else answers 404 (search: `[]` with 404), as for a missing run, and is logged. | allows only when `currentAccount` owns the run's connection (compared by type and id, so a null account, or one with no id, never matches); with neither this nor `currentAccount` set, throws `NotConfigured` naming the config file (a 500), as any unset setting does |
| `recordType` | `(record) → type`: the type a row keeps for one of your records | its class's name (a plain object, as Prisma returns, needs this set) |
| `findRecord` | `(type, id) → record`: your record of that type | none: an operation needs its own `findRecord`, and `findLinked` and `owner()` throw |
| `enqueue` | `(delivery) →` hands `{ kind, id, body }` (kind `"run"` or `"connection"`) to your queue; `false` or a throw answers 503 | `job(delivery)` in this process, after the response, with a warning |
| `jobAttempts` | how many times `job()` runs a delivery whose work threw, with a growing wait, before it logs an error and throws | `10` |
| `apiKey`, `baseUrl`, `webhookSecret`, `webhookUrl` | | the environment above; `webhookSecret` may be a list while one rotates |

The secrets never show: `console.log` and `JSON.stringify` of the settings say only whether each is
set. Set `authorizeQuestion` only to change who may answer: to check more (that this user may see
the record), or less (staff who act for any account):

```js
authorizeQuestion: async (req, record, run) =>
  run.connection.ownerId === String(req.user.accountId) && req.user.canEdit(record),
```

### Mounting the routers: `app.js`

Three routers, each optional, since they mount in different places. Their paths are relative to
where they're mounted.

```js
const express = require("express");
const qube = require("qubesync/express"); // or: import { webhooks, connect, questions } from "qubesync/express";
const config = require("./quickbooks-desktop/config");

const app = express();
app.use(qube.webhooks(config)); // before express.json(): the raw body, no sign-in, no CSRF
app.use(express.json());
app.use(requireSignIn); // your sign-in, and your CSRF protection
app.use(qube.connect(config));
app.use(qube.questions(config));
```

| Route | What it does |
| --- | --- |
| `POST quickbooks/connections` | Connect, for the signed-in account. Sends its newest connection that has never connected (`pending` or `setup_cancelled`) back through setup, so clicking Connect again doesn't pile up connections. Makes a new one (the row, then QuBe Sync's connection with the row's webhook URL, then its `qubeId`, with an optional `name`) when the account has none, or with `new=1`. Redirects (303) to the setup. |
| `POST quickbooks/connections/:id/onboarding` | One of the signed-in account's connections, back through setup, with its webhook URL brought up to date (or made at QuBe Sync, for a row QuBe Sync never answered). Another account's connection answers 404. |
| `POST webhooks/qube/runs/:id` | A run's webhooks. |
| `POST webhooks/qube/connections/:id` | A connection's webhooks. |
| `POST qube/questions/runs/:id` | Your user's answer to the run's question, from `renderQuestion`'s forms. |
| `GET qube/questions/runs/:id/search` | A record field's matches, as JSON. |
| `POST qube/runs/:id/retry_start` | A start QuBe Sync never confirmed, sent again with the same reference, from `renderRunStatus`. 409 for a run that isn't `starting`. |

The webhook routes verify the signature (401 if it doesn't check out, logging only its reason),
answer 404 when the row isn't there, enqueue, and answer 200, or 503 when the enqueue didn't take
it. Any content type, up to 5 MB (413 beyond). Each id in a URL is only a pointer: the job checks
the signed event's reference and connection id against the row. The question routes and the start
retry ask `authorizeQuestion` before anything else; an answer QuBe Sync says has changed (409, or
any 400) forgets the question and answers 409, and one it can't take (422) says why.

Passing `config` (what `configure` returns) makes sure the config file is loaded before the routes
are; a router also takes more settings in its argument. `connect()` and `questions()` parse their
own forms, after your middleware: if your CSRF protection reads its token from the body, mount
`express.urlencoded({ extended: false })` before it. Two buttons cover connecting:

```html
<form method="post" action="/quickbooks/connections"><button>Connect QuickBooks Desktop</button></form>
<form method="post" action="/quickbooks/connections">
  <input type="hidden" name="new" value="1"><input type="hidden" name="name" value="Second file">
  <button>Connect another company file</button>
</form>
```

### Connections

A `Connection` is one company file: `ownerType` and `ownerId` (your account), `qubeId` (QuBe
Sync's id, `null` until it answers), `name`, `status` (`pending`, `connected`, `setup_cancelled`,
`stalled`), `stallReason` and `revision`. `Connection.ownedBy(account)` lists an account's, and
`Connection.get(id)` finds one. `connection.notCheckingIn()` is a stall because the Web Connector
isn't calling in; `connection.webhookUrl()` is `QUBE_WEBHOOK_URL/connections/<id>`.

Its own events update `status`, `stallReason` and `revision` when the event is for that connection
(`qubeId`) and newer than the last one applied, under the row's lock. Then your class runs, with
`this.connection` and `await this.owner()`.

An event can come before the row has its `qubeId`: a simulated connection sends
`connection.connected` as it's made, before `createConnection` has answered. Such an event finds
QuBe Sync's connection made with the row's webhook URL and keeps its id, or throws `NotReady`, so
the job tries again shortly. Connect does the same for a row left without an id (a crash between
the create and the save), so one row never gets two connections. Adopting lists the app's
connections and takes only the one with the row's webhook URL that has never connected, or is simulated (a
simulated connection connects as it's made, so nobody else can have set it up), was made at
or after the row (its `created_at`, with five minutes allowed for clock difference), and has the
row's name when the row has one; if two qualify it takes neither, and one with no `created_at` is
never adopted.

```js
// quickbooks-desktop/connection-events.js
const { ConnectionEvents } = require("qubesync/kit");

class QuickbooksConnectionEvents extends ConnectionEvents {
  // QuickBooks is connected: start syncing.
  async connected(event) {
    await InitialImport.start(await this.owner(), this.connection);
  }

  // They chose "Cancel setup": offer to set it up again.
  async setupCancelled(event) {
    this.logEvent(event);
  }

  // this.connection.stallReason: "not_checking_in" (turn on the QuickBooks computer and check the
  // Web Connector runs) or "quickbooks_unavailable" (open QuickBooks with the company file).
  async stalled(event) {
    await mailer.quickbooksStalled(await this.owner(), this.connection);
  }

  async resumed(event) {
    this.logEvent(event);
  }
}

module.exports = QuickbooksConnectionEvents;
```

#### QuickBooks ids

Every ListID and TxnID your app learns is kept against its connection and its list family.
QuickBooks gives out ListIDs from one counter per family, so an id is unique only within its family
of one company file: customers, vendors, employees and other names share one, every item type
shares another, each other list (accounts, classes, terms...) has its own (`familyFor(kind)`).
TxnIDs are kept per transaction type.

```js
await connection.link(customer, { kind: "customer", qbId: listId, editSequence: "171", name: "Riverbend Electric" });
await connection.qbIdFor(customer, { kind: "customer" });     // "80000001-1738310400", or null
await connection.findLinked(listId, { kind: "customer" });    // your Customer (findRecord), or null
await connection.findLinked(entityRefListId);                 // any family; throws if the id is in several
await connection.quickbooksRecord(listId, { kind: "item" });  // the row, with kind, editSequence and name
```

A record has one id per kind on a connection; linking it again replaces it. One contact can be
linked as a customer and as a vendor. An id already linked in that family to another of your
records moves to this one, and that's logged; linked again with another kind of the same family
(an item converted from service to non-inventory), the row's kind changes. `qbIdFor` finds an item
linked as `item_service` when asked for `item` or `item_non_inventory`, but never hands out a
customer's id as a vendor's.

### Writing an operation: `quickbooks-desktop/create-invoice.js`

```js
const { Operation, get } = require("qubesync/kit");
const { Invoice } = require("../models");

class CreateInvoice extends Operation {
  static workflow = "add_transaction";
  static slug = "create_invoice";

  // Optional: your record, by the id its run keeps. Leave it out and the findRecord setting finds
  // it by its type; write it to load what the input reads.
  static async findRecord(id) {
    return Invoice.findByPk(id, { include: ["customer", { association: "lines", include: ["item"] }] });
  }

  // The run's input, from the record. withoutNils leaves out a field your record doesn't have yet.
  async input() {
    const lines = await Promise.all(
      this.record.lines.map(async (line) => ({
        item_ref: await this.quickbooksRef(line.item, { kind: "item", name: get(line, "item", "name") }),
        amount: line.total,
      }))
    );
    return this.withoutNils({
      operation: "invoice.create",
      params: {
        // Its ListID on this connection when it's linked, otherwise its name.
        customer_ref: await this.quickbooksRef(this.record.customer, { kind: "customer", name: get(this.record, "customer", "name") }),
        ref_number: this.record.number,
        invoice_line_add: lines,
      },
    });
  }

  // How the run ended: event.outcome says which, event.output holds the result.
  async ended(event) {
    // The records the add named, found or made, by the input's path: linked, so the next run
    // refers to them by id.
    await this.linkReferences(event, (path) => {
      if (path === "customer_ref") return this.record.customer;
      const line = /^invoice_line_add\.(\d+)\.item_ref$/.exec(path);
      return line ? get(this.record.lines[Number(line[1])], "item") : null;
    });
    if (event.outcome !== "added") return;

    const txn = (event.output && event.output.record) || {};
    await this.connection.link(this.record, { kind: "invoice", qbId: txn.txn_id, editSequence: txn.edit_sequence, name: txn.ref_number });
    await this.record.update({ status: "sent" });
  }

  // A run that failed, or that your app cancelled.
  async failed(event) {
    await this.record.update({ status: "failed" });
  }

  // What a running workflow sends along (a sync's pages): taken once per delivery_id.
  async notification(event) {
    this.logEvent(event);
  }
}

module.exports = CreateInvoice;
```

```js
const run = await CreateInvoice.start(invoice, connection);
```

With [typed workflow starts](#typed-workflow-starts), `input` can return the generated builder's
input, and in TypeScript say so: `input(): AddTransactionInvoiceInput` returning
`addTransaction.invoiceInput(params, { adds })`, both from `require("../qube-workflows")` (the
module `npx qubesync workflows` writes at your app's root). It's an object as before, so nothing
else changes; run `npx qubesync workflows --check` in CI to keep it current.

`start` takes a connection QuBe Sync has made (it throws `NotConnected` for one with no `qubeId`).
It writes the run's row first, with a new reference and state `starting`, since a webhook can come
before it returns; starts the run with that reference as the idempotency key and
`QUBE_WEBHOOK_URL/runs/<run id>` as its webhook URL; keeps QuBe Sync's `qubeRunId`, `state`,
`runUrl` and `cancelUrl`; and resolves to the `Run`. The row keeps the input it sent.

- **Refused** (QuBe Sync answered 4xx) or an input that threw: nothing was started. The row is
  marked `failed` and the error thrown; start again.
- **No answer** (a timeout, a 5xx, a dropped connection): the run may have started. The row stays
  `starting`, with its reference and input, and the error is thrown. Send it again with
  `await run.retryStart()` (or `CreateInvoice.retryStart(run)`), never with a new `start`: a new
  reference would start a second run, and a second invoice.

`retryStart` resends the same reference as the `Idempotency-Key`, with the same workflow, input
and webhook URL: QuBe Sync answers a repeat of a start it took with the run that start made, and
starts nothing. It returns a run that already has its `qubeRunId` as it is, and refuses one that
`failed`.

Each event is applied under the run row's lock (`withRunLock`): one whose reference isn't the
run's, or whose `connection_id` isn't its connection's, is skipped and logged; a notification is
taken once (`once`, in the same transaction); anything else only when its revision is newer than
the last applied. Handlers see `this.record`, `this.run` and `this.connection`, and `this.store`,
the lock's transaction: what a handler writes through it (a `link`, say) is saved with the revision
or not at all. A handler you don't write logs.

### Run status and questions

The kit keeps every ending on the run row before your handler runs: `state`, `outcome`, a
failure's `error` (a sentence, or its code, message and detail), a cancel's `cancelReason`, and
`endedAt`. `run.ended()`, `run.failed()` and `run.cancelled()` say which, and `run.summaryText()`
says it in a sentence: "Added to QuickBooks", "Done", "Failed: <message>", "Cancelled: <reason>",
"Waiting for your answer", "Starting", "Not confirmed by QuBe Sync yet" or "Running".
`run.errorMessage()` and `run.errorDetail()` give the error's parts.

Show the latest run on the record's page:

```js
const { Run, renderQuestion, renderRunStatus } = require("qubesync/kit");

const run = await Run.latestFor(invoice, "create_invoice");
const html =
  renderRunStatus(run, { csrfToken: req.csrfToken() }) +
  renderQuestion(run, { csrfToken: req.csrfToken(), nonce: res.locals.cspNonce });
```

`renderRunStatus(run, { mount, csrfToken, csrfField = "_csrf" })` shows the summary
(`.qube-run-summary`, inside `.qube-run-status.qube-run-<state>`) and, for a failure, the error's
detail (`.qube-run-error-detail`); a start unconfirmed for a minute (`run.unconfirmed()`) gets a
"Try the start again" button posting to `qube/runs/:id/retry_start`. `renderQuestion(run, { mount,
csrfToken, csrfField, nonce })` shows the run's open question, a form per choice posting to
`qube/questions/runs/:id`, and a record field's box searching through your app, so the API key
never reaches the browser. Both return `""` when there's nothing to show, escape every value, and
use `qube-` classes for your CSS; `mount` is where `questions()` is mounted. For other markup,
write your own with `escapeHtml` and `SEARCH_SCRIPT`.

### Background work

QuBe Sync's webhooks are handled in the background. The endpoint verifies a delivery, answers 200
at once, and hands it to `enqueue`. The default runs `job(delivery)` in your web process after the
response: a restart loses the deliveries it hasn't run, so point `enqueue` at a queue before
production, and have its worker call `run(delivery)`:

```js
const { Queue, Worker } = require("bullmq");
const { run } = require("qubesync/kit");

const queue = new Queue("qube-webhooks", { connection });
// in config: enqueue: (delivery) => queue.add("webhook", delivery, { attempts: 10, backoff: { type: "exponential", delay: 3000 } }),
new Worker("qube-webhooks", (task) => run(task.data), { connection }); // require the config file here too
```

Retries are your queue's: QuBe Sync stops sending a delivery once your endpoint has answered 200.
`run` throws when it can't do the work (a handler threw, the store is down, the run's operation was
taken out of `operations`, or a connection's event came before its `qubeId`: `NotReady`). `job`,
the default's, tries `jobAttempts` times with a growing wait (3 s, 18 s, 83 s...), then logs an
error ("QuBe Sync: gave up on a webhook ...") and throws. A delivery whose run, connection or record
has been deleted since isn't retried: `run` logs a warning ("QuBe Sync: dropped ...") and returns.

Without Express, `qubesync/kit` has the routes' work as plain functions: `receiveWebhook`,
`connectQuickbooks`, `resendOnboarding`, `answerQuestion`, `searchQuestion` and `retryStart`, each
resolving to the status (and body or location) to answer with.

### Storage

Rows go with their run: deleting a run deletes its notifications (`ON DELETE CASCADE`). Runs
themselves are yours to prune once you no longer need them, for instance runs in `completed`,
`failed` or `cancelled` whose `ended_at` is more than 90 days ago.

## Development

```sh
npm ci              # the dev dependencies: Express 4, TypeScript and Express's types
npm test            # node:test: the client, webhooks, the kit, the store checks on memoryStore() and the Express adapter
npm run test:types  # tsc --strict against test/types.ts and test/kit-types.ts
node scripts/generate-operations.js          # regenerate operations/ from test/fixtures/operations.json
node scripts/generate-operations.js --check  # fail when operations/ is stale
UPDATE_GOLDEN=1 node --test test/workflow-types.test.js  # rewrite test/fixtures/workflow_types/qube-workflows.*
```

`test/fixtures/test_vectors.json` comes from the QuBe Sync server (`mix webhook_vectors.gen`), and
`test/fixtures/operations.json` from https://qubesync.com/libraries/operations.json
(`mix library_operations.gen`). `test/fixtures/workflow_types/document.json` is the hand-written
sample the Ruby gem's specs render too, and `served.json` a real `GET /api/v2/workflows/types`
document for the shipped templates. Copy a new version in, then regenerate; don't edit either, or
anything in `operations/`.

## License

MIT
