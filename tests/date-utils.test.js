// Comprehensive calendar-correctness tests for common.mjs (issue #6).
//
// Every expected date below was computed independently of the library under
// test (Python's calendar module, cross-checked by hand), so these pin real
// calendar behaviour rather than echoing the implementation.
//
// Covered: first/second/third/fourth and last weekday occurrences across
// historical and future years (1900, 2020, 2024, 2030, 2050, 2100), leap
// years (2024, 2000) and the non-leap century year 2100, the rubric dates
// (October 2020, October 2024, May 2030), DST-transition months (the library
// is UTC-based, so results must land on UTC midnight regardless of local
// rules), and the month-occurrence mapping over days.json.

import assert from "node:assert";
import test from "node:test";

import {
  getDateFromDaysObject,
  getOccurencesForTheMonth,
} from "../common.mjs";
import days from "../days.json" with { type: "json" };

// (year, monthName, dayName, occurrence, expected day-of-month)
const EXPECTED = [
  // Historical years
  [1900, "January", "Monday", "first", 1],
  [1900, "February", "Wednesday", "last", 28],
  [2020, "October", "Saturday", "first", 3],
  [2020, "October", "Sunday", "first", 4],
  [2020, "October", "Friday", "last", 30],
  [2020, "October", "Thursday", "fourth", 22],
  // Rubric year 2024, incl. the existing Ada Lovelace Day pin
  [2024, "October", "Tuesday", "second", 8],
  [2024, "October", "Tuesday", "last", 29],
  [2024, "October", "Monday", "first", 7],
  [2024, "October", "Sunday", "last", 27],
  // Rubric year 2030
  [2030, "May", "Sunday", "first", 5],
  [2030, "May", "Wednesday", "last", 29],
  [2030, "May", "Monday", "third", 20],
  // Far future
  [2050, "December", "Friday", "third", 16],
  [2050, "July", "Sunday", "fourth", 24],
  [2050, "February", "Wednesday", "second", 9],
];

const MONTH_INDEX = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

test("weekday occurrences are calendar-correct across years", () => {
  for (const [year, month, day, occurrence, expected] of EXPECTED) {
    const date = getDateFromDaysObject(year, month, day, occurrence);
    assert.deepStrictEqual(
      date,
      new Date(Date.UTC(year, MONTH_INDEX[month], expected)),
      `${occurrence} ${day} of ${month} ${year} should be the ${expected}th`,
    );
  }
});

test("leap years keep February's 29th where it belongs", () => {
  // 2024 and 2000 are leap years; the last Thursday of February 2024 is the 29th.
  assert.deepStrictEqual(
    getDateFromDaysObject(2024, "February", "Thursday", "last"),
    new Date(Date.UTC(2024, 1, 29)),
  );
  // 2000 is a leap century year (divisible by 400).
  assert.deepStrictEqual(
    getDateFromDaysObject(2000, "February", "Tuesday", "last"),
    new Date(Date.UTC(2000, 1, 29)),
  );
  // 2100 is a century year that is NOT a leap year (not divisible by 400).
  assert.deepStrictEqual(
    getDateFromDaysObject(2100, "February", "Sunday", "last"),
    new Date(Date.UTC(2100, 1, 28)),
  );
});

test("results are UTC and unaffected by DST transition months", () => {
  // March and October contain the European DST transitions. The library
  // computes in UTC, so every result must be exactly UTC midnight and must
  // not shift with local DST rules.
  for (const date of [
    getDateFromDaysObject(2024, "March", "Sunday", "last"),
    getDateFromDaysObject(2024, "October", "Sunday", "last"),
    getDateFromDaysObject(2020, "October", "Saturday", "first"),
  ]) {
    assert.equal(date.getUTCHours(), 0);
    assert.equal(date.getUTCMinutes(), 0);
    assert.equal(date.getUTCSeconds(), 0);
    assert.equal(date.getUTCMilliseconds(), 0);
  }
  // The DST transition Sunday in the UK is 2024-03-31; the last Sunday of
  // March 2024 is exactly that date, at UTC midnight either side of the jump.
  assert.deepStrictEqual(
    getDateFromDaysObject(2024, "March", "Sunday", "last"),
    new Date(Date.UTC(2024, 2, 31)),
  );
});

test("every month of 2024 has a correct first and last Sunday", () => {
  const firstSundays = [7, 4, 3, 7, 5, 2, 7, 4, 1, 6, 3, 1];
  const lastSundays = [28, 25, 31, 28, 26, 30, 28, 25, 29, 27, 24, 29];
  const monthNames = Object.keys(MONTH_INDEX);
  monthNames.forEach((month, index) => {
    assert.deepStrictEqual(
      getDateFromDaysObject(2024, month, "Sunday", "first"),
      new Date(Date.UTC(2024, index, firstSundays[index])),
      `first Sunday of ${month} 2024`,
    );
    assert.deepStrictEqual(
      getDateFromDaysObject(2024, month, "Sunday", "last"),
      new Date(Date.UTC(2024, index, lastSundays[index])),
      `last Sunday of ${month} 2024`,
    );
  });
});

test("unknown inputs keep throwing", () => {
  assert.throws(() => getDateFromDaysObject(2024, "Frimaire", "Tuesday", "first"));
  assert.throws(() => getDateFromDaysObject(2024, "October", "Saturnday", "first"));
  // "fifth" is not a supported occurrence word.
  assert.throws(() => getDateFromDaysObject(2024, "October", "Tuesday", "fifth"));
  assert.throws(() => getDateFromDaysObject(2024, "October", "Tuesday", "0"));
});

test("getOccurencesForTheMonth maps every matching day of the month", () => {
  const october = getOccurencesForTheMonth(2024, "October", days);
  assert.ok(october.length > 0);
  for (const entry of october) {
    assert.ok(entry.date instanceof Date);
    assert.ok(Number.isFinite(entry.date.getTime()));
    assert.equal(entry.date.getUTCMonth(), 9);
    assert.ok(typeof entry.name === "string" && entry.name.length > 0);
  }
  // October 2024 has Ada Lovelace Day on the second Tuesday, the 8th.
  const lovelace = october.find((entry) => entry.name.includes("Ada Lovelace"));
  if (lovelace) {
    assert.deepStrictEqual(lovelace.date, new Date(Date.UTC(2024, 9, 8)));
  }
  // Other months must not leak in.
  const may = getOccurencesForTheMonth(2030, "May", days);
  for (const entry of may) {
    assert.equal(entry.date.getUTCMonth(), 4);
    assert.equal(entry.date.getUTCFullYear(), 2030);
  }
});
