"use strict";

// renderRunStatus(status, options) and renderQuestion(run, options): a record's sync status and
// its latest run's question, as HTML for the record's page (README, "Run status and questions").
// Every value is escaped; the markup is plain, with qube- classes for your CSS. For other markup,
// write your own with escapeHtml, SEARCH_SCRIPT and ROWS_SCRIPT.

const { SyncStatus } = require("./sync-status");

function renderQuestion(runOrStatus, options) {
  const { csrfToken, nonce, csrfField = "_csrf", mount = "", error = null } = options || {};
  const run = runOf(runOrStatus);
  const question = run ? run.openQuestion() : null;
  if (!question) return errorHtml(error).join("\n");
  const action = `${trimMount(mount)}/qube/questions/runs/${encodeURIComponent(String(run.id))}`;
  const html = [...errorHtml(error), `<section class="qube-question">`];
  html.push(`  <p class="qube-question-message">${escapeHtml(question.message)}</p>`);
  const details = question.details || [];
  if (details.length) {
    html.push(`  <table class="qube-question-details">`);
    for (const row of details) {
      const label = `<th scope="row">${escapeHtml(row.label)}</th>`;
      html.push(`    <tr>${label}<td>${escapeHtml(row.value)}</td></tr>`);
    }
    html.push(`  </table>`);
  }
  (question.choices || []).forEach((choice, n) => {
    html.push(`  <form class="qube-choice" method="post" action="${escapeHtml(action)}">`);
    html.push(...csrfInput(csrfToken, csrfField));
    html.push(`    <input type="hidden" name="choice" value="${escapeHtml(choice.id)}">`);
    for (const field of choice.fields || []) {
      const id = `qube-${question.token}-${n}-${field.name}`;
      const fieldLines = field.type === "rows" ? rowsHtml(field, `${action}/search`) : fieldHtml(field, id, `${action}/search`);
      html.push(...fieldLines);
    }
    const detail = choice.detail ? ` <span class="qube-choice-detail">${escapeHtml(choice.detail)}</span>` : "";
    const button = `${escapeHtml(choice.label)}${detail}`;
    html.push(`    <button type="submit" class="qube-choice-button">${button}</button>`);
    if (choice.description) {
      const description = escapeHtml(choice.description);
      html.push(`    <p class="qube-choice-description">${description}</p>`);
    }
    html.push(`  </form>`);
  });
  // Each script once, after the forms: they bind every box and table not yet bound.
  const fields = (question.choices || []).flatMap((choice) => choice.fields || []);
  const nonceAt = nonce ? ` nonce="${escapeHtml(nonce)}"` : "";
  if (fields.some((f) => f.type === "record" || f.type === "rows")) html.push(`  <script${nonceAt}>${SEARCH_SCRIPT}</script>`);
  if (fields.some((f) => f.type === "rows")) html.push(`  <script${nonceAt}>${ROWS_SCRIPT}</script>`);
  html.push(`</section>`);
  return html.join("\n");
}

function renderRunStatus(statusOrRun, options) {
  const { csrfToken, csrfField = "_csrf", mount = "", now = new Date(), error = null } = options || {};
  const sync = syncOf(statusOrRun, now);
  const html = errorHtml(error);
  if (sync.status === "not_sent") return html.join("\n");

  const { run } = sync;
  const status = escapeHtml(sync.status);
  const state = run ? ` qube-run-${escapeHtml(run.cancelled() ? "cancelled" : run.state)}` : "";
  html.push(`<div class="qube-run-status qube-sync-${status}${state}" data-qube-sync-status="${status}">`);
  html.push(`  <p class="qube-run-summary">${escapeHtml(sync.summaryText)}</p>`);
  const detail = sync.status === "failed" ? run.errorDetail() : null;
  if (detail) html.push(`  <p class="qube-run-error-detail">${escapeHtml(detail)}</p>`);
  const form = { mount, csrfToken, csrfField };
  if (run && run.looksStuck(now)) {
    html.push(`  <p class="qube-run-quiet">No news from QuBe Sync about it for a while.</p>`);
    html.push(...buttonForm(run, "redeliver", "qube-redeliver", "Send its latest news again", form));
  }
  if (sync.unconfirmed) html.push(...buttonForm(run, "retry_start", "qube-retry-start", "Try the start again", form));
  html.push(`</div>`);
  return html.join("\n");
}

