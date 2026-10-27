"use strict";

// Styling the screens: the view-models (the pieces' contract), choices by kind, uiClasses, an
// app's own pieces, the wording (messages), the behaviour script and stylesheet, and the
// storyboard (kit and Express). Mirrors qube_rails' view_models, choice_kinds, styling, wording
// and storyboard specs.

const { describe, it: nodeIt } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const http = require("node:http");

const express = require("express");

const support = require("./kit-support");
const { kit, tables, reset, makeConnection, makeRun, vectorBody } = support;
const qube = require("../express");

const it = (name, fn) => support.it(nodeIt, name, fn);

const prompt = () => JSON.parse(vectorBody("workflow_run.awaiting_input")).prompt;
const sample = (key) => kit.storyboard.findScreen(key).sample.prompt;
const question = (p) => new kit.QuestionView(p, { actionUrl: "/q/1", searchUrl: "/q/1/search" });
const arranged = (view) => view.choices.map((c) => [c.id, c.kind, c.style]);

// What the screens may never say to a user (qube_rails' wording_spec).
const JARGON = /QuBe Sync|qube sync|webhook|revision|ListID|your app|\bthe run\b/i;

async function fixtures() {
  const account = tables.Account.add({ name: "Riverbend" });
  const connection = await makeConnection(account);
  const invoice = tables.Invoice.add({ accountId: account.id, number: "1001" });
  const run = await makeRun(invoice, connection);
  return { account, connection, invoice, run };
}

