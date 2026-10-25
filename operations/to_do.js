// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks to do operations. Types: to_do.d.ts. */
class ToDo {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create to do.
   * @param {string} connectionId
   * @param {import("./to_do").ToDoCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/to-dos/create-to-do
   */
  create(connectionId, params, options) {
    return this.#client.queue("to_do.create", connectionId, params, options);
  }

  /**
   * List to dos.
   * @param {string} connectionId
   * @param {import("./to_do").ToDoQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/to-dos/list-to-dos
   */
  query(connectionId, params, options) {
    return this.#client.queue("to_do.query", connectionId, params, options);
  }

  /**
   * Update to do.
   * @param {string} connectionId
   * @param {import("./to_do").ToDoUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/to-dos/update-to-do
   */
  update(connectionId, params, options) {
    return this.#client.queue("to_do.update", connectionId, params, options);
  }
}

module.exports = { ToDo };
