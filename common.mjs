export function getDateFromDaysObject(year, monthName, dayName, occurrence) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const occurrenceNumbers = { first: 1, second: 2, third: 3, fourth: 4 };

  const monthIndex = monthNames.indexOf(monthName);
  const targetWeekday = dayNames.indexOf(dayName);

  if (monthIndex === -1) throw new Error(`Unknown month: ${monthName}`);
  if (targetWeekday === -1) throw new Error(`Unknown weekday: ${dayName}`);

  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  console.log(daysInMonth);

  if (occurrence === "last") {
    const lastWeekday = new Date(
      Date.UTC(year, monthIndex, daysInMonth),
    ).getUTCDay();
    const dayOfMonth = daysInMonth - ((lastWeekday - targetWeekday + 7) % 7);
    console.log(new Date(Date.UTC(year, monthIndex, dayOfMonth)));
    return new Date(Date.UTC(year, monthIndex, dayOfMonth));
  }

  const n = occurrenceNumbers[occurrence];
  if (!n) throw new Error(`Unknown occurrence: ${occurrence}`);

  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const firstOccurrence = 1 + ((targetWeekday - firstWeekday + 7) % 7);
  const dayOfMonth = firstOccurrence + 7 * (n - 1);
  console.log(new Date(Date.UTC(year, monthIndex, dayOfMonth)));
  if (dayOfMonth > daysInMonth) {
    throw new Error(`No ${occurrence} ${dayName} in ${monthName} ${year}`);
  }

  return new Date(Date.UTC(year, monthIndex, dayOfMonth));
}

console.log(getDateFromDaysObject(2026, "November", "Saturday", "third"));
