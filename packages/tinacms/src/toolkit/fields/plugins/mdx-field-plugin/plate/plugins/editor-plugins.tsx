'use client';

import { createSlatePlugin } from '@udecode/plate';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BasicMarksPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  BulletedListPlugin,
  ListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { ParagraphPlugin } from '@udecode/plate/react';
import React from 'react';
import { LinkFloatingToolbar } from '../components/plate-ui/link-floating-toolbar';
import { isUrl } from '../transforms/is-url';
import createImgPlugin from './create-img-plugin';
import { createInvalidMarkdownPlugin } from './create-invalid-markdown-plugin';
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './create-mdx-plugins';
import { FloatingToolbarPlugin } from './ui/floating-toolbar-plugin';
import {
  autoformatArrow,
  autoformatLegal,
  autoformatMath,
  autoformatPunctuation,
  AutoformatRule,
  autoformatSmartQuotes,
} from '@udecode/plate-autoformat';
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import { ListStyleType } from '@udecode/plate-indent-list';
import { unwrapList } from '@udecode/plate-list';
// @ts-ignore
// NOTE: Linter complains about ESM import here, as per conversation with Jeff it will be fine at build time—ignore this linting error for now.
import { all, createLowlight } from 'lowlight';
import { autoformatBlocks } from './core/autoformat/autoformat-block';
import { autoformatLists } from './core/autoformat/autoformat-lists';
import { autoformatMarks } from './core/autoformat/autoformat-marks';
import {
  createBlockquoteEnterBreakPlugin,
  createBreakPlugin,
  createHTMLInlinePlugin,
} from './create-html-block';
import { createHTMLBlockPlugin } from './create-html-block';

// Define block types that support MDX embedding
export const HANDLES_MDX = [
  HEADING_KEYS.h1,
  HEADING_KEYS.h2,
  HEADING_KEYS.h3,
  HEADING_KEYS.h4,
  HEADING_KEYS.h5,
  HEADING_KEYS.h6,
  ParagraphPlugin.key,
];

// Common rule for resetting block types
const resetBlockTypesCommonRule = {
  defaultType: ParagraphPlugin.key,
  types: [...HEADING_LEVELS, BlockquotePlugin.key],
};

const resetBlockTypesCodeBlockRule = {
  types: [CodeBlockPlugin.key],
  defaultType: ParagraphPlugin.key,
  onReset: unwrapCodeBlock,
};

// View Plugins: Basic nodes and marks
export const viewPlugins = [
  BasicMarksPlugin,
  UnderlinePlugin,
  HeadingPlugin.configure({ options: { levels: 6 } }),
  ParagraphPlugin,
  CodeBlockPlugin.configure({
    options: { lowlight: createLowlight(all) },
  }),
  BlockquotePlugin,
] as const;

const CorrectNodeBehaviorPlugin = createSlatePlugin({
  key: 'WITH_CORRECT_NODE_BEHAVIOR',
});

// Editor Plugins: Functional and formatting plugins
export const editorPlugins = [
  createMdxBlockPlugin,
  createMdxInlinePlugin,
  createImgPlugin,
  createHTMLBlockPlugin,
  createHTMLInlinePlugin,
  createBlockquoteEnterBreakPlugin,
  createInvalidMarkdownPlugin,
  CorrectNodeBehaviorPlugin,
  LinkPlugin.configure({
    options: {
      // Custom validation function to allow relative links, e.g., /about
      isUrl: (url) => isUrl(url),
    },
    render: { afterEditable: () => <LinkFloatingToolbar /> },
  }),

  ...viewPlugins,
  ListPlugin,
  IndentListPlugin,
  HorizontalRulePlugin,
  NodeIdPlugin,
  TablePlugin,
  SlashPlugin,
  // This lets users keep typing after end of marks like headings or quotes
  TrailingBlockPlugin, //makes sure there's always a blank paragraph at the end of the editor.
  createBreakPlugin,
  FloatingToolbarPlugin,

  AutoformatPlugin.configure({
    options: {
      enableUndoOnDelete: true,
      rules: [
        ...autoformatMarks,
        ...autoformatBlocks,
        ...autoformatLists,
        ...autoformatSmartQuotes,
        ...autoformatPunctuation,
        ...autoformatLegal,
        ...autoformatArrow,
        ...autoformatMath,
      ].map(
        (rule): AutoformatRule => ({
          ...rule,
          query: (editor) =>
            !editor.api.some({
              match: { type: editor.getType(CodeBlockPlugin) },
            }),
        })
      ),
    },
  }),

  // ExitBreakPlugin lets users "break out" of a block (like a heading)
  ExitBreakPlugin.configure({
    options: {
      rules: [
        {
          hotkey: 'mod+enter',
        },
        {
          hotkey: 'mod+shift+enter',
          before: true,
        },
        {
          hotkey: 'enter',
          query: {
            start: true,
            end: true,
            allow: HEADING_LEVELS,
          },
        },
      ],
    },
  }),
  // ResetNodePlugin lets users turn a heading back into a paragraph by pressing Enter (when empty) or Backspace (at the start).
  ResetNodePlugin.configure({
    options: {
      rules: [
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Enter',
          predicate: (editor) =>
            editor.api.isEmpty(editor.selection, { block: true }),
        },
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Backspace',
          predicate: (editor) => {
            return editor.api.isAt({ start: true });
          },
        },
        {
          ...resetBlockTypesCodeBlockRule,
          hotkey: 'Enter',
          predicate: isCodeBlockEmpty,
        },
        {
          ...resetBlockTypesCodeBlockRule,
          hotkey: 'Backspace',
          predicate: isSelectionAtCodeBlockStart,
        },
        // NOTE: Plate's ListPlugin usually handles resetting lists to paragraphs when pressing Backspace at the start of a list item.
        // However, if the list is the first node in the editor, the default reset behavior may not fully unwrap the list item,
        // which can leave an invalid structure (like a <li> inside a <p>).
        // This rule uses `onReset: unwrapList` to ensure lists are always properly reset to paragraphs, even when they are the first node.
        {
          types: [BulletedListPlugin.key, NumberedListPlugin.key],
          defaultType: ParagraphPlugin.key,
          hotkey: 'Backspace',
          predicate: (editor) => editor.api.isAt({ start: true }),
          onReset: unwrapList,
        },
      ],
    },
  }),
  SoftBreakPlugin.configure({
    options: {
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [CodeBlockPlugin.key, BlockquotePlugin.key],
          },
        },
      ],
    },
  }),
] as const;
