# qubesync (Node)

Verify and parse [QuBe Sync](https://qubesync.com) webhooks: QuickBooks Desktop through
qubesync.com. Plain JavaScript, zero dependencies, Node 16.17 and later, CommonJS and ESM,
TypeScript declarations included.

> Not on npm yet: the package name isn't settled, so `package.json` is `"private": true`.
> Install from a checkout (`npm install ../qube_sync_node`) for now.

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
