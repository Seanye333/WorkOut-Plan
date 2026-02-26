/**
 * Returns ISO week string like "2026-W09" for the given date.
 */
export function getWeekId(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Returns the Monday (start) of the week containing the given date.
 */
export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Returns array of 7 Date objects (Mon–Sun) for the week containing weekStart.
 */
export function getDaysOfWeek(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/**
 * Returns "monday", "tuesday", etc. for a given Date.
 */
export function getDayKey(date) {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

/**
 * Formats a date as "Mon, Feb 25".
 */
export function formatShortDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date as "February 25, 2026".
 */
export function formatLongDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns true if two dates are the same calendar day.
 */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Returns "Wk Feb 23 – Mar 1, 2026" label for a week.
 */
export function formatWeekRange(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const startStr = weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}
