"use strict";

// The view-models the pieces render from: the override contract, kept stable across versions
// (README, "Styling"). Built from the prompt QuBe Sync sent and from a SyncStatus; the same
// fields as qube_rails' QuestionView, ChoiceView, FieldView, RowsView, RowView, CellView and
// RunStatusView, in camelCase.

const { summaryOf } = require("./sync-status");
const { t } = require("./messages");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function objects(list) {
  return Array.isArray(list) ? list.filter(isObject) : [];
}

function text(value) {
  return value === null || value === undefined ? "" : String(value);
}

function presence(value) {
  const s = text(value);
  return s.trim() === "" ? null : s;
}

function trimMount(mount) {
  return String(mount || "").replace(/\/+$/, "");
}

/** The kit's routes under mount (where the questions router is mounted). */
function routes(mount = "") {
  const base = trimMount(mount);
  const id = (run) => encodeURIComponent(String(run.id));
  return {
    question: (run) => `${base}/qube/questions/runs/${id(run)}`,
    retryStart: (run) => `${base}/qube/runs/${id(run)}/retry_start`,
    redeliver: (run) => `${base}/qube/runs/${id(run)}/redeliver`,
  };
}

// A run's open question, or the run's own (a SyncStatus's run, or a bare Run).
class QuestionView {
  /** The question run is asking, or null when it isn't asking. urls: routes(mount), or your own. */
  static fromRun(run, { urls = routes(), error = null } = {}) {
    const prompt = run && typeof run.openQuestion === "function" ? run.openQuestion() : null;
    if (!prompt) return null;
    const action = urls.question(run);
    return new QuestionView(prompt, { actionUrl: action, searchUrl: `${action}/search`, error });
  }

  constructor(prompt, { actionUrl, searchUrl, error = null }) {
    this.prompt = prompt;
    this.message = text(prompt.message);
    this.token = text(prompt.token);
    this.details = objects(prompt.details).map((row) => ({ label: row.label, value: row.value }));
    this.actionUrl = actionUrl;
    this.searchUrl = searchUrl;
    this.error = error || null;
    this.choices = objects(prompt.choices).map((choice, n) => new ChoiceView(choice, n, this));
    this.#arrange();
  }

  /** The choice rows: items of a choose list (and, with no picks, plain choices before the first form). */
  get picks() {
    return this.choices.filter((c) => c.kind === "pick");
  }

  /** Choices with fields: a section each, "or" between. */
  get forms() {
    return this.choices.filter((c) => c.kind === "form");
  }

  /** None of these, cancel and the like: the footer row. */
  get exits() {
    return this.choices.filter((c) => c.kind === "exit");
  }

  /** Neither a pick nor a form: one row, the first choice primary. */
  get plain() {
    return this.picks.length === 0 && this.forms.length === 0;
  }

  // Kinds and button styles; one filled (primary) button at most.
  #arrange() {
    const firstForm = this.choices.findIndex((c) => c.kind === "form");
    if (!this.choices.some((c) => c.kind === "pick") && firstForm >= 0) {
      this.choices.slice(0, firstForm).forEach((c) => {
        if (!c.secondary) c.kind = "pick";
      });
    }
    const primary = this.plain ? this.choices.find((c) => !c.secondary) : this.forms[0];
    for (const choice of this.choices) {
      if (choice.kind === "pick") choice.style = null;
      else if (choice === primary) choice.style = "primary";
      else if (choice.secondary) choice.style = "ghost";
      else choice.style = "secondary";
    }
  }
}

// One thing the user can pick: a form of its own, posting choice=<id> and data[...] for its fields.
class ChoiceView {
  constructor(choice, index, question) {
    this.id = text(choice.id);
    this.label = text(choice.label);
    this.detail = presence(choice.detail);
    this.description = presence(choice.description);
    this.index = index;
    this.actionUrl = question.actionUrl;
    this.fields = objects(choice.fields).map((field) => FieldView.fromPrompt(field, question, index));
    // "pick", "form" or "exit"; style "primary", "secondary", "ghost", or null for a pick.
    if (this.fields.length > 0) this.kind = "form";
    else if (/:\d+$/.test(this.id)) this.kind = "pick";
    else this.kind = "exit";
    this.style = null;
  }

  /** A choice that stops (cancel). */
  get secondary() {
    return this.id === "cancel";
  }

  /** The uiClasses piece for its button: button, button_secondary or button_ghost. */
  get buttonPiece() {
    if (this.style === "primary") return "button";
    return this.style === "ghost" ? "button_ghost" : "button_secondary";
  }
}

const FIELD_TYPES = Object.freeze(["text", "number", "boolean", "select", "search", "rows"]);