describe("styling: the view-models", () => {
  it("builds a QuestionView from a prompt as QuBe Sync sends it", () => {
    const p = prompt();
    const view = question(p);
    assert.strictEqual(view.message, p.message);
    assert.strictEqual(view.token, "Vq3kT9xRb2LmW8sZ");
    assert.deepStrictEqual(view.details, [{ label: "Customer", value: "Riverbend" }]);
    assert.deepStrictEqual(view.choices.map((c) => c.id), ["use:1", "use", "none", "cancel"]);
    assert.strictEqual(view.choices[0].detail, "similar name");
    assert.strictEqual(view.choices[0].actionUrl, "/q/1");
    assert.strictEqual(view.choices[3].secondary, true);

    const field = view.choices[1].fields[0];
    assert.deepStrictEqual(
      [field.type, field.name, field.inputName, field.domId, field.label, field.required],
      ["search", "list_id", "data[list_id]", "qube-Vq3kT9xRb2LmW8sZ-1-list_id", "The one to use", true]
    );
    assert.deepStrictEqual([field.searchUrl, field.searchField, field.kind, field.piece, field.labelled], ["/q/1/search", "list_id", "customer", "fields/search", true]);
  });

  it("comes from a run's open question with the run's routes, and is null when it isn't asking", async () => {
    reset();
    const { run } = await fixtures();
    assert.strictEqual(kit.QuestionView.fromRun(run), null);
    assert.strictEqual(kit.QuestionView.fromRun(null), null);
    await run.update({ question: prompt() });
    const view = kit.QuestionView.fromRun(run, { urls: kit.routes("/app/"), error: "Nope" });
    assert.strictEqual(view.actionUrl, `/app/qube/questions/runs/${run.id}`);
    assert.strictEqual(view.searchUrl, `/app/qube/questions/runs/${run.id}/search`);
    assert.strictEqual(view.error, "Nope");
  });

  it("shows an enum as a select, and number and boolean fields as themselves", () => {
    const select = question(sample("enum_select")).choices[0].fields[0];
    assert.strictEqual(select.type, "select");
    assert.deepStrictEqual(select.options[0], { value: "sales_order", label: "Sales order" });
    const fields = question(sample("number_boolean")).choices[0].fields;
    assert.deepStrictEqual(fields.map((f) => f.type), ["number", "boolean"]);
    assert.deepStrictEqual(fields.map((f) => f.inputName), ["data[quantity]", "data[allow_negative]"]);
  });

  describe("RowsView", () => {
    const rows = () => question(sample("rows")).choices[0].fields[0].rows;

    it("has the columns, a row per record, and a cell per column it asks or has a value for", () => {
      const view = rows();
      assert.deepStrictEqual(view.columns.map((c) => c.name), ["action", "list_id", "item_type", "entity_type", "income_account", "asset_account", "cogs_account"]);
      assert.deepStrictEqual(view.rows.map((r) => r.key), ["customer_ref", "invoice_line_add.0.item_ref", "invoice_line_add.1.item_ref"]);
      const customer = view.rows[0];
      const action = customer.cells[0].field;
      assert.deepStrictEqual([action.type, action.inputName, action.context, action.data], ["select", "data[records][customer_ref][action]", "cell", { "qube-rows-input": "" }]);
      const listId = customer.cells[1].field;
      assert.deepStrictEqual([listId.type, listId.searchField, listId.rowKey], ["search", "records.list_id", "customer_ref"]);
      assert.deepStrictEqual(customer.cells.map((c) => c.column), ["action", "list_id"]);
      assert.strictEqual(action.segmented, true);
      assert.strictEqual(listId.domId, "qube-data-records-0-list_id");
    });

    it("shows a value the row already has by its label, and hides a cell whose when doesn't hold yet", () => {
      const kitRow = rows().rows[2];
      const itemType = kitRow.cells.find((c) => c.column === "item_type");
      assert.strictEqual(itemType.preset, "Inventory part");
      assert.strictEqual(itemType.hidden, true);
      assert.strictEqual(kitRow.cells[0].hidden, false);
      const asset = kitRow.cells.find((c) => c.column === "asset_account");
      assert.deepStrictEqual([asset.field.disabled, asset.whenJson], [true, JSON.stringify({ action: ["create"], item_type: ["item_inventory"] })]);
    });

    it("sets all by the first short enum column two rows ask, and isn't required while hidden", () => {
      const view = rows();
      assert.strictEqual(view.setAll.name, "action");
      assert.deepStrictEqual(view.setAll.options.map((o) => o.label), ["Create it", "Use an existing one"]);
      const vinyl = view.rows[1];
      const income = vinyl.cells.find((c) => c.column === "income_account");
      assert.deepStrictEqual([income.hidden, income.required, income.field.required, income.field.disabled], [true, true, false, true]);
      assert.strictEqual(vinyl.cells.find((c) => c.column === "item_type").field.segmented, false); // four options: a select
      assert.strictEqual(question(sample("missing_record")).choices[0].fields[0].rows.setAll, null); // one record
    });
  });

  describe("RunStatusView", () => {
    const view = async (invoice, options = {}) => kit.RunStatusView.fromSync(await kit.SyncStatus.latest(invoice, "create_invoice", { now: options.now }), options);
    const later = (seconds) => new Date(Date.now() + seconds * 1000);

    it("says a failure in a few words, why as a sentence, and what to do", async () => {
      reset();
      const { invoice, run } = await fixtures();
      await run.update({ state: "failed", endedAt: new Date(), error: { message: "No customer", detail: "Add it first." } });
      const v = await view(invoice);
      assert.deepStrictEqual([v.status, v.state, v.summary, v.reason, v.detail], ["failed", "failed", "Couldn't sync", "No customer.", "Add it first."]);
      assert.strictEqual(v.cssClass, "qube-run-status qube-sync-failed qube-run-failed");
      assert.deepStrictEqual([v.retryUrl, v.redeliverUrl], [null, null]);
    });

    it("has the retry URL for an unconfirmed start and the redeliver URL for a quiet run", async () => {
      reset();
      const { invoice, run } = await fixtures();
      await run.update({ state: "starting" });
      assert.strictEqual((await view(invoice, { now: later(120) })).retryUrl, `/qube/runs/${run.id}/retry_start`);
      await run.update({ state: "running", qubeRunId: "run-q" });
      const quiet = await view(invoice, { now: later(11 * 60) });
      assert.deepStrictEqual([quiet.redeliverUrl, quiet.quietText], [`/qube/runs/${run.id}/redeliver`, "No update from QuickBooks for a while."]);
    });

    it("says why a run waits on a stalled connection, offers no redelivery, and clears when it resumes", async () => {
      reset();
      const { connection, invoice, run } = await fixtures();
      await run.update({ state: "running", qubeRunId: "run-q" });
      await connection.update({ status: "stalled", stallReason: "not_checking_in" });
      const now = later(11 * 60); // quiet, but the cause is known
      let v = await view(invoice, { now });
      assert.deepStrictEqual([v.stall, v.summary, v.redeliverUrl, v.quietText], ["not_checking_in", "Waiting for QuickBooks", null, null]);
      assert.ok(v.stallText.startsWith("QuickBooks hasn't checked in for a while"));
      assert.ok(v.cssClass.includes("qube-connection-stalled"));
      await connection.update({ stallReason: "something_new" });
      v = await view(invoice, { now });
      assert.deepStrictEqual([v.stall, v.stallText], ["something_new", "Syncing with QuickBooks has stopped for now. Check the computer with QuickBooks and its Web Connector."]);
      await connection.update({ status: "connected", stallReason: null });
      v = await view(invoice, { now });
      assert.deepStrictEqual([v.stall, v.stallText, v.summary, v.redeliverUrl], [null, null, "Syncing with QuickBooks", `/qube/runs/${run.id}/redeliver`]);
    });

    it("leaves a question waiting on the person as it is, stalled or not, and takes the page's connection", async () => {
      reset();
      const { account, connection, invoice, run } = await fixtures();
      await run.update({ state: "awaiting_input", question: { message: "?" } });
      await connection.update({ status: "stalled", stallReason: "not_checking_in" });
      const v = await view(invoice);
      assert.deepStrictEqual([v.status, v.stall, v.summary], ["needs_answer", null, "Needs your answer"]);

      await run.update({ state: "running", question: null });
      await connection.update({ status: "connected", stallReason: null });
      const other = await (await kit.Connection.create(account)).update({ status: "stalled", stallReason: "quickbooks_unavailable" });
      assert.strictEqual((await view(invoice, { connection: other })).stall, "quickbooks_unavailable");
      assert.strictEqual((await view(invoice)).stall, null);
    });

    it("isn't visible before the record is sent", async () => {
      reset();
      const { invoice } = await fixtures();
      const fresh = tables.Invoice.add({ accountId: invoice.accountId, number: "1002" });
      const v = await view(fresh);
      assert.deepStrictEqual([v.visible, v.status], [false, "not_sent"]);
    });
  });
});

