"use strict";

// The pieces the screens are made of: each a function (view, ctx) → HTML from its view-model
// (kit/views.js). An app replaces any of them with the pieces setting or a render's pieces
// option; the rest stay the kit's. README, "Styling", has the list and each piece's view-model.

const { checkMessages, t } = require("./messages");

// The pieces of the screens the uiClasses setting can add classes to (qube_rails' UI_PIECES).
const UI_PIECES = Object.freeze([
  "question", "message", "details", "choice", "choice_detail", "choice_description", "field", "label", "input", "select", "checkbox",
  "button", "button_secondary", "search", "search_results", "search_result", "status", "summary", "detail", "error",
  "rows", "row", "row_header", "segmented", "segment", "row_fields", "use_for_all", "stall",
  "picks", "pick", "pick_detail", "pick_action", "reason", "button_ghost", "choice_footer", "choice_divider",
]);

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

// Text and attribute values as HTML: nothing in a question can become markup.
function escapeHtml(value) {
  return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

// Attributes from an object: a null, undefined or false one left out, true bare, the rest escaped.
function attrs(map) {
  return Object.entries(map)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escapeHtml(value)}"`))
    .join("");
}

// data-* attributes from { "qube-rows-input": "" }.
function dataAttrs(data) {
  const map = {};
  for (const [name, value] of Object.entries(data || {})) map[`data-${name}`] = value;
  return map;
}

// ---------------------------------------------------------------------------
// The default pieces. ctx: render(name, view, locals), classes(piece, ...base), t(key, vars),
// escape, attrs, csrf (the token's hidden input, or ""), and the piece's locals (question, rows,
// control).

