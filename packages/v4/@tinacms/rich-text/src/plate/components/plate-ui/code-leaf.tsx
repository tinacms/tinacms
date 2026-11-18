'use client';

import { PlateLeaf, PlateLeafProps } from '@udecode/plate/react';
import React from 'react';

export function CodeLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf
      {...props}
      as='code'
      className='rounded-xs bg-muted px-[0.3em] py-[0.15em] font-mono text-[0.9em] whitespace-pre-wrap'
    >
      {props.children}
    </PlateLeaf>
  );
}