describe("styling: a question's choices by kind", () => {
  it("makes a choose list's items picks, a choice with fields a form, and the rest exits", () => {
    const view = question(sample("near_match"));
    assert.deepStrictEqual(arranged(view), [["use:1", "pick", null], ["use", "form", "primary"], ["none", "exit", "secondary"], ["cancel", "exit", "ghost"]]);
    assert.deepStrictEqual([view.picks, view.forms, view.exits].map((l) => l.map((c) => c.id)), [["use:1"], ["use"], ["none", "cancel"]]);
    assert.strictEqual(view.plain, false);
  });

  it("fills no button for a pick from a list, and fills only the first form's submit", () => {
    assert.deepStrictEqual(arranged(question(sample("choose"))), [["use:1", "pick", null], ["use:2", "pick", null], ["none", "exit", "secondary"], ["cancel", "exit", "ghost"]]);
    assert.deepStrictEqual(arranged(question(sample("record_search"))), [["use:1", "pick", null], ["use:2", "pick", null], ["use:3", "pick", null], ["use", "form", "primary"], ["cancel", "exit", "ghost"]]);
    const field = (name) => [{ name, type: "string", label: name, required: true }];
    const forms = question({
      token: "t",
      message: "?",
      choices: [
        { id: "narrow", label: "Narrow it down", fields: field("city") },
        { id: "rename", label: "Rename it", fields: field("name") },
        { id: "cancel", label: "Cancel", fields: [] },
      ],
    });
    assert.deepStrictEqual(arranged(forms), [["narrow", "form", "primary"], ["rename", "form", "secondary"], ["cancel", "exit", "ghost"]]);
  });

  it("shows a plain choice before the first form as a pick when there are none, and a plain question in one row", () => {
    assert.deepStrictEqual(arranged(question(sample("name_clash"))), [["use_existing", "pick", null], ["rename", "form", "primary"], ["cancel", "exit", "ghost"]]);
    const plain = question({ token: "t", message: "?", choices: ["approve", "skip", "cancel"].map((id) => ({ id, label: id, fields: [] })) });
    assert.strictEqual(plain.plain, true);
    assert.deepStrictEqual(arranged(plain), [["approve", "exit", "primary"], ["skip", "exit", "secondary"], ["cancel", "exit", "ghost"]]);
  });

  it("has at most one primary button on every storyboard question", () => {
    for (const key of kit.storyboard.QUESTIONS) {
      assert.ok(question(sample(key)).choices.filter((c) => c.style === "primary").length <= 1, key);
    }
  });
});

