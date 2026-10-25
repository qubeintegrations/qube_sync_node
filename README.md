# qubesync (Node)

The [QuBe Sync](https://qubesync.com) v2 API client, and webhook verification and parsing:
QuickBooks Desktop through qubesync.com. Plain JavaScript, zero dependencies, Node 16.17 and
later, CommonJS and ESM, TypeScript declarations included. API docs: https://docs.qubesync.com.

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

```js
// POST /connections/{id}/customers; the answer arrives at webhookUrl.
const queued = await qube.queue(connectionId, "customers", { name: "Acme" }, {
  webhookUrl: "https://app.example.com/webhooks/qube",
});

// A query: method "GET" sends the params as the query string.
await qube.queue(connectionId, "txn-deleteds", { txn_del_type: ["Invoice", "Bill"] }, {
  webhookUrl: "https://app.example.com/webhooks/qube",
  method: "GET",
});

// qbXML as written.
await qube.queueQbxml(connectionId, requestXml, { webhookUrl: "https://app.example.com/webhooks/qube" });
```

`operation` is the path after the connection (`"customers"`, `"invoices"`, `"txn-deleteds"`, see the
[API reference](https://docs.qubesync.com)). `method` is `"POST"` by default, and case-insensitive.

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
- `queue` and `queueQbxml` take `idempotencyKey`; left out, the client makes a UUID per call and
  sends it again on that call's retries, so a retry never queues a request twice.
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

## Development

```sh
npm test            # node:test, no dependencies
npm run test:types  # tsc --strict against test/types.ts (fetches TypeScript with npx)
```

`test/fixtures/test_vectors.json` comes from the QuBe Sync server (`mix webhook_vectors.gen`).
Copy a new version in; don't edit it.

## License

MIT
