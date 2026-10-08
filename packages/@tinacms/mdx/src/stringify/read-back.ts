import type { RichTextField } from '@tinacms/schema-tools';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';

const FORMATTING = ['bold', 'italic', 'strikethrough', 'code'] as const;

/** Raw HTML is written as-is and may read back as formatted text. */
const OPAQUE = new Set(['html', 'html_inline']);

type Character = { char: string; key: string };

/** Text between raw HTML, which is skipped when comparing. */
type Run = Character[];

type Node = {
  type?: string;
  text?: unknown;
  children?: unknown;
  props?: { children?: { children?: unknown } };
};

/**
 * Walks `children` only. Component props are left out: rich text inside them
 * is checked on its own when it's written, and the rest isn't formatted text.
 * A rich-text prop named `children` is the exception, as it's written inline.
 */
const collect = (nodes: Node[], runs: Run[]) => {
  for (const node of nodes) {
    if (OPAQUE.has(node.type ?? '')) {
      runs.push([]);
    } else if (Array.isArray(node.children)) {
      collect(node.children, runs);
      const inline = node.props?.children?.children;
      if (Array.isArray(inline)) {
        collect(inline, runs);
      }
    } else if (typeof node.text === 'string') {
      const leaf = node as Plate.TextElement;
      const formatting = FORMATTING.filter((mark) => leaf[mark]).join();
      const run = runs.at(-1);
      for (const char of leaf.text) {
        run?.push({
          char,
          key: /\s/u.test(char) ? '' : `${char}\u0001${formatting}\u0002`,
        });
      }
    }
  }
};

/**
 * Every character in a document's own text, in order, with the formatting
 * markdown writes as delimiters, split into runs at raw HTML.
 */
export const charactersOf = (nodes: Node[] = []): Run[] => {
  const runs: Run[] = [[]];
  collect(nodes, runs);
  return runs;
};

/** Whitespace is left out: saving deliberately moves it out of marks and off block edges. */
const keyOf = (run: Run) => run.map(({ key }) => key).join('');

/** Where `run` stops matching `read` at `from`, as an index into `run`. */
const divergence = (run: Run, read: string, from: number) => {
  let offset = from;
  const index = run.findIndex(({ key }) => {
    if (!read.startsWith(key, offset)) {
      return true;
    }
    offset += key.length;
    return false;
  });
  return index === -1 ? run.length : index;
};

/** The first written character `read` doesn't match, if any. */
const firstMismatch = (
  written: Run[],
  read: string
): { run: Run; index: number } | undefined => {
  const first = written[0] ?? [];
  const last = written.at(-1) ?? [];
  if (written.length === 1) {
    return keyOf(first) === read
      ? undefined
      : { run: first, index: divergence(first, read, 0) };
  }
  if (!read.startsWith(keyOf(first))) {
    return { run: first, index: divergence(first, read, 0) };
  }
  let from = keyOf(first).length;
  for (const run of written.slice(1, -1)) {
    const at = read.indexOf(keyOf(run), from);
    if (at === -1) {
      return { run, index: divergence(run, read, from) };
    }
    from = at + keyOf(run).length;
  }
  const tail = read.length - keyOf(last).length;
  if (tail >= from && read.endsWith(keyOf(last))) {
    return undefined;
  }
  return { run: last, index: divergence(last, read, Math.max(from, tail)) };
};

/**
 * The older markdown parser reads some bold, italic and strikethrough edges
 * differently from how they were written, e.g. a mark ending in punctuation
 * right before a letter. Rather than save text that reloads changed, the save
 * is refused with the text to fix.
 */
export const assertReadsBack = (
  written: Run[],
  markdown: string,
  field: RichTextField,
  withoutFormatting: () => string
) => {
  const { children } = parseMDX(markdown, field, (url) => url);
  const loads = (nodes: Node[]) => nodes[0]?.type !== 'invalid_markdown';
  if (
    !loads(children) &&
    !loads(parseMDX(withoutFormatting(), field, (url) => url).children)
  ) {
    // The text itself hits an older escaping gap that formatting has no part
    // in; refusing would only lock the document.
    return;
  }
  const read = charactersOf(children).map(keyOf).join('');
  const mismatch = firstMismatch(written, read);
  if (!mismatch) {
    return;
  }
  const { run, index } = mismatch;
  const excerpt = run
    .slice(Math.max(0, index - 15), index + 15)
    .map(({ char }) => char)
    .join('')
    .trim();
  const [first] = children;
  if (first?.type === 'invalid_markdown') {
    throw new Error(
      `This text can't be saved yet, it wouldn't load again (${first.message}). Check the text and its bold, italic or strikethrough around "${excerpt}".`
    );
  }
  throw new Error(
    `This formatting can't be saved yet, it would change when the page reloads. Adjust the bold, italic or strikethrough around "${excerpt}", for example by ending it before the punctuation.`
  );
};