describe("styling: uiClasses and pieces", () => {
  it("adds uiClasses beside the qube- classes, from the setting and a render's own", async () => {
    reset({ uiClasses: { question: "card", button: ["btn", "btn-primary"], button_secondary: "btn btn-link", input: "form-control", label: "form-label", search_result: "list-group-item" } });
    const { run } = await fixtures();
    await run.update({ question: prompt() });
    const html = kit.renderQuestion(run, { uiClasses: { status: "alert" } });
    assert.ok(html.includes(`<section class="qube-question card"`));
    assert.strictEqual(html.match(/btn-primary/g).length, 1); // the form's submit; a pick is never a button
    assert.ok(/data-qube-choice="use" [^>]*>[\s\S]*?<button type="submit" class="qube-choice-button btn btn-primary"/.test(html));
    assert.ok(/data-qube-choice="use:1"[\s\S]*?<button type="submit" class="qube-pick">/.test(html));
    assert.ok(/data-qube-choice="cancel"[\s\S]*?<button type="submit" class="qube-choice-button btn btn-link" data-qube-button="ghost">/.test(html));
    assert.ok(html.includes(`class="qube-search-input form-control"`));
    assert.ok(html.includes(`class="qube-label form-label"`));
    assert.ok(html.includes(`data-qube-result-class="qube-search-result list-group-item"`));
    await run.update({ state: "failed", endedAt: new Date(), error: "Nope", question: null });
    assert.ok(kit.renderRunStatus(run, { uiClasses: { status: "alert" } }).includes(`class="qube-run-status qube-sync-failed qube-run-failed alert"`));
  });

  it("takes the choice pieces' classes: picks, pick, pick_detail, button_ghost, choice_footer, choice_divider", async () => {
    reset({ uiClasses: { button: "btn", button_secondary: "btn-2", button_ghost: "btn-link", picks: "list", pick: "list-item", pick_detail: "muted", choice_footer: "actions", choice_divider: "or" } });
    const { run } = await fixtures();
    await run.update({ question: prompt() });
    const html = kit.renderQuestion(run);
    assert.ok(html.includes(`<div class="qube-picks list" role="list">`));
    assert.ok(html.includes(`<button type="submit" class="qube-pick list-item">`));
    assert.ok(html.includes(`<span class="qube-pick-detail muted">`));
    assert.ok(html.includes(`<div class="qube-choice-divider or" role="separator">`));
    assert.ok(html.includes(`<div class="qube-choice-footer actions">`));
    assert.ok(html.includes(`class="qube-choice-button btn-2" data-qube-button="secondary">None of these`));
    assert.ok(html.includes(`class="qube-choice-button btn-link" data-qube-button="ghost">Cancel`));
  });

  it("throws for an unknown class piece or piece name, naming the ones there are", () => {
    reset();
    assert.throws(() => kit.configure({ uiClasses: { table: "x" } }), /uiClasses has no piece "table": it takes question, message, .*choice_divider/);
    assert.throws(() => kit.renderQuestion(null, { uiClasses: { nope: "x" } }), /no piece "nope"/);
    assert.throws(() => kit.configure({ pieces: { "question/question": () => "" } }), /pieces has no piece "question\/question": it takes question, message, .*error/);
    assert.throws(() => kit.configure({ pieces: { message: "<p>" } }), /must be a function/);
    assert.deepStrictEqual([...kit.UI_PIECES].sort(), [...new Set(kit.UI_PIECES)].sort());
  });

  it("renders an app's own piece instead of the kit's, from the view-model alone; the rest stay the kit's", async () => {
    reset({
      pieces: {
        "fields/boolean": (field, ctx) => `<label class="app-toggle" data-app-field="${ctx.escape(field.name)}"><input type="checkbox" name="${ctx.escape(field.inputName)}" value="true"> ${ctx.escape(field.label)}</label>`,
      },
    });
    const { run } = await fixtures();
    await run.update({ question: sample("number_boolean") });
    let html = kit.renderQuestion(run);
    assert.ok(html.includes(`<label class="app-toggle" data-app-field="allow_negative"><input type="checkbox" name="data[allow_negative]" value="true">`));
    assert.ok(!html.includes("qube-checkbox"));
    assert.ok(html.includes(`name="data[quantity]"`) && html.includes(`class="qube-input"`));
    // A render's own piece wins over the setting's, and a piece can render the kit's others.
    html = kit.renderQuestion(run, { pieces: { message: (q, ctx) => `<h3 class="app-ask">${ctx.escape(q.message)}</h3>${ctx.render("details", q)}` } });
    assert.ok(html.includes(`<h3 class="app-ask">`));
    assert.ok(html.includes(`<table class="qube-question-details">`));
    assert.strictEqual(kit.PIECES.message.length, 2);
  });

  it("posts the same names as before: choice and data[...], and a rows field's answer as before", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ question: prompt() });
    const html = kit.renderQuestion(run, { csrfToken: "t" });
    const form = html.split(`data-qube-choice="use" data-qube-choice-kind="form">`)[1].split("</form>")[0];
    assert.deepStrictEqual([...form.matchAll(/<input[^>]* name="([^"]+)"/g)].map((m) => m[1]), ["_csrf", "choice", "data[list_id]"]);

    const rows = sample("rows");
    await run.update({ question: rows });
    const rowsHtml = kit.renderQuestion(run);
    const names = [...new Set([...rowsHtml.matchAll(/ name="(data\[[^"]+)"/g)].map((m) => m[1]))];
    assert.ok(names.includes("data[records][customer_ref][action]"));
    assert.ok(names.includes("data[records][invoice_line_add.0.item_ref][income_account]"));
    // What the browser posts for those names is answered as { row key: { column: value } }.
    const posted = {
      choice: "proceed",
      "data[records][customer_ref][action]": "use",
      "data[records][customer_ref][list_id]": "80000001-1700000000",
      "data[records][invoice_line_add.0.item_ref][action]": "create",
      "data[records][invoice_line_add.0.item_ref][item_type]": "item_service",
    };
    const choice = rows.choices.find((c) => c.id === "proceed");
    const answer = kit.answerData(choice, posted).records;
    assert.deepStrictEqual(answer.customer_ref, { action: "use", list_id: "80000001-1700000000" });
    assert.deepStrictEqual(answer["invoice_line_add.0.item_ref"], { action: "create", item_type: "item_service" });
  });
});