const PIECES = {
  // A question: a refusal, its message, what it's about, then its choices by kind.
  question(question, ctx) {
    const html = [`<section class="${ctx.escape(ctx.classes("question", "qube-question"))}" data-qube-question="${ctx.escape(question.token)}">`];
    html.push(ctx.render("error", question.error));
    html.push(ctx.render("message", question));
    if (question.details.length) html.push(ctx.render("details", question));
    html.push(`<div class="qube-choices">`);
    const { picks, forms, exits } = question;
    if (picks.length) html.push(ctx.render("picks", question));
    forms.forEach((choice, n) => {
      if (n > 0 || picks.length) {
        const divider = ctx.escape(ctx.classes("choice_divider", "qube-choice-divider"));
        html.push(`<div class="${divider}" role="separator"><span>${ctx.escape(ctx.t("question.or"))}</span></div>`);
      }
      html.push(ctx.render("choice", choice, { question }));
    });
    if (exits.length) html.push(ctx.render("footer", question));
    html.push(`</div>`, `</section>`);
    return lines(html);
  },

  message(question, ctx) {
    return `<p class="${ctx.escape(ctx.classes("message", "qube-question-message"))}">${ctx.escape(question.message)}</p>`;
  },

  details(question, ctx) {
    const rows = question.details.map((row) => `<tr><th scope="row">${ctx.escape(row.label)}</th><td>${ctx.escape(row.value)}</td></tr>`);
    return lines([`<table class="${ctx.escape(ctx.classes("details", "qube-question-details"))}">`, ...rows, `</table>`]);
  },

  picks(question, ctx) {
    const items = question.picks.map((choice) => ctx.render("pick", choice, { question }));
    return lines([`<div class="${ctx.escape(ctx.classes("picks", "qube-picks"))}" role="list">`, ...items, `</div>`]);
  },

  // One pick: an option row, a form posting choice=<id>.
  pick(choice, ctx) {
    const at = attrs({ class: "qube-choice qube-pick-form", method: "post", action: choice.actionUrl, role: "listitem", "data-qube-choice": choice.id, "data-qube-choice-kind": "pick" });
    const text = [`<span class="qube-pick-label">${ctx.escape(choice.label)}</span>`];
    if (choice.detail) text.push(`<span class="${ctx.escape(ctx.classes("pick_detail", "qube-pick-detail"))}">${ctx.escape(choice.detail)}</span>`);
    if (choice.description) text.push(`<span class="qube-pick-description">${ctx.escape(choice.description)}</span>`);
    return lines([
      `<form${at}>`,
      ctx.csrf,
      `<input type="hidden" name="choice" value="${ctx.escape(choice.id)}">`,
      `<button type="submit" class="${ctx.escape(ctx.classes("pick", "qube-pick"))}">`,
      `<span class="qube-pick-text">${text.join("")}</span>`,
      `<span class="${ctx.escape(ctx.classes("pick_action", "qube-pick-action"))}">${ctx.escape(ctx.t("question.use_pick"))}</span>`,
      `</button>`,
      `</form>`,
    ]);
  },

  // A form or exit choice: a form posting choice=<id> and data[...] for its fields.
  choice(choice, ctx) {
    const formClass = ctx.classes("choice", "qube-choice", choice.kind === "form" ? "qube-choice-form" : null);
    const at = attrs({ class: formClass, method: "post", action: choice.actionUrl, "data-qube-choice": choice.id, "data-qube-choice-kind": choice.kind });
    const html = [`<form${at}>`, ctx.csrf, `<input type="hidden" name="choice" value="${ctx.escape(choice.id)}">`];
    for (const field of choice.fields) html.push(ctx.render(field.piece, field));
    const detail = choice.detail ? ` <span class="${ctx.escape(ctx.classes("choice_detail", "qube-choice-detail"))}">${ctx.escape(choice.detail)}</span>` : "";
    const button = attrs({ type: "submit", class: ctx.classes(choice.buttonPiece, "qube-choice-button"), "data-qube-button": choice.style });
    html.push(`<button${button}>${ctx.escape(choice.label)}${detail}</button>`);
    if (choice.description) {
      html.push(`<p class="${ctx.escape(ctx.classes("choice_description", "qube-choice-description"))}">${ctx.escape(choice.description)}</p>`);
    }
    html.push(`</form>`);
    return lines(html);
  },

  // The exits in a row; in a plain question, every choice.
  footer(question, ctx) {
    const at = attrs({ class: ctx.classes("choice_footer", "qube-choice-footer"), "data-qube-plain": question.plain });
    return lines([`<div${at}>`, ...question.exits.map((choice) => ctx.render("choice", choice, { question })), `</div>`]);
  },

  // A field's wrapper and label around its control (ctx.control, HTML).
  field(field, ctx) {
    const label = `<label for="${ctx.escape(field.domId)}" class="${ctx.escape(ctx.classes("label", "qube-label"))}">${ctx.escape(field.label)}</label>`;
    const inner = field.type === "boolean" ? [ctx.control, label] : [label, ctx.control];
    return lines([`<div class="${ctx.escape(ctx.classes("field", "qube-field", `qube-field-${field.type}`))}">`, ...inner, `</div>`]);
  },

  "fields/text"(field, ctx) {
    const at = { type: "text", name: field.inputName, id: field.domId, required: field.required, disabled: field.disabled };
    return ctx.render("field", field, { control: `<input${attrs({ ...at, class: inputClass(field, ctx, "input", "qube-input"), ...dataAttrs(field.data) })}>` });
  },

  "fields/number"(field, ctx) {
    const at = { type: "number", name: field.inputName, id: field.domId, step: "any", required: field.required, disabled: field.disabled };
    return ctx.render("field", field, { control: `<input${attrs({ ...at, class: inputClass(field, ctx, "input", "qube-input"), ...dataAttrs(field.data) })}>` });
  },

  // A checkbox: ticked posts "true", sent as true; unticked, false.
  "fields/boolean"(field, ctx) {
    const at = { type: "checkbox", name: field.inputName, id: field.domId, value: "true", disabled: field.disabled };
    return ctx.render("field", field, { control: `<input${attrs({ ...at, class: inputClass(field, ctx, "checkbox", "qube-checkbox"), ...dataAttrs(field.data) })}>` });
  },

  // A fixed list (field.options), with a blank first.
  "fields/select"(field, ctx) {
    const at = attrs({ name: field.inputName, id: field.domId, required: field.required, disabled: field.disabled, class: inputClass(field, ctx, "select", "qube-select"), ...dataAttrs(field.data) });
    const options = field.options.map((o) => `<option value="${ctx.escape(o.value)}">${ctx.escape(o.label)}</option>`).join("");
    return ctx.render("field", field, { control: `<select${at}><option value=""></option>${options}</select>` });
  },

  // A record field: typed text searched at field.searchUrl; the pick fills the hidden input.
  "fields/search"(field, ctx) {
    const box = attrs({
      class: ctx.classes("search", "qube-search"),
      "data-qube-search": field.searchUrl,
      "data-qube-field": field.searchField,
      "data-qube-row": field.rowKey,
      "data-qube-result-class": ctx.classes("search_result", "qube-search-result"),
      "data-qube-text-no-matches": ctx.t("question.no_matches"),
      "data-qube-text-searching": ctx.t("question.searching"),
      "data-qube-text-search-failed": ctx.t("question.search_failed"),
      "data-qube-text-pick-a-match": ctx.t("question.pick_a_match"),
    });
    const input = attrs({
      type: "search",
      id: field.domId,
      class: ctx.classes("input", "qube-search-input"),
      maxlength: "100",
      autocomplete: "off",
      required: field.required,
      disabled: field.disabled,
      role: "combobox",
      "aria-autocomplete": "list",
      "aria-expanded": "false",
      "data-qube-search-input": "",
    });
    const value = attrs({
      type: "hidden",
      name: field.inputName,
      disabled: field.disabled,
      class: ["qube-search-value", field.cell ? "qube-rows-input" : null].filter(Boolean).join(" "),
      ...dataAttrs(field.data),
      "data-qube-search-value": "",
    });
    const results = `<div class="${ctx.escape(ctx.classes("search_results", "qube-search-results"))}" data-qube-search-results aria-live="polite"></div>`;
    return ctx.render("field", field, { control: lines([`<div${box}>`, `<input${input}>`, `<input${value}>`, results, `</div>`]) });
  },

  // A rows field (field.rows): a block per record with the fields it asks, "Set all to:" above.
  "fields/rows"(field, ctx) {
    const rows = field.rows;
    const setAll = rows.setAll;
    const at = attrs({ class: ctx.classes("field", "qube-field", "qube-rows-field"), "data-qube-rows": true, "data-qube-text-use-for-all": ctx.t("question.use_for_all", { count: "%{count}" }) });
    const html = [`<div${at}>`, `<p class="${ctx.escape(ctx.classes("label", "qube-rows-label"))}">${ctx.escape(rows.label)}</p>`];
    if (setAll) {
      html.push(`<div class="qube-rows-set-all" data-qube-rows-set-all="${ctx.escape(setAll.name)}">`, `<span class="qube-rows-set-all-label">${ctx.escape(ctx.t("question.set_all"))}</span>`);
      for (const option of setAll.options) {
        const button = attrs({ type: "button", class: ctx.classes("button_secondary", "qube-set-all-button"), "data-qube-set-all": option.value });
        html.push(`<button${button}>${ctx.escape(option.label)}</button>`);
      }
      html.push(`</div>`);
    }
    html.push(`<div class="${ctx.escape(ctx.classes("rows", "qube-rows"))}" role="list">`, ...rows.rows.map((row) => ctx.render("rows/row", row, { rows })), `</div>`, `</div>`);
    return lines(html);
  },

  // One record of a rows field: its name, its segmented choice, then the fields it calls for.
  "rows/row"(row, ctx) {
    const headerId = `qube-row-${ctx.rows.inputName.replace(/[^A-Za-z0-9]+/g, "-")}${row.index}`.replace(/-+/g, "-");
    const at = attrs({ class: ctx.classes("row", "qube-row"), role: "listitem", "aria-labelledby": headerId, "data-qube-row": row.key, "data-qube-values": row.valuesJson });
    const header = [`<span class="qube-row-label">${ctx.escape(row.label)}</span>`];
    if (row.detail) header.push(`<span class="qube-row-detail">${ctx.escape(row.detail)}</span>`);
    return lines([
      `<div${at}>`,
      `<div class="${ctx.escape(ctx.classes("row_header", "qube-row-header"))}" id="${ctx.escape(headerId)}">${header.join("")}</div>`,
      `<div class="qube-row-body">`,
      ...row.segmentedCells.map((cell) => ctx.render("rows/cell", cell)),
      `<div class="${ctx.escape(ctx.classes("row_fields", "qube-row-fields"))}">`,
      ...row.fieldCells.map((cell) => ctx.render("rows/cell", cell)),
      `</div>`,
      `</div>`,
      `</div>`,
    ]);
  },

  // One field of a row: a segmented choice, a field (with "Use for all"), or a value it has.
  "rows/cell"(cell, ctx) {
    let content;
    if (cell.segmented) {
      content = ctx.render("rows/segmented", cell.field);
    } else if (cell.field) {
      content = ctx.render(cell.field.piece, cell.field);
      if (cell.field.type === "search" || cell.field.type === "select") {
        content += `\n<button type="button" class="${ctx.escape(ctx.classes("use_for_all", "qube-use-for-all"))}" data-qube-use-for-all hidden></button>`;
      }
    } else {
      const label = `<span class="${ctx.escape(ctx.classes("label", "qube-label"))}">${ctx.escape(cell.label)}</span>`;
      content = `<div class="qube-field qube-row-preset">${label}<span class="qube-row-preset-value">${ctx.escape(cell.preset)}</span></div>`;
    }
    const at = attrs({
      class: ["qube-row-cell", cell.segmented ? "qube-row-cell-segmented" : null].filter(Boolean).join(" "),
      hidden: cell.hidden,
      "data-qube-col": cell.column,
      "data-qube-when": cell.whenJson,
      "data-qube-hidden": cell.hidden ? "" : null,
      "data-qube-required": cell.required ? "" : null,
    });
    return lines([`<div${at}>`, content, `</div>`]);
  },

  // A short list (at most three options) as radios posted as field.inputName.
  "rows/segmented"(field, ctx) {
    const options = field.options.map((option) => {
      const input = attrs({ type: "radio", name: field.inputName, value: option.value, required: field.required, disabled: field.disabled, class: "qube-segment-input qube-rows-input", ...dataAttrs(field.data) });
      return `<label class="${ctx.escape(ctx.classes("segment", "qube-segment"))}"><input${input}><span>${ctx.escape(option.label)}</span></label>`;
    });
    return lines([
      `<fieldset class="qube-segmented-field">`,
      `<legend class="qube-visually-hidden">${ctx.escape(field.label)}</legend>`,
      `<div class="${ctx.escape(ctx.classes("segmented", "qube-segmented"))}">`,
      ...options,
      `</div>`,
      `</fieldset>`,
    ]);
  },

  // A record's status: the error, then the summary, why, the stall, and the buttons.
  "run_status/status"(status, ctx) {
    const html = [ctx.render("error", status.error)];
    if (status.visible) {
      const at = attrs({ class: ctx.classes("status", status.cssClass), "data-qube-sync-status": status.status, "data-qube-stall": status.stall });
      html.push(`<div${at}>`, ctx.render("run_status/summary", status));
      if (status.reason || status.detail) html.push(ctx.render("run_status/detail", status));
      if (status.stall) html.push(ctx.render("run_status/stall", status));
      if (status.redeliverUrl) html.push(ctx.render("run_status/redeliver", status));
      if (status.retryUrl) html.push(ctx.render("run_status/retry", status));
      html.push(`</div>`);
    }
    return lines(html);
  },

  "run_status/summary"(status, ctx) {
    return `<p class="${ctx.escape(ctx.classes("summary", "qube-run-summary"))}">${ctx.escape(status.summary)}</p>`;
  },

  // Why it failed or was cancelled (reason), then what to do about it (detail).
  "run_status/detail"(status, ctx) {
    const html = [];
    if (status.reason) html.push(`<p class="${ctx.escape(ctx.classes("reason", "qube-run-reason"))}">${ctx.escape(status.reason)}</p>`);
    if (status.detail) html.push(`<p class="${ctx.escape(ctx.classes("detail", "qube-run-error-detail"))}">${ctx.escape(status.detail)}</p>`);
    return lines(html);
  },

  "run_status/stall"(status, ctx) {
    return `<p class="${ctx.escape(ctx.classes("stall", "qube-run-stall"))}">${ctx.escape(status.stallText)}</p>`;
  },

  // A run that looks stuck: posts to redeliverUrl.
  "run_status/redeliver"(status, ctx) {
    return lines([
      `<p class="qube-run-quiet">${ctx.escape(status.quietText)}</p>`,
      buttonForm(ctx, "qube-redeliver", status.redeliverUrl, ctx.classes("button_secondary", "qube-redeliver"), ctx.t("status.check_for_updates")),
    ]);
  },

  // A start not confirmed for a minute: posts to retryUrl.
  "run_status/retry"(status, ctx) {
    return buttonForm(ctx, "qube-retry-start", status.retryUrl, ctx.classes("button", "qube-retry-start"), ctx.t("status.try_again"));
  },

  // A one-shot message from a route (view: the words, or null for nothing).
  error(message, ctx) {
    if (message === null || message === undefined || String(message).trim() === "") return "";
    return `<p class="${ctx.escape(ctx.classes("error", "qube-error"))}" role="alert">${ctx.escape(message)}</p>`;
  },
};
Object.freeze(PIECES);

