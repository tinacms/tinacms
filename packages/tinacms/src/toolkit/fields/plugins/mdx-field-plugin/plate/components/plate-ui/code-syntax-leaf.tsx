'use client';

import React from 'react';

import { type PlateLeafProps, PlateLeaf } from 'platejs/react';

export function CodeSyntaxLeaf(props: PlateLeafProps) {
  const tokenClassName = props.leaf.className as string;

  return <PlateLeaf className={tokenClassName} {...props} />;
}
