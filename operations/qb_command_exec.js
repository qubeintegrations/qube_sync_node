// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks qb command exec operations. Types: qb_command_exec.d.ts. */
class QbCommandExec {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Execute QB command exec.
   * @param {string} connectionId
   * @param {import("./qb_command_exec").QbCommandExecExecuteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/qb-command-exec/execute-qb-command-exec
   */
  execute(connectionId, params, options) {
    return this.#client.queue("qb_command_exec.execute", connectionId, params, options);
  }
}

module.exports = { QbCommandExec };
