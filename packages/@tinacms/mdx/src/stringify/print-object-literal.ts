import emojiRegex from 'emoji-regex';
import esutils from 'esutils';

/**
 * Prints a JSON-compatible value the way prettier 2.8.8 printed
 * `const dummyFunc = ${JSON.stringify(value)}` under
 * `{ parser: 'acorn', trailingComma: 'none', semi: false }`, then stripped the
 * `const dummyFunc = ` prefix.
 *
 * The result is written verbatim into user content files, so any deviation
 * rewrites object properties across every repository that saves a document.
 * `print-object-literal.test.ts` holds prettier as a differential oracle.
 */

const PRINT_WIDTH = 80;
const TAB_WIDTH = 2;
const PREFIX = 'const dummyFunc = ';
const MIN_OVERLAP_FOR_BREAK = 3;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/* ── string width (prettier's getStringWidth → string-width@4) ───────────── */

const ANSI_PATTERN = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
].join('|');
const NOT_ASCII = /[^\x20-\x7F]/;

const isFullwidthCodePoint = (codePoint: number) =>
  codePoint >= 0x1100 &&
  (codePoint <= 0x115f ||
    codePoint === 0x2329 ||
    codePoint === 0x232a ||
    (0x2e80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303f) ||
    (0x3250 <= codePoint && codePoint <= 0x4dbf) ||
    (0x4e00 <= codePoint && codePoint <= 0xa4c6) ||
    (0xa960 <= codePoint && codePoint <= 0xa97c) ||
    (0xac00 <= codePoint && codePoint <= 0xd7a3) ||
    (0xf900 <= codePoint && codePoint <= 0xfaff) ||
    (0xfe10 <= codePoint && codePoint <= 0xfe19) ||
    (0xfe30 <= codePoint && codePoint <= 0xfe6b) ||
    (0xff01 <= codePoint && codePoint <= 0xff60) ||
    (0xffe0 <= codePoint && codePoint <= 0xffe6) ||
    (0x1b000 <= codePoint && codePoint <= 0x1b001) ||
    (0x1f200 <= codePoint && codePoint <= 0x1f251) ||
    (0x20000 <= codePoint && codePoint <= 0x3fffd));

const getStringWidth = (text: string): number => {
  if (!text) {
    return 0;
  }
  if (!NOT_ASCII.test(text)) {
    return text.length;
  }
  const stripped = text
    .replace(new RegExp(ANSI_PATTERN, 'g'), '')
    .replace(emojiRegex(), '  ');
  let width = 0;
  for (let index = 0; index < stripped.length; index++) {
    const codePoint = stripped.codePointAt(index) as number;
    if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      continue;
    }
    if (codePoint >= 0x300 && codePoint <= 0x36f) {
      continue;
    }
    if (codePoint > 0xffff) {
      index++;
    }
    width += isFullwidthCodePoint(codePoint) ? 2 : 1;
  }
  return width;
};

/* ── literals ───────────────────────────────────────────────────────────── */

const SIMPLE_NUMBER = /^(?:\d+|\d+\.\d+)$/;

const printNumber = (rawNumber: string) =>
  rawNumber
    .toLowerCase()
    .replace(/^([+-]?[\d.]+e)(?:\+|(-))?0*(\d)/, '$1$2$3')
    .replace(/^([+-]?[\d.]+)e[+-]?0+$/, '$1')
    .replace(/^([+-])?\./, '$10.')
    .replace(/(\.\d+?)0+(?=e|$)/, '$1')
    .replace(/\.(?=e|$)/, '');

const countOccurrences = (haystack: string, needle: string) => {
  let count = 0;
  for (const character of haystack) {
    if (character === needle) {
      count++;
    }
  }
  return count;
};

const getPreferredQuote = (rawContent: string) => {
  if (!rawContent.includes('"') && !rawContent.includes("'")) {
    return '"';
  }
  return countOccurrences(rawContent, '"') > countOccurrences(rawContent, "'")
    ? "'"
    : '"';
};

