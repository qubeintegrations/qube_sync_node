// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks build assembly operations. Types: build_assembly.d.ts. */
class BuildAssembly {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create build assembly.
   * @param {string} connectionId
   * @param {import("./build_assembly").BuildAssemblyCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/build-assemblies/create-build-assembly
   */
  create(connectionId, params, options) {
    return this.#client.queue("build_assembly.create", connectionId, params, options);
  }

  /**
   * List build assemblies (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./build_assembly").BuildAssemblyQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/build-assemblies/list-build-assemblies
   */
  query(connectionId, params, options) {
    return this.#client.queue("build_assembly.query", connectionId, params, options);
  }

  /**
   * Update build assembly.
   * @param {string} connectionId
   * @param {import("./build_assembly").BuildAssemblyUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/build-assemblies/update-build-assembly
   */
  update(connectionId, params, options) {
    return this.#client.queue("build_assembly.update", connectionId, params, options);
  }
}

module.exports = { BuildAssembly };