describe("styling: wording", () => {
  it("keeps every English string free of QuBe Sync's name and plumbing", () => {
    const strings = (node) => Object.values(node).flatMap((v) => (typeof v === "string" ? [v] : strings(v)));
    assert.deepStrictEqual(strings(kit.MESSAGES).filter((s) => JARGON.test(s)), []);
    assert.strictEqual(kit.MESSAGE_KEYS.length, strings(kit.MESSAGES).length);
  });

  it("never names QuBe Sync or its plumbing on any storyboard screen (the storyboard's own notes aside)", () => {
    reset();
    const html = kit.storyboard.render();
    const canvases = html.split(`<div class="qube-storyboard-canvas" data-qube-storyboard-canvas>`).slice(1).map((part) => part.split(`</div>\n<details`)[0].split(`</div>\n</section>`)[0]);
    assert.strictEqual(canvases.length, kit.storyboard.screens().length);
    for (const canvas of canvases) {
      const words = [
        ...canvas.replace(/<[^>]*>/g, " ").split(/\s+/),
        ...[...canvas.matchAll(/(?:aria-label|data-qube-text-[a-z-]+)="([^"]*)"/g)].map((m) => m[1]),
      ].join(" ");
      assert.ok(!JARGON.test(words), `${words.match(JARGON)}: ${canvas.slice(0, 200)}`);
    }
  });

  it("takes an app's own words for a key, on the screens and in a route's message, and refuses an unknown key", async () => {
    reset({ messages: { status: { check_for_updates: "Look again", stalled: { not_checking_in: "Turn on the office PC." } }, "errors.not_starting": "Already on its way." } });
    const html = kit.storyboard.render();
    const panel = (key) => html.split(`data-qube-storyboard="${key}"`)[1].split("</section>")[0];
    assert.ok(panel("looks_stuck").includes(`<button type="submit" class="qube-redeliver">Look again</button>`));
    assert.ok(panel("stalled_not_checking_in").includes(`<p class="qube-run-stall">Turn on the office PC.</p>`));
    assert.strictEqual(kit.t(kit.NOT_STARTING), "Already on its way.");
    const { run } = await fixtures();
    assert.deepStrictEqual(await kit.retryStart({ runId: run.id, request: { account: tables.Account.find(run.connection.ownerId) } }), { status: 303, error: "Already on its way." });
    // A render's own words win, and a run's pill takes them too.
    assert.ok(kit.renderRunStatus(run, { messages: { status: { running: "Synchronisation" } } }).includes(`<p class="qube-run-summary">Synchronisation</p>`));
    assert.throws(() => kit.configure({ messages: { status: { nope: "x" } } }), /messages has no key "status.nope": it takes status.in_quickbooks, .*question.search_failed/);
  });
});

