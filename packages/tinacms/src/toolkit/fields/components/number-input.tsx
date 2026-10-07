import * as React from 'react';
import { Input } from './input';

export interface NumberProps extends React.ComponentProps<'input'> {
  step?: string | number;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberProps>(
  ({ onChange, ...rest }, ref) => (
    <Input
      {...rest}
      ref={ref}
      type='number'
      onChange={(event) => {
        const inputValue = event.target.value;
        const newValue = inputValue === '' ? undefined : inputValue;
        if (onChange) {
          const syntheticEvent = {
            ...event,
            target: {
              ...event.target,
              value: newValue,
            },
          };
          onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
      }}
    />
  )
);
