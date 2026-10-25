// Compiled with `npm run test:types` (tsc --strict --noEmit); never run.
import {
  verify,
  parse,
  SignatureError,
  WebhookEvent,
  SignatureErrorReason,
  VerifyOptions,
  Client,
  APIError,
  ApiObject,
  ClientOptions,
  RequestsPage,
  RunEventsPage,
  RetryInfo,
} from "qubesync";

declare const rawBody: Uint8Array;
declare const header: string | undefined;

const options: VerifyOptions = { secrets: ["whsec_a", "whsec_b"], tolerance: 300, now: new Date() };

function handle(event: WebhookEvent): string | null {
  switch (event.type) {
    case "request":
      return event.dedupeKey ?? event.pageRequestId;
    case "workflow_run": {
      const apply: boolean = event.newerThan(null);
      return apply ? event.runState : event.reference;
    }
    case "notification":
      return event.deliveryId;
    case "connection":
      return event.newerThan(undefined) ? event.connectionId : event.stallReason;
    case "name_index":
      return event.connectionId;
    case "unknown":
      return event.event;
  }
}

try {
  const event = verify(rawBody, header, options);
  handle(event);
  handle(verify("{}", "t=1,v1=00", { secrets: "whsec_a", now: 1761000000 }));
  handle(parse("{}"));
  const body: unknown = event.body["anything"];
  void body;
} catch (error) {
  if (error instanceof SignatureError) {
    const reason: SignatureErrorReason = error.reason;
    void reason;
  }
}

// The v2 client.
const clientOptions: ClientOptions = { apiKey: "sk_test", baseUrl: "https://qubesync.com", connectTimeout: 5000, timeout: 30000, maxRetries: 2 };
const client = new Client(clientOptions);
new Client({ apiKey: "sk_test", sleep: async (ms: number) => void ms, clock: () => 0 });
new Client({
  apiKey: "sk_test",
  totalTimeout: 60000,
  onRetry: (info: RetryInfo) => {
    const parts: [number, number, number, number, string, string, number | null, Error | null] = [
      info.attempt,
      info.maxRetries,
      info.delayMs,
      info.elapsedMs,
      info.method,
      info.url,
      info.status,
      info.error,
    ];
    void parts;
  },
});
const totalTimeout: number = new Client({ apiKey: "k" }).totalTimeout;
void totalTimeout;
const baseUrl: string = client.baseUrl;
void baseUrl;

async function useClient(): Promise<void> {
  const connection: ApiObject = await client.createConnection({ webhookUrl: "https://app.test/hooks", name: "Acme" });
  const onboarding: string = connection["links"]["onboarding"];
  void onboarding;
  await client.getConnection("c");
  const connections: ApiObject[] = await client.listConnections();
  void connections;
  await client.updateConnection("c", { name: "New" });
  const deleted: null = await client.deleteConnection("c");
  void deleted;
  await client.regenerateOnboarding("c");
  await client.setPassword("c");
  await client.setPassword("c", { password: "p" });
  const qwc: string = await client.getQwc("c");
  void qwc;

  const run = await client.startRun("c", "customer_sync", { customer: {} }, { reference: "order-1", webhookUrl: "https://app.test/h", version: 2 });
  await client.getRun(run.links.run);
  await client.getRun("c", run.id);
  await client.listRuns("c", { reference: "order-1", state: "awaiting_input", outcome: "succeeded" });
  await client.cancelRun(run.links.cancel, { reason: "asked" });
  await client.cancelRun(run.links.cancel);
  const events: RunEventsPage = await client.runEvents("c", "r", { after: "7.3", limit: 50 });
  void events.next_after;

  await client.answer(run.prompt.links.decisions, { choice: "use_existing", data: { customer: "1" } });
  const matches: ApiObject[] = await client.search(run.prompt.links.search, { field: "customer", q: "Ac" });
  void matches;

  await client.queue("c", "customers", { name: "Acme" }, { webhookUrl: "https://app.test/h" });
  await client.queue("c", "txn-deleteds", { txn_del_type: "Invoice" }, { webhookUrl: "https://app.test/h", method: "get", idempotencyKey: "k" });
  await client.queueQbxml("c", "<QBXML/>", { webhookUrl: "https://app.test/h" });
  await client.getRequest("c", "q");
  await client.requestPages("c", "q");
  const page: RequestsPage = await client.listRequests("c", { page: 1, pageSize: 50, state: "errored", webhookState: "failed", sort: "inserted_at", sortDirection: "desc", searchPhrase: "A" });
  const total: number = page.meta.total_pages;
  void total;
  for await (const request of client.eachRequest("c", { state: "errored" })) void request["id"];
  await client.discardRequest("c", "q");
  const anything: unknown = await client.request("GET", "/workflows", undefined, { query: { a: 1, b: ["x", "y"] }, headers: { "X-A": "b" } });
  void anything;
}

useClient().catch((error: unknown) => {
  if (error instanceof APIError) {
    const parts: [number, string | null, string, string | null] = [error.status, error.code, error.body, error.requestId];
    void parts;
    void error.errors;
  }
});
