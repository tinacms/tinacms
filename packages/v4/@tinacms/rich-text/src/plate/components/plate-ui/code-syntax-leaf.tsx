'use client';

import React from 'react';

import { PlateLeaf, type PlateLeafProps } from '@udecode/plate/react';

export function CodeSyntaxLeaf(props: PlateLeafProps) {
  const tokenClassName = props.leaf.className as string;

  return <PlateLeaf className={tokenClassName} {...props} />;
}
