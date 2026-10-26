"use strict";

// renderQuestion(run, options) and renderRunStatus(run, options): a record's latest run of an
// operation, as HTML for the record's page. Find the run with Run.latestFor:
//
//   const run = await Run.latestFor(invoice, "create_invoice");
//   const html = renderRunStatus(run, { csrfToken }) + renderQuestion(run, {
//     csrfToken: req.csrfToken && req.csrfToken(), // your CSRF protection's
//     nonce: res.locals.cspNonce, // your Content-Security-Policy's, on the search box's script
//   });
//
// renderQuestion shows the question the run is asking (Operation's question kept it), with a form
// per choice, or "" when it isn't asking. Each form posts your user's choice to the run's answer
// route, <mount>/qube/questions/runs/<run id> (the questions router), and a record field's box
// searches through it too, so the API key never reaches the browser.
//
// renderRunStatus says where the run stands, in a sentence (Run#summaryText), and what went wrong
// when it failed (Run#errorDetail), or "" for no run. A start QuBe Sync hasn't confirmed for a
// minute gets a "Try the start again" button, posting to <mount>/qube/runs/<run id>/retry_start,
// which resends it with the same reference.
//
// mount is where the questions router is mounted ("" for the app's root). Every value is escaped.
// csrfToken goes in each form as _csrf (or csrfField). The markup is plain, with qube- classes for
// your CSS. For other markup, write your own with escapeHtml and SEARCH_SCRIPT: the routes only
// need the form's fields (choice, data[name]) and the search box's data-qube-search and
// data-qube-field.

function renderQuestion(run, options) {
  const { csrfToken, nonce, csrfField = "_csrf", mount = "" } = options || {};
  const question = run && typeof run.openQuestion === "function" ? run.openQuestion() : null;
  if (!question) return "";
  const action = `${trimMount(mount)}/qube/questions/runs/${encodeURIComponent(String(run.id))}`;
  const html = [`<section class="qube-question">`];
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
      html.push(...fieldHtml(field, id, `${action}/search`, nonce));
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
  html.push(`</section>`);
  return html.join("\n");
}

function renderRunStatus(run, options) {
  const { csrfToken, csrfField = "_csrf", mount = "", now = new Date() } = options || {};
  if (!run || typeof run.summaryText !== "function") return "";
  const state = run.cancelled() ? "cancelled" : run.state;
  const html = [`<div class="qube-run-status qube-run-${escapeHtml(state)}">`];
  html.push(`  <p class="qube-run-summary">${escapeHtml(run.summaryText(now))}</p>`);
  const detail = run.failed() ? run.errorDetail() : null;
  if (detail) html.push(`  <p class="qube-run-error-detail">${escapeHtml(detail)}</p>`);
  if (run.unconfirmed(now)) {
    const action = `${trimMount(mount)}/qube/runs/${encodeURIComponent(String(run.id))}/retry_start`;
    html.push(`  <form class="qube-retry-start-form" method="post" action="${escapeHtml(action)}">`);
    html.push(...csrfInput(csrfToken, csrfField));
    html.push(`    <button type="submit" class="qube-retry-start">Try the start again</button>`);
    html.push(`  </form>`);
  }
  html.push(`</div>`);
  return html.join("\n");
}

function trimMount(mount) {
  return String(mount || "").replace(/\/+$/, "");
}

function csrfInput(csrfToken, csrfField) {
  if (!csrfToken) return [];
  return [`    <input type="hidden" name="${escapeHtml(csrfField)}" value="${escapeHtml(csrfToken)}">`];
}

// One field of a choice, with its label: a record field is a search box.
function fieldHtml(field, id, searchUrl, nonce) {
  const name = escapeHtml(`data[${field.name}]`);
  const at = `id="${escapeHtml(id)}"`;
  const required = field.required ? " required" : "";
  const html = [
    `    <div class="qube-field">`,
    `      <label for="${escapeHtml(id)}">${escapeHtml(field.label || field.name)}</label>`,
  ];
  if (field.type === "record") {
    const box = `data-qube-search="${escapeHtml(searchUrl)}"`;
    const nonceAt = nonce ? ` nonce="${escapeHtml(nonce)}"` : "";
    html.push(
      `      <div class="qube-search" ${box} data-qube-field="${escapeHtml(field.name)}">`,
      `        <input type="search" ${at} class="qube-search-input" maxlength="100"` + ` autocomplete="off"${required}>`,
      `        <input type="hidden" class="qube-search-value" name="${name}">`,
      `        <div class="qube-search-results" aria-live="polite"></div>`,
      `      </div>`,
      `      <script${nonceAt}>${SEARCH_SCRIPT}</script>`
    );
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
// A record field's search box: what your user types is looked up through your
// app's search route (data-qube-search), and the match they pick fills the field.
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
              });
              results.appendChild(pick);
            });
          });
      }, 250);
    });
  });
})();
`;

module.exports = { renderQuestion, renderRunStatus, escapeHtml, SEARCH_SCRIPT };