// One input: a choice's field, or a field of a rows field's row (context "cell").
class FieldView {
  /** A choice's field, as QuBe Sync sends it. */
  static fromPrompt(field, question, choiceIndex) {
    const name = text(field.name);
    const inputName = `data[${name}]`;
    const type = FieldView.typeOf(field);
    const rows = type === "rows" ? new RowsView(field, { inputName, searchUrl: question.searchUrl }) : null;
    return new FieldView({
      name,
      inputName,
      domId: `qube-${question.token}-${choiceIndex}-${name}`,
      type,
      label: field.label || name,
      required: field.required === true,
      options: FieldView.optionsOf(field),
      kind: field.kind,
      searchUrl: question.searchUrl,
      searchField: name,
      rows,
    });
  }

  /** What a prompt field shows as: a record a search, an enum a select, else by its type. */
  static typeOf(field) {
    if (field.type === "rows") return "rows";
    if (field.type === "record") return "search";
    if (Array.isArray(field.enum) && field.enum.length > 0) return "select";
    if (field.type === "boolean" || field.type === "number") return field.type;
    return "text";
  }

  static optionsOf(field) {
    return objects(field.enum).map((e) => ({ value: e.value, label: text(e.label || e.value) }));
  }

  constructor({
    name,
    type,
    label,
    inputName = null,
    domId = null,
    required = false,
    options = [],
    kind = null,
    searchUrl = null,
    searchField = null,
    rowKey = null,
    when = null,
    rows = null,
    context = "choice",
    disabled = false,
  }) {
    if (!FIELD_TYPES.includes(type)) throw new TypeError(`QuBe Sync: no field type ${JSON.stringify(type)}`);
    Object.assign(this, { name, type, label: text(label), inputName, domId, required, options, kind: kind || null });
    Object.assign(this, { searchUrl, searchField, rowKey, when: when || {}, rows, context, disabled });
  }

  /** The piece that renders it: "fields/<type>". */
  get piece() {
    return `fields/${this.type}`;
  }

  /** A field of a rows field's row. */
  get cell() {
    return this.context === "cell";
  }

  /** Shown with its own label: always. */
  get labelled() {
    return true;
  }

  /** The input's data attributes the behaviour script keys on. */
  get data() {
    return this.cell ? { "qube-rows-input": "" } : {};
  }

  /** A cell's select of one to three options, shown as a segmented control. */
  get segmented() {
    return this.cell && this.type === "select" && this.options.length >= 1 && this.options.length <= 3;
  }
}

// A rows field: the same columns asked of each row, posted as data[<field>][<row key>][<column>],
// shown as a block per record.
class RowsView {
  constructor(field, { inputName, searchUrl }) {
    this.name = text(field.name);
    this.label = text(field.label || this.name);
    this.inputName = inputName;
    this.searchUrl = searchUrl;
    const declared = objects(field.columns);
    this.columns = declared.map((column) => this.#columnField(column));
    this.rows = objects(field.rows).map((row, n) => new RowView(row, declared, this, n));
  }

  /** A column's control for one row: not required in the markup while hidden. */
  cellField(column, rowKey, rowIndex, shown) {
    const col = text(column.name);
    return new FieldView({
      name: col,
      type: FieldView.typeOf(column),
      label: column.label || col,
      inputName: `${this.inputName}[${rowKey}][${col}]`,
      domId: `qube-${this.inputName.replace(/[^A-Za-z0-9]+/g, "-")}${rowIndex}-${col}`.replace(/-+/g, "-"),
      required: column.required === true && shown,
      options: FieldView.optionsOf(column),
      kind: column.kind,
      searchUrl: this.searchUrl,
      searchField: `${this.name}.${col}`,
      rowKey,
      when: this.whenOf(column),
      context: "cell",
      disabled: !shown,
    });
  }

  whenOf(column) {
    return isObject(column.when) ? column.when : {};
  }

  /** The column "Set all to:" sets: the first segmented one two rows or more ask; else null. */
  get setAll() {
    if (this.rows.length < 2) return null;
    return (
      this.columns.find(
        (column) =>
          column.type === "select" &&
          column.options.length >= 1 &&
          column.options.length <= 3 &&
          this.rows.filter((row) => row.cells.some((cell) => cell.column === column.name && cell.field)).length >= 2
      ) || null
    );
  }

  #columnField(column) {
    const col = text(column.name);
    return new FieldView({
      name: col,
      type: FieldView.typeOf(column),
      label: column.label || col,
      required: column.required === true,
      options: FieldView.optionsOf(column),
      kind: column.kind,
      searchUrl: this.searchUrl,
      searchField: `${this.name}.${col}`,
      when: this.whenOf(column),
      context: "cell",
    });
  }
}

