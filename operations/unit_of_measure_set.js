// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks unit of measure set operations. Types: unit_of_measure_set.d.ts. */
class UnitOfMeasureSet {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create unit of measure set.
   * @param {string} connectionId
   * @param {import("./unit_of_measure_set").UnitOfMeasureSetCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/unit-of-measure-sets/create-unit-of-measure-set
   */
  create(connectionId, params, options) {
    return this.#client.queue("unit_of_measure_set.create", connectionId, params, options);
  }

  /**
   * List unit of measure sets.
   * @param {string} connectionId
   * @param {import("./unit_of_measure_set").UnitOfMeasureSetQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/unit-of-measure-sets/list-unit-of-measure-sets
   */
  query(connectionId, params, options) {
    return this.#client.queue("unit_of_measure_set.query", connectionId, params, options);
  }
}

module.exports = { UnitOfMeasureSet };
