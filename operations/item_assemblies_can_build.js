// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item assemblies can build operations. Types: item_assemblies_can_build.d.ts. */
class ItemAssembliesCanBuild {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List item assemblies can builds.
   * @param {string} connectionId
   * @param {import("./item_assemblies_can_build").ItemAssembliesCanBuildQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-assemblies-can-builds/list-item-assemblies-can-builds
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_assemblies_can_build.query", connectionId, params, options);
  }
}

module.exports = { ItemAssembliesCanBuild };