describe("styling: the behaviour script and the stylesheet", () => {
  it("ships the script keyed on data-qube-* attributes, and the stylesheet with no specificity", () => {
    const script = fs.readFileSync(kit.QUESTION_SCRIPT_PATH, "utf8");
    assert.ok(script.includes('document.addEventListener("input"') && script.includes("[data-qube-search-input]") && script.includes("[data-qube-set-all]"));
    assert.ok(!/\.qube-[a-z-]+["']/.test(script));
    const css = fs.readFileSync(kit.STYLESHEET_PATH, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const selectors = [...css.matchAll(/^([^{}\n][^{}]*)\{/gm)].map((m) => m[1].trim());
    assert.ok(selectors.length > 0);
    assert.deepStrictEqual(selectors.filter((s) => !s.startsWith("@") && !["from", "to"].includes(s) && !s.startsWith(":where(")), []);
    for (const name of ["--qube-accent", "--qube-border", "--qube-radius", "--qube-gap", "--qube-font", "--qube-muted", "--qube-error", "--qube-surface"]) {
      assert.ok(css.includes(`var(${name}`), name);
    }
    assert.strictEqual(require.resolve("qubesync/kit/question.js"), kit.QUESTION_SCRIPT_PATH);
    assert.strictEqual(require.resolve("qubesync/kit/qubesync.css"), kit.STYLESHEET_PATH);
  });

  it("writes their tags, with a CSP nonce when given", () => {
    assert.strictEqual(kit.renderAssets(), `<script src="/qube/assets/question.js" defer></script>`);
    assert.strictEqual(
      kit.renderAssets({ mount: "/app/", stylesheet: true, nonce: "n<1" }),
      `<link rel="stylesheet" href="/app/qube/assets/qubesync.css">\n<script src="/app/qube/assets/question.js" defer nonce="n&lt;1"></script>`
    );
  });
});

describe("styling: the storyboard", () => {
  it("has every screen, renders each from sample data, and lists the pieces to replace", () => {
    reset();
    const keys = kit.storyboard.screens().map((s) => s.key);
    assert.deepStrictEqual(keys, [
      ...["not_sent", "starting", "unconfirmed", "running", "stalled_not_checking_in", "stalled_quickbooks_unavailable", "needs_answer", "looks_stuck", "in_quickbooks", "done", "failed", "cancelled", "error"],
      ...["near_match", "record_search", "choose", "enum_select", "number_boolean", "name_clash", "ask_about_add", "missing_record", "rows", "refusal"],
    ]);
    const html = kit.storyboard.render({ mount: "/app" });
    assert.strictEqual(html.match(/<div class="qube-run-status /g).length, 11); // not_sent renders nothing
    assert.strictEqual(html.match(/<section class="qube-question"/g).length, 10);
    const panel = (key) => html.split(`data-qube-storyboard="${key}"`)[1].split("</section>\n<section class=\"qube-storyboard-panel\"")[0];
    assert.ok(panel("unconfirmed").includes(`<form class="qube-retry-start-form" method="post" action="/app/qube/storyboard/unconfirmed/answer">`));
    assert.ok(panel("looks_stuck").includes(`qube-redeliver-form`));
    const stalled = panel("stalled_not_checking_in");
    assert.ok(stalled.includes(`qube-connection-stalled" data-qube-sync-status="sending" data-qube-stall="not_checking_in"`));
    assert.ok(stalled.includes(`<p class="qube-run-summary">Waiting for QuickBooks</p>`));
    assert.ok(stalled.includes("Web Connector is running") && !stalled.includes("qube-redeliver") && !stalled.includes("qube-run-quiet"));
    assert.ok(panel("stalled_quickbooks_unavailable").includes("can&#39;t open QuickBooks"));
    assert.ok(panel("failed").includes("active in QuickBooks"));
    assert.ok(panel("error").includes(`<p class="qube-error" role="alert">`));
    assert.ok(/<section class="qube-question"[^>]*>\n<p class="qube-error" role="alert">That answer couldn&#39;t be used/.test(panel("refusal")));
    assert.strictEqual(panel("rows").match(/data-qube-row="[^"]+" data-qube-values=/g).length, 3);
    assert.strictEqual(panel("missing_record").match(/data-qube-row="[^"]+" data-qube-values=/g).length, 1);
    assert.ok(panel("missing_record").includes("Create it") && panel("missing_record").includes("Use an existing one"));
    assert.ok(panel("near_match").includes("None of these: add &quot;Riverbend&quot; as new"));
    assert.ok(panel("near_match").includes(`data-qube-search="/app/qube/storyboard/near_match/search"`));
    assert.ok(panel("failed").includes(`<code>pieces[&quot;run_status/status&quot;]</code>`) && panel("failed").includes(`pieces[&quot;run_status/detail&quot;]`));
    // At most one filled button per question, and no submit disabled in the markup.
    for (const key of kit.storyboard.QUESTIONS) assert.ok((panel(key).match(/data-qube-button="primary"/g) || []).length <= 1, key);
    assert.strictEqual((panel("choose").match(/data-qube-button="primary"/g) || []).length, 0);
    assert.ok(!/<button[^>]*type="submit"[^>]*disabled/.test(html));
  });

  it("names every piece the kit has on some screen", () => {
    const named = new Set(kit.storyboard.screens().flatMap((s) => s.pieces));
    assert.deepStrictEqual(kit.PIECE_NAMES.filter((name) => !named.has(name)), []);
  });

  it("answers a search from the samples", () => {
    const rows = kit.storyboard.findScreen("rows");
    assert.deepStrictEqual(kit.storyboard.matches(rows, "records.income_account", "sales").map((m) => m.label), ["Sales", "Sales:Signs"]);
    assert.deepStrictEqual(kit.storyboard.matches(null, "x", "y"), []);
  });
});

// One request to the app on a port of its own.
function request(app, { method = "GET", path, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const req = http.request({ host: "127.0.0.1", port: server.address().port, method, path, headers }, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          server.close();
          resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString("utf8") });
        });
      });
      req.on("error", (err) => {
        server.close();
        reject(err);
      });
      if (body !== undefined) req.write(body);
      req.end();
    });
  });
}

function storyboardApp(options) {
  const made = express();
  made.use((req, res, next) => (req.get("X-Test-Account") ? next() : res.sendStatus(401)));
  made.use("/app", qube.storyboard(options));
  made.use("/app", qube.questions());
  return made;
}

describe("express: the storyboard and the assets", () => {
  const signedIn = { "X-Test-Account": "1" };

  it("shows every screen in the app's layout while the storyboard setting is true, behind the app's sign-in", async () => {
    reset({ storyboard: true });
    const layout = (body, { title, assets }) => `<html><head><title>${title}</title>${assets}</head><body><nav id="app-nav"></nav>${body}</body></html>`;
    const app = storyboardApp({ layout });
    const res = await request(app, { path: "/app/qube/storyboard", headers: signedIn });
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes(`<nav id="app-nav"></nav>`));
    assert.ok(res.text.includes(`<link rel="stylesheet" href="/app/qube/assets/qubesync.css">`));
    assert.strictEqual(res.text.match(/data-qube-storyboard="/g).length, kit.storyboard.screens().length);
    assert.ok(!/<script(?![^>]*\ssrc=)/.test(res.text)); // no inline script
    assert.strictEqual((await request(app, { path: "/app/qube/storyboard" })).status, 401);

    const one = await request(app, { path: "/app/qube/storyboard/rows", headers: signedIn });
    assert.deepStrictEqual([...one.text.matchAll(/data-qube-storyboard="([^"]+)"/g)].map((m) => m[1]), ["rows"]);
    assert.strictEqual((await request(app, { path: "/app/qube/storyboard/nope", headers: signedIn })).status, 404);
  });

  it("answers a search from the samples, and sends nothing for an answer, saying so", async () => {
    reset({ storyboard: true });
    const app = storyboardApp();
    const found = await request(app, { path: "/app/qube/storyboard/rows/search?field=records.income_account&q=sales&row=customer_ref", headers: signedIn });
    assert.deepStrictEqual(JSON.parse(found.text).map((m) => m.label), ["Sales", "Sales:Signs"]);
    const body = "choice=rename&data%5Bname%5D=x";
    const posted = await request(app, { method: "POST", path: "/app/qube/storyboard/name_clash/answer", body, headers: { ...signedIn, "content-type": "application/x-www-form-urlencoded" } });
    assert.deepStrictEqual([posted.status, posted.headers.location], [303, "/app/qube/storyboard/name_clash?sent=none"]);
    const shown = await request(app, { path: posted.headers.location, headers: signedIn });
    assert.ok(shown.text.includes(`<p class="qube-storyboard-notice" role="status">Storyboard: nothing was sent.</p>`));
    assert.ok(shown.text.startsWith("<!DOCTYPE html>")); // the default layout
  });

  it("is not there when the storyboard setting is false, as by default outside development", async () => {
    reset();
    const saved = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";
    try {
      assert.strictEqual(kit.settings().storyboard, false);
      process.env.NODE_ENV = "development";
      assert.strictEqual(kit.settings().storyboard, true);
      process.env.NODE_ENV = "test";
      const app = storyboardApp();
      assert.strictEqual((await request(app, { path: "/app/qube/storyboard", headers: signedIn })).status, 404);
      assert.strictEqual((await request(app, { path: "/app/qube/storyboard/rows/search?field=records.list_id&q=lo", headers: signedIn })).status, 404);
      assert.strictEqual((await request(app, { method: "POST", path: "/app/qube/storyboard/rows/answer", headers: signedIn })).status, 404);
    } finally {
      if (saved === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = saved;
    }
  });

  it("serves the behaviour script and the stylesheet from the questions router", async () => {
    reset();
    const app = storyboardApp();
    const script = await request(app, { path: "/app/qube/assets/question.js", headers: signedIn });
    assert.strictEqual(script.status, 200);
    assert.ok(script.headers["content-type"].startsWith("application/javascript"));
    assert.strictEqual(script.text, fs.readFileSync(kit.QUESTION_SCRIPT_PATH, "utf8"));
    const css = await request(app, { path: "/app/qube/assets/qubesync.css", headers: signedIn });
    assert.ok(css.headers["content-type"].startsWith("text/css"));
    assert.ok(css.text.includes(":where("));
  });
});
