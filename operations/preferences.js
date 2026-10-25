// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks preferences operations. Types: preferences.d.ts. */
class Preferences {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List preferences.
   * @param {string} connectionId
   * @param {import("./preferences").PreferencesQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/preferences/list-preferences
   */
  query(connectionId, params, options) {
    return this.#client.queue("preferences.query", connectionId, params, options);
  }

  /**
   * Update preferences.
   * @param {string} connectionId
   * @param {import("./preferences").PreferencesUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/preferences/update-preferences
   */
  update(connectionId, params, options) {
    return this.#client.queue("preferences.update", connectionId, params, options);
  }
}

module.exports = { Preferences };
