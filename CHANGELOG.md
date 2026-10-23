# Changelog

## 0.1.0 (unreleased)

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
- Tested against the server's own test vectors (`test/fixtures/test_vectors.json`).
