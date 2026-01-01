'use client';

import { withProps } from '@udecode/cn';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { SlashInputPlugin } from '@udecode/plate-slash-command/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { ParagraphPlugin, PlateElement, PlateLeaf } from '@udecode/plate/react';
import React from 'react';

import { BlockquoteElement } from '../../components/plate-ui/blockquote-element';
import { CodeBlockElement } from '../../components/plate-ui/code-block/code-block-element';
import { CodeLeaf } from '../../components/plate-ui/code-leaf';
import { CodeLineElement } from '../../components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '../../components/plate-ui/code-syntax-leaf';
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

/**
 * Plate/Slate sometimes pass internal props through element renderers.
 * If spread onto DOM nodes, React warnings / errors (e.g. setOption) appear.
 */
function sanitizeDomProps<T extends Record<string, any>>(props: T): Partial<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    editor,
    element,
    leaf,
    text,
    nodeProps,
    setOption,
    setOptions,
    getOption,
    getOptions,
    plugin,
    path,
    ...rest
  } = props as any;

  return rest;
}

type HeadingRendererProps = {
  attributes: Record<string, any>;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
};

function Heading({
  as: Tag,
  attributes,
  children,
  className,
  ...rest
}: HeadingRendererProps & { as: keyof JSX.IntrinsicElements }) {
  const domProps = sanitizeDomProps(rest);

  return (
    <Tag {...attributes} {...domProps} className={className}>
      {children}
    </Tag>
  );
}

export const Components = () => {
  return {
    // Slash input element
    [SlashInputPlugin.key]: SlashInputElement,

    // Headings
    [HEADING_KEYS.h1]: ({ attributes, children, className, ...rest }) => (
      <Heading
        as="h1"
        attributes={attributes}
        {...sanitizeDomProps(rest)}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-4xl mb-4 last:mb-0 mt-6 first:mt-0 font-libre-baskerville'
        )}
      >
        {children}
      </Heading>
    ),
    [HEADING_KEYS.h2]: ({ attributes, children, className, ...rest }) => (
      <Heading
        as="h2"
        attributes={attributes}
        {...sanitizeDomProps(rest)}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-3xl mb-4 last:mb-0 mt-6 first:mt-0 font-libre-baskerville'
        )}
      >
        {children}
      </Heading>
    ),
    [HEADING_KEYS.h3]: ({ attributes, children, className, ...rest }) => (
      <Heading
        as="h3"
        attributes={attributes}
        {...sanitizeDomProps(rest)}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-2xl mb-4 last:mb-0 mt-6 first:mt-0 font-libre-baskerville'
        )}
      >
        {children}
      </Heading>
    ),
    [HEADING_KEYS.h4]: ({ attributes, children, className, ...rest }) => (
      <Heading
        as="h4"
        attributes={attributes}
        {...sanitizeDomProps(rest)}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-xl mb-4 last:mb-0 mt-6 first:mt-0 font-libre-baskerville'
        )}
      >
        {children}
      </Heading>
    ),

    /** Tailwind prose doesn't style h5 and h6 elements */
    [HEADING_KEYS.h5]: ({ attributes, children, className, ...rest }) => (
      <Heading
        as="h5"
        attributes={attributes}
        {...sanitizeDomProps(rest)}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-lg mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: '400' }}
      >
        {children}
      </Heading>
    ),
    [HEADING_KEYS.h6]: ({ attributes, children, className, ...rest }) => (
      <Heading
        as="h6"
        attributes={attributes}
        {...sanitizeDomProps(rest)}
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-base mb-4 last:mb-0 mt-6 first:mt-0'
        )}
        style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: '400' }}
      >
        {children}
      </Heading>
    ),
    [ParagraphPlugin.key]: ParagraphElement,
    [BlockquotePlugin.key]: BlockquoteElement,
    [CodeBlockPlugin.key]: CodeBlockElement,
    [CodeLinePlugin.key]: CodeLineElement,
    [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
    html: ({ attributes, element, children, className }) => {
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
    html_inline: ({ attributes, element, children, className }) => {
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
    [BulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
    [NumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
    [ListItemPlugin.key]: withProps(PlateElement, { as: 'li' }),
    [LinkPlugin.key]: LinkElement,
    [CodePlugin.key]: CodeLeaf,
    [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
    [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
    [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
    [HorizontalRulePlugin.key]: HrElement,
    [TableCellHeaderPlugin.key]: TableCellHeaderElement,
    [TableCellPlugin.key]: TableCellElement,
    [TablePlugin.key]: TableElement,
    [TableRowPlugin.key]: TableRowElement,
  };
};
