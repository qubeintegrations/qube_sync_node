// Compiled with `npm run test:types` (tsc --strict --noEmit); never run. A TypeScript app using
// the module `npx qubesync workflows` writes (the golden one, from the sample document), and a
// qubesync/kit operation whose input is one of its types.
import { Client, NOT_MODIFIED } from "qubesync";
import { Operation } from "qubesync/kit";
import { render, check, cli, header } from "qubesync/workflow-types";
import {
  addTransaction,
  recordPayment,
  resolve,
  upsert,
  setClient,
  AddTransactionInvoiceInput,
  AddTransactionInput,
  AddTransactionAddsItem,
  RecordPaymentInput,
  RecordPaymentPaymentBody,
  UpsertCustomerInput,
  UpsertFutureListInput,
  ResolveInput,
} from "./fixtures/workflow_types/qube-workflows";

const qube = new Client({ apiKey: "k" });
setClient(qube);
const start = { reference: "invoice-1", webhookUrl: "https://app.test/runs" };

async function starts(): Promise<void> {
  const run = await addTransaction.invoice("c", { customer_ref: { full_name: "Acme" } }, { adds: [{ kind: "customer", add: { name: "Acme" } }], ...start });
  void run.id;
  await addTransaction.bill({ qubeId: "c" }, { vendor_ref: { full_name: "Supplies Co" } }, { ...start, version: 3, client: qube });
  await addTransaction.start("c", addTransaction.invoiceInput({ customer_ref: { list_id: "1" } }), start);
  // @ts-expect-error a start needs its reference and webhookUrl
  await addTransaction.invoice("c", { customer_ref: { list_id: "1" } }, { adds: [] });
  // @ts-expect-error customer_rf isn't an invoice.create field
  await addTransaction.invoice("c", { customer_rf: { list_id: "1" } }, start);
  // @ts-expect-error an adds entry is one of its kinds
  await addTransaction.invoice("c", { customer_ref: { list_id: "1" } }, { adds: [{ kind: "vendor", add: {} }], ...start });

  // The workflow sets customer_ref and total_amount itself: optional here.
  await recordPayment.start("c", { payment: { memo: "Paid by check" }, txnId: "T-1", ...start });
  // @ts-expect-error payment is required
  await recordPayment.start("c", { txnId: "T-1", ...start });
  // list_id and edit_sequence are set by the workflow; name is customer.update's own.
  await upsert.customer("c", { add: { name: "Acme" }, update: { name: "Acme Ltd" }, class: "VIP", listId: "1", ...start });
  // @ts-expect-error customer.create needs a name
  await upsert.customer("c", { add: {}, update: {}, ...start });
  await upsert.futureList("c", { add: { anything: 1 }, update: {}, ...start });
  await resolve.start("c", { kind: "customer", name: "Acme", ...start });
}
void starts;

// The types the kit refers to.
const invoice: AddTransactionInvoiceInput = addTransaction.invoiceInput({ customer_ref: { list_id: "1" } }, { references: { customer: "ensure" } });
const any: AddTransactionInput = invoice;
const operation: "invoice.create" = invoice.operation;
const item: AddTransactionAddsItem = { kind: "item_service", add: { name: "Consulting" }, accept: "exact" };
const payment: RecordPaymentPaymentBody = { memo: "x" };
const paid: RecordPaymentInput = { payment };
const customer: UpsertCustomerInput = upsert.customerInput({ add: { name: "Acme" }, update: {} });
const future: UpsertFutureListInput = { kind: "future_list", add: {}, update: {} };
const resolved: ResolveInput = resolve.input({ kind: "customer" });
// @ts-expect-error references take one of three rules
const badRule: AddTransactionInvoiceInput = { operation: "invoice.create", params: { customer_ref: { list_id: "1" } }, references: { customer: "maybe" } };
void [any, operation, item, paid, customer, future, resolved, badRule];
const version: 3 = addTransaction.VERSION;
const draft: null = resolve.VERSION;
void [version, draft];

interface Invoice {
  id: string;
  number: string;
  customerName: string;
}

// A kit operation whose input is the generated type.
class CreateInvoice extends Operation<Invoice> {
  static workflow = addTransaction.WORKFLOW;
  static slug = "create_invoice";

  input(): AddTransactionInvoiceInput {
    return addTransaction.invoiceInput({ customer_ref: { full_name: this.record.customerName }, ref_number: this.record.number });
  }
}
void CreateInvoice;

// The renderer and the CLI, as a script would call them.
async function generate(): Promise<void> {
  const document = await qube.workflowTypes({ includeDrafts: true });
  if (document === NOT_MODIFIED) return;
  const files = render(document, { source: "https://qubesync.com/api/v2/workflows/types", drafts: true });
  const recorded = header(files.js);
  if (recorded) void recorded.digest;
  const outcome = await check(files.js, { client: qube, source: "https://qubesync.com/api/v2/workflows/types", path: "qube-workflows.js" });
  const status: 0 | 1 = outcome.exitStatus;
  void status;
  const exit: number = await cli(["workflows", "--check"]);
  void exit;
}
void generate;
