import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@toolkit/components/ui/popover';
import { ElementApi } from '@udecode/plate';
import {
  ParagraphPlugin,
  PlateEditor,
  useSelected,
} from '@udecode/plate/react';
import React from 'react';
import { ELEMENT_MDX_INLINE } from '.';
import { EllipsisIcon } from '../../components/plate-ui/icons';
import { useTemplates } from '../../editor-context';
import { useEmbedHandles, useHotkey } from '../../hooks/embed-hooks';
import { NestedForm } from '../../nested-form';
import { classNames } from '../ui/helpers';

const Wrapper = ({ inline, children }) => {
  const Component = inline ? 'span' : 'div';
  return (
    <Component
      contentEditable={false}
      style={{ userSelect: 'none' }}
      className='relative'
    >
      {children}
    </Component>
  );
};

interface InlineEmbedProps {
  attributes: any;
  children: any;
  element: any;
  onChange?: (value: any) => void;
  editor: PlateEditor;
}

export const InlineEmbed = ({
  attributes,
  children,
  element,
  onChange,
  editor,
}: InlineEmbedProps) => {
  const selected = useSelected();
  const { templates, fieldName } = useTemplates();
  const { handleClose, handleRemove, handleSelect, isExpanded } =
    useEmbedHandles(editor, element, fieldName);
  useHotkey('enter', () => {
    editor.tf.insertNodes([
      { type: ParagraphPlugin.key, children: [{ text: '' }] },
    ]);
  });
  useHotkey('space', () => {
    editor.tf.insertNodes([{ text: ' ' }], {
      match: (n) => {
        if (ElementApi.isElement(n) && n.type === ELEMENT_MDX_INLINE) {
          return true;
        }
      },
      select: true,
    });
  });

  const activeTemplate = templates.find(
    (template) => template.name === element.name
  );

  const formProps = {
    activeTemplate,
    element,
    editor,
    onChange,
    onClose: handleClose,
  };

  if (!activeTemplate) {
    return null;
  }

  const label = getLabel(activeTemplate, formProps);
  return (
    <span {...attributes}>
      {children}
      <Wrapper inline={true}>
        <span
          // give just enough margin so that the cursor is visible when adjacent to this node.
          style={{ margin: '0 0.5px' }}
          className='relative inline-flex shadow-sm rounded leading-none'
        >
          {selected && (
            <span className='absolute inset-0 ring-2 ring-blue-100 ring-inset rounded z-10 pointer-events-none' />
          )}
          <span
            style={{ fontWeight: 'inherit', maxWidth: '275px' }}
            // Tailwind reset puts styles on buttons
            className='truncate cursor-pointer relative inline-flex items-center justify-start px-2 py-0.5 rounded-l border border-gray-200 bg-white  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            onMouseDown={handleSelect}
          >
            {label}
          </span>
          <DotMenu onOpen={handleSelect} onRemove={handleRemove} />
        </span>
        {isExpanded && <EmbedNestedForm {...formProps} />}
      </Wrapper>
    </span>
  );
};

export const BlockEmbed = ({
  attributes,
  children,
  element,
  editor,
  onChange,
}) => {
  const selected = useSelected();
  const { templates, fieldName } = useTemplates();
  const { handleClose, handleRemove, handleSelect, isExpanded } =
    useEmbedHandles(editor, element, fieldName);

  useHotkey('enter', () => {
    editor.tf.insertNodes([
      { type: ParagraphPlugin.key, children: [{ text: '' }] },
    ]);
  });

  const activeTemplate = templates.find(
    (template) => template.name === element.name
  );

  const formProps = {
    activeTemplate,
    element,
    editor,
    onChange,
    onClose: handleClose,
  };

  if (!activeTemplate) {
    return null;
  }

  const label = getLabel(activeTemplate, formProps);
  return (
    <div {...attributes} className='w-full my-2'>
      {children}
      <Wrapper inline={false}>
        <span className='relative w-full inline-flex shadow-sm rounded'>
          {selected && (
            <span className='absolute inset-0 ring-2 ring-blue-100 ring-inset rounded z-10 pointer-events-none' />
          )}
          <span
            onMouseDown={handleSelect}
            className='truncate cursor-pointer w-full relative inline-flex items-center justify-start px-4 py-2 rounded-l border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
          >
            {label}
          </span>
          <DotMenu onOpen={handleSelect} onRemove={handleRemove} />
        </span>
        {isExpanded && <EmbedNestedForm {...formProps} />}
      </Wrapper>
    </div>
  );
};

const getLabel = (activeTemplate, formProps) => {
  const titleField = activeTemplate.fields.find((field) => field.isTitle);
  let label = activeTemplate.label || activeTemplate.name;
  if (titleField) {
    const titleValue = formProps.element.props[titleField.name];
    if (titleValue) {
      label = `${label}: ${titleValue}`;
    }
  }

  return label;
};

const EmbedNestedForm = ({
  editor,
  element,
  activeTemplate,
  onClose,
  onChange,
}) => {
  const path = editor.findPath(element);
  const id = [...path, activeTemplate.name].join('.');
  return (
    <NestedForm
      id={id}
      label={activeTemplate.label}
      fields={activeTemplate.fields}
      initialValues={element.props}
      onChange={onChange}
      onClose={onClose}
    />
  );
};

const DotMenu = ({ onOpen, onRemove }) => {
  return (
    <Popover>
      <PopoverTrigger className='cursor-pointer h-full relative inline-flex items-center px-1 py-0.5 rounded-r border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'>
        <EllipsisIcon title='Open options' />
      </PopoverTrigger>
      <PopoverContent
        align='end'
        sideOffset={8}
        className='z-30 w-auto p-0 rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none border-0'
      >
        <div className='py-1'>
          <span
            onClick={onOpen}
            className={classNames(
              'cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            Edit
          </span>
          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              onRemove();
            }}
            className={classNames(
              'cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            Remove
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
