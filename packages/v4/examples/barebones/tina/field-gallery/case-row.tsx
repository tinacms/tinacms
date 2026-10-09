import { Badge } from '@tinacms/ui/components/badge';
import { useEffect, useState } from 'react';
import { type ControlProps, FieldFrame } from './field-frame';
import { type FrameFlags, STATES, type StateName } from './states';

export interface CaseControlProps<T> {
  control: ControlProps;
  flags: FrameFlags;
  value: T;
  label: string;
  saved: T;
  frozen: boolean;
  startClosed?: boolean;
  onChange: (value: T) => void;
  onBlur: () => void;
}

export interface CaseSpec<T> {
  id: string;
  title: string;
  note?: string;
  notInV4?: boolean;
  label: string;
  overflowLabel?: string;
  description?: string;
  layout?: 'block' | 'inline';
  empty: T;
  filled: T;
  overflow?: T;
  invalid?: T;
  dirty?: T;
  required?: boolean;
  validate: (value: T, required: boolean) => string[];
  warn?: (value: T) => string[];
  labelling?: 'label' | 'group' | 'none';
  doesNotApply?: Partial<Record<StateName, string>>;
  Control: (props: CaseControlProps<T>) => React.ReactNode;
}

const isSame = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

export function useLiveField<T>(spec: CaseSpec<T>, saveAttempted = false) {
  const [saved] = useState(spec.filled);
  const [value, setValue] = useState(spec.filled);
  const [blurred, setTouched] = useState(false);
  const touched = blurred || saveAttempted;
  const required = spec.required ?? false;
  const errors = touched ? spec.validate(value, required) : [];
  return {
    value,
    saved,
    setValue,
    onBlur: () => setTouched(true),
    flags: {
      required,
      dirty: !isSame(value, saved),
      errors,
      warnings: spec.warn?.(value) ?? [],
      touched,
    } satisfies FrameFlags,
  };
}

interface FrozenField<T> {
  value: T;
  label: string;
  flags: FrameFlags;
}

function frozenField<T>(spec: CaseSpec<T>, state: StateName): FrozenField<T> {
  const filled: FrozenField<T> = {
    value: spec.filled,
    label: spec.label,
    flags: {},
  };
  switch (state) {
    case 'empty':
      return { ...filled, value: spec.empty };
    case 'filled':
      return filled;
    case 'focused':
      return { ...filled, flags: { focused: true } };
    case 'hover':
      return { ...filled, flags: { hover: true } };
    case 'disabled':
      return { ...filled, flags: { disabled: true } };
    case 'readOnly':
      return { ...filled, flags: { readOnly: true } };
    case 'invalid': {
      const value = spec.invalid ?? spec.empty;
      return {
        ...filled,
        value,
        flags: {
          required: true,
          touched: true,
          errors: spec.validate(value, true),
        },
      };
    }
    case 'required':
      return { ...filled, value: spec.empty, flags: { required: true } };
    case 'dirty':
      return {
        ...filled,
        value: spec.dirty ?? spec.filled,
        flags: { dirty: true },
      };
    case 'overflow':
      return {
        ...filled,
        value: spec.overflow ?? spec.filled,
        label: spec.overflowLabel ?? spec.label,
      };
  }
}

const noop = () => {};

function FrozenCell<T>({
  spec,
  state,
}: {
  spec: CaseSpec<T>;
  state: StateName;
}) {
  const reason = spec.doesNotApply?.[state];
  if (reason) {
    return (
      <p className='text-label text-muted-foreground'>
        <span aria-hidden='true'>–</span> {reason}
      </p>
    );
  }
  const frozen = frozenField(spec, state);
  const { value, label } = frozen;
  const flags = { ...frozen.flags, warnings: spec.warn?.(value) ?? [] };
  const { Control } = spec;
  return (
    <FieldFrame
      label={label}
      description={spec.description}
      showDescription={state === 'filled'}
      flags={flags}
      layout={spec.layout}
      labelling={spec.labelling}
    >
      {(control) => (
        <Control
          control={control}
          flags={flags}
          value={value}
          label={label}
          saved={state === 'dirty' ? spec.filled : value}
          frozen
          onChange={noop}
          onBlur={noop}
        />
      )}
    </FieldFrame>
  );
}

export function LiveCopy<T>({
  spec,
  saveAttempted,
  readOnly,
  startClosed,
  onValue,
}: {
  spec: CaseSpec<T>;
  saveAttempted?: boolean;
  readOnly?: boolean;
  startClosed?: boolean;
  onValue?: (value: T) => void;
}) {
  const live = useLiveField(spec, saveAttempted);
  const flags = readOnly ? { ...live.flags, readOnly } : live.flags;
  const { Control } = spec;
  useEffect(() => {
    onValue?.(live.value);
  }, [live.value, onValue]);
  return (
    <FieldFrame
      label={spec.label}
      description={spec.description}
      flags={flags}
      layout={spec.layout}
      labelling={spec.labelling}
    >
      {(control) => (
        <Control
          control={control}
          flags={flags}
          value={live.value}
          label={spec.label}
          saved={live.saved}
          frozen={false}
          startClosed={startClosed}
          onChange={live.setValue}
          onBlur={live.onBlur}
        />
      )}
    </FieldFrame>
  );
}

// Each cell is as wide as the editor pane, so a field shows at its real width.
const paneClasses =
  'grid content-start gap-2.5 rounded-md border border-border-subtle bg-card px-6 py-4';

export function CaseRow<T>({ spec }: { spec: CaseSpec<T> }) {
  const headingId = `case-${spec.id}`;
  return (
    <section
      aria-labelledby={headingId}
      className='grid gap-3 border-t border-border-subtle py-6'
    >
      <header className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
        <h3 id={headingId} className='text-base font-semibold'>
          {spec.title}
        </h3>
        {spec.notInV4 ? <Badge variant='draft'>Not in v4 yet</Badge> : null}
        {spec.note ? (
          <p className='basis-full text-label text-muted-foreground'>
            {spec.note}
          </p>
        ) : null}
      </header>
      <div className='grid grid-cols-[repeat(auto-fill,var(--pane-width))] gap-3'>
        <div
          data-testid={`${spec.id}-live`}
          className={`${paneClasses} border-input shadow-xs`}
        >
          <p className='text-xs font-medium text-foreground'>Try it</p>
          <LiveCopy spec={spec} />
        </div>
        <div inert data-testid={`${spec.id}-states`} className='contents'>
          {STATES.map((state) => (
            <div key={state.name} className={paneClasses}>
              <p className='text-xs text-muted-foreground'>{state.label}</p>
              <FrozenCell spec={spec} state={state.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface GalleryCase {
  id: string;
  title: string;
  notInV4?: boolean;
  Row: () => React.ReactNode;
}

export function defineCase<T>(spec: CaseSpec<T>): GalleryCase {
  return {
    id: spec.id,
    title: spec.title,
    notInV4: spec.notInV4,
    Row: () => <CaseRow spec={spec} />,
  };
}
