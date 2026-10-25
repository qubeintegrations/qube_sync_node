// Compiled with `npm run test:types` (tsc --strict --noEmit); never run. A TypeScript app's
// quickbooks-desktop/ files, as the README writes them, against qubesync/kit and qubesync/express.
import express = require("express");
import type { Request } from "express";
import {
  ConnectionEvents,
  Operation,
  configure,
  renderQuestion,
  run,
  withoutNils,
  asString,
  APIError,
} from "qubesync/kit";
import type { ConnectionEvent, QubeJob, QubeRecord, Settings, WorkflowRunEvent, NotificationEvent } from "qubesync/kit";
import { connect, questions, webhooks } from "qubesync/express";

// quickbooks-desktop/create-invoice.ts
interface Invoice extends QubeRecord {
  id: number;
  accountId: number;
  status?: string;
}

declare function findInvoice(id: string): Promise<Invoice | null>;
declare function findAccount(id: string | number): Promise<AccountRow | null>;

class CreateInvoice extends Operation<Invoice> {
  static workflow = "add_transaction";
  static slug = "create_invoice";

  static async findRecord(id: string): Promise<Invoice | null> {
    return findInvoice(id);
  }

  input() {
    return withoutNils({ operation: "invoice.create", params: { ref_number: asString(this.record.id) } });
  }

  async ended(event: WorkflowRunEvent) {
    if (event.outcome === "added") this.record.status = "sent";
    await this.saveRecord();
  }

  async notification(event: NotificationEvent) {
    this.logEvent(event);
  }
}

// quickbooks-desktop/account-connection.ts
interface AccountRow {
  id: number;
  qube_connection_id?: string | null;
  qube_connection_revision?: number | null;
  connected?: boolean;
  save(): Promise<void>;
}

class AccountConnection extends ConnectionEvents<AccountRow> {
  static async findRecord(id: string) {
    return findAccount(id);
  }

  async connected(event: ConnectionEvent) {
    this.account.connected = event.connectionId !== null;
    await this.saveRecord();
  }
}

// quickbooks-desktop/config.ts
declare const queue: { add(name: string, data: QubeJob): Promise<unknown> };
type SignedIn = Request & { user?: { accountId: number } };

const config: Settings = configure<SignedIn>({
  operations: { create_invoice: CreateInvoice },
  connection: AccountConnection,
  currentAccount: (req) => (req.user ? findAccount(req.user.accountId) : null),
  authorizeQuestion: (req, record) => Boolean(req.user && record.accountId === req.user.accountId),
  enqueue: (job) => queue.add("webhook", job),
  dedupe: { seen: async (key: string) => key === "", remember: async (_key: string) => undefined },
  webhookSecret: ["whsec_a", "whsec_b"],
});

// app.ts
const app = express();
app.use(webhooks(config));
app.use(webhooks({ limit: "10mb" }));
app.use(express.json());
app.use(connect(config));
app.use(questions({ limit: "50kb" }));

async function page(invoice: Invoice, csrfToken: string): Promise<string> {
  const started = await CreateInvoice.start(invoice, "conn_1");
  const runId: string = started.id;
  const html: string = renderQuestion(invoice.qube_question, {
    action: `/qube/questions/create_invoice/${encodeURIComponent(invoice.id)}`,
    csrfToken,
    nonce: null,
  });
  return runId + html;
}

async function worker(job: QubeJob) {
  try {
    await run(job);
  } catch (err) {
    if (err instanceof APIError) console.log(err.status, err.code);
    throw err;
  }
}

void page;
void worker;