const makeString = (rawContent: string, enclosingQuote: string) => {
  const otherQuote = enclosingQuote === '"' ? "'" : '"';
  const newContent = rawContent.replace(
    /\\(.)|(["'])/gs,
    (_match, escaped: string | undefined, quote: string | undefined) => {
      if (escaped === otherQuote) {
        return escaped;
      }
      if (quote === enclosingQuote) {
        return `\\${quote}`;
      }
      if (quote) {
        return quote;
      }
      return /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/.test(escaped as string)
        ? (escaped as string)
        : `\\${escaped}`;
    }
  );
  return enclosingQuote + newContent + enclosingQuote;
};

const printString = (value: string) => {
  const rawContent = JSON.stringify(value).slice(1, -1);
  return makeString(rawContent, getPreferredQuote(rawContent));
};

const printPropertyKey = (key: string) => {
  const safeToUnquote =
    JSON.stringify(key).slice(1, -1) === key &&
    (esutils.keyword.isIdentifierNameES5(key) ||
      (SIMPLE_NUMBER.test(key) && String(Number(key)) === key));
  if (!safeToUnquote) {
    return printString(key);
  }
  return /^\d/.test(key) ? printNumber(key) : key;
};

/* ── doc IR ─────────────────────────────────────────────────────────────── */

type Doc =
  | string
  | Doc[]
  | { type: 'line'; soft: boolean }
  | { type: 'indent'; contents: Doc }
  | { type: 'fill'; parts: Doc[] }
  | { type: 'group'; contents: Doc; shouldBreak: boolean; id?: symbol }
  | { type: 'indent-if-break'; contents: Doc; groupId: symbol };

const LINE: Doc = { type: 'line', soft: false };
const SOFTLINE: Doc = { type: 'line', soft: true };
const indent = (contents: Doc): Doc => ({ type: 'indent', contents });
const group = (contents: Doc, shouldBreak = false, id?: symbol): Doc => ({
  type: 'group',
  contents,
  shouldBreak,
  id,
});

/** A group that breaks forces every group enclosing it to break as well. */
const propagateBreaks = (doc: Doc): boolean => {
  if (typeof doc === 'string') {
    return false;
  }
  if (Array.isArray(doc)) {
    let broke = false;
    for (const part of doc) {
      broke = propagateBreaks(part) || broke;
    }
    return broke;
  }
  switch (doc.type) {
    case 'fill': {
      let broke = false;
      for (const part of doc.parts) {
        broke = propagateBreaks(part) || broke;
      }
      return broke;
    }
    case 'indent':
    case 'indent-if-break':
      return propagateBreaks(doc.contents);
    case 'group':
      if (propagateBreaks(doc.contents)) {
        doc.shouldBreak = true;
      }
      return doc.shouldBreak;
    default:
      return false;
  }
};

/* ── doc building (prettier's estree printer, restricted to JSON) ────────── */

type NodeType =
  | 'ArrayExpression'
  | 'ObjectExpression'
  | 'UnaryExpression'
  | 'Literal';

/** `JSON.stringify` renders a negative number as a unary minus expression. */
const nodeType = (value: JsonValue): NodeType => {
  if (Array.isArray(value)) {
    return 'ArrayExpression';
  }
  if (value !== null && typeof value === 'object') {
    return 'ObjectExpression';
  }
  if (typeof value === 'number' && value < 0) {
    return 'UnaryExpression';
  }
  return 'Literal';
};

const buildArray = (elements: JsonValue[]): Doc => {
  if (elements.length === 0) {
    return ['[', ']'];
  }
  const shouldBreak =
    elements.length > 1 &&
    elements.every((element, index) => {
      const type = nodeType(element);
      if (type !== 'ArrayExpression' && type !== 'ObjectExpression') {
        return false;
      }
      const next = elements[index + 1];
      if (index + 1 < elements.length && nodeType(next as JsonValue) !== type) {
        return false;
      }
      const items = element as JsonValue[] | { [key: string]: JsonValue };
      return (Array.isArray(items) ? items : Object.keys(items)).length > 1;
    });
  const concise =
    elements.length > 1 && elements.every((el) => typeof el === 'number');

  let items: Doc;
  if (concise) {
    const parts: Doc[] = [];
    elements.forEach((element, index) => {
      const isLast = index === elements.length - 1;
      parts.push([buildValue(element), isLast ? '' : ',']);
      if (!isLast) {
        parts.push(LINE);
      }
    });
    items = { type: 'fill', parts };
  } else {
    const parts: Doc[] = [];
    elements.forEach((element, index) => {
      if (index > 0) {
        parts.push(',', LINE);
      }
      parts.push(group(buildValue(element)));
    });
    items = parts;
  }
  return group(['[', indent([SOFTLINE, items]), SOFTLINE, ']'], shouldBreak);
};

/**
 * prettier's `chooseLayout`, reduced to the three layouts JSON can reach:
 * break-after-operator, never-break-after-operator and fluid.
 */
const buildProperty = (key: string, value: JsonValue): Doc => {
  const keyDoc = printPropertyKey(key);
  const hasShortKey =
    getStringWidth(keyDoc) < TAB_WIDTH + MIN_OVERLAP_FOR_BREAK;
  const valueDoc = buildValue(value);
  if (!hasShortKey && typeof value === 'string') {
    return group([group(keyDoc), ':', group(indent([LINE, valueDoc]))]);
  }
  const isNumericLiteral =
    typeof value === 'number' && nodeType(value) === 'Literal';
  if (hasShortKey || isNumericLiteral) {
    return group([group(keyDoc), ':', ' ', valueDoc]);
  }
  const groupId = Symbol('assignment');
  return group([
    group(keyDoc),
    ':',
    group(indent(LINE), false, groupId),
    { type: 'indent-if-break', contents: valueDoc, groupId },
  ]);
};

const buildObject = (value: { [key: string]: JsonValue }): Doc => {
  const entries = Object.entries(value);
  if (entries.length === 0) {
    return ['{', '}'];
  }
  const props: Doc[] = [];
  entries.forEach(([key, propertyValue], index) => {
    if (index > 0) {
      props.push(',', LINE);
    }
    props.push(group(buildProperty(key, propertyValue)));
  });
  return group(['{', indent([LINE, props]), LINE, '}']);
};

const buildValue = (value: JsonValue): Doc => {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return printString(value);
  }
  if (typeof value === 'number') {
    return printNumber(JSON.stringify(value));
  }
  if (typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return buildArray(value);
  }
  return buildObject(value);
};

/* ── doc printer (prettier's printDocToString) ──────────────────────────── */

const MODE_BREAK = 1;
const MODE_FLAT = 2;

type Command = { ind: number; mode: number; doc: Doc };

const trimTrailingWhitespace = (out: string[]) => {
  let trimCount = 0;
  while (out.length > 0 && /^[\t ]*$/.test(out[out.length - 1]!)) {
    trimCount += out.pop()!.length;
  }
  if (out.length > 0) {
    const last = out[out.length - 1]!;
    const trimmed = last.replace(/[\t ]*$/, '');
    trimCount += last.length - trimmed.length;
    out[out.length - 1] = trimmed;
  }
  return trimCount;
};

const fits = (
  next: Command,
  restCommands: Command[],
  width: number,
  groupModes: Map<symbol, number>,
  mustBeFlat: boolean
) => {
  let restIdx = restCommands.length;
  const cmds: Command[] = [next];
  while (width >= 0) {
    if (cmds.length === 0) {
      if (restIdx === 0) {
        return true;
      }
      cmds.push(restCommands[--restIdx]!);
      continue;
    }
    const { ind, mode, doc } = cmds.pop()!;
    if (typeof doc === 'string') {
      width -= getStringWidth(doc);
      continue;
    }
    if (Array.isArray(doc)) {
      for (let i = doc.length - 1; i >= 0; i--) {
        cmds.push({ ind, mode, doc: doc[i]! });
      }
      continue;
    }
    switch (doc.type) {
      case 'fill':
        for (let i = doc.parts.length - 1; i >= 0; i--) {
          cmds.push({ ind, mode, doc: doc.parts[i]! });
        }
        break;
      case 'indent':
      case 'indent-if-break':
        cmds.push({ ind, mode, doc: doc.contents });
        break;
      case 'group': {
        if (mustBeFlat && doc.shouldBreak) {
          return false;
        }
        cmds.push({
          ind,
          mode: doc.shouldBreak ? MODE_BREAK : mode,
          doc: doc.contents,
        });
        break;
      }
      case 'line':
        if (mode === MODE_BREAK) {
          return true;
        }
        if (!doc.soft) {
          width--;
        }
        break;
    }
  }
  return false;
};

const printDocToString = (doc: Doc) => {
  const groupModes = new Map<symbol, number>();
  const out: string[] = [];
  let pos = 0;
  const cmds: Command[] = [{ ind: 0, mode: MODE_BREAK, doc }];
  while (cmds.length > 0) {
    const { ind, mode, doc: current } = cmds.pop()!;
    if (typeof current === 'string') {
      out.push(current);
      pos += getStringWidth(current);
      continue;
    }
    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i--) {
        cmds.push({ ind, mode, doc: current[i]! });
      }
      continue;
    }
    switch (current.type) {
      case 'indent':
        cmds.push({ ind: ind + TAB_WIDTH, mode, doc: current.contents });
        break;
      case 'group': {
        if (mode === MODE_FLAT) {
          cmds.push({
            ind,
            mode: current.shouldBreak ? MODE_BREAK : MODE_FLAT,
            doc: current.contents,
          });
        } else {
          const flat: Command = { ind, mode: MODE_FLAT, doc: current.contents };
          if (
            !current.shouldBreak &&
            fits(flat, cmds, PRINT_WIDTH - pos, groupModes, false)
          ) {
            cmds.push(flat);
          } else {
            cmds.push({ ind, mode: MODE_BREAK, doc: current.contents });
          }
        }
        if (current.id) {
          groupModes.set(current.id, cmds[cmds.length - 1]!.mode);
        }
        break;
      }
      case 'indent-if-break': {
        const groupMode = groupModes.get(current.groupId);
        if (groupMode === MODE_BREAK) {
          cmds.push({ ind, mode, doc: indent(current.contents) });
        } else if (groupMode === MODE_FLAT) {
          cmds.push({ ind, mode, doc: current.contents });
        }
        break;
      }
      case 'fill': {
        const rem = PRINT_WIDTH - pos;
        const parts = current.parts;
        if (parts.length === 0) {
          break;
        }
        const content = parts[0]!;
        const whitespace = parts[1]!;
        const contentFlat: Command = { ind, mode: MODE_FLAT, doc: content };
        const contentBreak: Command = { ind, mode: MODE_BREAK, doc: content };
        const contentFits = fits(contentFlat, [], rem, groupModes, true);
        if (parts.length === 1) {
          cmds.push(contentFits ? contentFlat : contentBreak);
          break;
        }
        const whitespaceFlat: Command = {
          ind,
          mode: MODE_FLAT,
          doc: whitespace,
        };
        const whitespaceBreak: Command = {
          ind,
          mode: MODE_BREAK,
          doc: whitespace,
        };
        if (parts.length === 2) {
          if (contentFits) {
            cmds.push(whitespaceFlat, contentFlat);
          } else {
            cmds.push(whitespaceBreak, contentBreak);
          }
          break;
        }
        const rest = parts.slice(2);
        const remaining: Command = {
          ind,
          mode,
          doc: { type: 'fill', parts: rest },
        };
        const pairFits = fits(
          { ind, mode: MODE_FLAT, doc: [content, whitespace, rest[0]!] },
          [],
          rem,
          groupModes,
          true
        );
        if (pairFits) {
          cmds.push(remaining, whitespaceFlat, contentFlat);
        } else if (contentFits) {
          cmds.push(remaining, whitespaceBreak, contentFlat);
        } else {
          cmds.push(remaining, whitespaceBreak, contentBreak);
        }
        break;
      }
      case 'line':
        if (mode === MODE_FLAT) {
          if (!current.soft) {
            out.push(' ');
            pos += 1;
          }
          break;
        }
        pos -= trimTrailingWhitespace(out);
        out.push(`\n${' '.repeat(ind)}`);
        pos = ind;
        break;
    }
  }
  return out.join('');
};

export const printObjectLiteral = (value: unknown): string => {
  const source = JSON.stringify(value);
  if (source === undefined) {
    return 'undefined';
  }
  const doc: Doc = [PREFIX, buildValue(JSON.parse(source))];
  propagateBreaks(doc);
  return printDocToString(doc).trim().replace(PREFIX, '');
};