// One record: its cells (the columns it asks, and the values it already has).
class RowView {
  constructor(row, declared, rows, index = 0) {
    this.key = text(row.key);
    this.label = text(row.label || this.key);
    this.detail = presence(row.detail) === null ? null : text(row.detail);
    this.values = isObject(row.values) ? row.values : {};
    this.index = index;
    const asks = Array.isArray(row.columns) ? row.columns.map(String) : [];
    this.cells = [];
    for (const column of declared) {
      const col = text(column.name);
      const when = rows.whenOf(column);
      const shown = this.#applies(when);
      const label = text(column.label || col);
      if (asks.includes(col)) {
        const field = rows.cellField(column, this.key, index, shown);
        this.cells.push(new CellView({ column: col, label, field, when, shown, required: column.required === true }));
      } else if (text(this.values[col]) !== "") {
        this.cells.push(new CellView({ column: col, label, preset: presetText(column, this.values[col]), when, shown }));
      }
    }
  }

  /** The values it already has, as JSON, for data-qube-values. */
  get valuesJson() {
    return JSON.stringify(this.values);
  }

  /** The segmented cells (the row's choice, such as create or use). */
  get segmentedCells() {
    return this.cells.filter((cell) => cell.segmented);
  }

  get fieldCells() {
    return this.cells.filter((cell) => !cell.segmented);
  }

  // Before the user picks anything, a column shows when its "when" holds for the row's values.
  #applies(when) {
    return Object.entries(when).every(([col, allowed]) => (Array.isArray(allowed) ? allowed : allowed === undefined || allowed === null ? [] : [allowed]).includes(this.values[col]));
  }
}

// A value the row already has, by its enum label when it has one.
function presetText(column, value) {
  const entry = objects(column.enum).find((e) => e.value === value);
  return entry ? text(entry.label || entry.value) : text(value);
}

// One field of a row: a field to fill, or what the row already has (preset, read-only).
class CellView {
  constructor({ column, label = null, field = null, preset = null, when = {}, shown = true, required = false }) {
    Object.assign(this, { column, label: label || column, field, preset, when, shown, required });
  }

  get whenJson() {
    return JSON.stringify(this.when);
  }

  get hidden() {
    return !this.shown;
  }

  get segmented() {
    return Boolean(this.field) && this.field.segmented;
  }
}

const STALL_REASONS = Object.freeze(["not_checking_in", "quickbooks_unavailable"]);

// Where a record stands: status is SyncStatus's, state the latest run's (or null). summary is a
// few words for the pill; reason, why it failed or was cancelled; detail, what to do.
class RunStatusView {
  /**
   * From a SyncStatus. connection: the one the page is about (else the latest run's); while it's
   * stalled, a "sending" status says why and offers no redelivery.
   */
  static fromSync(sync, { urls = routes(), error = null, connection = null, now = new Date(), messages } = {}) {
    const say = (key) => t(key, null, messages);
    const run = sync.run || null;
    const state = run ? (run.cancelled() ? "cancelled" : run.state) : null;
    const failed = sync.status === "failed";
    const reason = run && (failed || run.cancelled()) ? run.reasonText(messages) : null;
    const detail = failed && run ? run.errorDetail() : null;
    const on = connection || (run && run.connection) || null;
    const stall = sync.status === "sending" ? RunStatusView.stallOf(on) : null;
    const stuck = run && !stall ? run.looksStuck(now) : false;
    return new RunStatusView({
      status: sync.status,
      state,
      summary: stall ? say("status.waiting_for_quickbooks") : summaryOf(sync.status, run, now, messages),
      reason,
      detail,
      quietText: stuck ? say("status.quiet") : null,
      retryUrl: sync.unconfirmed ? urls.retryStart(run) : null,
      redeliverUrl: stuck ? urls.redeliver(run) : null,
      error,
      stall,
      messages,
    });
  }

  /** A stalled connection's reason ("other" when it gives none), or null. */
  static stallOf(connection) {
    if (!connection || connection.status !== "stalled") return null;
    const reason = text(connection.stallReason);
    return reason === "" ? "other" : reason;
  }

  constructor({ status, state = null, summary = null, reason = null, detail = null, quietText = null, retryUrl = null, redeliverUrl = null, error = null, stall = null, messages }) {
    Object.assign(this, { status: String(status), state, summary, reason, detail, quietText, retryUrl, redeliverUrl, error: error || null, stall });
    this.stallText = stall ? t(`status.stalled.${STALL_REASONS.includes(stall) ? stall : "other"}`, null, messages) : null;
  }

  /** Nothing is shown before the record is sent (the error aside). */
  get visible() {
    return this.status !== "not_sent";
  }

  /** qube-run-status qube-sync-<status> qube-run-<state>, and qube-connection-stalled while stalled. */
  get cssClass() {
    return ["qube-run-status", `qube-sync-${this.status}`, this.state && `qube-run-${this.state}`, this.stall && "qube-connection-stalled"].filter(Boolean).join(" ");
  }
}

module.exports = {
  routes,
  QuestionView,
  ChoiceView,
  FieldView,
  RowsView,
  RowView,
  CellView,
  RunStatusView,
  FIELD_TYPES,
  STALL_REASONS,
};
