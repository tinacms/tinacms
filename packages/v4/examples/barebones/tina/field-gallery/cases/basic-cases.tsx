import { Checkbox } from '@tinacms/ui/components/checkbox';
import { Input } from '@tinacms/ui/components/input';
import { cn } from '@tinacms/ui/lib/utils';
import { type CaseControlProps, type CaseSpec, defineCase } from '../case-row';
import { controlClasses, markFocusClasses } from '../field-frame';

const MIN = 1;
const MAX = 60;
const STEP = 1;

function stepValue(value: string, direction: 1 | -1) {
  const current = Number.parseFloat(value);
  if (Number.isNaN(current)) return String(direction === 1 ? MIN : MAX);
  const next = current + direction * STEP;
  return String(Math.min(MAX, Math.max(MIN, next)));
}

function ChevronIcon({ direction }: { direction: 1 | -1 }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 12 12'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-3'
    >
      <path
        d={
          direction === 1
            ? 'M3.5 7.25 6 4.75l2.5 2.5'
            : 'M3.5 4.75 6 7.25l2.5-2.5'
        }
      />
    </svg>
  );
}

function StepButton({
  direction,
  disabled,
  onStep,
}: {
  direction: 1 | -1;
  disabled: boolean;
  onStep: () => void;
}) {
  return (
    <button
      type='button'
      tabIndex={-1}
      aria-label={direction === 1 ? 'Increase' : 'Decrease'}
      disabled={disabled}
      onClick={onStep}
      className='flex flex-1 cursor-pointer items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function NumberControl({
  control,
  value,
  onChange,
  onBlur,
}: CaseControlProps<string>) {
  const current = Number.parseFloat(value);
  const locked = control.disabled || control.readOnly;
  const step = (direction: 1 | -1) => {
    if (!locked) onChange(stepValue(value, direction));
  };
  return (
    <div className='relative'>
      <Input
        {...control}
        type='number'
        inputMode='decimal'
        min={MIN}
        max={MAX}
        step={STEP}
        className={cn(
          'tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          'pr-8',
          controlClasses
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onWheel={(event) => event.currentTarget.blur()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            step(event.key === 'ArrowUp' ? 1 : -1);
          }
        }}
      />
      {locked ? null : (
        <div className='absolute inset-y-px right-px flex w-6 flex-col divide-y divide-border-subtle overflow-hidden rounded-r-[3px] border-l border-border-subtle'>
          <StepButton
            direction={1}
            disabled={current >= MAX}
            onStep={() => step(1)}
          />
          <StepButton
            direction={-1}
            disabled={current <= MIN}
            onStep={() => step(-1)}
          />
        </div>
      )}
    </div>
  );
}

export const numberCase: CaseSpec<string> = {
  id: 'number-limits',
  title: 'Number with step and limits',
  note: 'Arrow keys stop at the limits. A typed number past a limit shows as invalid.',
  label: 'Reading time (minutes)',
  overflowLabel: 'Reading time in minutes, rounded up to the next whole minute',
  description: `From ${MIN} to ${MAX}.`,
  empty: '',
  filled: '8',
  invalid: '75',
  required: true,
  validate: (value, required) => {
    if (value.trim() === '') return required ? ['Enter a reading time.'] : [];
    const number = Number.parseFloat(value);
    if (Number.isNaN(number)) return ['Enter a number.'];
    if (number > MAX) return [`Use ${MAX} or less.`];
    if (number < MIN) return [`Use ${MIN} or more.`];
    return [];
  },
  Control: NumberControl,
};

export const checkboxCase: CaseSpec<boolean> = {
  id: 'boolean-checkbox',
  title: 'Checkbox',
  layout: 'inline',
  label: 'Featured',
  overflowLabel: 'Featured on the home page, the blog index and the newsletter',
  description: 'Show this post on the home page.',
  empty: false,
  filled: true,
  validate: () => [],
  doesNotApply: {
    empty: 'Always on or off.',
    invalid: 'No rules to break.',
    required: 'Always has a value.',
  },
  Control: ({ control, value, onChange, onBlur }) => (
    <Checkbox
      id={control.id}
      aria-describedby={control['aria-describedby']}
      data-force={control['data-force']}
      disabled={control.disabled}
      readOnly={control.readOnly}
      className={cn(
        'cursor-pointer hover:border-(--input-hover) data-[force=hover]:border-(--input-hover) data-checked:hover:border-primary-hover data-checked:hover:bg-primary-hover data-checked:data-[force=hover]:border-primary-hover data-checked:data-[force=hover]:bg-primary-hover',
        markFocusClasses,
        'data-disabled:hover:border-border data-disabled:data-checked:hover:border-border data-disabled:data-checked:hover:bg-transparent',
        control.readOnly
          ? 'cursor-default border-border-subtle bg-muted hover:border-border-subtle data-checked:border-border data-checked:bg-muted data-checked:text-foreground data-checked:hover:border-border data-checked:hover:bg-muted'
          : null
      )}
      checked={value}
      onCheckedChange={(checked) => onChange(checked === true)}
      onBlur={onBlur}
    />
  ),
};

export const dateTimeCase: CaseSpec<string> = {
  id: 'datetime-picker',
  title: 'Date and time',
  label: 'Publish date',
  overflowLabel: 'Publish date, in the time zone of the person editing',
  empty: '',
  filled: '2026-10-09T09:30',
  required: true,
  validate: (value, required) =>
    required && value === '' ? ['Choose a date and time.'] : [],
  Control: ({ control, value, onChange, onBlur }) => (
    <Input
      {...control}
      type='datetime-local'
      className={cn('w-full min-w-0', controlClasses)}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
    />
  ),
};

export const numberCases = [defineCase(numberCase)];
export const booleanCases = [defineCase(checkboxCase)];
export const dateTimeCases = [defineCase(dateTimeCase)];
