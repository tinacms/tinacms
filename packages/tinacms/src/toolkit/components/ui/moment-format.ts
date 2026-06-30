/**
 * Converts a moment.js format string to the equivalent date-fns format string.
 * This is a non-breaking shim so callers that pass moment tokens (the public API
 * contract for the date field's dateFormat/timeFormat options) continue to work
 * after moment has been removed.
 */

// Ordered longest-first within each letter group so the tokenizer greedily
// picks the longest match (e.g. MMMM before MMM before MM before M).
const TOKEN_MAP: [string, string][] = [
  // Year
  ['YYYY', 'yyyy'],
  ['YY', 'yy'],
  // Month
  ['MMMM', 'MMMM'],
  ['MMM', 'MMM'],
  ['MM', 'MM'],
  ['M', 'M'],
  // Day of month (uppercase D = day-of-month in moment)
  ['DD', 'dd'],
  ['Do', 'do'],
  ['D', 'd'],
  // Weekday (lowercase d = weekday in moment)
  ['dddd', 'EEEE'],
  ['ddd', 'EEE'],
  ['dd', 'EEEEEE'],
  // 24-hour
  ['HH', 'HH'],
  ['H', 'H'],
  // 12-hour
  ['hh', 'hh'],
  ['h', 'h'],
  // Minute
  ['mm', 'mm'],
  ['m', 'm'],
  // Second
  ['ss', 'ss'],
  ['s', 's'],
  // Millisecond
  ['SSS', 'SSS'],
  // AM/PM
  ['A', 'a'],
  ['a', 'aaa'],
  // Timezone offset
  ['ZZ', 'xx'],
  ['Z', 'xxx'],
  // Unix timestamps
  ['X', 't'],
  ['x', 'T'],
];

export function momentToDateFns(momentFormat: string): string {
  let result = '';
  let i = 0;

  while (i < momentFormat.length) {
    // Handle moment literal escapes: [text] → 'text'
    if (momentFormat[i] === '[') {
      const end = momentFormat.indexOf(']', i + 1);
      if (end !== -1) {
        // Escape any single quotes inside the literal by doubling them
        const literal = momentFormat.slice(i + 1, end).replace(/'/g, "''");
        result += `'${literal}'`;
        i = end + 1;
        continue;
      }
    }

    // Try to match a known token at the current position
    let matched = false;
    for (const [momentToken, dateFnsToken] of TOKEN_MAP) {
      if (momentFormat.startsWith(momentToken, i)) {
        result += dateFnsToken;
        i += momentToken.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const ch = momentFormat[i];
      // Non-letter characters pass through unchanged
      if (/[a-zA-Z]/.test(ch)) {
        // Unknown letter token — wrap in single quotes so date-fns treats it
        // as a literal instead of throwing
        result += `'${ch}'`;
      } else {
        result += ch;
      }
      i++;
    }
  }

  return result;
}
