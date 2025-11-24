import React, { useCallback } from 'react';
import { useEffect, useState, useRef } from 'react';
import { type InputProps, textFieldClasses } from '../components';
import { wrapFieldsWithMeta } from './wrap-field-with-meta';
// we might be able to go back to react-datetime when https://github.com/arqex/react-datetime/pull/813 is merged
import ReactDatetime from '../../react-datetime/DateTime';
import type { DatetimepickerProps } from 'react-datetime';
import { format, parse, DEFAULT_DATE_DISPLAY_FORMAT, DEFAULT_TIME_DISPLAY_FORMAT } from './date-format';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore importing css is not recognized
import type { Field } from '../../forms';
import { DateTimePicker } from '../../components/ui/date-time-picker';
import { getTime } from 'date-fns';

export const DateField = wrapFieldsWithMeta<InputProps, DatetimepickerProps>(
  ({ input, field: { dateFormat, timeFormat, ...rest } }) => {

    const granularity = timeFormat === false ? 'day' : 'minute';

    const getTimeFormat = useCallback(()=> {

      if(timeFormat === false)
      {
        return
      }

      if(timeFormat === true)
      {
        return DEFAULT_TIME_DISPLAY_FORMAT
      }
      
      return timeFormat;
    }, [timeFormat]);

    const getDateFormat = useCallback(()=> {
      if(dateFormat === true || typeof dateFormat !== 'string')
      {
        return DEFAULT_DATE_DISPLAY_FORMAT 
      }
      return dateFormat;
    }, [dateFormat]);

    const date = input.value ? new Date(input.value) : input.value;
    
    return (
      <DateTimePicker 
        granularity={granularity} 
        onChange={(value)=> {
        
          input.onChange(value.toISOString());}}
        timeFormat={getTimeFormat()} 
        hourCycle={12} 
        dateFormat={getDateFormat()} 
        // {...rest}
        value={date}
        
        />
    )
  }
);

export const ReactDateTimeWithStyles = (
  props: DatetimepickerProps & Partial<Field>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const area = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!area.current) return;
      if (!event.target) return;

      if (!area.current.contains(event.target as HTMLElement)) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    document.addEventListener('mouseup', handleClick, false);
    return () => {
      document.removeEventListener('mouseup', handleClick, false);
    };
  }, [document]);

  React.useEffect(() => {
    if (area.current) {
      setTimeout(() => {
        // ReactDateTime doesn't expose it's underlying element
        // as a ref, so we need to query for it ourselves
        const plateElement = area.current.querySelector(
          'input[type="text"]'
        ) as HTMLElement;
        if (props.experimental_focusIntent && plateElement) {
          if (plateElement) plateElement.focus();
        }
        // ReactDateTime takes a second to mount
      }, 100);
    }
  }, [props.experimental_focusIntent, area]);

  return (
    <>
      <div className='tina-date-field' ref={area}>
        <ReactDatetime  {...props} isOpen={isOpen} />
      </div>
    </>
  );
};

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
