import { BasicMarksPlugin, UnderlinePlugin } from '@udecode/plate-basic-marks/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { ParagraphPlugin } from '@udecode/plate/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ListPlugin } from '@udecode/plate-list/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { TablePlugin } from '@udecode/plate-table/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';


export const viewPlugins = [
  BasicMarksPlugin,
  HeadingPlugin.configure({ options: { levels: 3 } }),
  ParagraphPlugin,
  CodeBlockPlugin,
  BlockquotePlugin,
  UnderlinePlugin,
] as const;

//
// 👉 Editor Plugins (includes functionality-specific plugins)
//
export const editorPlugins = [
  ...viewPlugins,
  ListPlugin,
  IndentListPlugin,
  HorizontalRulePlugin,
  NodeIdPlugin,
  TablePlugin,
  SlashPlugin,
] as const;