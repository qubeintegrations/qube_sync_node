# qubesync (Node)

The [QuBe Sync](https://qubesync.com) v2 API client, and webhook verification and parsing:
QuickBooks Desktop through qubesync.com. Plain JavaScript, zero dependencies, Node 16.17 and
later, CommonJS and ESM, TypeScript declarations included. API docs: https://docs.qubesync.com.
For an Express app, [the integration kit](#the-integration-kit-qubesynckit-and-qubesyncexpress) is
the webhook endpoint, onboarding and the question routes, ready to mount.

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

Everything an Express app's QuBe Sync integration has that's the same in every app: the webhook
endpoint and its job, onboarding, the question routes and their HTML, and the `Operation` and
`ConnectionEvents` bases with their reference, revision and delivery-id checks. Your app keeps only
its own code, in `quickbooks-desktop/`: one config file, an operation class per way it starts a
workflow, and a connection class. `npm update qubesync` updates the rest; don't copy it into your
app. `qubesync/kit` is framework-free; `qubesync/express` mounts it in Express 4 or 5.

```bash
npm install "qubesync@>=0.3.0" express
```

The environment, read at first use: `QUBE_API_KEY`, `QUBE_URL` (default `https://qubesync.com`) and
`QUBE_WEBHOOK_SECRET`, which `qube env --write .env` writes, and `QUBE_WEBHOOK_URL`, the base of
every run's and connection's webhook URL: `qube listen --write-env .env` writes it in development,
and in production it's your app's `/webhooks/qube`.

### The config file: `quickbooks-desktop/config.js`

The only place the kit reads your app from. A setting it needs and you haven't written throws the
first time it's needed, naming this file, so nothing silently passes. Write `authorizeQuestion`
before anything else.

```js
const { configure } = require("qubesync/kit"); // or: import { configure } from "qubesync/kit";

const Account = require("../models/account");
const CreateInvoice = require("./create-invoice");
const AccountConnection = require("./account-connection");

module.exports = configure({
  // Each operation class by the slug in its webhook URL (its static slug). A fixed list, so a
  // class is never looked up from the URL itself: any other slug is a 404.
  operations: { create_invoice: CreateInvoice },
  // The connection's own events (connected, setup cancelled, stalled, resumed).
  connection: AccountConnection,
  // The signed-in customer's account, from the request.
  currentAccount: (req) => Account.findByPk(req.user.accountId),
  // True when the signed-in user may answer or search this record's question. The record's id
  // comes from the URL, so this is all that keeps one customer's users off another's records:
  // until it's set, every answer and search is refused with a 403 (and logged).
  authorizeQuestion: (req, record) => record.accountId === req.user.accountId,
  // Optional: a durable queue (below), and a dedupe store shared by every process.
  // enqueue: (job) => queue.add("webhook", job),
  // dedupe: { seen: (key) => redis.exists(`qube:${key}`), remember: (key) => redis.set(`qube:${key}`, 1, "EX", 86400) },
});
```

| Setting | What it is | Default |
| --- | --- | --- |
| `operations` | slug → operation class | none: throws |
| `connection` | your connection class | none: throws |
| `currentAccount` | `(req) → account` | none: throws |
| `authorizeQuestion` | `(req, record, operation) → true` when the user may answer or search; anything else is a 404 | refuses every answer and search with a 403, and logs why |
| `enqueue` | `(job) →` hands `{ operation, recordId, body }` to your queue | in this process, after the response, one at a time, with a warning |
| `dedupe` | `{ seen(key), remember(key) }` for notification delivery ids (may be async) | in this process's memory, with a warning |
| `apiKey`, `baseUrl`, `webhookSecret`, `webhookUrl` | | the environment above; `webhookSecret` may be a list while one rotates |

The secrets never show: `console.log` and `JSON.stringify` of the settings say only whether each is
set.

### Mounting the routers: `app.js`

Three routers, each optional, since they mount in different places. Their paths are relative to
where they're mounted.

```js
const express = require("express");
const qube = require("qubesync/express"); // or: import { webhooks, connect, questions } from "qubesync/express";
const config = require("./quickbooks-desktop/config");

const app = express();

// POST /webhooks/qube/:operation/:record_id. Before express.json(), which would read the body
// first and leave nothing to verify: no sign-in, no CSRF. Verifies, answers 404 for a slug that
// isn't yours, enqueues and answers 200 (401 for a bad signature, logging only its reason).
app.use(qube.webhooks(config)); // { limit: "5mb" }: the biggest body taken

app.use(express.json());
app.use(requireSignIn); // your sign-in, and your CSRF protection

// POST /quickbooks/connect, from a "Connect QuickBooks Desktop" button: makes the account's
// connection (or reuses it, with a fresh link) and redirects to QuBe Sync's setup. The setup
// doesn't come back here: connection.connected comes to your connection class by webhook.
app.use(qube.connect(config));

// POST /qube/questions/:operation/:record_id (a choice) and GET .../search (a record field's
// matches): each asks authorizeQuestion first (anything but true is a 404; unset, a 403), and the
// API key never reaches the browser.
app.use(qube.questions(config));
```

Passing `config` (what `configure` returns) makes sure the config file is loaded before the routes
are; a router also takes more settings in its argument. `questions()` parses its own form, after
your middleware: if your CSRF protection reads its token from the body, mount
`express.urlencoded({ extended: false })` before it.

### An operation: `quickbooks-desktop/create-invoice.js`

```js
const { Operation, withoutNils, asString } = require("qubesync/kit");
const Invoice = require("../models/invoice");

class CreateInvoice extends Operation {
  static workflow = "add_transaction";
  static slug = "create_invoice";

  // Your invoice, by the id in its webhook URL.
  static async findRecord(id) {
    return Invoice.findByPk(id, { include: ["lines"] });
  }

  // The run's input, from the invoice.
  input() {
    return withoutNils({ operation: "invoice.create", params: { ref_number: asString(this.record.id) } });
  }

  // How the run ended: event.outcome says which, event.output holds the result.
  async ended(event) {
    if (event.outcome === "added") {
      this.record.txnId = event.output.record.txn_id;
      await this.saveRecord();
    }
  }

  // A run that failed, or that your app cancelled.
  async failed(event) {
    this.logEvent(event);
  }
}

module.exports = CreateInvoice;
```

Start a run with `await CreateInvoice.start(invoice, account.qube_connection_id)`. The record keeps
the run's reference and revision in `qube_reference` and `qube_revision`, and a question in
`qube_question` and `qube_links` (JSON), written with the record's `save()` (Sequelize, Mongoose,
TypeORM). Override `saveRecord` for another ORM (Prisma's `update`, say), or `savedReference` /
`saveReference`, `savedRevision` / `saveRevision`, `savedQuestion` / `savedLinks` / `saveQuestion`
to keep them elsewhere. The handlers: `question` (saves it; your user's choice answers it),
`notification`, `ended`, `failed`; each logs until you write it. `handle` skips an event whose
reference isn't the record's, takes a notification once by its delivery id (`dedupe`), and applies
any other only when its revision is newer. With more than one worker, take a row lock on the record
around it.

In TypeScript, `class CreateInvoice extends Operation<Invoice>` types `this.record`.

### The connection class: `quickbooks-desktop/account-connection.js`

```js
const { ConnectionEvents } = require("qubesync/kit");
const Account = require("../models/account");

class AccountConnection extends ConnectionEvents {
  static async findRecord(id) {
    return Account.findByPk(id); // the id in the connection's webhook URL
  }

  async connected(event) { /* mark the account connected, and start syncing */ }
  async setupCancelled(event) { /* offer Connect QuickBooks Desktop again */ }
  async stalled(event) { /* show event.stallReason: not_checking_in or quickbooks_unavailable */ }
  async resumed(event) { /* clear what stalled showed */ }
}

module.exports = AccountConnection;
```

The account keeps its connection's id and last revision in `qube_connection_id` and
`qube_connection_revision`; override `savedConnectionId` / `saveConnectionId`, `savedRevision` /
`saveRevision` or `saveRecord` to keep them elsewhere.

### Showing a question: `renderQuestion`

```js
const { renderQuestion } = require("qubesync/kit");

const html = renderQuestion(invoice.qube_question, {
  action: `/qube/questions/create_invoice/${encodeURIComponent(invoice.id)}`, // where questions() is mounted
  csrfToken: req.csrfToken && req.csrfToken(), // your CSRF protection's, as _csrf (csrfField: to rename it)
  nonce: res.locals.cspNonce, // your Content-Security-Policy's, on the search box's script
});
```

`renderQuestion(question, { action, csrfToken, csrfField = "_csrf", nonce })` returns the
question as HTML, a form per choice, with every value escaped and `qube-` classes for your CSS, or
`""` when nothing is asked. For other markup, write your own with `escapeHtml` and `SEARCH_SCRIPT`:
the routes need only the form's `choice` and `data[<field>]`, and a search box's
`data-qube-search` and `data-qube-field`.

### A durable queue

The default `enqueue` runs each job in your web process after the response: a restart loses the
jobs it hasn't run, so point it at a queue before production. QuBe Sync had its 2xx when a job was
enqueued, so a job that throws is your queue's to retry. With BullMQ:

```js
const { Queue, Worker } = require("bullmq");
const { run } = require("qubesync/kit");

const queue = new Queue("qube-webhooks", { connection });
// in config: enqueue: (job) => queue.add("webhook", job, { attempts: 10 }),
new Worker("qube-webhooks", (job) => run(job.data), { connection }); // require the config file here too
```

pg-boss is the same with `boss.send` and `boss.work`. Without Express, `qubesync/kit` has the
routes' work as plain functions: `receiveWebhook`, `run`, `startOnboarding`, `answerQuestion` and
`searchQuestion`.

## Development

```sh
npm ci              # the dev dependencies: Express 4, TypeScript and Express's types
npm test            # node:test: the client, webhooks, the kit and the Express adapter
npm run test:types  # tsc --strict against test/types.ts and test/kit-types.ts
node scripts/generate-operations.js          # regenerate operations/ from test/fixtures/operations.json
node scripts/generate-operations.js --check  # fail when operations/ is stale
```

`test/fixtures/test_vectors.json` comes from the QuBe Sync server (`mix webhook_vectors.gen`), and
`test/fixtures/operations.json` from https://qubesync.com/libraries/operations.json
(`mix library_operations.gen`). Copy a new version in, then regenerate; don't edit either, or
anything in `operations/`.

## License

MIT
