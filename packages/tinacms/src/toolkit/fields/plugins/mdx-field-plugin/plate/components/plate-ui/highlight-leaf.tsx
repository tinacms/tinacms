'use client';

import { PlateLeaf, type PlateLeafProps } from 'platejs/react';
import React from 'react';

const highlightColorClasses: Record<string, string> = {
  yellow: 'bg-yellow-200',
  green: 'bg-green-200',
  blue: 'bg-blue-200',
  pink: 'bg-pink-200',
  orange: 'bg-orange-200',
};

type HighlightLeafNode = { highlightColor?: string };

export function HighlightLeaf(props: PlateLeafProps) {
  const color = (props.leaf as HighlightLeafNode).highlightColor ?? 'yellow';
  const bgClass = highlightColorClasses[color] ?? 'bg-yellow-200';

  return (
    <PlateLeaf {...props} as='mark' className={`${bgClass} px-0.5`}>
      {props.children}
    </PlateLeaf>
  );
}
