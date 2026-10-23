import { describe, it } from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

import qubesync, { verify, parse, SignatureError, WorkflowRunEvent, VERSION } from "qubesync";
import * as local from "../index.mjs";

const require = createRequire(import.meta.url);
const cjs = require("../index.js");
const vectors = JSON.parse(readFileSync(new URL("./fixtures/test_vectors.json", import.meta.url), "utf8"));

describe("ESM wrapper", () => {
  it("exports the CommonJS module's names and default", () => {
    assert.strictEqual(qubesync, cjs);
    assert.strictEqual(verify, cjs.verify);
    assert.strictEqual(SignatureError, cjs.SignatureError);
    assert.strictEqual(local.parse, cjs.parse);
    assert.strictEqual(VERSION, cjs.VERSION);
    for (const name of Object.keys(cjs)) assert.strictEqual(local[name], cjs[name], name);
  });

  it("verifies and parses", () => {
    const c = vectors.events.find((e) => e.name === "workflow_run.completed");
    const event = verify(c.body, c.header, { secrets: vectors.secrets, now: vectors.timestamp });
    assert.ok(event instanceof WorkflowRunEvent);
    assert.strictEqual(parse(c.body).revision, 9);
    assert.throws(
      () => verify(c.body, undefined, { secrets: vectors.secrets }),
      (error) => error instanceof SignatureError && error.reason === "missing"
    );
  });
});
