// Compiled with `npm run test:types` (tsc --strict --noEmit); never run.
import { verify, parse, SignatureError, WebhookEvent, SignatureErrorReason, VerifyOptions } from "qubesync";

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
