// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks vehicle mileage operations. Types: vehicle_mileage.d.ts. */
class VehicleMileage {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create vehicle mileage.
   * @param {string} connectionId
   * @param {import("./vehicle_mileage").VehicleMileageCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vehicle-mileages/create-vehicle-mileage
   */
  create(connectionId, params, options) {
    return this.#client.queue("vehicle_mileage.create", connectionId, params, options);
  }

  /**
   * List vehicle mileages (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./vehicle_mileage").VehicleMileageQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vehicle-mileages/list-vehicle-mileages
   */
  query(connectionId, params, options) {
    return this.#client.queue("vehicle_mileage.query", connectionId, params, options);
  }
}

module.exports = { VehicleMileage };
