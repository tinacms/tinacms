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

/** The character each mark's delimiters are written with; equal ones join into one run. */
const MARKERS: Record<string, string> = {
  strong: '*',
  emphasis: '*',
  delete: '~',
};

/** Tags, brackets, backticks and other markers: all punctuation to the flanking rules. */
const NOT_TEXT = '<';

const isPunctuation = (char: string | undefined) =>
  !!char && /[\p{P}\p{S}]/u.test(char);

const isWordChar = (char: string | undefined) =>
  !!char && !/\s/u.test(char) && !isPunctuation(char);

const edgeChild = (node: Parent, edge: 'lead' | 'trail') =>
  edge === 'lead' ? node.children.at(0) : node.children.at(-1);

/**
 * The character written at one edge of `node`, looking through marks drawn
 * with `marker` since their delimiters join the same run.
 */
const contentEdge = (
  node: Md.PhrasingContent | undefined,
  edge: 'lead' | 'trail',
  marker?: string
): string | undefined => {
  if (!node) {
    return undefined;
  }
  if (node.type === 'text') {
    const chars = Array.from(node.value);
    return edge === 'lead' ? chars.at(0) : chars.at(-1);
  }
  const parent = asParent(node);
  if (parent && marker && MARKERS[node.type] === marker) {
    return contentEdge(edgeChild(parent, edge), edge, marker);
  }
  return MARKERS[node.type] ?? NOT_TEXT;
};

const characterReference = (char: string): Md.HTML => ({
  type: 'html',
  value: `&#x${char.codePointAt(0)?.toString(16).toUpperCase()};`,
});

/** Rewrites the character `contentEdge` finds as a character reference. */
const encodeEdge = (
  node: Md.PhrasingContent,
  edge: 'lead' | 'trail',
  marker?: string
): Md.PhrasingContent[] => {
  if (node.type === 'text') {
    const chars = Array.from(node.value);
    const char = (edge === 'lead' ? chars.shift() : chars.pop()) ?? '';
    const rest: Md.Text[] = chars.length
      ? [{ type: 'text', value: chars.join('') }]
      : [];
    return edge === 'lead'
      ? [characterReference(char), ...rest]
      : [...rest, characterReference(char)];
  }
  const parent = asParent(node);
  const child = parent && edgeChild(parent, edge);
  if (parent && child && marker && MARKERS[node.type] === marker) {
    const encoded = encodeEdge(child, edge, marker);
    parent.children =
      edge === 'lead'
        ? [...encoded, ...parent.children.slice(1)]
        : [...parent.children.slice(0, -1), ...encoded];
  }
  return [node];
};

/**
 * A delimiter run only closes when it isn't sandwiched between punctuation
 * before it and a letter after it, and only opens in the mirror case. Mark
 * edges are often punctuation (`.`, or the `>` of a `<mark>`), so `*a.*b`,
 * `x*.a*` and `*<mark>…</mark>***b**` would all lose a mark on reload, or
 * inside a JSX element fail to parse. The offending letter is written as a
 * character reference (`*a.*&#x62;`), which reads back as the same text.
 */
const encodeFlankingNeighbours = (node: Parent): boolean => {
  let changed = false;
  for (let index = 0; index < node.children.length - 1; index++) {
    const left = node.children[index];
    const right = node.children[index + 1];
    if (!left || !right) {
      continue;
    }
    const leftMarker = MARKERS[left.type];
    const rightMarker = MARKERS[right.type];
    if (!leftMarker && !rightMarker) {
      continue;
    }
    const joined = leftMarker === rightMarker;
    const before = contentEdge(left, 'trail', leftMarker);
    const after = contentEdge(
      right,
      'lead',
      joined || !leftMarker ? rightMarker : undefined
    );
    const closes = !!leftMarker;
    const opens = !!rightMarker && (joined || !leftMarker);
    if (closes && isPunctuation(before) && isWordChar(after)) {
      node.children.splice(
        index + 1,
        1,
        ...encodeEdge(right, 'lead', joined ? rightMarker : undefined)
      );
      changed = true;
    } else if (opens && isWordChar(before) && isPunctuation(after)) {
      node.children.splice(index, 1, ...encodeEdge(left, 'trail', leftMarker));
      changed = true;
    }
  }
  return changed;
};

const encodeTree = (node: Parent): boolean =>
  node.children.reduce((changed, child) => {
    const parent = asParent(child);
    return (parent ? encodeTree(parent) : false) || changed;
  }, false) || encodeFlankingNeighbours(node);

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
  };
  visit(tree as unknown as Parent);
  // An encoded letter can be the far edge of its mark, or sit inside a mark
  // already checked, so repeat until stable. Each change turns a letter into
  // punctuation, so this ends.
  while (encodeTree(tree as unknown as Parent)) {}
  return tree;
};
