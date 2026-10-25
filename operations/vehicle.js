// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks vehicle operations. Types: vehicle.d.ts. */
class Vehicle {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create vehicle.
   * @param {string} connectionId
   * @param {import("./vehicle").VehicleCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vehicles/create-vehicle
   */
  create(connectionId, params, options) {
    return this.#client.queue("vehicle.create", connectionId, params, options);
  }

  /**
   * List vehicles.
   * @param {string} connectionId
   * @param {import("./vehicle").VehicleQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vehicles/list-vehicles
   */
  query(connectionId, params, options) {
    return this.#client.queue("vehicle.query", connectionId, params, options);
  }

  /**
   * Update vehicle.
   * @param {string} connectionId
   * @param {import("./vehicle").VehicleUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vehicles/update-vehicle
   */
  update(connectionId, params, options) {
    return this.#client.queue("vehicle.update", connectionId, params, options);
  }
}

module.exports = { Vehicle };
