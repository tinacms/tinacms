import * as React from 'react';
import { FieldProps } from './field-props';
import { useEvent } from '@toolkit/react-core/use-cms-event';
import { FieldHoverEvent, FieldFocusEvent } from '@toolkit/fields/field-events';
import { Form, Field } from '@toolkit/forms';
import { useCMS } from '@toolkit/react-core';

export type InputFieldType<ExtraFieldProps, InputProps> =
  FieldProps<InputProps> & ExtraFieldProps;

// Wraps the Field component in labels describing the field's meta state
// Add any other fields that the Field component should expect onto the ExtraFieldProps generic type
export function wrapFieldsWithMeta<ExtraFieldProps = {}, InputProps = {}>(
  Field:
    | React.FunctionComponent<InputFieldType<ExtraFieldProps, InputProps>>
    | React.ComponentClass<InputFieldType<ExtraFieldProps, InputProps>>
) {
  return (props: InputFieldType<ExtraFieldProps, InputProps>) => {
    return (
      <FieldMeta
        name={props.input.name}
        label={props.field.label}
        description={props.field.description}
        error={props.meta.error}
        index={props.index}
        tinaForm={props.tinaForm}
        field={props.field}
      >
        <Field {...props} />
      </FieldMeta>
    );
  };
}

/**
 * Same as wrapFieldsWithMeta but excludes the label, and description useful for fields that render their label and description
 */
export function wrapFieldWithNoHeader<ExtraFieldProps = {}, InputProps = {}>(
  Field:
    | React.FunctionComponent<InputFieldType<ExtraFieldProps, InputProps>>
    | React.ComponentClass<InputFieldType<ExtraFieldProps, InputProps>>
) {
  return (props: InputFieldType<ExtraFieldProps, InputProps>) => {
    return (
      <FieldMeta
        name={props.input.name}
        label={false}
        description={''}
        error={props.meta.error}
        index={props.index}
        tinaForm={props.tinaForm}
      >
        <Field {...props} />
      </FieldMeta>
    );
  };
}

/**
 * Same as above but excludes the label, useful for fields that have their own label
 * @deprecated This function is deprecated and will be removed in future versions.
 */
export function wrapFieldWithError<ExtraFieldProps = {}, InputProps = {}>(
  Field:
    | React.FunctionComponent<InputFieldType<ExtraFieldProps, InputProps>>
    | React.ComponentClass<InputFieldType<ExtraFieldProps, InputProps>>
) {
  return (props: InputFieldType<ExtraFieldProps, InputProps>) => {
    return (
      <FieldMeta
        name={props.input.name}
        label={false}
        description={props.field.description}
        error={props.meta.error}
        index={props.index}
        tinaForm={props.tinaForm}
      >
        <Field {...props} />
      </FieldMeta>
    );
  };
}

interface FieldMetaProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  children: any;
  label?: string | boolean;
  description?: string;
  error?: string;
  margin?: boolean;
  index?: number;
  tinaForm: Form;
  field?: Field;
}

export const FieldMeta = ({
  name,
  label,
  description,
  error,
  margin = true,
  children,
  index,
  tinaForm,
  field,
  ...props
}: FieldMetaProps) => {
  const { dispatch: setHoveredField } =
    useEvent<FieldHoverEvent>('field:hover');
  const { dispatch: setFocusedField } =
    useEvent<FieldFocusEvent>('field:focus');
  return (
    <FieldWrapper
      margin={margin}
      field={field}
      onMouseOver={() => setHoveredField({ id: tinaForm.id, fieldName: name })}
      onMouseOut={() => setHoveredField({ id: null, fieldName: null })}
      onClick={() => setFocusedField({ id: tinaForm.id, fieldName: name })}
      style={{ zIndex: index ? 1000 - index : undefined }}
      {...props}
    >
      {(label !== false || description) && (
        <FieldLabel name={name}>
          {label !== false && <>{label || name}</>}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldLabel>
      )}
      {children}
      {/*
      FIXME: when a object field has a sub-field with a validation (eg. required)
             AND the object field is not pristine (eg. you've touched other fields)
             the error will be an object (eg {mySubField: "required"}).
     */}
      {error && typeof error === 'string' && <FieldError>{error}</FieldError>}
    </FieldWrapper>
  );
};

export const FieldWrapper = ({
  margin,
  children,
  field,
  ...props
}: {
  margin: boolean;
  children: React.ReactNode;
  field?: Field;
} & Partial<React.ComponentPropsWithoutRef<'div'>>) => {
  return (
    <div
      className={`relative w-full px-2 ${margin ? 'mb-5 last:mb-0' : ''} ${field?.width === 'half' ? '@sm:w-1/2' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface FieldLabel extends React.HTMLAttributes<HTMLLabelElement> {
  children?: any | any[];
  className?: string;
  name?: string;
}

export const FieldLabel = ({
  children,
  className,
  name,
  ...props
}: FieldLabel) => {
  return (
    <label
      htmlFor={name}
      className={`block font-sans text-xs font-semibold text-gray-700 whitespace-normal mb-2 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export const FieldDescription = ({
  children,
  className,
  ...props
}: {
  children?: any | any[];
  className?: string;
}) => {
  if (typeof children === 'string') {
    return (
      <span
        className={`block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal m-0 ${className}`}
        {...props}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }
  return (
    <span
      className={`block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal m-0 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const FieldError = ({
  children,
  className,
  ...props
}: {
  children?: any | any[];
  className?: string;
}) => {
  return (
    <span
      className={`block font-sans text-xs font-normal text-red-500 pt-3 animate-slide-in whitespace-normal m-0  ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
