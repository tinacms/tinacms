import { withProps } from '@udecode/cn';
import {
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_UL,
} from '@udecode/plate';
import { ELEMENT_SLASH_INPUT } from '@udecode/plate-slash-command';
import React from 'react';
import { useSelected } from 'slate-react';
import { BlockquoteElement } from '../../components/plate-ui/blockquote-element';
import { CodeBlockElement } from '../../components/plate-ui/code-block-element';
import { CodeLeaf } from '../../components/plate-ui/code-leaf';
import { CodeLineElement } from '../../components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '../../components/plate-ui/code-syntax-leaf';
import { ListElement } from '../../components/plate-ui/list-element';
import { MermaidElement } from '../../components/plate-ui/mermaid-element';
import { SlashInputElement } from '../../components/plate-ui/slash-input-element';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '../../components/plate-ui/table-cell-element';
import { TableElement } from '../../components/plate-ui/table-element';
import { TableRowElement } from '../../components/plate-ui/table-row-element';
import { ELEMENT_MERMAID } from '../custom/mermaid-plugin';
import { classNames } from './helpers';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TablePlugin } from '@udecode/plate-table/react';
import { ParagraphPlugin, PlateElement, PlateLeaf } from '@udecode/plate/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';

/**
 * For blocks elements (p, blockquote, ul, ...etc), it
 * can be jarring to see the cursor jump inconsistently
 * based on .prose styles. These classes aim to normalize
 * blocks behavior so they take up the same space
 */
const blockClasses = 'mt-0.5';
/** prose sets a bold font, making bold marks impossible to see */
const headerClasses = 'font-normal';

export const Components = () => {
  return {
    [ELEMENT_SLASH_INPUT]: SlashInputElement,
    [HEADING_KEYS.h1]: ({
      attributes,
      editor,
      element,
      className,
      ...props
    }) => (
      <h1
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-4xl font-medium mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    [HEADING_KEYS.h2]: ({
      attributes,
      editor,
      element,
      className,
      ...props
    }) => (
      <h2
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-3xl font-medium mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    [HEADING_KEYS.h3]: ({
      attributes,
      editor,
      element,
      className,
      ...props
    }) => (
      <h3
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-2xl font-semibold mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    [HEADING_KEYS.h4]: ({
      attributes,
      editor,
      element,
      className,
      ...props
    }) => (
      <h4
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-xl font-bold mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    /** Tailwind prose doesn't style h5 and h6 elements */
    [HEADING_KEYS.h5]: ({
      attributes,
      editor,
      element,
      className,
      ...props
    }) => (
      <h5
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-lg font-bold mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    [HEADING_KEYS.h6]: ({
      attributes,
      editor,
      element,
      className,
      ...props
    }) => (
      <h6
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-base font-bold mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ParagraphPlugin.key]: ({
      attributes,
      className,
      editor,
      element,
      ...props
    }) => (
      // Descendants in the rich-text editor can be `<div>` elements, so we get a console error for divs in paragraphs
      <div
        className={classNames(
          blockClasses,
          className,
          'text-base font-normal mb-4 last:mb-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_MERMAID]: MermaidElement,
    [BlockquotePlugin.key]: BlockquoteElement,
    [CodeBlockPlugin.key]: CodeBlockElement,
    [CodeLinePlugin.key]: CodeLineElement,
    [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
    html: ({ attributes, editor, element, children, className }) => {
      return (
        <div
          {...attributes}
          className={classNames(
            'font-mono text-sm bg-green-100 cursor-not-allowed mb-4',
            className
          )}
        >
          {children}
          {element.value}
        </div>
      );
    },
    html_inline: ({ attributes, editor, element, children, className }) => {
      return (
        <span
          {...attributes}
          className={classNames(
            'font-mono bg-green-100 cursor-not-allowed',
            className
          )}
        >
          {children}
          {element.value}
        </span>
      );
    },
    [ELEMENT_UL]: withProps(ListElement, { variant: 'ul' }),
    [ELEMENT_OL]: withProps(ListElement, { variant: 'ol' }),
    [ELEMENT_LI]: withProps(PlateElement, { as: 'li' }),
    [ELEMENT_LINK]: ({
      attributes,
      editor,
      element,
      nodeProps,
      className,
      ...props
    }) => (
      <a
        className={classNames(
          className,
          'text-blue-500 hover:text-blue-600 transition-color ease-out duration-150 underline'
        )}
        {...attributes}
        {...props}
      />
    ),
    [CodePlugin.key]: CodeLeaf,
    [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
    [StrikethroughPlugin.key]: ({ editor, leaf, text, ...props }) => (
      <s {...props.attributes} {...props} />
    ),
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
    [BoldPlugin.key]: ({ editor, leaf, text, ...props }) => (
      <strong {...props.attributes} {...props} />
    ),
    [HorizontalRulePlugin.key]: ({
      attributes,
      className,
      editor,
      element,
      children,
      ...props
    }) => {
      const selected = useSelected();
      return (
        <div
          className={classNames(
            className,
            'cursor-pointer relative border bg-gray-200 my-4 first:mt-0 last:mb-0'
          )}
          {...attributes}
          {...props}
        >
          {children}
          {selected && (
            <span className='absolute h-4 -top-2 inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none' />
          )}
        </div>
      );
    },
    [TablePlugin.key]: TableElement,
    [ELEMENT_TR]: TableRowElement,
    [ELEMENT_TD]: TableCellElement,
    [ELEMENT_TH]: TableCellHeaderElement,
  };
};
