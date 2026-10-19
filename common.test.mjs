import { getDateFromDaysObject } from "./common.mjs";
import assert from "node:assert";
import test from "node:test";

// - If October 2024 is being shown, October 8th must show Ada Lovelace Day.
// - If October 2025 is being shown, October 14th must show Ada Lovelace Day.

test("getDateFromDaysObject for Ada Lovelace Day is correct", () => {
  assert.deepStrictEqual(
    getDateFromDaysObject(2024, "October", "Tuesday", "second"),
    new Date(Date.UTC(2024, 9, 8)),
  );
  assert.deepStrictEqual(
    getDateFromDaysObject(2025, "October", "Tuesday", "second"),
    new Date(Date.UTC(2025, 9, 14)),
  );
});

test("getDateFromDaysObject for last occurrence of day of week is correct", () => {
  assert.deepStrictEqual(
    getDateFromDaysObject(2024, "October", "Tuesday", "last"),
    new Date(Date.UTC(2024, 9, 29)),
  );
});

test("getDateFromDaysObject throws error when month not found", () => {
  assert.throws(() =>
    getDateFromDaysObject(2024, "Unknown", "Tuesday", "second"),
  );
});

test("getDateFromDaysObject throws error when day of week not found", () => {
  assert.throws(() =>
    getDateFromDaysObject(2024, "October", "Unknown", "second"),
  );
});

test("getDateFromDaysObject throws error when occurrence not found", () => {
  assert.throws(() =>
    getDateFromDaysObject(2024, "October", "Tuesday", "fifth"),
  );
});