// A SyncStatus as given, or a bare Run's (no link looked up).
function syncOf(statusOrRun, now) {
  if (statusOrRun instanceof SyncStatus) return statusOrRun;
  return SyncStatus.fromRun(isRun(statusOrRun) ? statusOrRun : null, { now });
}

function runOf(runOrStatus) {
  if (runOrStatus instanceof SyncStatus) return runOrStatus.run;
  return isRun(runOrStatus) ? runOrStatus : null;
}

function isRun(value) {
  return Boolean(value) && typeof value.summaryText === "function" && typeof value.openQuestion === "function";
}

function errorHtml(error) {
  return error ? [`<p class="qube-error">${escapeHtml(error)}</p>`] : [];
}

// A one-button form posting to <mount>/qube/runs/<run id>/<action>.
function buttonForm(run, action, className, label, { mount, csrfToken, csrfField }) {
  const url = `${trimMount(mount)}/qube/runs/${encodeURIComponent(String(run.id))}/${action}`;
  return [
    `  <form class="${className}-form" method="post" action="${escapeHtml(url)}">`,
    ...csrfInput(csrfToken, csrfField),
    `    <button type="submit" class="${className}">${label}</button>`,
    `  </form>`,
  ];
}

function trimMount(mount) {
  return String(mount || "").replace(/\/+$/, "");
}

function csrfInput(csrfToken, csrfField) {
  if (!csrfToken) return [];
  return [`    <input type="hidden" name="${escapeHtml(csrfField)}" value="${escapeHtml(csrfToken)}">`];
}

// One field of a choice, with its label: a record field is a search box, a fixed list a select.
function fieldHtml(field, id, searchUrl) {
  const name = escapeHtml(`data[${field.name}]`);
  const at = `id="${escapeHtml(id)}"`;
  const required = field.required ? " required" : "";
  const html = [
    `    <div class="qube-field">`,
    `      <label for="${escapeHtml(id)}">${escapeHtml(field.label || field.name)}</label>`,
  ];
  if (field.type === "record") {
    const box = `data-qube-search="${escapeHtml(searchUrl)}"`;
    html.push(
      `      <div class="qube-search" ${box} data-qube-field="${escapeHtml(field.name)}">`,
      `        <input type="search" ${at} class="qube-search-input" maxlength="100"` + ` autocomplete="off"${required}>`,
      `        <input type="hidden" class="qube-search-value" name="${name}">`,
      `        <div class="qube-search-results" aria-live="polite"></div>`,
      `      </div>`
    );
  } else if (hasEnum(field)) {
    html.push(`      ${selectHtml(field.enum, `${at} name="${name}"${required}`)}`);
  } else if (field.type === "boolean") {
    html.push(`      <input type="checkbox" ${at} name="${name}" value="true">`);
  } else if (field.type === "number") {
    html.push(`      <input type="number" step="any" ${at} name="${name}"${required}>`);
  } else {
    html.push(`      <input type="text" ${at} name="${name}"${required}>`);
  }
  html.push(`    </div>`);
  return html;
}

