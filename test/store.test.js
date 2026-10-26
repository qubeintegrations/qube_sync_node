"use strict";

// The store checks (qubesync/kit/store-tests), against memoryStore(), and schema.sql against the
// columns the kit reads and writes.

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");

const kit = require("../kit");
const storeTests = require("../kit/store-tests");

kit.resetSettings();
kit.configure({ webhookUrl: "https://app.example.com/webhooks/qube" });

storeTests(async () => kit.memoryStore());

describe("schema.sql", () => {
  const sql = fs.readFileSync(kit.SCHEMA_PATH, "utf8");

  it("has every table and column the kit reads and writes, and no others", () => {
    const tables = {};
    for (const match of sql.matchAll(/CREATE TABLE (\w+) \(([\s\S]*?)\n\);/g)) {
      tables[match[1]] = match[2]
        .split("\n")
        .map((line) => line.trim().split(/\s+/)[0])
        .filter((word) => word && word !== "CONSTRAINT");
    }
    assert.deepStrictEqual(Object.keys(tables).sort(), Object.keys(kit.STORE_COLUMNS).sort());
    for (const [table, columns] of Object.entries(kit.STORE_COLUMNS)) {
      assert.deepStrictEqual(tables[table], Object.values(columns), table);
    }
  });

  it("has qube_rails' unique keys and indexes, by name", () => {
    for (const index of [
      "UNIQUE INDEX index_qube_connections_on_qube_id ON qube_connections (qube_id)",
      "INDEX index_qube_connections_on_owner ON qube_connections (owner_type, owner_id)",
      "UNIQUE INDEX index_qube_runs_on_reference ON qube_runs (reference)",
      "INDEX index_qube_runs_on_connection_id ON qube_runs (connection_id)",
      "INDEX index_qube_runs_on_record_and_operation ON qube_runs (record_type, record_id, operation, created_at)",
      "UNIQUE INDEX index_qube_notifications_on_run_and_delivery ON qube_notifications (run_id, delivery_id)",
      "UNIQUE INDEX index_qube_quickbooks_records_on_qb_id ON qube_quickbooks_records (connection_id, list, qb_id)",
      "UNIQUE INDEX index_qube_quickbooks_records_on_record ON qube_quickbooks_records (connection_id, kind, record_type, record_id)",
      "INDEX index_qube_quickbooks_records_on_connection_and_record ON qube_quickbooks_records (connection_id, record_type, record_id)",
      "INDEX index_qube_runs_on_connection_record_and_state ON qube_runs (connection_id, record_type, record_id, operation, state)",
    ]) {
      assert.ok(sql.includes(`CREATE ${index};`), index);
    }
    assert.ok(sql.includes("FOREIGN KEY (run_id) REFERENCES qube_runs (id) ON DELETE CASCADE"));
  });
});

describe("familyFor", () => {
  it("maps kinds to families as qube_rails' QuickbooksRecord.family_for does", () => {
    const cases = {
      customer: "name",
      vendor: "name",
      employee: "name",
      other_name: "name",
      item: "item",
      item_service: "item",
      item_non_inventory: "item",
      account: "account",
      invoice: "invoice",
      itemized: "itemized",
      "": "",
    };
    for (const [kind, family] of Object.entries(cases)) assert.strictEqual(kit.familyFor(kind), family, kind);
    assert.strictEqual(kit.familyFor(null), "");
  });
});
