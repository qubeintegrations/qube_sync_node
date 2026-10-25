import { describe, it } from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

import kit, { configure, Operation, ConnectionEvents, renderQuestion, run } from "qubesync/kit";
import adapter, { webhooks, connect, questions } from "qubesync/express";
import * as localKit from "../kit/index.mjs";
import * as localExpress from "../express/index.mjs";

const require = createRequire(import.meta.url);
const cjsKit = require("qubesync/kit");
const cjsExpress = require("qubesync/express");

describe("ESM wrappers: qubesync/kit and qubesync/express", () => {
  it("export the CommonJS modules' names and default, the same objects", () => {
    assert.strictEqual(kit, cjsKit);
    assert.strictEqual(adapter, cjsExpress);
    assert.strictEqual(configure, cjsKit.configure);
    assert.strictEqual(Operation, cjsKit.Operation);
    assert.strictEqual(ConnectionEvents, cjsKit.ConnectionEvents);
    assert.strictEqual(renderQuestion, cjsKit.renderQuestion);
    assert.strictEqual(run, cjsKit.run);
    assert.strictEqual(webhooks, cjsExpress.webhooks);
    assert.strictEqual(connect, cjsExpress.connect);
    assert.strictEqual(questions, cjsExpress.questions);
    for (const name of Object.keys(cjsKit)) assert.strictEqual(localKit[name], cjsKit[name], name);
    for (const name of Object.keys(cjsExpress)) assert.strictEqual(localExpress[name], cjsExpress[name], name);
  });

  it("an ESM operation class configures as a CommonJS one does", () => {
    class CreateInvoice extends Operation {
      static workflow = "add_transaction";
      static slug = "create_invoice";
    }
    configure({ operations: { create_invoice: CreateInvoice } });
    assert.strictEqual(cjsKit.settings().operations.get("create_invoice"), CreateInvoice);
    cjsKit.resetSettings();
  });
});
