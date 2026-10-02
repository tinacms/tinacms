'use client';

import { Checkbox } from '@tinacms/ui/components/checkbox';
import { PlateElement, type PlateElementProps } from '@udecode/plate/react';
import React from 'react';

export function ListItemElement(props: PlateElementProps) {
  const { children, editor, element } = props;
  const labelId = React.useId();

  if (typeof element.checked !== 'boolean') {
    return (
      <PlateElement as='li' {...props}>
        {children}
      </PlateElement>
    );
  }

  return (
    <PlateElement as='li' {...props} className='flex list-none items-start'>
      {/* The caret stays where the author left it: the pointer never reaches
          the default action that moves focus out of the contentEditable. */}
      <div
        contentEditable={false}
        style={{ userSelect: 'none' }}
        className='me-2 mt-1'
        onMouseDown={(event) => event.preventDefault()}
      >
        <Checkbox
          checked={element.checked}
          aria-labelledby={labelId}
          onCheckedChange={(checked) => {
            editor.tf.setNodes(
              { checked },
              { at: editor.api.findPath(element) }
            );
          }}
        />
      </div>
      <div id={labelId} className='flex-1'>
        {children}
      </div>
    </PlateElement>
  );
}
