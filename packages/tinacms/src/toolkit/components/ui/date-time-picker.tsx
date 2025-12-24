import { buttonVariants } from './button';

import { RotateCw } from 'lucide-react';
import {
  Calendar as CalendarSVG,
  CalendarDays,
  CalendarCheck,
} from 'lucide-react';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import moment from 'moment';
import 'moment-timezone';
import { enUS, Locale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Clock } from 'lucide-react';
import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';
import { DayPicker, DayPickerProps } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { cn } from '../../../utils/cn';

// ---------- utils start ----------
/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
) {
  let numericValue = parseInt(value, 10);

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, '0');
  }

  return '00';
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

function getValidArrowNumber(
  value: string,
  { min, max, step }: GetValidArrowNumberConfig
) {
  let numericValue = parseInt(value, 10);
  if (!Number.isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), { min, max, loop: true });
  }
  return '00';
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 1, max: 12, step });
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours';
type Period = 'AM' | 'PM';

function setDateByType(
  date: Date,
  value: string,
  type: TimePickerType,
  period?: Period
) {
  switch (type) {
    case 'minutes':
      return setMinutes(date, value);
    case 'seconds':
      return setSeconds(date, value);
    case 'hours':
      return setHours(date, value);
    case '12hours': {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return '00';
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case 'hours':
      return getValidHour(String(date.getHours()));
    case '12hours':
      return getValid12Hour(String(display12HourValue(date.getHours())));
    default:
      return '00';
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step);
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step);
    case 'hours':
      return getValidArrowHour(value, step);
    case '12hours':
      return getValidArrow12Hour(value, step);
    default:
      return '00';
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === 'PM') {
    if (hour <= 11) {
      return hour + 12;
    }
    return hour;
  }

  if (period === 'AM') {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return '12';
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}

function genMonths() {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), 'MMMM'),
  }));
}

function genYears(yearRange = 50) {
  const today = new Date();
  return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
    value: today.getFullYear() - yearRange + i,
    label: (today.getFullYear() - yearRange + i).toString(),
  }));
}

const formatCurrentDate = ({
  dateFormat,
  timeFormat,
  displayDate,
}: { dateFormat?: string; timeFormat?: string; displayDate: Date }) => {
  if (!dateFormat && !timeFormat) {
    console.error('DateTimePicker: Missing date or time format');
    return 'Error: Missing date or time format';
  }

  if (!timeFormat) {
    return format(displayDate, dateFormat);
  }

  if (!dateFormat) {
    return format(displayDate, timeFormat);
  }
  return `${format(displayDate, dateFormat)} ${format(displayDate, timeFormat)}`;
};

// ---------- utils end ----------

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  yearRange = 50,
  selected,
  onSelect,
  initialMonth,
  locale: localeOverride,
  required,
  ...props
}: Omit<
  DayPickerProps,
  'mode' | 'selected' | 'onSelect' | 'month' | 'onMonthChange'
