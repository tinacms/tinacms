import { CollapsibleSection } from '@tinacms/ui/components/collapsible-section';
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
  /** The field name. It names the drill-in card when `label` is not text. */
  name?: string;
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

type LookProps = ObjectFieldViewProps;

function Frame({
  errors,
  help,
  helpId,
  children,
}: Pick<LookProps, 'errors' | 'help' | 'helpId' | 'children'>) {
  return (
    <FieldWrapper errors={errors} help={help} helpId={helpId}>
      {children}
    </FieldWrapper>
  );
}

function InPlaceLook(props: LookProps) {
  return (
    <Frame {...props}>
      <div className='min-w-0'>{props.children}</div>
    </Frame>
  );
}

function DrillInLook(props: LookProps) {
  const { label, name, required, summary, invalidCount, disabled } = props;
  return (
    <Frame {...props}>
      <DrillInCard
        label={typeof label === 'string' ? label : (name ?? '')}
        required={required}
        summary={summary ?? NOT_SET}
        invalidCount={invalidCount}
        disabled={disabled}
        onOpen={props.onDrillIn ?? noop}
      />
    </Frame>
  );
}

function CollapsibleLook(props: LookProps) {
  const { label, labelId, required, summary, invalidCount, disabled } = props;
  return (
    <Frame {...props}>
      <CollapsibleSection
        label={label}
        labelId={labelId}
        required={required}
        summary={summary ?? NOT_SET}
        invalidCount={invalidCount}
        open={props.open ?? false}
        onOpenChange={props.onOpenChange ?? noop}
        disabled={disabled}
        onHeaderFocus={props.onHeaderFocus}
      >
        <div role='group' aria-labelledby={labelId}>
          {props.children}
        </div>
      </CollapsibleSection>
    </Frame>
  );
}

function FieldsetLook(props: LookProps) {
  return (
    <FieldWrapper
      label={props.label}
      labelId={props.labelId}
      required={props.required}
      errors={props.errors}
      help={props.help}
      helpId={props.helpId}
      disabled={props.disabled}
      data-read-only={props.readOnly || undefined}
    >
      <div role='group' aria-labelledby={props.labelId} className='min-w-0'>
        {props.children}
      </div>
    </FieldWrapper>
  );
}

const LOOKS: Record<ObjectDisplay, (props: LookProps) => ReactNode> = {
  fieldset: FieldsetLook,
  collapsible: CollapsibleLook,
  drillIn: DrillInLook,
};

const noop = () => {};

/** The three looks of an object field. It reads no store; the connected field feeds it. */
export function ObjectFieldView(props: ObjectFieldViewProps) {
  if (props.inPlace) return <InPlaceLook {...props} />;
  const Look = LOOKS[props.display];
  return <Look {...props} />;
}
