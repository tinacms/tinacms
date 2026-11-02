import { Collapsible } from '@tinacms/ui/components/collapsible';
import { DrillInCard } from '@tinacms/ui/components/drill-in-card';
import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import type { FocusEventHandler, ReactNode } from 'react';
import type { ObjectDisplay } from './object-field.schema';

export const NOT_SET = 'Not set';

export interface ObjectFieldViewProps
  extends Pick<
    FieldWrapperProps,
    'label' | 'labelId' | 'required' | 'errors' | 'help' | 'helpId'
  > {
  display: ObjectDisplay;
  /** Collapsible only. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Drill-in only. */
  onDrillIn?: () => void;
  /** The line shown while closed, or on the card. */
  summary?: string;
  /** Fields inside that hold a revealed error. */
  invalidCount?: number;
  disabled?: boolean;
  readOnly?: boolean;
  /** The object is the open form level: its fields show in place, with no frame of its own. */
  inPlace?: boolean;
  onHeaderFocus?: FocusEventHandler<HTMLButtonElement>;
  /** The nested fields. A closed collapsible does not draw them. */
  children?: ReactNode;
}

/** The three looks of an object field. It reads no store; the connected field feeds it. */
export function ObjectFieldView({
  display,
  open = false,
  onOpenChange = () => {},
  onDrillIn = () => {},
  summary,
  invalidCount = 0,
  disabled = false,
  readOnly = false,
  inPlace = false,
  onHeaderFocus,
  label,
  labelId,
  required,
  errors,
  help,
  helpId,
  children,
}: ObjectFieldViewProps) {
  const text = typeof label === 'string' ? label : undefined;

  if (inPlace) {
    return (
      <FieldWrapper errors={errors} help={help} helpId={helpId}>
        <div className='min-w-0'>{children}</div>
      </FieldWrapper>
    );
  }

  if (display === 'drillIn') {
    return (
      <FieldWrapper errors={errors} help={help} helpId={helpId}>
        <DrillInCard
          label={text ?? ''}
          summary={summary ?? NOT_SET}
          invalidCount={invalidCount}
          disabled={disabled}
          readOnly={readOnly}
          onOpen={onDrillIn}
        />
      </FieldWrapper>
    );
  }

  if (display === 'collapsible') {
    return (
      <FieldWrapper errors={errors} help={help} helpId={helpId}>
        <Collapsible
          label={label}
          labelId={labelId}
          summary={summary ?? NOT_SET}
          invalidCount={invalidCount}
          open={open}
          onOpenChange={onOpenChange}
          disabled={disabled}
          readOnly={readOnly}
          onHeaderFocus={onHeaderFocus}
        >
          <div role='group' aria-labelledby={labelId}>
            {children}
          </div>
        </Collapsible>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper
      label={label}
      labelId={labelId}
      required={required}
      errors={errors}
      help={help}
      helpId={helpId}
      disabled={disabled}
    >
      <div role='group' aria-labelledby={labelId} className='min-w-0'>
        {children}
      </div>
    </FieldWrapper>
  );
}
