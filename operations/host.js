// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks host operations. Types: host.d.ts. */
class Host {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List hosts.
   * @param {string} connectionId
   * @param {import("./host").HostQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/hosts/list-hosts
   */
  query(connectionId, params, options) {
    return this.#client.queue("host.query", connectionId, params, options);
  }
}

module.exports = { Host };