> & {
  yearRange?: number;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialMonth?: Date;
}) {
  const MONTHS = React.useMemo(() => {
    let locale: Pick<Locale, 'options' | 'localize' | 'formatLong'> = enUS;
    const { options, localize, formatLong } = localeOverride || {};
    if (options && localize && formatLong) {
      locale = { options, localize, formatLong };
    }
    return genMonths();
  }, [localeOverride]);

  const YEARS = React.useMemo(() => genYears(yearRange), [yearRange]);

  // Calendar manages its own month state, initialized from selected date or initialMonth
  const [month, setMonth] = React.useState<Date>(
    initialMonth || selected || new Date()
  );

  // Update month when selected date changes to a different month/year
  React.useEffect(() => {
    if (
      selected &&
      (selected.getMonth() !== month.getMonth() ||
        selected.getFullYear() !== month.getFullYear())
    ) {
      setMonth(selected);
    }
  }, [selected]);
  const disableLeftNavigation = React.useCallback(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear() - yearRange, 0, 1);
    return (
      month.getMonth() === startDate.getMonth() &&
      month.getFullYear() === startDate.getFullYear()
    );
  }, [month, yearRange]);
  const disableRightNavigation = React.useCallback(() => {
    const today = new Date();
    const endDate = new Date(today.getFullYear() + yearRange, 11, 31);
    return (
      month.getMonth() === endDate.getMonth() &&
      month.getFullYear() === endDate.getFullYear()
    );
  }, [month, yearRange]);

  return (
    <DayPicker
      mode='single'
      selected={selected}
      onSelect={(day) => {
        if (!day) {
          onSelect?.(undefined);
          return;
        }
        // Preserve time from selected date when picking a new day
        const withTime = new Date(day);
        if (selected) {
          withTime.setHours(
            selected.getHours(),
            selected.getMinutes(),
            selected.getSeconds(),
            selected.getMilliseconds()
          );
        }
        onSelect?.(withTime);
      }}
      month={month}
      onMonthChange={setMonth}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      {...props}
      classNames={{
        months:
          'flex flex-col sm:flex-row space-y-4 relative sm:space-y-0 justify-center',
        month: 'flex flex-col items-center space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center ',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-[0.25rem] top-[0.25rem]',
          disableLeftNavigation() && 'pointer-events-none'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-[0.25rem] top-[0.25rem]',
          disableRightNavigation() && 'pointer-events-none'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: cn('flex', props.showWeekNumber && 'justify-end'),
        weekday:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: cn(
          'h-9 w-9 text-center  hover:[&:not([aria-selected])]:bg-tina-orange/10 text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-md'
        ),
        day_button: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-l-md rounded-r-md'
        ),

        range_end: 'day-range-end',
        selected:
          'bg-tina-orange-dark text-primary-foreground active:bg-tina-orange-dark hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md rounded-r-md',
        today: 'bg-accent text-accent-foreground',
        outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) =>
          props.orientation === 'left' ? (
            <ChevronLeft className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          ),
        MonthCaption: ({ calendarMonth }) => {
          return (
            <div className='inline-flex gap-2'>
              <Select
                defaultValue={calendarMonth.date.getMonth().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(calendarMonth.date);
                  newDate.setMonth(Number.parseInt(value, 10));
                  setMonth(newDate);
                }}
              >
                <SelectTrigger className='focus:text-accent-foreground w-fit gap-1 border-none p-0 shadow-none'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position='popper'>
                  {MONTHS.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                defaultValue={calendarMonth.date.getFullYear().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(calendarMonth.date);
                  newDate.setFullYear(Number.parseInt(value, 10));
                  setMonth(newDate);
                }}
              >
                <SelectTrigger className='focus:text-accent-foreground w-fit gap-1 border-none p-0 shadow-none'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

interface PeriodSelectorProps {
  period: Period;
  setPeriod?: (m: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePeriodSelect = React.forwardRef<
  HTMLButtonElement,
  PeriodSelectorProps
>(
  (
    { period, setPeriod, date, onDateChange, onLeftFocus, onRightFocus },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowRight') onRightFocus?.();
      if (e.key === 'ArrowLeft') onLeftFocus?.();
    };

    const handleValueChange = (value: Period) => {
      setPeriod?.(value);

      /**
       * trigger an update whenever the user switches between AM and PM;
       * otherwise user must manually change the hour each time
       */
      if (date) {
        const tempDate = new Date(date);
        const hours = display12HourValue(date.getHours());
        onDateChange?.(
          setDateByType(
            tempDate,
            hours.toString(),
            '12hours',
            period === 'AM' ? 'PM' : 'AM'
          )
        );
      }
    };

    return (
      <div className='flex h-10 items-center'>
        <Select
          defaultValue={period}
          onValueChange={(value: Period) => handleValueChange(value)}
        >
          <SelectTrigger
            ref={ref}
            className='focus:border-blue-500 shadow-none focus:ring-[3px] focus:ring-outline focus:text-accent-foreground w-[65px]'
            onKeyDown={handleKeyDown}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='AM'>AM</SelectItem>
            <SelectItem value='PM'>PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

TimePeriodSelect.displayName = 'TimePeriodSelect';

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = 'tel',
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      onDateChange,
      onChange,
      onKeyDown,
      picker,
      period,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false);
    /**
     * allow the user to enter the second digit within 2 seconds
     * otherwise start again with entering first digit
     */
    React.useEffect(() => {
      if (flag) {
        const timer = setTimeout(() => {
          setFlag(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }, [flag]);

    const calculatedValue = React.useMemo(() => {
      return getDateByType(date, picker);
    }, [date]);

    const calculateNewValue = (key: string) => {
      /*
       * If picker is '12hours' and the first digit is 0, then the second digit is automatically set to 1.
       * The second entered digit will break the condition and the value will be set to 10-12.
       */

      return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') return;
      e.preventDefault();
      if (e.key === 'ArrowRight') onRightFocus?.();
      if (e.key === 'ArrowLeft') onLeftFocus?.();
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const step = e.key === 'ArrowUp' ? 1 : -1;
        const newValue = getArrowByType(calculatedValue, step, picker);
        if (flag) setFlag(false);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
      if (e.key >= '0' && e.key <= '9') {
        const newValue = calculateNewValue(e.key);
        if (flag) onRightFocus?.();
        setFlag((prev) => !prev);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
    };

    return (
      <Input
        ref={ref}
        id={id}
        name={name}
        className={cn(
          'focus-visible:ring-outline focus-visible:border-blue-500 shadow-none focus:text-accent-foreground w-[48px] text-center font-mono text-base tabular-nums caret-transparent [&::-webkit-inner-spin-button]:appearance-none',
          className
        )}
        value={value || calculatedValue}
        onChange={(e) => {
          e.preventDefault();
          onChange?.(e);
        }}
        type={type}
        inputMode='decimal'
        onKeyDown={(e) => {
          onKeyDown?.(e);
          handleKeyDown(e);
        }}
        {...props}
      />
    );
  }
);

TimePickerInput.displayName = 'TimePickerInput';

interface TimePickerProps {
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  /**
   * Determines the smallest unit that is displayed in the datetime picker.
   * Default is 'second'.
   * */
  granularity?: Granularity;
}

interface TimePickerRef {
  minuteRef: HTMLInputElement | null;
  hourRef: HTMLInputElement | null;
  secondRef: HTMLInputElement | null;
}

const TimePicker = React.forwardRef<TimePickerRef, TimePickerProps>(
  ({ date, onChange, hourCycle = 24, granularity = 'second' }, ref) => {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const secondRef = React.useRef<HTMLInputElement>(null);
    const periodRef = React.useRef<HTMLButtonElement>(null);
    const [period, setPeriod] = React.useState<Period>(
      date && date.getHours() >= 12 ? 'PM' : 'AM'
    );

    useImperativeHandle(
      ref,
      () => ({
        minuteRef: minuteRef.current,
        hourRef: hourRef.current,
        secondRef: secondRef.current,
        periodRef: periodRef.current,
      }),
      [minuteRef, hourRef, secondRef]
    );
    return (
      <div className='flex items-center justify-center gap-2'>
        <label htmlFor='datetime-picker-hour-input' className='cursor-pointer'>
          <Clock className='mr-2 h-4 w-4' />
        </label>
        <TimePickerInput
          picker={hourCycle === 24 ? 'hours' : '12hours'}
          date={date}
          id='datetime-picker-hour-input'
          onDateChange={onChange}
          ref={hourRef}
          period={period}
          onRightFocus={() => minuteRef?.current?.focus()}
        />
        {(granularity === 'minute' || granularity === 'second') && (
          <>
            :
            <TimePickerInput
              picker='minutes'
              date={date}
              onDateChange={onChange}
              ref={minuteRef}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
            />
          </>
        )}
        {granularity === 'second' && (
          <>
            :
            <TimePickerInput
              picker='seconds'
              date={date}
              onDateChange={onChange}
              ref={secondRef}
              onLeftFocus={() => minuteRef?.current?.focus()}
              onRightFocus={() => periodRef?.current?.focus()}
            />
          </>
        )}
        {hourCycle === 12 && (
          <div className='grid gap-1 text-center'>
            <TimePeriodSelect
              period={period}
              setPeriod={setPeriod}
              date={date}
              onDateChange={(date) => {
                onChange?.(date);
                if (date && date?.getHours() >= 12) {
                  setPeriod('PM');
                } else {
                  setPeriod('AM');
                }
              }}
              ref={periodRef}
              onLeftFocus={() => secondRef?.current?.focus()}
            />
          </div>
        )}
      </div>
    );
  }
);
TimePicker.displayName = 'TimePicker';

type Granularity = 'day' | 'hour' | 'minute' | 'second';

type DateTimePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  dateFormat?: string;
  timeFormat?: string;
  /** showing `AM/PM` or not. */
  hourCycle?: 12 | 24;
  placeholder?: string;
  /**
   * The year range will be: `This year + yearRange` and `this year - yearRange`.
   * Default is 50.
   * For example:
   * This year is 2024, The year dropdown will be 1974 to 2024 which is generated by `2024 - 50 = 1974` and `2024 + 50 = 2074`.
   * */
  yearRange?: number;
  /**
   * The format is derived from the `date-fns` documentation.
   * @reference https://date-fns.org/v3.6.0/docs/format
   **/
  displayFormat?: { hour24?: string; hour12?: string };
  /**
   * The granularity prop allows you to control the smallest unit that is displayed by DateTimePicker.
   * By default, the value is `second` which shows all time inputs.
   **/
  granularity?: Granularity;
  className?: string;
  /**
   * Show the default month and time when popup the calendar. Default is the current Date().
   **/
  defaultPopupValue?: Date;
} & Pick<
  DayPickerProps,
  'locale' | 'weekStartsOn' | 'showWeekNumber' | 'showOutsideDays'
>;

type DateTimePickerRef = {
  value?: Date;
} & Omit<HTMLInputElement, 'value'>;

const DateTimePicker = React.forwardRef<
  Partial<DateTimePickerRef>,
  DateTimePickerProps
>(
  (
    {
      locale = enUS,
      defaultPopupValue = new Date(new Date().setHours(0, 0, 0, 0)),
      value,
      onChange,
      hourCycle = 24,
      dateFormat,
      timeFormat,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = 'second',
      placeholder = 'Pick a date',
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const buttonRef = useRef<HTMLInputElement>(null);
    const [displayDate, setDisplayDate] = React.useState<Date | undefined>(
      value ?? undefined
    );

    /**
     * Makes sure display date updates when value changes on parent component
     */
    React.useEffect(() => {
      setDisplayDate(value);
    }, [value]);

    const handleClose = React.useCallback((isOpen: boolean) => {
      setOpen(isOpen);
    }, []);

    const handleDaySelect = (newDay?: Date) => {
      if (!newDay) return;
      onChange?.(newDay);
      setDisplayDate(newDay);
    };

    useImperativeHandle(
      ref,
      () => ({
        ...buttonRef.current,
        focus: () => buttonRef.current?.focus(),
        open: () => setOpen(true),
        value: displayDate,
      }),
      [displayDate]
    );

    let loc = enUS;
    const { options, localize, formatLong } = locale;
    if (options && localize && formatLong) {
      loc = {
        ...enUS,
        options,
        localize,
        formatLong,
      };
    }

    return (
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          handleClose(isOpen);
        }}
      >
        <PopoverTrigger asChild disabled={disabled}>
          <div
            ref={buttonRef}
            tabIndex={0}
            className='text-xs pointer overflow-hidden hover:text-gray-600 cursor-pointer rounded border border-gray-100 flex font-semibold shadow transition-colors bg-white text-gray-500'
          >
            <div className='my-auto group gap-0.5 flex w-full'>
              <div className='relative w-9 h-10'>
                {value ? (
                  <CalendarCheck className='absolute size-5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity' />
                ) : (
                  <>
                    <CalendarSVG className='absolute size-5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity transition-colors' />
                    <CalendarDays className='absolute size-5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100' />
                  </>
                )}
              </div>
              <span className='my-auto text-gray-600 group-hover:text-blue-600'>
                {displayDate
                  ? formatCurrentDate({ dateFormat, displayDate, timeFormat })
                  : placeholder}
              </span>
            </div>
            {value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(undefined);
                  setOpen(false);
                }}
                className='px-1 w-8 hover:text-blue-600 hover:text-inherit text-gray-200 flex items-center justify-center hover:bg-gray-50'
              >
                <RotateCw className='h-5 p-0.5 w-auto  ' />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent align='start' className='w-auto p-0'>
          <Calendar
            className='text-gray-700'
            selected={displayDate}
            onSelect={handleDaySelect}
            initialMonth={value ?? defaultPopupValue}
            yearRange={yearRange}
            locale={locale}
            {...props}
          />
          {granularity !== 'day' && (
            <div className='border-border border-t p-3'>
              <TimePicker
                onChange={(value) => {
                  onChange?.(value);
                  setDisplayDate(value);
                }}
                date={displayDate}
                hourCycle={hourCycle}
                granularity={granularity}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';

const format = (date: Date, format: string) => {
  const m = moment(date);
  return m.format(format);
};

export { DateTimePicker, TimePickerInput, TimePicker, formatCurrentDate };
export type { TimePickerType, DateTimePickerProps, DateTimePickerRef };