const PIECE_NAMES = Object.freeze(Object.keys(PIECES));

function lines(list) {
  return list.filter((line) => line !== "" && line !== null && line !== undefined).join("\n");
}

function inputClass(field, ctx, piece, base) {
  return ctx.classes(piece, base, field.cell ? "qube-rows-input" : null);
}

function buttonForm(ctx, name, url, classes, label) {
  return lines([
    `<form class="${name}-form" method="post" action="${ctx.escape(url)}">`,
    ctx.csrf,
    `<button type="submit" class="${ctx.escape(classes)}">${ctx.escape(label)}</button>`,
    `</form>`,
  ]);
}

// ---------------------------------------------------------------------------
// Checks and the render context

/** uiClasses, checked: piece → a string or an array of them; returns piece → one string. */
function checkUiClasses(map, where = "uiClasses") {
  if (map === null || typeof map !== "object" || Array.isArray(map)) throw new TypeError(`QuBe Sync: ${where} is an object of piece → CSS classes`);
  const out = {};
  for (const [piece, classes] of Object.entries(map)) {
    if (!UI_PIECES.includes(piece)) throw new TypeError(`QuBe Sync: ${where} has no piece ${JSON.stringify(piece)}: it takes ${UI_PIECES.join(", ")}`);
    const list = (Array.isArray(classes) ? classes.flat(Infinity) : [classes]).filter((c) => c !== null && c !== undefined);
    if (!list.every((c) => typeof c === "string")) throw new TypeError(`QuBe Sync: ${where}.${piece} is a string or an array of strings`);
    out[piece] = list.filter((c) => c !== "").join(" ");
  }
  return Object.freeze(out);
}

