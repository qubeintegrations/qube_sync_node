"use strict";

// The kit's own errors, each for one thing a caller can act on.

// A setting your app hasn't written yet, thrown the first time it's needed.
class NotConfigured extends Error {
  constructor(message) {
    super(message);
    this.name = "NotConfigured";
  }
}

// A run whose operation none of the operations setting has any more (taken out after it started).
class UnknownOperation extends Error {
  constructor(message) {
    super(message);
    this.name = "UnknownOperation";
  }
}

// A connection's event came before the row's qubeId was saved (createConnection hadn't answered
// yet, or its update hadn't committed: a simulated connection sends connection.connected at once).
// The job throws it so the queue retries once it's there.
class NotReady extends Error {
  constructor(message) {
    super(message);
    this.name = "NotReady";
  }
}

// Operation.start was given a connection QuBe Sync hasn't made yet (no qubeId): the customer
// hasn't finished onboarding, or QuBe Sync didn't answer it.
class NotConnected extends TypeError {
  constructor(message) {
    super(message);
    this.name = "NotConnected";
  }
}

// What a store throws when a write breaks one of the tables' unique keys (another worker wrote
// the same row at the same moment). Connection#link tries once more when it sees one.
class StoreConflict extends Error {
  constructor(message) {
    super(message);
    this.name = "StoreConflict";
  }
}

module.exports = { NotConfigured, UnknownOperation, NotReady, NotConnected, StoreConflict };
