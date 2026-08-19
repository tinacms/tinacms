'use client';

import type { HeadingLevel } from '@tinacms/schema-tools';
import { createSlatePlugin } from '@udecode/plate';
import {
  AutoformatRule,
  autoformatArrow,
  autoformatLegal,
  autoformatMath,
  autoformatPunctuation,
  autoformatSmartQuotes,
} from '@udecode/plate-autoformat';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BasicMarksPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break/react';
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { ListStyleType } from '@udecode/plate-indent-list';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { unwrapList } from '@udecode/plate-list';
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
import { all, createLowlight } from 'lowlight';
import React from 'react';
import { LinkFloatingToolbar } from '../components/plate-ui/link-floating-toolbar';
import { isUrl } from '../transforms/is-url';
import { getAutoformatBlocks } from './core/autoformat/autoformat-block';
import { autoformatLists } from './core/autoformat/autoformat-lists';
import { autoformatMarks } from './core/autoformat/autoformat-marks';
import {
  createBreakPlugin,
  createHTMLInlinePlugin,
  createSoftBreakPlugin,
} from './create-html-block';
import { createHTMLBlockPlugin } from './create-html-block';
import createImgPlugin from './create-img-plugin';
import { createInvalidMarkdownPlugin } from './create-invalid-markdown-plugin';
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './create-mdx-plugins';
import { FloatingToolbarPlugin } from './ui/floating-toolbar-plugin';

export const HANDLES_MDX = [
  HEADING_KEYS.h1,
  HEADING_KEYS.h2,
  HEADING_KEYS.h3,
  HEADING_KEYS.h4,
  HEADING_KEYS.h5,
  HEADING_KEYS.h6,
  ParagraphPlugin.key,
];

const resetBlockTypesCommonRule = {
  defaultType: ParagraphPlugin.key,
  types: [...HEADING_LEVELS, BlockquotePlugin.key],
};

const resetBlockTypesCodeBlockRule = {
  types: [CodeBlockPlugin.key],
  defaultType: ParagraphPlugin.key,
  onReset: unwrapCodeBlock,
};

export const viewPlugins: any[] = [
  BasicMarksPlugin,
  UnderlinePlugin,
  HighlightPlugin,
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

const ClearHighlightOnEnterPlugin = createSlatePlugin({
  key: 'CLEAR_HIGHLIGHT_ON_ENTER',
}).overrideEditor(({ editor, tf: { insertBreak } }) => ({
  transforms: {
    insertBreak() {
      const keyboardEvent = editor.currentKeyboardEvent;
      const isPlainEnter =
        keyboardEvent?.key === 'Enter' &&
        !keyboardEvent.shiftKey &&
        !keyboardEvent.metaKey &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.altKey;
      const activeMarks = editor.api.marks();
      const hasHighlight = Boolean(
        activeMarks?.highlight || activeMarks?.highlightColor
      );

      insertBreak();

      if (!isPlainEnter || !hasHighlight) {
        return;
      }

      editor.tf.removeMark('highlight');
      editor.tf.removeMark('highlightColor');

      editor.tf.unsetNodes(['highlight', 'highlightColor'], {
        at: editor.selection ?? undefined,
        match: (node) => editor.api.isText(node),
      });
    },
  },
}));

export interface CreateEditorPluginsOptions {
  headingLevels?: readonly HeadingLevel[];
}

export const createEditorPlugins = ({
  headingLevels,
}: CreateEditorPluginsOptions = {}): any[] => [
  createMdxBlockPlugin,
  createMdxInlinePlugin,
  createImgPlugin,
  createHTMLBlockPlugin,
  createHTMLInlinePlugin,
  createSoftBreakPlugin,
  createInvalidMarkdownPlugin,
  CorrectNodeBehaviorPlugin,
  ClearHighlightOnEnterPlugin,
  LinkPlugin.configure({
    options: {
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
  TrailingBlockPlugin,
  createBreakPlugin,
  FloatingToolbarPlugin,

  AutoformatPlugin.configure({
    options: {
      enableUndoOnDelete: true,
      rules: [
        ...autoformatMarks,
        ...getAutoformatBlocks(headingLevels),
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

  ExitBreakPlugin.configure({
    options: {
      rules: [
        { hotkey: 'mod+enter' },
        { hotkey: 'mod+shift+enter', before: true },
        {
          hotkey: 'enter',
          query: { start: true, end: true, allow: HEADING_LEVELS },
        },
      ],
    },
  }),
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
          predicate: (editor) => editor.api.isAt({ start: true }),
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
          query: { allow: [CodeBlockPlugin.key, BlockquotePlugin.key] },
        },
      ],
    },
  }),
];
