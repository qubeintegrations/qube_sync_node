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
  PlainRequest,
  QueuedRequest,
  RealtimeRequired,
  Run,
  StoreConflict,
  SyncStatus,
  REDELIVERY_REFUSED,
  SIGNATURE_HINTS,
  asString,
  configure,
  familyFor,
  job,
  memoryStore,
  pruneRuns,
  DAY_MS,
  RUNS_GOING,
  renderQuestion,
  renderRunStatus,
  renderAssets,
  QuestionView,
  RunStatusView,
  PIECES,
  storyboard,
  t,
  run,
  withoutNils,
} from "qubesync/kit";
import type {
  ConnectionEvent,
  ConnectionRow,
  NotificationEvent,
  QubeDelivery,
  QueuedRequestRow,
  RequestEvent,
  QuickbooksRecordRow,
  RunRow,
  SyncStatusName,
  Settings,
  Store,
  WorkflowRunEvent,
} from "qubesync/kit";
import { connect, questions, storyboard as storyboardRouter, takeError, webhooks } from "qubesync/express";
import { connectQuickbooks, disconnectQuickbooks, redeliver, receiveWebhook } from "qubesync/kit";
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

// quickbooks-desktop/find-customer.ts: a plain request.
class FindCustomer extends PlainRequest<Customer> {
  static operation = "customer.query";
  static slug = "find_customer";

  params() {
    return { full_name: this.record.name };
  }

  async answered(event: RequestEvent) {
    const response = event.responseJson as { data?: Array<{ list_id: string; full_name: string }> } | null;
    const found = response && response.data && response.data[0];
    if (found && this.connection) await this.connection.link(this.record, { kind: "customer", qbId: found.list_id, name: found.full_name });
  }

  async timedOut(event: RequestEvent) {
    await this.failed(event);
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

  async disconnected() {
    await this.store.getConnection(this.connection.id);
  }
}

// quickbooks-desktop/config.ts
declare const queue: { add(name: string, data: QubeDelivery): Promise<unknown> };
type SignedIn = Request & { user?: { accountId: number } };

const store: Store = memoryStore();
const config: Settings = configure<SignedIn>({
  store,
  operations: { create_invoice: CreateInvoice, find_customer: FindCustomer },
  pruneRunsAfter: 90 * DAY_MS,
  connectionType: "realtime",
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

// A record's page and its list page, with the sync status.
app.get("/invoices/:id", async (req, res) => {
  const invoice = new Invoice(Number(req.params.id), "1001", null);
  const [connection] = await Connection.ownedBy(new Account(1, "Riverbend"));
  const sync: SyncStatus = await connection.syncStatus(invoice, "create_invoice");
  const name: SyncStatusName = sync.status;
  const qbId: string | null = sync.qbId;
  const retry: boolean = sync.retry || sync.unconfirmed;
  const latest = await SyncStatus.latest(invoice, "create_invoice");
  const stuck: boolean = latest.run !== null && latest.run.looksStuck();
  const reused: boolean = (await CreateInvoice.start(invoice, connection)).reused;
  const queued: QueuedRequest = await FindCustomer.queue(new Customer(1, "Riverbend"), connection);
  const row: QueuedRequestRow = queued;
  const since: Date | null = await connection.lastSyncedAt("pull_changes");
  void [row.state, queued.done(), queued.webhookUrl(), since];
  const error: string | null = takeError(req, res);
  const where: string = connection.inQuickbooksSql("invoices", { recordType: "Invoice" }) + connection.sendingSql("invoices", { recordType: "Invoice", operation: "create_invoice", dialect: "mysql" });
  res.send(renderRunStatus(sync, { error }) + renderQuestion(sync) + name + qbId + retry + stuck + reused + where + REDELIVERY_REFUSED[409] + SIGNATURE_HINTS.stale + renderAssets({ stylesheet: true }));
});

async function routes(req: Request): Promise<number> {
  const simulated = await connectQuickbooks({ request: req, simulated: true });
  const gone = await disconnectQuickbooks({ request: req, id: "1" });
  const goneError: string | undefined = "error" in gone ? gone.error : RUNS_GOING;
  const pruned: { runs: number; requests: number } = await pruneRuns();
  void goneError;
  void pruned;
  const again = await redeliver({ runId: "1", request: req });
  const refused = await receiveWebhook({ kind: "run", id: "1", body: "", signature: null, path: "/webhooks/qube/runs/1" });
  return simulated.status + again.status + refused.status + ("error" in again && again.error ? 1 : 0);
}
void routes;

async function worker(delivery: QubeDelivery) {
  try {
    await run(delivery);
    await job(delivery, { sleep: async () => undefined });
  } catch (err) {
    if (err instanceof APIError) console.log(err.status, err.code);
    if (err instanceof NotReady || err instanceof StoreConflict) console.log(err.message);
    if (err instanceof RealtimeRequired) console.log(err.message);
    throw err;
  }
}

// A store of the app's own, checked by the suite.
async function rows(s: Store): Promise<[ConnectionRow | null, RunRow | null]> {
  const connection = await s.getConnection("1");
  const latest = await s.latestRun("Invoice", "7", "create_invoice", { connectionId: "1" });
  await s.withRunLock("1", async (tx, row) => (row ? tx.once(row.id, "d-1", async () => undefined) : false));
  return [connection, latest];
}
storeTests(async () => memoryStore());
storeTests(async () => memoryStore(), { dialect: "sqlite", query: async (_store, sql) => [{ sql }] });

// Styling: the settings, a piece of the app's own, the view-models and the storyboard.
configure({
  uiClasses: { button: ["btn", "btn-primary"], input: "form-control" },
  messages: { status: { running: "Syncing" }, "errors.unreachable": "Try again soon." },
  storyboard: false,
  pieces: {
    "fields/boolean": (field, ctx) => `<label>${ctx.escape(field.label)}<input type="checkbox" name="${ctx.escape(field.inputName)}" value="true"></label>`,
    message: (question: QuestionView, ctx) => `<h3 class="${ctx.classes("message", "qube-question-message")}">${ctx.escape(question.message)}</h3>`,
  },
});
async function styled(sync: SyncStatus): Promise<string> {
  const view = RunStatusView.fromSync(sync, { now: new Date() });
  const asked = QuestionView.fromRun(sync.run);
  const picks: string[] = asked ? asked.picks.map((c) => `${c.kind}:${c.style}`) : [];
  return `${view.summary}${view.stall}${picks.join()}${PIECES.error(null, null as any)}${storyboard.screens().length}${t(RUNS_GOING)}`;
}
const board: import("express").Router = storyboardRouter({ layout: (body, { title, assets }) => `<title>${title}</title>${assets}${body}`, csrfToken: () => "t" });

void page;
void worker;
void styled;
void board;
void rows;
