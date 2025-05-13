'use client';
import * as React from 'react';
import { NodeApi } from '@udecode/plate';
import {
  type TCodeBlockElement,
  formatCodeBlock,
  isLangSupported,
} from '@udecode/plate-code-block';
import { type PlateElementProps, PlateElement } from '@udecode/plate/react';
import { BracesIcon, CheckIcon, CopyIcon } from 'lucide-react';
import { Button } from './button';
import { CodeBlock } from '../../plugins/ui/code-block';

export function CodeBlockElement(props: PlateElementProps<TCodeBlockElement>) {
  const { editor, element } = props;

  return (
    <PlateElement className='relative py-1' {...props}>
      <CodeBlock {...props} />
    </PlateElement>
  );
}
