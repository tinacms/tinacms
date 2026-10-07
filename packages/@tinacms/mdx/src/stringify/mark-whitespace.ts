import type * as Md from 'mdast';

type Parent = { type?: string; children: Md.PhrasingContent[] };

const MARKS = new Set(['strong', 'emphasis', 'delete']);

/**
 * Whitespace this pass moves to a block edge was never at the edge in the
 * editor: at the start of a paragraph it reloads as indentation nobody typed,
 * and in a table cell it widens the column on every save. It is cleared there.
 * Whitespace already at the edge is the author's, and is left alone.
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
  const fromHoist = new Set<Md.Text>();
  const hoist = (value: string) => {
    const text: Md.Text = { type: 'text', value };
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
      if (edge?.type === 'text' && fromHoist.has(edge)) {
        edge.value = '';
      }
    }
  }
  // Runs after the edge clearing: merging discards the node identity `fromHoist`
  // is keyed on, so an earlier merge makes every edge look like the author's.
  node.children = mergeText(hoisted);
};

const isPunctuation = (char: string | undefined) =>
  !!char && /[\p{P}\p{S}]/u.test(char);

const isWordChar = (char: string | undefined) =>
  !!char && !/\s/u.test(char) && !isPunctuation(char);

/** The first or last character written for `node`; delimiters and tags are punctuation. */
const writtenEdge = (
  node: Md.PhrasingContent | undefined,
  edge: 'lead' | 'trail'
) => {
  if (node?.type !== 'text') {
    return node ? '*' : undefined;
  }
  const chars = Array.from(node.value);
  return edge === 'lead' ? chars.at(0) : chars.at(-1);
};

const characterReference = (char: string) =>
  `&#x${char.codePointAt(0)?.toString(16).toUpperCase()};`;

/**
 * Writes the letter beside a mark as a character reference when the mark's
 * own edge is punctuation. Otherwise `*a.*b` can't close (and `x*.a*` can't
 * open), so the mark is lost on reload, or inside a JSX element the whole
 * document fails to parse. `*a.*&#x62;` reads back as the same text.
 */
const encodeFlankingNeighbours = (node: Parent) => {
  const encoded: Md.PhrasingContent[] = [];
  node.children.forEach((child, index) => {
    const previous = encoded.at(-1);
    const next = node.children[index + 1];
    const mark = MARKS.has(child.type) ? asParent(child) : null;
    if (!mark) {
      encoded.push(child);
      return;
    }
    if (
      previous?.type === 'text' &&
      isWordChar(writtenEdge(previous, 'trail')) &&
      isPunctuation(writtenEdge(mark.children.at(0), 'lead'))
    ) {
      const chars = Array.from(previous.value);
      const last = chars.pop() ?? '';
      previous.value = chars.join('');
      encoded.push({ type: 'html', value: characterReference(last) });
    }
    encoded.push(child);
    if (
      next?.type === 'text' &&
      isWordChar(writtenEdge(next, 'lead')) &&
      isPunctuation(writtenEdge(mark.children.at(-1), 'trail'))
    ) {
      const [first = '', ...rest] = Array.from(next.value);
      next.value = rest.join('');
      encoded.push({ type: 'html', value: characterReference(first) });
    }
  });
  node.children = encoded;
};

/**
 * Marks created in the editor can hold leading or trailing whitespace — a word
 * selected along with the space after it. Markdown emphasis markers cannot sit
 * next to whitespace, so that whitespace is moved out of the mark and marks
 * left with nothing are dropped. Letters that would stop a mark opening or
 * closing are then encoded (see `encodeFlankingNeighbours`). Mutates the tree
 * in place.
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
    encodeFlankingNeighbours(node);
  };
  visit(tree as unknown as Parent);
  return tree;
};
