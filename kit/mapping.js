"use strict";

// What a mapped operation's input and endings read with: each reads past a missing association,
// so a record without one maps to a field left out.

// value.name1.name2..., or undefined as soon as one is missing.
function get(value, ...names) {
  for (const name of names) {
    if (value === null || value === undefined) return undefined;
    value = value[name];
  }
  return value;
}

// A has-many's rows, as an array: none for a missing one.
function rows(value) {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : Array.from(value);
}

// data[key1][key2]... in a webhook, or undefined as soon as one is missing.
function dig(data, ...keys) {
  return get(data, ...keys);
}

function asString(value) {
  return value === null || value === undefined ? undefined : String(value);
}

// value as a number, or undefined when it isn't one ("", "n/a"): the field is left out.
function asNumber(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

function asInteger(value) {
  const number = asNumber(value);
  return number === undefined ? undefined : Math.trunc(number);
}

// A date as QuickBooks takes it, YYYY-MM-DD, from a Date or a string.
function asDate(value) {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

// value without its null and undefined values, at every depth: a field the record doesn't have
// yet is left out rather than sent as null.
function withoutNils(value) {
  if (Array.isArray(value)) {
    return value.filter((inner) => inner !== null && inner !== undefined).map(withoutNils);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const kept = {};
    for (const [key, inner] of Object.entries(value)) {
      if (inner !== null && inner !== undefined) kept[key] = withoutNils(inner);
    }
    return kept;
  }
  return value;
}

module.exports = { get, rows, dig, asString, asNumber, asInteger, asDate, withoutNils };