/** pieces, checked: name → (view, ctx) → HTML. */
function checkPieces(map, where = "pieces") {
  if (map === null || typeof map !== "object" || Array.isArray(map)) throw new TypeError(`QuBe Sync: ${where} is an object of piece name → function`);
  for (const [name, fn] of Object.entries(map)) {
    if (!PIECE_NAMES.includes(name)) throw new TypeError(`QuBe Sync: ${where} has no piece ${JSON.stringify(name)}: it takes ${PIECE_NAMES.join(", ")}`);
    if (typeof fn !== "function") throw new TypeError(`QuBe Sync: ${where}["${name}"] must be a function (view, ctx) → HTML`);
  }
  return Object.freeze({ ...map });
}

/**
 * A renderer: pieces, uiClasses and messages are a render's own, over the settings'. csrf is the
 * token's hidden input. Returns { render(name, view, locals), ctx }.
 */
function renderer({ pieces, uiClasses, messages, csrfToken = null, csrfField = "_csrf" } = {}) {
  const { settings } = require("./settings");
  const set = settings();
  const using = { ...PIECES, ...set.pieces, ...(pieces ? checkPieces(pieces) : {}) };
  const classMap = { ...set.uiClasses, ...(uiClasses ? checkUiClasses(uiClasses) : {}) };
  const words = { ...set.messages, ...(messages ? checkMessages(messages) : {}) };

  const base = {
    escape: escapeHtml,
    attrs,
    csrf: csrfToken ? `<input type="hidden" name="${escapeHtml(csrfField)}" value="${escapeHtml(csrfToken)}">` : "",
    messages: words,
    t: (key, vars) => t(key, vars, words),
    // A piece's qube- classes, then the app's for it (button_ghost falls back to button_secondary's).
    classes(piece, ...more) {
      if (!UI_PIECES.includes(piece)) throw new TypeError(`QuBe Sync: no uiClasses piece ${JSON.stringify(piece)}`);
      const extra = piece === "button_ghost" && classMap.button_ghost === undefined ? classMap.button_secondary : classMap[piece];
      return [...more.flat(), extra].filter((c) => c !== null && c !== undefined && c !== "").join(" ");
    },
    render(name, view, locals) {
      const piece = using[name];
      if (!piece) throw new TypeError(`QuBe Sync: no piece ${JSON.stringify(name)}: there are ${PIECE_NAMES.join(", ")}`);
      const out = piece(view, { ...base, ...(locals || {}) });
      return out === null || out === undefined ? "" : String(out);
    },
  };
  return { render: base.render, ctx: base };
}

module.exports = { PIECES, PIECE_NAMES, UI_PIECES, escapeHtml, attrs, checkUiClasses, checkPieces, renderer };
