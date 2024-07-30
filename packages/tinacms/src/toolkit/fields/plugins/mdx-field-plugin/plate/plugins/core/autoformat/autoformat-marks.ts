import {
  type AutoformatRule,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
} from '@udecode/plate'

export const autoformatMarks: AutoformatRule[] = [
  {
    mode: 'mark',
    type: [MARK_BOLD, MARK_ITALIC],
    match: '***',
  },
  {
    mode: 'mark',
    type: MARK_BOLD,
    match: '**',
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '*',
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '_',
  },
  {
    mode: 'mark',
    type: MARK_CODE,
    match: '`',
  },
]
