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

    // Use Intl.DateTimeFormat to get the actual locale-specific ordering
    // This is more reliable than moment.js for detecting locale patterns
    const formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Format a sample date to analyze the pattern
    const sampleDate = new Date(2024, 11, 25); // Dec 25, 2024
    const formatted = formatter.format(sampleDate);

    // Analyze the pattern to determine date ordering
    let format: string;

    // Common patterns and their analysis
    if (formatted.startsWith('25')) {
      // Starts with day: DD/MM/YYYY or DD.MM.YYYY format
      format = 'DD MMM YYYY';
    } else if (
      formatted.includes('/25/') ||
      formatted.includes('.25.') ||
      formatted.includes('-25-')
    ) {
      // Day in middle: MM/DD/YYYY, MM.DD.YYYY, YYYY-MM-DD format
      if (formatted.startsWith('12') || formatted.startsWith('2024')) {
        // Either MM/DD/YYYY or YYYY/MM/DD
        const parts = formatted.split(/[\/\.\-\s]/);
        if (parts[0] === '2024') {
          // YYYY-MM-DD format (less common for display)
          format = 'YYYY MMM DD';
        } else {
          // MM/DD/YYYY format (US style)
          format = 'MMM DD YYYY';
        }
      } else {
        format = 'MMM DD YYYY';
      }
    } else {
      // Default fallback
      format = 'MMM DD YYYY';
    }

    return format;
  } catch (error) {
    console.log('Error detecting locale format:', error);
    // Fallback to default if there's any issue with locale detection
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
