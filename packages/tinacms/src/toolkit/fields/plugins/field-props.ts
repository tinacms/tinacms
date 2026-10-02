import { Field, Form, FormApi } from '@toolkit/forms';
import { FieldRenderProps } from '@toolkit/form-builder';

/**
 * Props every field plugin receives.
 *
 * `react-final-form` v6 declares `[otherProp: string]: any` on `FieldRenderProps`,
 * so the extras `FieldsBuilder` passes down would type-check implicitly. They are
 * declared explicitly anyway: v7 drops that index signature, and the next bump
 * should not have to rediscover them.
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
