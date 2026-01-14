import React, { useCallback } from 'react';
import { type InputProps } from '../components';
import { wrapFieldsWithMeta } from './wrap-field-with-meta';
// we might be able to go back to react-datetime when https://github.com/arqex/react-datetime/pull/813 is merged
import type { DatetimepickerProps } from 'react-datetime';
import {
  format,
  parse,
  DEFAULT_DATE_DISPLAY_FORMAT,
  DEFAULT_TIME_DISPLAY_FORMAT,
} from './date-format';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore importing css is not recognized
import { DateTimePicker } from '../../components/ui/date-time-picker';
import { DayPickerLocale } from 'react-day-picker';

export const DateField = wrapFieldsWithMeta<InputProps, DatetimepickerProps>(
  ({ input, field: { dateFormat, timeFormat, onChange, ...rest } }) => {
    const granularity = timeFormat ? 'minute' : 'day';

    const inputRef = React.useRef(null);

    React.useEffect(() => {
      if (inputRef.current && rest.experimental_focusIntent) {
        inputRef.current.focus();
        inputRef.current.open();
      }
    }, [rest.experimental_focusIntent]);

    const getTimeFormat = useCallback(() => {
      if (timeFormat === false) {
        return;
      }
      if (timeFormat === true) {
        return DEFAULT_TIME_DISPLAY_FORMAT;
      }
      return timeFormat;
    }, [timeFormat]);

    const getDateFormat = useCallback(() => {
      if (dateFormat === true || typeof dateFormat !== 'string') {
        return DEFAULT_DATE_DISPLAY_FORMAT;
      }
      return dateFormat;
    }, [dateFormat]);

    const date = input.value ? new Date(input.value) : new Date();
    return (
      <React.Fragment>
        <DateTimePicker
          {...rest}
          ref={inputRef}
          granularity={granularity}
          onChange={(value) =>
            input.onChange(value ? value.toISOString() : value)
          }
          timeFormat={getTimeFormat()}
          hourCycle={12}
          dateFormat={getDateFormat()}
          value={date}
          locale={
            rest.locale
              ? ({ code: rest.locale } as Partial<DayPickerLocale>)
              : undefined
          }
        />
      </React.Fragment>
    );
  }
);

export const DateFieldPlugin = {
  __type: 'field',
  name: 'date',
  Component: DateField,
  format,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required';
  },
};
