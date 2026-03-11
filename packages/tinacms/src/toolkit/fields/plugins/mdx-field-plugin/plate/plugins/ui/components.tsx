import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import { BaseBlockquotePlugin } from '@platejs/basic-nodes';
import { BaseHorizontalRulePlugin } from '@platejs/basic-nodes';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';
import { withProps } from '@udecode/cn';

// Define heading keys locally
const HEADING_KEYS = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};
import { BaseLinkPlugin } from '@platejs/link';
import {
  BaseBulletedListPlugin,
  BaseListItemPlugin,
  BaseNumberedListPlugin,
} from '@platejs/list-classic';
import { BaseSlashInputPlugin } from '@platejs/slash-command';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import { ParagraphPlugin, PlateElement, PlateLeaf } from 'platejs/react';
import React from 'react';
import { BlockquoteElement } from '../../components/plate-ui/blockquote-element';
import { CodeBlockElement } from '../../components/plate-ui/code-block/code-block-element';
import { CodeLeaf } from '../../components/plate-ui/code-leaf';
import { CodeLineElement } from '../../components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '../../components/plate-ui/code-syntax-leaf';
import { HighlightLeaf } from '../../components/plate-ui/highlight-leaf';
import { HrElement } from '../../components/plate-ui/hr-element';
import { LinkElement } from '../../components/plate-ui/link-element';
import { ListElement } from '../../components/plate-ui/list-element';
import { ParagraphElement } from '../../components/plate-ui/paragraph-element';
import { SlashInputElement } from '../../components/plate-ui/slash-input-element';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '../../components/plate-ui/table/table-cell-element';
import { TableElement } from '../../components/plate-ui/table/table-element';
import { TableRowElement } from '../../components/plate-ui/table/table-row-element';
import { classNames } from './helpers';

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
    [BaseSlashInputPlugin.key]: SlashInputElement,
    [HEADING_KEYS.h1]: ({
      attributes,
      editor,
      element,
      className,
      ...props
    }) => (
      <h1
        {...attributes}
        {...props}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-4xl mb-4 last:mb-0 mt-6 first:mt-0 font-libre-baskerville'
        )}
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
        {...attributes}
        {...props}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-3xl mb-4 last:mb-0 mt-6 first:mt-0 font-libre-baskerville'
        )}
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
        {...attributes}
        {...props}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-2xl mb-4 last:mb-0 mt-6 first:mt-0 font-libre-baskerville'
        )}
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
        {...attributes}
        {...props}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-xl mb-4 last:mb-0 mt-6 first:mt-0 font-libre-baskerville'
        )}
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
        {...attributes}
        {...props}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-lg mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: '400' }}
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
        {...attributes}
        {...props}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-base mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: '400' }}
      />
    ),
    [ParagraphPlugin.key]: ParagraphElement,
    [BaseBlockquotePlugin.key]: BlockquoteElement,
    [BaseCodeBlockPlugin.key]: CodeBlockElement,
    [BaseCodeLinePlugin.key]: CodeLineElement,
    [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeaf,
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
    [BaseBulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
    [BaseNumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
    [BaseListItemPlugin.key]: withProps(PlateElement, { as: 'li' }),
    [BaseLinkPlugin.key]: LinkElement,
    [BaseCodePlugin.key]: CodeLeaf,
    [BaseHighlightPlugin.key]: HighlightLeaf,
    [BaseUnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
    [BaseStrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
    [BaseItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
    [BaseBoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
    [BaseHorizontalRulePlugin.key]: HrElement,
    [BaseTableCellHeaderPlugin.key]: TableCellHeaderElement,
    [BaseTableCellPlugin.key]: TableCellElement,
    [BaseTablePlugin.key]: TableElement,
    [BaseTableRowPlugin.key]: TableRowElement,
  };
};
