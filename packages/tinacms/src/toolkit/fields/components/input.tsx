import React from 'react';
import { textFieldClasses } from './text-field';

export interface InputProps {
  error?: boolean;
  small?: boolean;
  placeholder?: string;
  step?: string | number;
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>((props, ref) => <input ref={ref} className={textFieldClasses} {...props} />);
