'use client';

import type { Value } from '@udecode/plate';

import { withProps } from '@udecode/cn';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HeadingPlugin, TocPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { SlashInputPlugin } from '@udecode/plate-slash-command/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import {
  type CreatePlateEditorOptions,
  ParagraphPlugin,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate/react';
import { editorPlugins } from '../plugins/editor-plugins';
import { withPlaceholders } from '../components/placeholder';

export const useCreateEditor = ({
  plugins,
  value,
  components = {},
}: {
  plugins: any[];
  value: Value;
  components?:  Record<string, any>;
}) => {
  return usePlateEditor<Value, typeof plugins[number]>(
    {
      plugins,
      value,
      override: {
        components,
      },
    },
    []
  );
};