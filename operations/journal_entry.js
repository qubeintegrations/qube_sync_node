// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks journal entry operations. Types: journal_entry.d.ts. */
class JournalEntry {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create journal entry.
   * @param {string} connectionId
   * @param {import("./journal_entry").JournalEntryCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/journal-entries/create-journal-entry
   */
  create(connectionId, params, options) {
    return this.#client.queue("journal_entry.create", connectionId, params, options);
  }

  /**
   * List journal entries (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./journal_entry").JournalEntryQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/journal-entries/list-journal-entries
   */
  query(connectionId, params, options) {
    return this.#client.queue("journal_entry.query", connectionId, params, options);
  }

  /**
   * Update journal entry.
   * @param {string} connectionId
   * @param {import("./journal_entry").JournalEntryUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/journal-entries/update-journal-entry
   */
  update(connectionId, params, options) {
    return this.#client.queue("journal_entry.update", connectionId, params, options);
  }
}

module.exports = { JournalEntry };
