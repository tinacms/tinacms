import moment from 'moment';
import type { DatetimepickerProps } from 'react-datetime';

export const DEFAULT_DATE_DISPLAY_FORMAT = 'MMM DD, YYYY';
export const DEFAULT_TIME_DISPLAY_FORMAT = 'h:mm A';

/**
 * Gets the user's locale-specific date format using abbreviated months
 * Returns formats like "MMM DD, YYYY" for US or "DD MMM, YYYY" for UK, etc.
 * Falls back to the hardcoded default format if locale detection fails
 */
export const getLocaleDateFormat = (): string => {
  try {
    const locale = navigator?.language || 'en-US';
    const sampleDate = new Date(2024, 11, 25); // Dec 25, 2024
    const formatted = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(sampleDate);

    // Split by common separators and find positions of known values
    const parts = formatted.split(/[\/\.\-\s]+/);
    const dayIndex = parts.findIndex((part) => part === '25');
    const monthIndex = parts.findIndex((part) => part === '12');
    const yearIndex = parts.findIndex((part) => part === '2024');

    // Determine format based on component positions
    if (dayIndex === 0) return 'DD MMM YYYY'; // Day first
    if (yearIndex === 0) return 'YYYY MMM DD'; // Year first
    if (monthIndex === 0) return 'MMM DD YYYY'; // Month first (US style)

    return DEFAULT_DATE_DISPLAY_FORMAT; // Fallback
  } catch (error) {
    console.log('Error detecting locale format:', error);
    return DEFAULT_DATE_DISPLAY_FORMAT;
  }
};

// formats a function from default datetime format to given format
export const format = (
  val: string,
  _name: string,
  field: DatetimepickerProps
): string => {
  // allow the date to be empty
  if (!val) return val;
  const dateFormat = parseDateFormat(field.dateFormat);
  const timeFormat = parseTimeFormat(field.timeFormat);

  const combinedFormat =
    typeof timeFormat === 'string' ? `${dateFormat} ${timeFormat}` : dateFormat;

  if (typeof val === 'string') {
    const date = moment(val);
    return date.isValid() ? date.format(combinedFormat) : val;
  }

  return moment(val).format(combinedFormat);
};

// parses a function from the given format to default datetime format
export const parse = (val: string) => {
  // allow the date to be empty
  if (!val) return val;
  const date = new Date(val);
  if (!isNaN(date.getTime())) {
    return new Date(val).toISOString();
  }
  return val;
};

function parseDateFormat(format: string | boolean | undefined): string {
  if (typeof format === 'string') {
    return format;
  }
  return DEFAULT_DATE_DISPLAY_FORMAT;
}

function parseTimeFormat(
  format: string | boolean | undefined
): string | undefined {
  if (typeof format === 'string') {
    return format;
  } else if (format) {
    return DEFAULT_TIME_DISPLAY_FORMAT;
  }
}
