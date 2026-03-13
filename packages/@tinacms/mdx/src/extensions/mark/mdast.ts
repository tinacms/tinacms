/**
 * mdast utilities for `==highlight==` marks.
 *
 * `markFromMarkdown`  – converts micromark `highlight` tokens → mdast
 *                       `{ type: 'highlight', children: [...] }` nodes.
 *
 * `markToMarkdown`    – serialises mdast `highlight` nodes back to
 *                       `==text==`.
 */

import type {
  CompileContext,
  Extension as FromMarkdownExtension,
  Handle as FromMarkdownHandle,
} from 'mdast-util-from-markdown';
import type {
  ConstructName,
  Options as ToMarkdownExtension,
  Handle as ToMarkdownHandle,
} from 'mdast-util-to-markdown';
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing';
import { track } from 'mdast-util-to-markdown/lib/util/track';
import type { Parent, PhrasingContent } from 'mdast';

// ---------------------------------------------------------------------------
// Type augmentation so TypeScript knows about the `highlight` mdast node.
// ---------------------------------------------------------------------------

export interface Highlight extends Parent {
  type: 'highlight';
  children: PhrasingContent[];
}

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    highlight: Highlight;
  }
  interface PhrasingContentMap {
    highlight: Highlight;
  }
}

// ---------------------------------------------------------------------------
// Constructs that cannot contain highlight (mirrors the strikethrough list).
// ---------------------------------------------------------------------------

const constructsWithoutHighlight: ConstructName[] = [
  'autolink',
  'destinationLiteral',
  'destinationRaw',
  'reference',
  'titleQuote',
  'titleApostrophe',
];

// ---------------------------------------------------------------------------
// from-markdown extension
// ---------------------------------------------------------------------------

function enterHighlight(this: CompileContext, token: Parameters<FromMarkdownHandle>[0]) {
  this.enter({ type: 'highlight', children: [] } as Highlight, token);
}

function exitHighlight(this: CompileContext, token: Parameters<FromMarkdownHandle>[0]) {
  this.exit(token);
}

export const markFromMarkdown: FromMarkdownExtension = {
  canContainEols: ['highlight'],
  enter: { highlight: enterHighlight },
  exit: { highlight: exitHighlight },
};

// ---------------------------------------------------------------------------
// to-markdown extension
// ---------------------------------------------------------------------------

handleHighlight.peek = peekHighlight;

function handleHighlight(
  node: Highlight,
  _parent: Parameters<ToMarkdownHandle>[1],
  context: Parameters<ToMarkdownHandle>[2],
  safeOptions: Parameters<ToMarkdownHandle>[3]
): string {
  const tracker = track(safeOptions);
  const exit = context.enter('highlight' as ConstructName);
  let value = tracker.move('==');
  value += containerPhrasing(node as any, context, {
    ...tracker.current(),
    before: value,
    after: '=',
  });
  value += tracker.move('==');
  exit();
  return value;
}

function peekHighlight(): string {
  return '=';
}

export const markToMarkdown: ToMarkdownExtension = {
  unsafe: [
    {
      character: '=',
      after: '=',
      inConstruct: 'phrasing',
      notInConstruct: constructsWithoutHighlight,
    },
  ],
  handlers: { highlight: handleHighlight as ToMarkdownHandle },
};
