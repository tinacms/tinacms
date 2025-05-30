"use client";

import { createSlatePlugin } from "@udecode/plate";
import { AutoformatPlugin } from "@udecode/plate-autoformat/react";
import {
  BasicMarksPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { ExitBreakPlugin, SoftBreakPlugin } from "@udecode/plate-break/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { HEADING_KEYS, HEADING_LEVELS } from "@udecode/plate-heading";
import { HeadingPlugin } from "@udecode/plate-heading/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import { ListPlugin } from "@udecode/plate-list/react";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { ResetNodePlugin } from "@udecode/plate-reset-node/react";
import { SlashPlugin } from "@udecode/plate-slash-command/react";
import { TablePlugin } from "@udecode/plate-table/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";
import { ParagraphPlugin } from "@udecode/plate/react";
import React from "react";
import { LinkFloatingToolbar } from "../components/plate-ui/link-floating-toolbar";
import { isUrl } from "../transforms/is-url";
import createImgPlugin from "./create-img-plugin";
import { createInvalidMarkdownPlugin } from "./create-invalid-markdown-plugin";
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from "./create-mdx-plugins";
import { FloatingToolbarPlugin } from "./ui/floating-toolbar-plugin";
// NOTE: Linter complains about ESM import here, as per conversation with Jeff it will be fine at build time—ignore this linting error for now.
import { isCodeBlockEmpty, isSelectionAtCodeBlockStart, unwrapCodeBlock } from "@udecode/plate-code-block";
import { all, createLowlight } from "lowlight";
import { AutoformatRule } from "@udecode/plate-autoformat";
import { autoformatArrow, autoformatMath } from "@udecode/plate-autoformat";
import { autoformatLegal, autoformatPunctuation } from "@udecode/plate-autoformat";
import { autoformatMarks } from "./core/autoformat/autoformat-marks";
import { autoformatBlocks } from "./core/autoformat/autoformat-block";
import { autoformatSmartQuotes } from "@udecode/plate-autoformat";
import { autoformatLists } from "./core/autoformat/autoformat-lists";
import { INDENT_LIST_KEYS, ListStyleType } from '@udecode/plate-indent-list';

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
  types: [
    ...HEADING_LEVELS,
    BlockquotePlugin.key,
    ListStyleType.Disc,
    ListStyleType.Decimal,
  ],
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
  key: "WITH_CORRECT_NODE_BEHAVIOR",
});

// Editor Plugins: Functional and formatting plugins
export const editorPlugins = [
  createMdxBlockPlugin,
  createMdxInlinePlugin,
  createImgPlugin,
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

  // TrailingBlockPlugin makes sure there's always a blank paragraph at the end of the editor.
  // This lets users keep typing after end of marks like headings or quotes

  TrailingBlockPlugin,
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
  
  // ExitBreakPlugin lets users “break out” of a block (like a heading)
  ExitBreakPlugin.configure({
    options: {
      rules: [
        {
          hotkey: "mod+enter",
        },
        {
          hotkey: "mod+shift+enter",
          before: true,
        },
        {
          hotkey: "enter",
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
      ],
    },
  }),
  SoftBreakPlugin.configure({
    options: {
      rules: [
        { hotkey: "shift+enter" },
        {
          hotkey: "enter",
          query: {
            allow: [CodeBlockPlugin.key, BlockquotePlugin.key],
          },
        },
      ],
    },
  }),
] as const;
