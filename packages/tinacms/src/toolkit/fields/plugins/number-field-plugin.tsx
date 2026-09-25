import * as React from 'react';
import { wrapFieldsWithMeta } from './wrap-field-with-meta';
import { NumberInput as BaseNumberField, InputProps } from '../components';
import { parse } from './number-format';

export const NumberField = wrapFieldsWithMeta<{
  step: string | number;
  input: InputProps;
}>(({ input, field }) => {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current && field.experimental_focusIntent) {
      ref.current.focus();
    }
  }, [field.experimental_focusIntent]);

  // @ts-ignore field.step
  return <BaseNumberField {...input} ref={ref} step={field.step} />;
});

export const NumberFieldPlugin = {
  name: 'number',
  Component: NumberField,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && typeof value !== 'number') return 'Required';
  },
};
