// Type definitions for qubesync/kit/store-tests: the checks a store has to pass.

import type { Store } from "./index";

/**
 * Registers the store checks: rows, unique keys (StoreConflict), transactions and savepoints,
 * locks, notifications taken once, and the kit's link rules on the store. makeStore is called
 * once per check and resolves to an empty store. Run it from a test file of its own.
 */
declare function storeTests(makeStore: () => Store | Promise<Store>, options?: storeTests.StoreTestsOptions): void;

declare namespace storeTests {
  export interface StoreTestsOptions {
    /** node:test's describe, unless given. */
    describe?: (name: string, fn: () => void) => unknown;
    /** node:test's it, unless given. */
    it?: (name: string, fn: () => Promise<void>) => unknown;
  }
  export { storeTests };
}

export = storeTests;
