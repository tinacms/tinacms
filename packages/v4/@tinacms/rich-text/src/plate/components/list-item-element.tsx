'use client';

import { Checkbox } from '@tinacms/ui/components/checkbox';
import { cn } from '@tinacms/ui/lib/utils';
import {
  PlateElement,
  type PlateElementProps,
  useReadOnly,
} from '@udecode/plate/react';
import React from 'react';

export function ListItemElement(props: PlateElementProps) {
  const { children, editor, element } = props;
  const labelId = React.useId();
  const readOnly = useReadOnly();

  if (typeof element.checked !== 'boolean') {
    return (
      <PlateElement as='li' {...props}>
        {children}
      </PlateElement>
    );
  }

  return (
    <PlateElement
      as='li'
      {...props}
      className='flex list-none items-start gap-2'
    >
      {/* The caret stays where the author left it: the pointer never reaches
          the default action that moves focus out of the contentEditable. */}
      <div
        contentEditable={false}
        style={{ userSelect: 'none' }}
        className='mt-0.5'
        onMouseDown={(event) => event.preventDefault()}
      >
        <Checkbox
          checked={element.checked}
          disabled={readOnly}
          aria-labelledby={labelId}
          onCheckedChange={(checked) => {
            editor.tf.setNodes(
              { checked },
              { at: editor.api.findPath(element) }
            );
          }}
        />
      </div>
      <div
        id={labelId}
        className={cn(
          'min-w-0 flex-1',
          element.checked && 'text-muted-foreground line-through'
        )}
      >
        {children}
      </div>
    </PlateElement>
  );
}
