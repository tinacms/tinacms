import { AutoformatRule } from '@platejs/autoformat';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
} from '@platejs/basic-nodes';

export const autoformatMarks: AutoformatRule[] = [
  {
    mode: 'mark',
    type: [BaseBoldPlugin.key, BaseItalicPlugin.key],
    match: '***',
  },
  {
    mode: 'mark',
    type: BaseBoldPlugin.key,
    match: '**',
  },
  {
    mode: 'mark',
    type: BaseItalicPlugin.key,
    match: '*',
  },
  {
    mode: 'mark',
    type: BaseItalicPlugin.key,
    match: '_',
  },
  {
    mode: 'mark',
    type: BaseCodePlugin.key,
    match: '`',
  },
  {
    mode: 'mark',
    type: BaseStrikethroughPlugin.key,
    match: ['~~', '~'],
  },
];
