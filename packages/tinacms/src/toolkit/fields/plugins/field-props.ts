import { Field, Form, FormApi } from '@toolkit/forms';
import { FieldRenderProps } from '@toolkit/form-builder';

/**
 * Props every field plugin receives.
 *
 * `react-final-form` v6 declared `[otherProp: string]: any` on `FieldRenderProps`,
 * so the extras `FieldsBuilder` passes down type-checked implicitly. v7 dropped
 * that index signature, so they are declared here instead.
 */
export interface FieldProps<InputProps>
  extends FieldRenderProps<any, HTMLElement> {
  field: Field & InputProps;
  form: FormApi;
  tinaForm: Form;
  index?: number;
  children?: React.ReactNode;
  experimental_focusIntent?: boolean;
}
