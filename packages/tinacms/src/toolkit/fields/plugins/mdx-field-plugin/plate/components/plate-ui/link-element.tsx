'use client';

import * as React from 'react';

import type { TLinkElement } from '@udecode/plate-link';
import type { PlateElementProps } from '@udecode/plate/react';

import { useLink } from '@udecode/plate-link/react';
import { PlateElement } from '@udecode/plate/react';

export function LinkElement(props: PlateElementProps<TLinkElement>) {
  const { props: linkProps } = useLink({ element: props.element });

  return (
    <PlateElement
      {...props}
      as='a'
      className='font-small underline underline-offset-2 text-blue-500 hover:text-blue-600 transition-color ease-out duration-150'
      attributes={{
        ...props.attributes,
        ...(linkProps as any),
      }}
    >
      {props.children}
    </PlateElement>
  );
}
