// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks list merge operations. Types: list_merge.d.ts. */
class ListMerge {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Execute list merge.
   * @param {string} connectionId
   * @param {import("./list_merge").ListMergeExecuteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/list-merge/execute-list-merge
   */
  execute(connectionId, params, options) {
    return this.#client.queue("list_merge.execute", connectionId, params, options);
  }
}

module.exports = { ListMerge };
