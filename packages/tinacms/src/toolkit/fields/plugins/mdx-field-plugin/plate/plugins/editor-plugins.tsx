"use client";

import {
  BasicMarksPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { HeadingPlugin } from "@udecode/plate-heading/react";
import { ParagraphPlugin } from "@udecode/plate/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { ListPlugin } from "@udecode/plate-list/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { TablePlugin } from "@udecode/plate-table/react";
import { SlashPlugin } from "@udecode/plate-slash-command/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";
import { AutoformatPlugin } from "@udecode/plate-autoformat/react";
import { ExitBreakPlugin, SoftBreakPlugin } from "@udecode/plate-break/react";
import { autoformatRules } from "./core/autoformat/autoformat-rules";
import { HEADING_KEYS, HEADING_LEVELS } from "@udecode/plate-heading";
import { LinkPlugin } from "@udecode/plate-link/react";
import { isUrl } from "../transforms/is-url";
import { LinkFloatingToolbar } from "../components/plate-ui/link-floating-toolbar";
import React from "react";
import { ResetNodePlugin } from "@udecode/plate-reset-node/react";
import { createInvalidMarkdownPlugin } from "./create-invalid-markdown-plugin";
import createImgPlugin from "./create-img-plugin";
import { createMdxBlockPlugin, createMdxInlinePlugin } from "./create-mdx-plugins";
import { createMermaidPlugin } from "./custom/mermaid-plugin";

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
  types: [
    BlockquotePlugin.key,
    HEADING_KEYS.h1,
    HEADING_KEYS.h2,
    HEADING_KEYS.h3,
    HEADING_KEYS.h4,
    HEADING_KEYS.h5,
    HEADING_KEYS.h6,
  ],
  defaultType: ParagraphPlugin.key,
};

// View Plugins: Basic nodes and marks
export const viewPlugins = [
  BasicMarksPlugin,
  UnderlinePlugin,
  HeadingPlugin.configure({ options: { levels: 6 } }),
  ParagraphPlugin,
  CodeBlockPlugin,
  BlockquotePlugin,
] as const;

// Editor Plugins: Functional and formatting plugins
export const editorPlugins = [
  createMdxBlockPlugin,
  createMdxInlinePlugin,
  createImgPlugin,
  createMermaidPlugin,
  createInvalidMarkdownPlugin,
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
  TrailingBlockPlugin,
  AutoformatPlugin.configure({
    options: {
      rules: autoformatRules,
    },
  }),
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
  ResetNodePlugin.configure({
    options: {
      rules: [
        {
          ...resetBlockTypesCommonRule,
          hotkey: "Enter",
          predicate: (editor) =>
            editor.api.isEmpty(editor.selection, { block: true }),
        },
        {
          ...resetBlockTypesCommonRule,
          hotkey: "Backspace",
          predicate: (editor) => editor.api.isAt({ start: true }),
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
