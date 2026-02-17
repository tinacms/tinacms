import { AutoformatRule } from '@platejs/autoformat';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
} from '@platejs/basic-nodes';

export const autoformatMarks: AutoformatRule[] = [
  {
    mode: 'mark',
    type: [BoldPlugin.key, ItalicPlugin.key],
    match: '***',
  },
  {
    mode: 'mark',
    type: BoldPlugin.key,
    match: '**',
  },
  {
    mode: 'mark',
    type: ItalicPlugin.key,
    match: '*',
  },
  {
    mode: 'mark',
    type: ItalicPlugin.key,
    match: '_',
  },
  {
    mode: 'mark',
    type: CodePlugin.key,
    match: '`',
  },
  {
    mode: 'mark',
    type: StrikethroughPlugin.key,
    match: ['~~', '~'],
  },
];
