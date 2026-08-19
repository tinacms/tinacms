import type * as Md from 'mdast';

/**
 * Reshape the tree so every hard break left in it is one markdown can express.
 * Order matters: a heading ending in a break would otherwise split into an
 * empty second heading.
 */
export const serializeBreaks = <T extends Md.Root>(tree: T): T => {
  walk(tree);
  return tree;
};

type Parent = { type?: string; children: unknown[] };

const isParent = (node: unknown): node is Parent =>
  Array.isArray((node as Parent | undefined)?.children);

/**
 * Blocks that hold phrasing content directly. Blockquotes and list items hold
 * paragraphs, which the walk reaches on its own.
 */
const PHRASING_BLOCKS = new Set(['paragraph', 'heading', 'tableCell']);

const walk = (node: Parent) => {
  if (PHRASING_BLOCKS.has(node.type ?? '')) {
    trimTrailingBreaks(node);
  }
  node.children = node.children.flatMap((child) =>
    isHeading(child) && child.depth > DEEPEST_SETEXT
      ? splitOnBreaks(child)
      : [child]
  );
  for (const child of node.children) {
    if (isParent(child)) {
      walk(child);
    }
  }
};

/**
 * A trailing backslash is a hard break in CommonMark only when another line
 * follows it in the same block. With nothing after it, `one\` reads back as a
 * literal backslash — the break is lost and a character the author never typed
 * enters the content as data (#5426).
 *
 * Representability here is positional, not type-based, so no list of container
 * types can express it. Only the last child can be in trailing position, so
 * descend through it — `**one\**` is dangling, `**one\** two` is not.
 */
const trimTrailingBreaks = ({ children }: Parent) => {
  let end = children.length;
  while (end > 0 && writesNothing(children[end - 1])) {
    end--;
  }
  let start = end;
  while (
    start > 0 &&
    (children[start - 1] as Parent | undefined)?.type === 'break'
  ) {
    start--;
  }
  // Leave the empty text nodes alone; a lone one is a deliberate spacer.
  children.splice(start, end - start);

  const last = children.at(-1);
  if (isParent(last)) {
    trimTrailingBreaks(last);
  }
};

/**
 * An empty text node writes nothing, so a break in front of one is still the
 * last thing in the block. The editor always produces that pair — Slate keeps a
 * text node after a trailing inline void — so skipping them is what makes this
 * fire on real editor output rather than only on hand-built trees.
 */
const writesNothing = (node: unknown) =>
  (node as Md.Text | undefined)?.type === 'text' &&
  (node as Md.Text).value === '';

const isHeading = (node: unknown): node is Md.Heading =>
  isParent(node) && node.type === 'heading';

/**
 * `#` and `##` have a setext form, so a break in them survives as a real break
 * in one heading. Files written by earlier versions already carry that shape,
 * and re-splitting them would restructure content that round-trips correctly
 * today, so leave those two levels alone.
 */
const DEEPEST_SETEXT = 2;

/**
 * `###` and deeper have no setext form. The break silently degrades to a space,
 * so the author's line break vanishes with no error.
 *
 * Split into headings of the same level instead. The content and the line break
 * both survive, the file keeps its ATX style, and the result is a fixed point
 * on the next save.
 */
const splitOnBreaks = (heading: Md.Heading): Md.Heading[] => {
  const segments: Md.Heading['children'][] = [[]];
  for (const child of heading.children) {
    if (child.type === 'break') {
      segments.push([]);
    } else {
      segments[segments.length - 1]?.push(child);
    }
  }
  // A segment of nothing but empty text would write a bare `###`.
  return segments
    .filter((children) => children.some((child) => !writesNothing(child)))
    .map((children) => ({ ...heading, children }));
};
