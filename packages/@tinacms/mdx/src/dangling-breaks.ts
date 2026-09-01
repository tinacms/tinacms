import type * as Md from 'mdast';

/**
 * A trailing backslash is a hard break in CommonMark only when another line
 * follows it in the same block. With nothing after it, `one\` reads back as a
 * literal backslash, so the break is lost and a character the author never
 * typed enters the content as data (#5426). Reshapes in place.
 */
export const dropDanglingBreaks = <T extends Md.Root>(tree: T): T => {
  walk(tree);
  return tree;
};

/** Blockquotes and list items hold paragraphs, which the walk reaches anyway. */
const BLOCKS = new Set(['paragraph', 'heading', 'tableCell']);

type Parent = { type?: string; children: unknown[] };

const isParent = (node: unknown): node is Parent =>
  Array.isArray((node as Parent | undefined)?.children);

const walk = (node: Parent) => {
  // What sits after a break is a local question, so it holds at any inline
  // depth. Only "trailing" needs the block gate — `**one\** two` is not dangling.
  dropBreaksBeforeLineStartSensitive(node.children);
  if (BLOCKS.has(node.type ?? '')) {
    trimTrailingBreaks(node);
  }
  for (const child of node.children) {
    if (isParent(child)) {
      walk(child);
    }
  }
};

/**
 * A break puts whatever follows it at the start of a line, and these two read
 * differently there:
 *
 * - raw HTML — `toMarkdown` will not let `<` open a line, so it rewrites the
 *   break to `\` plus a space, which reads back as a literal backslash;
 * - an inline MDX element — at line start it parses as flow, so the element is
 *   promoted out of the paragraph, or writes nothing at all when no template
 *   matches it, leaving the `\` dangling.
 *
 * Either way the break has no representable form in front of one, so drop it
 * rather than write a character the author never typed.
 */
const dropBreaksBeforeLineStartSensitive = (children: unknown[]) => {
  for (let index = children.length - 1; index >= 0; index--) {
    if (!isBreak(children[index])) {
      continue;
    }
    const next = children
      .slice(index + 1)
      .find((sibling) => !writesNothing(sibling));
    const type = (next as Parent | undefined)?.type;
    if (type === 'html') {
      // Raw HTML always writes, so keep the word separation the break gave —
      // unless what precedes it already ends in whitespace, where a second
      // space would only churn the author's file.
      const before = children[index - 1] as Md.Text | undefined;
      const spaced = before?.type === 'text' && /[ \t]$/.test(before.value);
      children.splice(
        index,
        1,
        ...(spaced ? [] : [{ type: 'text', value: ' ' }])
      );
    } else if (type === 'mdxJsxTextElement') {
      // An inline element with no matching template writes nothing at all, so a
      // space here would just be trailing whitespace.
      children.splice(index, 1);
    }
  }
};

/** Slate keeps one of these after a trailing inline void, and it writes nothing. */
const writesNothing = (node: unknown) =>
  (node as Md.Text | undefined)?.type === 'text' &&
  (node as Md.Text).value === '';

const isBreak = (node: unknown) =>
  (node as { type?: string } | undefined)?.type === 'break';

/**
 * Walks back over breaks and the empty text nodes between them, in any order:
 * two shift+Enters leave `[break, text(''), break, text('')]`, so a single pass
 * of each would strip one break and leave the other dangling.
 *
 * Descends through the last child that writes something — the spacer after it
 * is not it — so `**one\**` and `[one\](/x)` are both dangling, while
 * `**one\** two` is not.
 */
const trimTrailingBreaks = ({ children }: Parent) => {
  let index = children.length;
  const trailing: number[] = [];
  while (index > 0) {
    const child = children[index - 1];
    if (isBreak(child)) {
      trailing.push(index - 1);
    } else if (!writesNothing(child)) {
      break;
    }
    index--;
  }
  // Descending indices, so each splice leaves the rest addressable. Only the
  // breaks go; a lone empty text node is a deliberate spacer.
  for (const at of trailing) {
    children.splice(at, 1);
  }

  const last = children[index - 1];
  if (isParent(last)) {
    trimTrailingBreaks(last);
  }
};
