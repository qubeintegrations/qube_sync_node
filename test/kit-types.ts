// Compiled with `npm run test:types` (tsc --strict --noEmit); never run. A TypeScript app's
// quickbooks-desktop/ files, as the README writes them, against qubesync/kit and qubesync/express.
import express = require("express");
import type { Request } from "express";
import {
  APIError,
  Connection,
  ConnectionEvents,
  NotReady,
  Operation,
  Run,
  StoreConflict,
  asString,
  configure,
  familyFor,
  job,
  memoryStore,
  renderQuestion,
  renderRunStatus,
  run,
  withoutNils,
} from "qubesync/kit";
import type {
  ConnectionEvent,
  ConnectionRow,
  NotificationEvent,
  QubeDelivery,
  QuickbooksRecordRow,
  RunRow,
  Settings,
  Store,
  WorkflowRunEvent,
} from "qubesync/kit";
import { connect, questions, webhooks } from "qubesync/express";
import storeTests = require("qubesync/kit/store-tests");

// The app's own records.
class Account {
  constructor(public id: number, public name: string) {}
}
class Customer {
  constructor(public id: number, public name: string) {}
}
class Invoice {
  constructor(public id: number, public number: string, public customer: Customer | null, public status = "draft") {}
}

declare function findInvoice(id: string): Promise<Invoice | null>;
declare function findAccount(id: string | number): Promise<Account | null>;
declare function findByType(type: string, id: string): Promise<unknown>;

// quickbooks-desktop/create-invoice.ts
class CreateInvoice extends Operation<Invoice> {
  static workflow = "add_transaction";
  static slug = "create_invoice";

  static async findRecord(id: string): Promise<Invoice | null> {
    return findInvoice(id);
  }

  async input() {
    const customer = this.record.customer;
    return withoutNils({
      operation: "invoice.create",
      params: {
        customer_ref: await this.quickbooksRef(customer, { kind: "customer", name: customer && customer.name }),
        ref_number: asString(this.record.number),
      },
    });
  }

  async ended(event: WorkflowRunEvent) {
    await this.linkReferences(event, (path) => (path === "customer_ref" ? this.record.customer : null));
    if (event.outcome !== "added") return;
    const output = event.output as { record?: { txn_id?: string; ref_number?: string } } | null;
    const txn = (output && output.record) || {};
    const row: QuickbooksRecordRow = await this.connection.link(this.record, { kind: "invoice", qbId: txn.txn_id, name: txn.ref_number });
    this.record.status = row.qbId ? "sent" : this.record.status;
  }

  async notification(event: NotificationEvent) {
    this.logEvent(event);
  }
}

// quickbooks-desktop/connection-events.ts
class QuickbooksConnectionEvents extends ConnectionEvents {
  async connected(event: ConnectionEvent) {
    const owner = await this.owner<Account>();
    const status: string = this.connection.status;
    console.log(owner.name, status, event.connectionId);
  }

  async stalled(_event: ConnectionEvent) {
    if (this.connection.notCheckingIn()) console.log("turn the QuickBooks computer on");
  }
}

// quickbooks-desktop/config.ts
declare const queue: { add(name: string, data: QubeDelivery): Promise<unknown> };
type SignedIn = Request & { user?: { accountId: number } };

const store: Store = memoryStore();
const config: Settings = configure<SignedIn>({
  store,
  operations: { create_invoice: CreateInvoice },
  connectionEvents: QuickbooksConnectionEvents,
  currentAccount: (req) => (req.user ? findAccount(req.user.accountId) : null),
  findRecord: (type, id) => findByType(type, id),
  recordType: (record) => record.constructor.name,
  enqueue: (delivery) => queue.add("webhook", delivery),
  jobAttempts: 5,
  webhookSecret: ["whsec_a", "whsec_b"],
});
configure({ authorizeQuestion: (req: SignedIn, record: Invoice, asked: Run) => Boolean(req.user) && record.status !== "void" && asked.connection.connected() });

// app.ts
const app = express();
app.use(webhooks(config));
app.use(express.json());
app.use(connect(config));
app.use(questions({ limit: "50kb" }));

async function page(invoice: Invoice, account: Account, csrfToken: string): Promise<string> {
  const [connection] = await Connection.ownedBy(account);
  const started: Run = await CreateInvoice.start(invoice, connection);
  const qbId: string | null = await connection.qbIdFor(invoice.customer!, { kind: "customer" });
  const linked = await connection.findLinked<Customer>("80000001-1", { kind: "customer" });
  const latest = await Run.latestFor(invoice, "create_invoice");
  const html: string = renderRunStatus(latest, { csrfToken }) + renderQuestion(latest, { csrfToken, nonce: null, mount: "" });
  const sentence: string = started.summaryText();
  const family: string = familyFor("item_service");
  return [html, sentence, family, qbId, linked && linked.name, started.reference].join("");
}

async function worker(delivery: QubeDelivery) {
  try {
    await run(delivery);
    await job(delivery, { sleep: async () => undefined });
  } catch (err) {
    if (err instanceof APIError) console.log(err.status, err.code);
    if (err instanceof NotReady || err instanceof StoreConflict) console.log(err.message);
    throw err;
  }
}

// A store of the app's own, checked by the suite.
async function rows(s: Store): Promise<[ConnectionRow | null, RunRow | null]> {
  const connection = await s.getConnection("1");
  const latest = await s.latestRun("Invoice", "7", "create_invoice");
  await s.withRunLock("1", async (tx, row) => (row ? tx.once(row.id, "d-1", async () => undefined) : false));
  return [connection, latest];
}
storeTests(async () => memoryStore());

void page;
void worker;
void rows;
