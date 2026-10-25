# Changelog

## 0.2.0 (2026-10-25)

The v2 API client.

- `new Client({ apiKey, baseUrl = "https://qubesync.com", connectTimeout = 5000, timeout = 30000, maxRetries = 2 })`:
  Basic auth with the key passed in (the environment is never read), and the key never in
  `util.inspect`, `JSON.stringify` or an error.
- Connections: `createConnection`, `getConnection`, `listConnections`, `updateConnection`,
  `deleteConnection`, `regenerateOnboarding`, `setPassword`, `getQwc`.
- Runs: `startRun` (the `reference` is the Idempotency-Key), `getRun` by link or ids, `listRuns`,
  `cancelRun`, `runEvents`. Questions: `answer`, `search`.
- Requests: `queue` (any operation, `method` `"POST"` by default, a generated Idempotency-Key reused
  on retries), `queueQbxml`, `getRequest`, `requestPages`, `listRequests`, `eachRequest` (an async
  iterator over every page), `discardRequest`; `request` for anything else.
- Links are refused unless they're on the client's own origin.
- Retries for retry-safe requests on a failed connection, a timeout, 429, 502, 503 and 504, with
  `Retry-After` honoured up to 30 s.
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
