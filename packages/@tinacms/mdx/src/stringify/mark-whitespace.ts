import type * as Md from 'mdast';

type Parent = { type?: string; children: Md.PhrasingContent[] };

const MARKS = new Set(['strong', 'emphasis', 'delete']);

/**
 * `toTinaMarkdown` drops the escape for spaces in phrasing content, so whitespace
 * this pass moves to a block boundary reaches the file verbatim — four of them
 * would open an indented code block. Whitespace already at the edge is the
 * author's, and is left alone.
 */
const BLOCK_BOUNDARIES = new Set(['paragraph', 'heading', 'tableCell']);

const asParent = (node: Md.PhrasingContent): Parent | null =>
  Array.isArray((node as Parent).children) ? (node as unknown as Parent) : null;

const isEmpty = (node: Md.PhrasingContent): boolean => {
  if (node.type === 'text') {
    return node.value === '';
  }
  const parent = asParent(node);
  return parent ? parent.children.every(isEmpty) : false;
};

/**
 * Removes the whitespace at one edge of a node and returns it, descending
 * through nested marks. Anything else — a link, an image, inline code — owns
 * its whitespace, so nothing is taken.
 */
const takeEdge = (node: Md.PhrasingContent, edge: 'lead' | 'trail'): string => {
  if (node.type === 'text') {
    const [whitespace = ''] =
      node.value.match(edge === 'lead' ? /^\s+/ : /\s+$/) ?? [];
    node.value =
      edge === 'lead'
        ? node.value.slice(whitespace.length)
        : node.value.slice(0, node.value.length - whitespace.length);
    return whitespace;
  }
  const parent = MARKS.has(node.type) ? asParent(node) : null;
  const child =
    edge === 'lead' ? parent?.children.at(0) : parent?.children.at(-1);
  return child ? takeEdge(child, edge) : '';
};

const mergeText = (children: Md.PhrasingContent[]): Md.PhrasingContent[] =>
  children.reduce<Md.PhrasingContent[]>((merged, child) => {
    const previous = merged.at(-1);
    if (child.type === 'text' && previous?.type === 'text') {
      previous.value += child.value;
      return merged;
    }
    merged.push(child);
    return merged;
  }, []);

const hoistFromMarks = (node: Parent) => {
  const hoisted: Md.PhrasingContent[] = [];
  const fromHoist = new Set<Md.PhrasingContent>();
  const hoist = (value: string) => {
    const text: Md.PhrasingContent = { type: 'text', value };
    fromHoist.add(text);
    hoisted.push(text);
  };

  for (const child of node.children) {
    if (!MARKS.has(child.type)) {
      hoisted.push(child);
      continue;
    }
    const lead = takeEdge(child, 'lead');
    const trail = takeEdge(child, 'trail');
    if (isEmpty(child)) {
      hoist(lead + trail);
      continue;
    }
    if (lead) {
      hoist(lead);
    }
    hoisted.push(child);
    if (trail) {
      hoist(trail);
    }
  }

  if (node.type && BLOCK_BOUNDARIES.has(node.type)) {
    for (const edge of [hoisted.at(0), hoisted.at(-1)]) {
      if (edge && fromHoist.has(edge)) {
        (edge as Md.Text).value = '';
      }
    }
  }
  node.children = mergeText(hoisted);
};

/**
 * Marks created in the editor can hold leading or trailing whitespace — a word
 * selected along with the space after it. Markdown emphasis markers cannot sit
 * next to whitespace, so that whitespace is moved out of the mark and marks
 * left with nothing are dropped. Mutates the tree in place.
 */
export const normalizeMarkWhitespace = (tree: Md.Root): Md.Root => {
  const visit = (node: Parent) => {
    node.children.forEach((child) => {
      const parent = asParent(child);
      if (parent) {
        visit(parent);
      }
    });
    hoistFromMarks(node);
  };
  visit(tree as unknown as Parent);
  return tree;
};
