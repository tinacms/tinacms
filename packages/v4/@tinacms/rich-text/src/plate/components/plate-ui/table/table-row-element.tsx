'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { useDropLine } from '@udecode/plate-dnd';
import {
  PlateElement,
  useEditorRef,
  useElement,
  useSelected,
} from '@udecode/plate/react';
import { GripVertical } from 'lucide-react';
import { Button } from '../button';

export const TableRowElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const selected = useSelected();

    return (
      <PlateElement
        as='tr'
        className={cn(className, 'group/row')}
        data-selected={selected ? 'true' : undefined}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);

function RowDragHandle({ dragRef }: { dragRef: React.Ref<any> }) {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <Button
      ref={dragRef}
      variant='outline'
      className={cn(
        'absolute top-1/2 left-0 z-51 h-6 w-4 -translate-y-1/2 p-0 focus-visible:ring-0 focus-visible:ring-offset-0',
        'cursor-grab active:cursor-grabbing',
        'opacity-0 transition-opacity duration-100 group-hover/row:opacity-100 group-has-data-[resizing="true"]/row:opacity-0'
      )}
      onClick={() => {
        editor.tf.select(element);
      }}
    >
      <GripVertical className='text-muted-foreground' />
    </Button>
  );
}

function DropLine() {
  const { dropLine } = useDropLine();

  if (!dropLine) return null;

  return (
    <div
      className={cn(
        'absolute inset-x-0 left-2 z-50 h-0.5 bg-brand/50',
        dropLine === 'top' ? '-top-px' : '-bottom-px'
      )}
    />
  );
}