// A rows field: one row per record, each with the columns it asks (a column shows only while its
// "when" holds for the row's other answers), and a "Set selected" bar that fills a column on every
// ticked row. Posts data[<field>][<row key>][<column>].
function rowsHtml(field, searchUrl) {
  const columns = field.columns || [];
  const box = `class="qube-search" data-qube-search="${escapeHtml(searchUrl)}"`;
  const fieldOf = (column) => escapeHtml(`${field.name}.${column.name}`);
  const html = [
    `    <div class="qube-field qube-rows" data-qube-rows>`,
    `      <p class="qube-rows-label">${escapeHtml(field.label || field.name)}</p>`,
    `      <table class="qube-rows-table">`,
    `        <thead>`,
    `          <tr>`,
    `            <th><input type="checkbox" class="qube-rows-all" aria-label="Select all"></th>`,
    `            <th>Record</th>`,
    ...columns.map((column) => `            <th>${escapeHtml(column.label || column.name)}</th>`),
    `          </tr>`,
    `          <tr class="qube-rows-bulk">`,
    `            <td></td>`,
    `            <td>Set selected</td>`,
  ];
  // The bar's inputs belong to no form (form=""), so they're never posted.
  for (const column of columns) {
    html.push(`            <td data-qube-bulk="${escapeHtml(column.name)}">`);
    if (hasEnum(column)) {
      html.push(`              ${selectHtml(column.enum, `class="qube-bulk-value" form=""`)}`);
      html.push(`              <button type="button" class="qube-bulk-apply">Apply</button>`);
    } else if (column.type === "record" && column.kind) {
      html.push(
        `              <div ${box} data-qube-field="${fieldOf(column)}">`,
        `                <input type="search" class="qube-search-input" maxlength="100" autocomplete="off" form="">`,
        `                <input type="hidden" class="qube-search-value qube-bulk-value" form="">`,
        `                <div class="qube-search-results" aria-live="polite"></div>`,
        `              </div>`,
        `              <button type="button" class="qube-bulk-apply">Apply</button>`
      );
    }
    html.push(`            </td>`);
  }
  html.push(`          </tr>`, `        </thead>`, `        <tbody>`);
  for (const row of field.rows || []) {
    const key = row.key;
    const values = row.values || {};
    const asked = row.columns || [];
    html.push(
      `          <tr data-qube-row="${escapeHtml(key)}" data-qube-values="${escapeHtml(JSON.stringify(values))}">`,
      `            <td><input type="checkbox" class="qube-rows-pick" aria-label="Select ${escapeHtml(row.label)}"></td>`,
      `            <th scope="row">${escapeHtml(row.label)}` +
        (row.detail ? ` <span class="qube-rows-detail">${escapeHtml(row.detail)}</span>` : "") +
        `</th>`
    );
    for (const column of columns) {
      const name = escapeHtml(`data[${field.name}][${key}][${column.name}]`);
      const required = column.required ? " required" : "";
      const aria = `aria-label="${escapeHtml(column.label || column.name)}"`;
      const when = escapeHtml(JSON.stringify(column.when || {}));
      html.push(`            <td data-qube-col="${escapeHtml(column.name)}" data-qube-when="${when}">`);
      if (!asked.includes(column.name)) {
        // A preset value, as text: its enum label when it has one.
        const preset = values[column.name];
        const option = (column.enum || []).find((e) => e.value === preset);
        html.push(`              ${escapeHtml(option ? option.label || option.value : preset)}`);
      } else if (hasEnum(column)) {
        html.push(`              ${selectHtml(column.enum, `name="${name}" class="qube-rows-input" ${aria}${required}`)}`);
      } else if (column.type === "record") {
        html.push(
          `              <div ${box} data-qube-field="${fieldOf(column)}" data-qube-row="${escapeHtml(key)}">`,
          `                <input type="search" class="qube-search-input" maxlength="100" autocomplete="off" ${aria}${required}>`,
          `                <input type="hidden" class="qube-search-value qube-rows-input" name="${name}">`,
          `                <div class="qube-search-results" aria-live="polite"></div>`,
          `              </div>`
        );
      } else {
        html.push(`              <input type="text" name="${name}" class="qube-rows-input" ${aria}${required}>`);
      }
      html.push(`            </td>`);
    }
    html.push(`          </tr>`);
  }
  html.push(`        </tbody>`, `      </table>`, `    </div>`);
  return html;
}

function hasEnum(field) {
  return Array.isArray(field.enum) && field.enum.length > 0;
}

// A select of an enum's values (labelled), with a blank first.
function selectHtml(options, attributes) {
  const items = options.map((e) => `<option value="${escapeHtml(e.value)}">${escapeHtml(e.label || e.value)}</option>`);
  return `<select ${attributes}><option value=""></option>${items.join("")}</select>`;
}

const ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Text and attribute values as HTML: nothing in a question can become markup.
function escapeHtml(value) {
  return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

// The search box's script, sent as it is: nothing in it comes from the question.
const SEARCH_SCRIPT = `
// The question's search boxes: what your user types is looked up through your
// app's search route (data-qube-search, with the row's key for a rows field), and
// the match they pick fills the field.
// Plain JavaScript for the browser, no build; it binds each box once.
(function () {
  var boxes = document.querySelectorAll(".qube-search:not([data-qube-ready])");
  Array.prototype.forEach.call(boxes, function (box) {
    box.setAttribute("data-qube-ready", "");
    var input = box.querySelector(".qube-search-input");
    var value = box.querySelector(".qube-search-value");
    var results = box.querySelector(".qube-search-results");
    var timer = null;
    var asked = 0;
    // Until a match is picked, the form won't send what was typed.
    var check = function () {
      var unpicked = input.value && !value.value;
      input.setCustomValidity(unpicked ? "Pick one of the matches." : "");
    };
    input.addEventListener("input", function () {
      value.value = "";
      check();
      clearTimeout(timer);
      results.textContent = "";
      var q = input.value.trim();
      if (q.length < 2) return;
      timer = setTimeout(function () {
        var n = ++asked;
        var url = box.getAttribute("data-qube-search") +
          "?field=" + encodeURIComponent(box.getAttribute("data-qube-field")) +
          "&q=" + encodeURIComponent(q);
        var row = box.getAttribute("data-qube-row");
        if (row) url += "&row=" + encodeURIComponent(row);
        fetch(url, {
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        })
          .then(function (res) { return res.ok ? res.json() : []; })
          .then(function (matches) {
            if (n !== asked) return; // a later search has gone out since
            results.textContent = matches.length ? "" : "No matches.";
            matches.forEach(function (match) {
              var pick = document.createElement("button");
              pick.type = "button";
              pick.className = "qube-search-result";
              pick.textContent = match.label;
              if (match.detail) pick.textContent += " · " + match.detail;
              pick.addEventListener("click", function () {
                value.value = match.value;
                input.value = match.label;
                results.textContent = "";
                check();
                box.dispatchEvent(new CustomEvent("qube:picked", { bubbles: true }));
              });
              results.appendChild(pick);
            });
          });
      }, 250);
    });
  });
})();
`;

// A rows field's script, sent as it is: shows a cell only while its "when" holds (a hidden one is
// disabled, so it isn't sent or required) and fills a column on the ticked rows ("Set selected").
const ROWS_SCRIPT = `
(function () {
  var tables = document.querySelectorAll("[data-qube-rows]:not([data-qube-ready])");
  Array.prototype.forEach.call(tables, function (table) {
    table.setAttribute("data-qube-ready", "");
    var rows = table.querySelectorAll("tr[data-qube-row]");

    // A row's answers so far: its preset values, then its selects.
    var answers = function (row) {
      var values = JSON.parse(row.getAttribute("data-qube-values") || "{}");
      Array.prototype.forEach.call(row.querySelectorAll("td[data-qube-col] select"), function (select) {
        values[select.closest("td").getAttribute("data-qube-col")] = select.value;
      });
      return values;
    };

    // Shows a cell while its "when" holds; a hidden one sends nothing and isn't required.
    var refresh = function (row) {
      var values = answers(row);
      Array.prototype.forEach.call(row.querySelectorAll("td[data-qube-col]"), function (cell) {
        var when = JSON.parse(cell.getAttribute("data-qube-when") || "{}");
        var shown = Object.keys(when).every(function (k) { return when[k].indexOf(values[k]) !== -1; });
        cell.style.visibility = shown ? "" : "hidden";
        Array.prototype.forEach.call(cell.querySelectorAll("input, select"), function (input) {
          input.disabled = !shown;
        });
      });
    };

    Array.prototype.forEach.call(rows, function (row) {
      row.addEventListener("change", function () { refresh(row); });
      refresh(row);
    });

    table.querySelector(".qube-rows-all").addEventListener("change", function (event) {
      Array.prototype.forEach.call(table.querySelectorAll(".qube-rows-pick"), function (box) {
        box.checked = event.target.checked;
      });
    });

    // Fills a column on every ticked row that asks it.
    Array.prototype.forEach.call(table.querySelectorAll(".qube-bulk-apply"), function (button) {
      button.addEventListener("click", function () {
        var bulk = button.closest("[data-qube-bulk]");
        var col = bulk.getAttribute("data-qube-bulk");
        var value = bulk.querySelector(".qube-bulk-value").value;
        var shownLabel = bulk.querySelector(".qube-search-input");
        if (!value) return;
        Array.prototype.forEach.call(rows, function (row) {
          if (!row.querySelector(".qube-rows-pick").checked) return;
          var cell = row.querySelector('td[data-qube-col="' + col + '"]');
          var input = cell && cell.querySelector(".qube-rows-input");
          if (!input || input.disabled) return;
          input.value = value;
          var search = cell.querySelector(".qube-search-input");
          if (search) {
            search.value = shownLabel ? shownLabel.value : value;
            search.setCustomValidity("");
          }
          refresh(row);
        });
      });
    });
  });
})();
`;

module.exports = { renderQuestion, renderRunStatus, escapeHtml, SEARCH_SCRIPT, ROWS_SCRIPT };
