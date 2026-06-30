export interface DateFieldProps {
  dateFormat?: string | boolean;
  timeFormat?: string | boolean;
  locale?: string;
  experimental_focusIntent?: boolean;
  onChange?: (value: unknown) => void;
  required?: boolean;
  // tolerate additional field-config props passed through to the picker
  [key: string]: unknown;
}

export const DEFAULT_DATE_DISPLAY_FORMAT = 'MMM DD, YYYY';
export const DEFAULT_TIME_DISPLAY_FORMAT = 'h:mm A';

// formats a function from default datetime format to given format
export const format = (
  val: string,
  _name: string,
  field: DateFieldProps
): string => {
  if (!val) return val;
  return new Date(val).toISOString();
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
