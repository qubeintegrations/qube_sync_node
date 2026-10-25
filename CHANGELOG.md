# Changelog

## 0.3.0 (unreleased)

The integration kit's foundation, so an Express app keeps only its own code (a config, operation
classes, a connection class) and updates the rest with `npm update`.

- `qubesync/kit`, framework-free: `configure(settings)` / `settings()` (operations, connection,
  currentAccount, authorizeQuestion, enqueue, dedupe, apiKey, baseUrl, webhookSecret, webhookUrl;
  an unset one throws at first use naming the config file, the secrets fall back to the
  environment and never show in `inspect` or JSON); the `Operation` and `ConnectionEvents` bases
  (reference, revision and delivery-id checks, questions saved and forgotten, `saveRecord`);
  `run(job)`; `receiveWebhook`, `startOnboarding`, `answerQuestion` and `searchQuestion`;
  `renderQuestion` with `escapeHtml` and `SEARCH_SCRIPT`; the mapping helpers (`get`, `rows`,
  `dig`, `asString`, `asNumber`, `asInteger`, `asDate`, `withoutNils`); `client()`.
- `qubesync/express`, for Express 4 and 5 (an optional peer dependency): the `webhooks()`,
  `connect()` and `questions()` routers.
- Unset, `authorizeQuestion` refuses every answer and search with a 403 and logs why (anything it
  returns but `true` is a 404); `enqueue` runs jobs in
  the process after the response, and `dedupe` keeps delivery ids in memory, each warning once.

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
