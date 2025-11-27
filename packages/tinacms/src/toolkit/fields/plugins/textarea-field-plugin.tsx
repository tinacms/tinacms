import * as React from 'react';
import { TextArea, InputProps } from '../components';
import { wrapFieldsWithMeta } from './wrap-field-with-meta';
import { parse } from './text-format';

const TextareaField = wrapFieldsWithMeta<{ input: InputProps }>((props) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const focusIntent = props.field.experimental_focusIntent;
    // Only focus if visualOnly is not set (or is false)
    const shouldFocus =
      focusIntent &&
      (typeof focusIntent === 'boolean' || !focusIntent.visualOnly);

    if (ref.current && shouldFocus) {
      const el = ref.current;
      el.focus();
      // Move the cursor to the end of the text
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [props.field.experimental_focusIntent, ref]);

  return <TextArea ref={ref} {...props.input} />;
});
export const TextareaFieldPlugin = {
  name: 'textarea',
  Component: TextareaField,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required';
  },
};
