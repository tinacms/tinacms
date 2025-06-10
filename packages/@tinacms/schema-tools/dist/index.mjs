import * as yup from "yup";
import UrlPattern from "url-pattern";
import z$1, { z, ZodError } from "zod";
function addNamespaceToSchema(maybeNode, namespace = []) {
  if (typeof maybeNode !== "object" || maybeNode === null) {
    return maybeNode;
  }
  const newNode = { ...maybeNode, namespace: [...namespace] };
  Object.entries(maybeNode).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      newNode[key] = value.map((element) => {
        if (element && typeof element === "object" && "name" in element) {
          const valueName = element.name || element.value;
          return addNamespaceToSchema(element, [...namespace, valueName]);
        }
        return element;
      });
    } else if (value && typeof value === "object" && "name" in value) {
      newNode[key] = addNamespaceToSchema(value, [...namespace, value.name]);
    } else {
      newNode[key] = value;
    }
  });
  return newNode;
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var utils$4 = {};
const WIN_SLASH = "\\\\/";
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;
const DOT_LITERAL = "\\.";
const PLUS_LITERAL = "\\+";
const QMARK_LITERAL = "\\?";
const SLASH_LITERAL = "\\/";
const ONE_CHAR = "(?=.)";
const QMARK = "[^/]";
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;
const SEP = "/";
const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR,
  SEP
};
const WINDOWS_CHARS = {
  ...POSIX_CHARS,
  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
  SEP: "\\"
};
const POSIX_REGEX_SOURCE$1 = {
  alnum: "a-zA-Z0-9",
  alpha: "a-zA-Z",
  ascii: "\\x00-\\x7F",
  blank: " \\t",
  cntrl: "\\x00-\\x1F\\x7F",
  digit: "0-9",
  graph: "\\x21-\\x7E",
  lower: "a-z",
  print: "\\x20-\\x7E ",
  punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
  space: " \\t\\r\\n\\v\\f",
  upper: "A-Z",
  word: "A-Za-z0-9_",
  xdigit: "A-Fa-f0-9"
};
var constants$2 = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,
  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    "***": "*",
    "**/**": "**",
    "**/**/**": "**"
  },
  // Digits
  CHAR_0: 48,
  /* 0 */
  CHAR_9: 57,
  /* 9 */
  // Alphabet chars.
  CHAR_UPPERCASE_A: 65,
  /* A */
  CHAR_LOWERCASE_A: 97,
  /* a */
  CHAR_UPPERCASE_Z: 90,
  /* Z */
  CHAR_LOWERCASE_Z: 122,
  /* z */
  CHAR_LEFT_PARENTHESES: 40,
  /* ( */
  CHAR_RIGHT_PARENTHESES: 41,
  /* ) */
  CHAR_ASTERISK: 42,
  /* * */
  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38,
  /* & */
  CHAR_AT: 64,
  /* @ */
  CHAR_BACKWARD_SLASH: 92,
  /* \ */
  CHAR_CARRIAGE_RETURN: 13,
  /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94,
  /* ^ */
  CHAR_COLON: 58,
  /* : */
  CHAR_COMMA: 44,
  /* , */
  CHAR_DOT: 46,
  /* . */
  CHAR_DOUBLE_QUOTE: 34,
  /* " */
  CHAR_EQUAL: 61,
  /* = */
  CHAR_EXCLAMATION_MARK: 33,
  /* ! */
  CHAR_FORM_FEED: 12,
  /* \f */
  CHAR_FORWARD_SLASH: 47,
  /* / */
  CHAR_GRAVE_ACCENT: 96,
  /* ` */
  CHAR_HASH: 35,
  /* # */
  CHAR_HYPHEN_MINUS: 45,
  /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60,
  /* < */
  CHAR_LEFT_CURLY_BRACE: 123,
  /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91,
  /* [ */
  CHAR_LINE_FEED: 10,
  /* \n */
  CHAR_NO_BREAK_SPACE: 160,
  /* \u00A0 */
  CHAR_PERCENT: 37,
  /* % */
  CHAR_PLUS: 43,
  /* + */
  CHAR_QUESTION_MARK: 63,
  /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62,
  /* > */
  CHAR_RIGHT_CURLY_BRACE: 125,
  /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93,
  /* ] */
  CHAR_SEMICOLON: 59,
  /* ; */
  CHAR_SINGLE_QUOTE: 39,
  /* ' */
  CHAR_SPACE: 32,
  /*   */
  CHAR_TAB: 9,
  /* \t */
  CHAR_UNDERSCORE: 95,
  /* _ */
  CHAR_VERTICAL_LINE: 124,
  /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
  /* \uFEFF */
  /**
   * Create EXTGLOB_CHARS
   */
  extglobChars(chars) {
    return {
      "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
      "?": { type: "qmark", open: "(?:", close: ")?" },
      "+": { type: "plus", open: "(?:", close: ")+" },
      "*": { type: "star", open: "(?:", close: ")*" },
      "@": { type: "at", open: "(?:", close: ")" }
    };
  },
  /**
   * Create GLOB_CHARS
   */
  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};
(function(exports) {
  const {
    REGEX_BACKSLASH,
    REGEX_REMOVE_BACKSLASH,
    REGEX_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_GLOBAL
  } = constants$2;
  exports.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
  exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
  exports.isRegexChar = (str) => str.length === 1 && exports.hasRegexChars(str);
  exports.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
  exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
  exports.isWindows = () => {
    if (typeof navigator !== "undefined" && navigator.platform) {
      const platform = navigator.platform.toLowerCase();
      return platform === "win32" || platform === "windows";
    }
    if (typeof process !== "undefined" && process.platform) {
      return process.platform === "win32";
    }
    return false;
  };
  exports.removeBackslashes = (str) => {
    return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
      return match === "\\" ? "" : match;
    });
  };
  exports.escapeLast = (input, char, lastIdx) => {
    const idx = input.lastIndexOf(char, lastIdx);
    if (idx === -1)
      return input;
    if (input[idx - 1] === "\\")
      return exports.escapeLast(input, char, idx - 1);
    return `${input.slice(0, idx)}\\${input.slice(idx)}`;
  };
  exports.removePrefix = (input, state = {}) => {
    let output = input;
    if (output.startsWith("./")) {
      output = output.slice(2);
      state.prefix = "./";
    }
    return output;
  };
  exports.wrapOutput = (input, state = {}, options = {}) => {
    const prepend = options.contains ? "" : "^";
    const append = options.contains ? "" : "$";
    let output = `${prepend}(?:${input})${append}`;
    if (state.negated === true) {
      output = `(?:^(?!${output}).*$)`;
    }
    return output;
  };
  exports.basename = (path, { windows } = {}) => {
    const segs = path.split(windows ? /[\\/]/ : "/");
    const last = segs[segs.length - 1];
    if (last === "") {
      return segs[segs.length - 2];
    }
    return last;
  };
})(utils$4);
const utils$3 = utils$4;
const {
  CHAR_ASTERISK,
  /* * */
  CHAR_AT,
  /* @ */
  CHAR_BACKWARD_SLASH,
  /* \ */
  CHAR_COMMA,
  /* , */
  CHAR_DOT,
  /* . */
  CHAR_EXCLAMATION_MARK,
  /* ! */
  CHAR_FORWARD_SLASH,
  /* / */
  CHAR_LEFT_CURLY_BRACE,
  /* { */
  CHAR_LEFT_PARENTHESES,
  /* ( */
  CHAR_LEFT_SQUARE_BRACKET,
  /* [ */
  CHAR_PLUS,
  /* + */
  CHAR_QUESTION_MARK,
  /* ? */
  CHAR_RIGHT_CURLY_BRACE,
  /* } */
  CHAR_RIGHT_PARENTHESES,
  /* ) */
  CHAR_RIGHT_SQUARE_BRACKET
  /* ] */
} = constants$2;
const isPathSeparator = (code) => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};
const depth = (token) => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};
const scan$1 = (input, options) => {
  const opts = options || {};
  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];
  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob = false;
  let isExtglob = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let negatedExtglob = false;
  let finished = false;
  let braces = 0;
  let prev;
  let code;
  let token = { value: "", depth: 0, isGlob: false };
  const eos = () => index >= length;
  const peek = () => str.charCodeAt(index + 1);
  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };
  while (index < length) {
    code = advance();
    let next;
    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = token.backslashes = true;
      code = advance();
      if (code === CHAR_LEFT_CURLY_BRACE) {
        braceEscaped = true;
      }
      continue;
    }
    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
      braces++;
      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }
        if (code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          continue;
        }
        if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (braceEscaped !== true && code === CHAR_COMMA) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_RIGHT_CURLY_BRACE) {
          braces--;
          if (braces === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
    if (code === CHAR_FORWARD_SLASH) {
      slashes.push(index);
      tokens.push(token);
      token = { value: "", depth: 0, isGlob: false };
      if (finished === true)
        continue;
      if (prev === CHAR_DOT && index === start + 1) {
        start += 2;
        continue;
      }
      lastIndex = index + 1;
      continue;
    }
    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        isExtglob = token.isExtglob = true;
        finished = true;
        if (code === CHAR_EXCLAMATION_MARK && index === start) {
          negatedExtglob = true;
        }
        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }
            if (code === CHAR_RIGHT_PARENTHESES) {
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
    }
    if (code === CHAR_ASTERISK) {
      if (prev === CHAR_ASTERISK)
        isGlobstar = token.isGlobstar = true;
      isGlob = token.isGlob = true;
      finished = true;
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
    if (code === CHAR_QUESTION_MARK) {
      isGlob = token.isGlob = true;
      finished = true;
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
    if (code === CHAR_LEFT_SQUARE_BRACKET) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }
        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          isBracket = token.isBracket = true;
          isGlob = token.isGlob = true;
          finished = true;
          break;
        }
      }
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }
    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
      isGlob = token.isGlob = true;
      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }
          if (code === CHAR_RIGHT_PARENTHESES) {
            finished = true;
            break;
          }
        }
        continue;
      }
      break;
    }
    if (isGlob === true) {
      finished = true;
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
  }
  if (opts.noext === true) {
    isExtglob = false;
    isGlob = false;
  }
  let base = str;
  let prefix = "";
  let glob = "";
  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }
  if (base && isGlob === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob === true) {
    base = "";
    glob = str;
  } else {
    base = str;
  }
  if (base && base !== "" && base !== "/" && base !== str) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }
  if (opts.unescape === true) {
    if (glob)
      glob = utils$3.removeBackslashes(glob);
    if (base && backslashes === true) {
      base = utils$3.removeBackslashes(base);
    }
  }
  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob,
    isExtglob,
    isGlobstar,
    negated,
    negatedExtglob
  };
  if (opts.tokens === true) {
    state.maxDepth = 0;
    if (!isPathSeparator(code)) {
      tokens.push(token);
    }
    state.tokens = tokens;
  }
  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;
    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);
      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }
        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }
      if (idx !== 0 || value !== "") {
        parts.push(value);
      }
      prevIndex = i;
    }
    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);
      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }
    state.slashes = slashes;
    state.parts = parts;
  }
  return state;
};
var scan_1 = scan$1;
const constants$1 = constants$2;
const utils$2 = utils$4;
const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants$1;
const expandRange = (args, options) => {
  if (typeof options.expandRange === "function") {
    return options.expandRange(...args, options);
  }
  args.sort();
  const value = `[${args.join("-")}]`;
  try {
    new RegExp(value);
  } catch (ex) {
    return args.map((v) => utils$2.escapeRegex(v)).join("..");
  }
  return value;
};
const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};
const parse$1 = (input, options) => {
  if (typeof input !== "string") {
    throw new TypeError("Expected a string");
  }
  input = REPLACEMENTS[input] || input;
  const opts = { ...options };
  const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }
  const bos = { type: "bos", value: "", output: opts.prepend || "" };
  const tokens = [bos];
  const capture = opts.capture ? "" : "?:";
  const PLATFORM_CHARS = constants$1.globChars(opts.windows);
  const EXTGLOB_CHARS = constants$1.extglobChars(PLATFORM_CHARS);
  const {
    DOT_LITERAL: DOT_LITERAL2,
    PLUS_LITERAL: PLUS_LITERAL2,
    SLASH_LITERAL: SLASH_LITERAL2,
    ONE_CHAR: ONE_CHAR2,
    DOTS_SLASH: DOTS_SLASH2,
    NO_DOT: NO_DOT2,
    NO_DOT_SLASH: NO_DOT_SLASH2,
    NO_DOTS_SLASH: NO_DOTS_SLASH2,
    QMARK: QMARK2,
    QMARK_NO_DOT: QMARK_NO_DOT2,
    STAR: STAR2,
    START_ANCHOR: START_ANCHOR2
  } = PLATFORM_CHARS;
  const globstar = (opts2) => {
    return `(${capture}(?:(?!${START_ANCHOR2}${opts2.dot ? DOTS_SLASH2 : DOT_LITERAL2}).)*?)`;
  };
  const nodot = opts.dot ? "" : NO_DOT2;
  const qmarkNoDot = opts.dot ? QMARK2 : QMARK_NO_DOT2;
  let star = opts.bash === true ? globstar(opts) : STAR2;
  if (opts.capture) {
    star = `(${star})`;
  }
  if (typeof opts.noext === "boolean") {
    opts.noextglob = opts.noext;
  }
  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: "",
    output: "",
    prefix: "",
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };
  input = utils$2.removePrefix(input, state);
  len = input.length;
  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;
  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index] || "";
  const remaining = () => input.slice(state.index + 1);
  const consume = (value2 = "", num = 0) => {
    state.consumed += value2;
    state.index += num;
  };
  const append = (token) => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };
  const negate = () => {
    let count = 1;
    while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
      advance();
      state.start++;
      count++;
    }
    if (count % 2 === 0) {
      return false;
    }
    state.negated = true;
    state.start++;
    return true;
  };
  const increment = (type) => {
    state[type]++;
    stack.push(type);
  };
  const decrement = (type) => {
    state[type]--;
    stack.pop();
  };
  const push = (tok) => {
    if (prev.type === "globstar") {
      const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
      const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
      if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = "star";
        prev.value = "*";
        prev.output = star;
        state.output += prev.output;
      }
    }
    if (extglobs.length && tok.type !== "paren") {
      extglobs[extglobs.length - 1].inner += tok.value;
    }
    if (tok.value || tok.output)
      append(tok);
    if (prev && prev.type === "text" && tok.type === "text") {
      prev.output = (prev.output || prev.value) + tok.value;
      prev.value += tok.value;
      return;
    }
    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };
  const extglobOpen = (type, value2) => {
    const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? "(" : "") + token.open;
    increment("parens");
    push({ type, value: value2, output: state.output ? "" : ONE_CHAR2 });
    push({ type: "paren", extglob: true, value: advance(), output });
    extglobs.push(token);
  };
  const extglobClose = (token) => {
    let output = token.close + (opts.capture ? ")" : "");
    let rest;
    if (token.type === "negate") {
      let extglobStar = star;
      if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
        extglobStar = globstar(opts);
      }
      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }
      if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        const expression = parse$1(rest, { ...options, fastpaths: false }).output;
        output = token.close = `)${expression})${extglobStar})`;
      }
      if (token.prev.type === "bos") {
        state.negatedExtglob = true;
      }
    }
    push({ type: "paren", extglob: true, value, output });
    decrement("parens");
  };
  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;
    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === "\\") {
        backslashes = true;
        return m;
      }
      if (first === "?") {
        if (esc) {
          return esc + first + (rest ? QMARK2.repeat(rest.length) : "");
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK2.repeat(rest.length) : "");
        }
        return QMARK2.repeat(chars.length);
      }
      if (first === ".") {
        return DOT_LITERAL2.repeat(chars.length);
      }
      if (first === "*") {
        if (esc) {
          return esc + first + (rest ? star : "");
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });
    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, "");
      } else {
        output = output.replace(/\\+/g, (m) => {
          return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
        });
      }
    }
    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }
    state.output = utils$2.wrapOutput(output, state, options);
    return state;
  }
  while (!eos()) {
    value = advance();
    if (value === "\0") {
      continue;
    }
    if (value === "\\") {
      const next = peek();
      if (next === "/" && opts.bash !== true) {
        continue;
      }
      if (next === "." || next === ";") {
        continue;
      }
      if (!next) {
        value += "\\";
        push({ type: "text", value });
        continue;
      }
      const match = /^\\+/.exec(remaining());
      let slashes = 0;
      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += "\\";
        }
      }
      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }
      if (state.brackets === 0) {
        push({ type: "text", value });
        continue;
      }
    }
    if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
      if (opts.posix !== false && value === ":") {
        const inner = prev.value.slice(1);
        if (inner.includes("[")) {
          prev.posix = true;
          if (inner.includes(":")) {
            const idx = prev.value.lastIndexOf("[");
            const pre = prev.value.slice(0, idx);
            const rest2 = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest2];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();
              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR2;
              }
              continue;
            }
          }
        }
      }
      if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
        value = `\\${value}`;
      }
      if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
        value = `\\${value}`;
      }
      if (opts.posix === true && value === "!" && prev.value === "[") {
        value = "^";
      }
      prev.value += value;
      append({ value });
      continue;
    }
    if (state.quotes === 1 && value !== '"') {
      value = utils$2.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }
    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: "text", value });
      }
      continue;
    }
    if (value === "(") {
      increment("parens");
      push({ type: "paren", value });
      continue;
    }
    if (value === ")") {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError("opening", "("));
      }
      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }
      push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
      decrement("parens");
      continue;
    }
    if (value === "[") {
      if (opts.nobracket === true || !remaining().includes("]")) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError("closing", "]"));
        }
        value = `\\${value}`;
      } else {
        increment("brackets");
      }
      push({ type: "bracket", value });
      continue;
    }
    if (value === "]") {
      if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
        push({ type: "text", value, output: `\\${value}` });
        continue;
      }
      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError("opening", "["));
        }
        push({ type: "text", value, output: `\\${value}` });
        continue;
      }
      decrement("brackets");
      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
        value = `/${value}`;
      }
      prev.value += value;
      append({ value });
      if (opts.literalBrackets === false || utils$2.hasRegexChars(prevValue)) {
        continue;
      }
      const escaped = utils$2.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }
    if (value === "{" && opts.nobrace !== true) {
      increment("braces");
      const open = {
        type: "brace",
        value,
        output: "(",
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };
      braces.push(open);
      push(open);
      continue;
    }
    if (value === "}") {
      const brace = braces[braces.length - 1];
      if (opts.nobrace === true || !brace) {
        push({ type: "text", value, output: value });
        continue;
      }
      let output = ")";
      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];
        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === "brace") {
            break;
          }
          if (arr[i].type !== "dots") {
            range.unshift(arr[i].value);
          }
        }
        output = expandRange(range, opts);
        state.backtrack = true;
      }
      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = "\\{";
        value = output = "\\}";
        state.output = out;
        for (const t of toks) {
          state.output += t.output || t.value;
        }
      }
      push({ type: "brace", value, output });
      decrement("braces");
      braces.pop();
      continue;
    }
    if (value === "|") {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: "text", value });
      continue;
    }
    if (value === ",") {
      let output = value;
      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === "braces") {
        brace.comma = true;
        output = "|";
      }
      push({ type: "comma", value, output });
      continue;
    }
    if (value === "/") {
      if (prev.type === "dot" && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = "";
        state.output = "";
        tokens.pop();
        prev = bos;
        continue;
      }
      push({ type: "slash", value, output: SLASH_LITERAL2 });
      continue;
    }
    if (value === ".") {
      if (state.braces > 0 && prev.type === "dot") {
        if (prev.value === ".")
          prev.output = DOT_LITERAL2;
        const brace = braces[braces.length - 1];
        prev.type = "dots";
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }
      if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
        push({ type: "text", value, output: DOT_LITERAL2 });
        continue;
      }
      push({ type: "dot", value, output: DOT_LITERAL2 });
      continue;
    }
    if (value === "?") {
      const isGroup = prev && prev.value === "(";
      if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
        extglobOpen("qmark", value);
        continue;
      }
      if (prev && prev.type === "paren") {
        const next = peek();
        let output = value;
        if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
          output = `\\${value}`;
        }
        push({ type: "text", value, output });
        continue;
      }
      if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
        push({ type: "qmark", value, output: QMARK_NO_DOT2 });
        continue;
      }
      push({ type: "qmark", value, output: QMARK2 });
      continue;
    }
    if (value === "!") {
      if (opts.noextglob !== true && peek() === "(") {
        if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
          extglobOpen("negate", value);
          continue;
        }
      }
      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }
    if (value === "+") {
      if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
        extglobOpen("plus", value);
        continue;
      }
      if (prev && prev.value === "(" || opts.regex === false) {
        push({ type: "plus", value, output: PLUS_LITERAL2 });
        continue;
      }
      if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
        push({ type: "plus", value });
        continue;
      }
      push({ type: "plus", value: PLUS_LITERAL2 });
      continue;
    }
    if (value === "@") {
      if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
        push({ type: "at", extglob: true, value, output: "" });
        continue;
      }
      push({ type: "text", value });
      continue;
    }
    if (value !== "*") {
      if (value === "$" || value === "^") {
        value = `\\${value}`;
      }
      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }
      push({ type: "text", value });
      continue;
    }
    if (prev && (prev.type === "globstar" || prev.star === true)) {
      prev.type = "star";
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }
    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen("star", value);
      continue;
    }
    if (prev.type === "star") {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }
      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === "slash" || prior.type === "bos";
      const afterStar = before && (before.type === "star" || before.type === "globstar");
      if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
        push({ type: "star", value, output: "" });
        continue;
      }
      const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
      const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
      if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
        push({ type: "star", value, output: "" });
        continue;
      }
      while (rest.slice(0, 3) === "/**") {
        const after = input[state.index + 4];
        if (after && after !== "/") {
          break;
        }
        rest = rest.slice(3);
        consume("/**", 3);
      }
      if (prior.type === "bos" && eos()) {
        prev.type = "globstar";
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }
      if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;
        prev.type = "globstar";
        prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }
      if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
        const end = rest[1] !== void 0 ? "|$" : "";
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;
        prev.type = "globstar";
        prev.output = `${globstar(opts)}${SLASH_LITERAL2}|${SLASH_LITERAL2}${end})`;
        prev.value += value;
        state.output += prior.output + prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: "slash", value: "/", output: "" });
        continue;
      }
      if (prior.type === "bos" && rest[0] === "/") {
        prev.type = "globstar";
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL2}|${globstar(opts)}${SLASH_LITERAL2})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: "slash", value: "/", output: "" });
        continue;
      }
      state.output = state.output.slice(0, -prev.output.length);
      prev.type = "globstar";
      prev.output = globstar(opts);
      prev.value += value;
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }
    const token = { type: "star", value, output: star };
    if (opts.bash === true) {
      token.output = ".*?";
      if (prev.type === "bos" || prev.type === "slash") {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }
    if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }
    if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
      if (prev.type === "dot") {
        state.output += NO_DOT_SLASH2;
        prev.output += NO_DOT_SLASH2;
      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH2;
        prev.output += NO_DOTS_SLASH2;
      } else {
        state.output += nodot;
        prev.output += nodot;
      }
      if (peek() !== "*") {
        state.output += ONE_CHAR2;
        prev.output += ONE_CHAR2;
      }
    }
    push(token);
  }
  while (state.brackets > 0) {
    if (opts.strictBrackets === true)
      throw new SyntaxError(syntaxError("closing", "]"));
    state.output = utils$2.escapeLast(state.output, "[");
    decrement("brackets");
  }
  while (state.parens > 0) {
    if (opts.strictBrackets === true)
      throw new SyntaxError(syntaxError("closing", ")"));
    state.output = utils$2.escapeLast(state.output, "(");
    decrement("parens");
  }
  while (state.braces > 0) {
    if (opts.strictBrackets === true)
      throw new SyntaxError(syntaxError("closing", "}"));
    state.output = utils$2.escapeLast(state.output, "{");
    decrement("braces");
  }
  if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
    push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL2}?` });
  }
  if (state.backtrack === true) {
    state.output = "";
    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;
      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }
  return state;
};
parse$1.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }
  input = REPLACEMENTS[input] || input;
  const {
    DOT_LITERAL: DOT_LITERAL2,
    SLASH_LITERAL: SLASH_LITERAL2,
    ONE_CHAR: ONE_CHAR2,
    DOTS_SLASH: DOTS_SLASH2,
    NO_DOT: NO_DOT2,
    NO_DOTS: NO_DOTS2,
    NO_DOTS_SLASH: NO_DOTS_SLASH2,
    STAR: STAR2,
    START_ANCHOR: START_ANCHOR2
  } = constants$1.globChars(opts.windows);
  const nodot = opts.dot ? NO_DOTS2 : NO_DOT2;
  const slashDot = opts.dot ? NO_DOTS_SLASH2 : NO_DOT2;
  const capture = opts.capture ? "" : "?:";
  const state = { negated: false, prefix: "" };
  let star = opts.bash === true ? ".*?" : STAR2;
  if (opts.capture) {
    star = `(${star})`;
  }
  const globstar = (opts2) => {
    if (opts2.noglobstar === true)
      return star;
    return `(${capture}(?:(?!${START_ANCHOR2}${opts2.dot ? DOTS_SLASH2 : DOT_LITERAL2}).)*?)`;
  };
  const create = (str) => {
    switch (str) {
      case "*":
        return `${nodot}${ONE_CHAR2}${star}`;
      case ".*":
        return `${DOT_LITERAL2}${ONE_CHAR2}${star}`;
      case "*.*":
        return `${nodot}${star}${DOT_LITERAL2}${ONE_CHAR2}${star}`;
      case "*/*":
        return `${nodot}${star}${SLASH_LITERAL2}${ONE_CHAR2}${slashDot}${star}`;
      case "**":
        return nodot + globstar(opts);
      case "**/*":
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL2})?${slashDot}${ONE_CHAR2}${star}`;
      case "**/*.*":
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL2})?${slashDot}${star}${DOT_LITERAL2}${ONE_CHAR2}${star}`;
      case "**/.*":
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL2})?${DOT_LITERAL2}${ONE_CHAR2}${star}`;
      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match)
          return;
        const source2 = create(match[1]);
        if (!source2)
          return;
        return source2 + DOT_LITERAL2 + match[2];
      }
    }
  };
  const output = utils$2.removePrefix(input, state);
  let source = create(output);
  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL2}?`;
  }
  return source;
};
var parse_1 = parse$1;
const scan = scan_1;
const parse = parse_1;
const utils$1 = utils$4;
const constants = constants$2;
const isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
const picomatch$2 = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map((input) => picomatch$2(input, options, returnState));
    const arrayMatcher = (str) => {
      for (const isMatch of fns) {
        const state2 = isMatch(str);
        if (state2)
          return state2;
      }
      return false;
    };
    return arrayMatcher;
  }
  const isState = isObject(glob) && glob.tokens && glob.input;
  if (glob === "" || typeof glob !== "string" && !isState) {
    throw new TypeError("Expected pattern to be a non-empty string");
  }
  const opts = options || {};
  const posix = opts.windows;
  const regex = isState ? picomatch$2.compileRe(glob, options) : picomatch$2.makeRe(glob, options, false, true);
  const state = regex.state;
  delete regex.state;
  let isIgnored = () => false;
  if (opts.ignore) {
    const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
    isIgnored = picomatch$2(opts.ignore, ignoreOpts, returnState);
  }
  const matcher = (input, returnObject = false) => {
    const { isMatch, match, output } = picomatch$2.test(input, regex, options, { glob, posix });
    const result = { glob, state, regex, posix, input, output, match, isMatch };
    if (typeof opts.onResult === "function") {
      opts.onResult(result);
    }
    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }
    if (isIgnored(input)) {
      if (typeof opts.onIgnore === "function") {
        opts.onIgnore(result);
      }
      result.isMatch = false;
      return returnObject ? result : false;
    }
    if (typeof opts.onMatch === "function") {
      opts.onMatch(result);
    }
    return returnObject ? result : true;
  };
  if (returnState) {
    matcher.state = state;
  }
  return matcher;
};
picomatch$2.test = (input, regex, options, { glob, posix } = {}) => {
  if (typeof input !== "string") {
    throw new TypeError("Expected input to be a string");
  }
  if (input === "") {
    return { isMatch: false, output: "" };
  }
  const opts = options || {};
  const format = opts.format || (posix ? utils$1.toPosixSlashes : null);
  let match = input === glob;
  let output = match && format ? format(input) : input;
  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }
  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch$2.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }
  return { isMatch: Boolean(match), match, output };
};
picomatch$2.matchBase = (input, glob, options) => {
  const regex = glob instanceof RegExp ? glob : picomatch$2.makeRe(glob, options);
  return regex.test(utils$1.basename(input));
};
picomatch$2.isMatch = (str, patterns, options) => picomatch$2(patterns, options)(str);
picomatch$2.parse = (pattern, options) => {
  if (Array.isArray(pattern))
    return pattern.map((p) => picomatch$2.parse(p, options));
  return parse(pattern, { ...options, fastpaths: false });
};
picomatch$2.scan = (input, options) => scan(input, options);
picomatch$2.compileRe = (state, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return state.output;
  }
  const opts = options || {};
  const prepend = opts.contains ? "" : "^";
  const append = opts.contains ? "" : "$";
  let source = `${prepend}(?:${state.output})${append}`;
  if (state && state.negated === true) {
    source = `^(?!${source}).*$`;
  }
  const regex = picomatch$2.toRegex(source, options);
  if (returnState === true) {
    regex.state = state;
  }
  return regex;
};
picomatch$2.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== "string") {
    throw new TypeError("Expected a non-empty string");
  }
  let parsed = { negated: false, fastpaths: true };
  if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
    parsed.output = parse.fastpaths(input, options);
  }
  if (!parsed.output) {
    parsed = parse(input, options);
  }
  return picomatch$2.compileRe(parsed, options, returnOutput, returnState);
};
picomatch$2.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
  } catch (err) {
    if (options && options.debug === true)
      throw err;
    return /$^/;
  }
};
picomatch$2.constants = constants;
var picomatch_1$1 = picomatch$2;
const pico = picomatch_1$1;
const utils = utils$4;
function picomatch(glob, options, returnState = false) {
  if (options && (options.windows === null || options.windows === void 0)) {
    options = { ...options, windows: utils.isWindows() };
  }
  return pico(glob, options, returnState);
}
Object.assign(picomatch, pico);
var picomatch_1 = picomatch;
const picomatch$1 = /* @__PURE__ */ getDefaultExportFromCjs(picomatch_1);
function assertShape(value, yupSchema, errorMessage) {
  const shape = yupSchema(yup);
  try {
    shape.validateSync(value);
  } catch (e) {
    const message = errorMessage || `Failed to assertShape - ${e.message}`;
    throw new Error(message);
  }
}
const lastItem = (arr) => {
  if (typeof arr === "undefined") {
    throw new Error("Can not call lastItem when arr is undefined");
  }
  return arr[arr.length - 1];
};
const capitalize = (s) => {
  if (typeof s !== "string")
    return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const generateNamespacedFieldName = (names, suffix = "") => {
  return (suffix ? [...names, suffix] : names).map(capitalize).join("");
};
const NAMER = {
  dataFilterTypeNameOn: (namespace) => {
    return generateNamespacedFieldName(namespace, "_FilterOn");
  },
  dataFilterTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "Filter");
  },
  dataMutationTypeNameOn: (namespace) => {
    return generateNamespacedFieldName(namespace, "_MutationOn");
  },
  dataMutationTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "Mutation");
  },
  updateName: (namespace) => {
    return "update" + generateNamespacedFieldName(namespace, "Document");
  },
  createName: (namespace) => {
    return "create" + generateNamespacedFieldName(namespace, "Document");
  },
  queryName: (namespace) => {
    return "get" + generateNamespacedFieldName(namespace, "Document");
  },
  generateQueryListName: (namespace) => {
    return "get" + generateNamespacedFieldName(namespace, "List");
  },
  fragmentName: (namespace) => {
    return generateNamespacedFieldName(namespace, "") + "Parts";
  },
  collectionTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "Collection");
  },
  documentTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "Document");
  },
  dataTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "");
  },
  referenceConnectionType: (namespace) => {
    return generateNamespacedFieldName(namespace, "Connection");
  },
  referenceConnectionEdgesTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "ConnectionEdges");
  }
};
function findDuplicates(array = []) {
  const duplicates = [
    ...new Set(array.filter((item, index) => array.indexOf(item) !== index))
  ].map((x) => `"${x}"`);
  if (duplicates.length) {
    return duplicates.join(", ");
  } else
    return void 0;
}
const TINA_HOST = "content.tinajs.io";
const parseURL = (url) => {
  if (url.startsWith("/")) {
    return {
      branch: null,
      isLocalClient: false,
      clientId: null,
      host: null
    };
  }
  if (url.includes("localhost")) {
    return {
      branch: null,
      isLocalClient: true,
      clientId: null,
      host: "localhost"
    };
  }
  const params = new URL(url);
  const isTinaCloud = params.host.includes("tinajs.dev") || params.host.includes("tina.io") || params.host.includes("tinajs.io");
  if (!isTinaCloud) {
    return {
      branch: null,
      isLocalClient: true,
      clientId: null,
      host: params.host
    };
  }
  const pattern = new UrlPattern("/:v/content/:clientId/github/*", {
    escapeChar: " ",
    // extend to allow `.` in version
    segmentValueCharset: "a-zA-Z0-9-_~ %."
  });
  const result = pattern.match(params.pathname);
  const branch = result == null ? void 0 : result._;
  const clientId = result == null ? void 0 : result.clientId;
  if (!branch || !clientId) {
    throw new Error(
      `Invalid URL format provided. Expected: https://content.tinajs.io/<Version>/content/<ClientID>/github/<Branch> but but received ${url}`
    );
  }
  return {
    host: params.host,
    branch,
    clientId,
    isLocalClient: false
  };
};
const normalizePath = (filepath) => filepath.replace(/\\/g, "/");
const canonicalPath = (filepath) => {
  return normalizePath(filepath).split("/").filter((name2) => name2 !== "").join("/");
};
class TinaSchema {
  /**
   * Create a schema class from a user defined schema object
   */
  constructor(config) {
    this.config = config;
    this.getIsTitleFieldName = (collection) => {
      var _a;
      const col = this.getCollection(collection);
      const field = (_a = col == null ? void 0 : col.fields) == null ? void 0 : _a.find((x) => x.type === "string" && x.isTitle);
      return field == null ? void 0 : field.name;
    };
    this.getCollectionsByName = (collectionNames) => {
      return this.schema.collections.filter(
        (collection) => collectionNames.includes(collection.name)
      );
    };
    this.getCollection = (collectionName) => {
      const collection = this.schema.collections.find(
        (collection2) => collection2.name === collectionName
      );
      if (!collection) {
        throw new Error(`Expected to find collection named ${collectionName}`);
      }
      const extraFields = {};
      const templateInfo = this.getTemplatesForCollectable(collection);
      switch (templateInfo.type) {
        case "object":
          extraFields.fields = templateInfo.template.fields;
          break;
        case "union":
          extraFields.templates = templateInfo.templates;
          break;
      }
      return {
        // @ts-ignore FIXME: backwards compatibility, using `slug` should probably be deprecated
        slug: collection.name,
        ...extraFields,
        ...collection,
        format: collection.format || "md"
      };
    };
    this.getCollections = () => {
      return this.schema.collections.map(
        (collection) => this.getCollection(collection.name)
      ) || [];
    };
    this.getCollectionByFullPath = (filepath) => {
      const fileExtension = filepath.split(".").pop();
      const canonicalFilepath = canonicalPath(filepath);
      const possibleCollections = this.getCollections().filter((collection) => {
        var _a, _b;
        if (!canonicalFilepath.endsWith(`.gitkeep.${collection.format || "md"}`) && fileExtension !== (collection.format || "md")) {
          return false;
        }
        if (((_a = collection == null ? void 0 : collection.match) == null ? void 0 : _a.include) || ((_b = collection == null ? void 0 : collection.match) == null ? void 0 : _b.exclude)) {
          const matches = this.getMatches({ collection });
          const match = picomatch$1.isMatch(canonicalFilepath, matches);
          if (!match) {
            return false;
          }
        }
        const collectionPath = canonicalPath(collection.path);
        return collectionPath === "" || canonicalFilepath.startsWith(`${collectionPath}/`);
      });
      if (possibleCollections.length === 0) {
        throw new Error(`Unable to find collection for file at ${filepath}`);
      }
      if (possibleCollections.length === 1) {
        return possibleCollections[0];
      }
      if (possibleCollections.length > 1) {
        const longestMatch = possibleCollections.reduce((acc, collection) => {
          if (collection.path.length > acc.path.length) {
            return collection;
          }
          return acc;
        });
        return longestMatch;
      }
    };
    this.getCollectionAndTemplateByFullPath = (filepath, templateName) => {
      const collection = this.getCollectionByFullPath(filepath);
      if (!collection) {
        return void 0;
      }
      let template;
      const templates = this.getTemplatesForCollectable(collection);
      if (templates.type === "union") {
        if (templateName) {
          template = templates.templates.find(
            (template2) => lastItem(template2.namespace) === templateName
          );
          if (!template) {
            throw new Error(
              `Unable to determine template for item at ${filepath}`
            );
          }
        } else {
          throw new Error(
            `Unable to determine template for item at ${filepath}, no template name provided for collection with multiple templates`
          );
        }
      }
      if (templates.type === "object") {
        template = templates.template;
      }
      if (!template) {
        throw new Error(
          `Something went wrong while trying to determine template for ${filepath}`
        );
      }
      return { collection, template };
    };
    this.getTemplateForData = ({
      data,
      collection
    }) => {
      const templateInfo = this.getTemplatesForCollectable(collection);
      switch (templateInfo.type) {
        case "object":
          return templateInfo.template;
        case "union": {
          assertShape(
            data,
            (yup2) => yup2.object({ _template: yup2.string().required() })
          );
          const template = templateInfo.templates.find(
            (template2) => template2.namespace[template2.namespace.length - 1] === data._template
          );
          if (!template) {
            throw new Error(
              `Expected to find template named '${data._template}' for collection '${lastItem(collection.namespace)}'`
            );
          }
          return template;
        }
      }
    };
    this.transformPayload = (collectionName, payload) => {
      const collection = this.getCollection(collectionName);
      if (collection.templates) {
        const template = collection.templates.find((template2) => {
          if (typeof template2 === "string") {
            throw new Error("Global templates not supported");
          }
          return (payload == null ? void 0 : payload._template) === template2.name;
        });
        if (!template) {
          console.error(payload);
          throw new Error("Unable to find template for payload");
        }
        if (typeof template === "string") {
          throw new Error("Global templates not supported");
        }
        return {
          [collectionName]: {
            [template.name]: this.transformCollectablePayload(payload, template)
          }
        };
      }
      return {
        [collectionName]: this.transformCollectablePayload(payload, collection)
      };
    };
    this.transformCollectablePayload = (payload, collection) => {
      const accumulator = {};
      Object.entries(payload).forEach(([key, value]) => {
        var _a;
        if (typeof collection.fields === "string") {
          throw new Error("Global templates not supported");
        }
        const field = (_a = collection == null ? void 0 : collection.fields) == null ? void 0 : _a.find((field2) => {
          if (typeof field2 === "string") {
            throw new Error("Global templates not supported");
          }
          return field2.name === key;
        });
        if (field) {
          accumulator[key] = this.transformField(field, value);
        }
      });
      return accumulator;
    };
    this.transformField = (field, value) => {
      if (field.type === "object")
        if (field.templates) {
          if (field.list) {
            assertShape(
              value,
              (yup2) => yup2.array(yup2.object({ _template: yup2.string().required() }))
            );
            return value.map((item) => {
              const { _template, ...rest } = item;
              const template = field.templates.find((template2) => {
                if (typeof template2 === "string") {
                  return false;
                }
                return template2.name === _template;
              });
              if (typeof template === "string") {
                throw new Error("Global templates not supported");
              }
              if (!template) {
                throw new Error(`Expected to find template named '${_template}'`);
              }
              return {
                [_template]: this.transformCollectablePayload(rest, template)
              };
            });
          } else {
            assertShape(
              value,
              (yup2) => yup2.object({ _template: yup2.string().required() })
            );
            const { _template, ...rest } = value;
            return { [_template]: this.transformCollectablePayload(rest, field) };
          }
        } else {
          if (field.list) {
            assertShape(value, (yup2) => yup2.array(yup2.object()));
            return value.map((item) => {
              return this.transformCollectablePayload(item, field);
            });
          } else {
            assertShape(value, (yup2) => yup2.object());
            return this.transformCollectablePayload(value, field);
          }
        }
      else {
        return value;
      }
    };
    this.isMarkdownCollection = (collectionName) => {
      const collection = this.getCollection(collectionName);
      const format = collection.format;
      if (!format) {
        return true;
      }
      if (["markdown", "md"].includes(format)) {
        return true;
      }
      return false;
    };
    this.getTemplatesForCollectable = (collection) => {
      const extraFields = [];
      if (collection == null ? void 0 : collection.fields) {
        const template = collection;
        if (typeof template.fields === "string" || typeof template.fields === "undefined") {
          throw new Error("Expected template to have fields but none were found");
        }
        return {
          namespace: collection.namespace,
          type: "object",
          template: {
            ...template,
            fields: [...template.fields, ...extraFields]
          }
        };
      } else {
        if (collection == null ? void 0 : collection.templates) {
          return {
            namespace: collection.namespace,
            type: "union",
            templates: collection.templates.map((templateOrTemplateString) => {
              const template = templateOrTemplateString;
              return {
                ...template,
                fields: [...template.fields, ...extraFields]
              };
            })
          };
        } else {
          throw new Error(
            `Expected either fields or templates array to be defined on collection ${collection.namespace.join(
              "_"
            )}`
          );
        }
      }
    };
    this.legacyWalkFields = (cb) => {
      const walk = (collectionOrObject, collection, path) => {
        if (collectionOrObject.templates) {
          collectionOrObject.templates.forEach((template) => {
            template.fields.forEach((field) => {
              cb({ field, collection, path: [...path, template.name] });
            });
          });
        }
        if (collectionOrObject.fields) {
          collectionOrObject.fields.forEach((field) => {
            cb({ field, collection, path: [...path, field.name] });
            if (field.type === "rich-text" || field.type === "object") {
              walk(field, collection, [...path, field.name]);
            }
          });
        }
      };
      const collections = this.getCollections();
      collections.forEach((collection) => walk(collection, collection, []));
    };
    this.schema = config;
    this.legacyWalkFields(({ field, collection }) => {
      if (!("searchable" in field)) {
        if (field.type === "image") {
          field.searchable = false;
        } else {
          field.searchable = true;
        }
      }
      if (field.type === "rich-text") {
        if (field.parser) {
          return;
        }
        if (collection.format === "mdx") {
          field.parser = { type: "mdx" };
        } else {
          field.parser = { type: "markdown" };
        }
      }
      field.uid = field.uid || false;
    });
  }
  findReferencesFromCollection(name2) {
    const result = {};
    this.walkFields(({ field, collection: c, path }) => {
      if (c.name !== name2) {
        return;
      }
      if (field.type === "reference") {
        field.collections.forEach((name22) => {
          if (result[name22] === void 0) {
            result[name22] = [];
          }
          result[name22].push(path);
        });
      }
    });
    return result;
  }
  /**
   * Walk all fields in tina schema
   *
   * @param cb callback function invoked for each field
   */
  walkFields(cb) {
    const walk = (collectionOrObject, collection, path = "$") => {
      if (collectionOrObject.templates) {
        collectionOrObject.templates.forEach((template) => {
          const templatePath = `${path}.${template.name}`;
          template.fields.forEach((field) => {
            const fieldPath = field.list ? `${templatePath}[*].${field.name}` : `${templatePath}.${field.name}`;
            cb({ field, collection, path: fieldPath });
            if (field.type === "object") {
              walk(field, collection, fieldPath);
            }
          });
        });
      }
      if (collectionOrObject.fields) {
        collectionOrObject.fields.forEach((field) => {
          const fieldPath = field.list ? `${path}.${field.name}[*]` : `${path}.${field.name}`;
          cb({ field, collection, path: fieldPath });
          if (field.type === "object" && field.fields) {
            walk(field, collection, fieldPath);
          } else if (field.templates) {
            field.templates.forEach((template) => {
              const templatePath = `${fieldPath}.${template.name}`;
              template.fields.forEach((field2) => {
                const fieldPath2 = field2.list ? `${templatePath}[*].${field2.name}` : `${templatePath}.${field2.name}`;
                cb({ field: field2, collection, path: fieldPath2 });
                if (field2.type === "object") {
                  walk(field2, collection, fieldPath2);
                }
              });
            });
          }
        });
      }
    };
    this.getCollections().forEach((collection) => {
      walk(collection, collection);
    });
  }
  /**
   * This function returns an array of glob matches for a given collection.
   *
   * @param collection The collection to get the matches for. Can be a string or a collection object.
   * @returns An array of glob matches.
   */
  getMatches({
    collection: collectionOrString
  }) {
    var _a, _b;
    const collection = typeof collectionOrString === "string" ? this.getCollection(collectionOrString) : collectionOrString;
    const collectionPath = canonicalPath(collection.path);
    const pathSuffix = collectionPath ? "/" : "";
    const format = collection.format || "md";
    const matches = [];
    if ((_a = collection == null ? void 0 : collection.match) == null ? void 0 : _a.include) {
      const match = `${collectionPath}${pathSuffix}${collection.match.include}.${format}`;
      matches.push(match);
    }
    if ((_b = collection == null ? void 0 : collection.match) == null ? void 0 : _b.exclude) {
      const exclude = `!(${collectionPath}${pathSuffix}${collection.match.exclude}.${format})`;
      matches.push(exclude);
    }
    return matches;
  }
  matchFiles({
    collection,
    files
  }) {
    const matches = this.getMatches({ collection });
    const matcher = picomatch$1(matches);
    const matchedFiles = files.filter((file) => matcher(file));
    return matchedFiles;
  }
}
const resolveField = (field, schema) => {
  var _a;
  const extraFields = field.ui || {};
  switch (field.type) {
    case "number":
      return {
        component: "number",
        ...field,
        ...extraFields
      };
    case "datetime":
      return {
        component: "date",
        ...field,
        ...extraFields
      };
    case "boolean":
      return {
        component: "toggle",
        ...field,
        ...extraFields
      };
    case "image":
      if (field.list) {
        return {
          component: "list",
          field: {
            component: "image"
          },
          ...field,
          ...extraFields
        };
      }
      return {
        component: "image",
        clearable: true,
        ...field,
        ...extraFields
      };
    case "string":
      if (field.options) {
        if (field.list) {
          return {
            component: "checkbox-group",
            ...field,
            ...extraFields,
            options: field.options
          };
        }
        if (field.options[0] && typeof field.options[0] === "object" && field.options[0].icon) {
          return {
            component: "button-toggle",
            ...field,
            ...extraFields,
            options: field.options
          };
        }
        return {
          component: "select",
          ...field,
          ...extraFields,
          options: field.ui && field.ui.component !== "select" ? field.options : [{ label: "Choose an option", value: "" }, ...field.options]
        };
      }
      if (field.list) {
        return {
          // Allows component to be overridden for scalars
          component: "list",
          field: {
            component: "text"
          },
          ...field,
          ...extraFields
        };
      }
      return {
        // Allows component to be overridden for scalars
        component: "text",
        ...field,
        ...extraFields
      };
    case "object": {
      const templateInfo = schema.getTemplatesForCollectable(field);
      if (templateInfo.type === "object") {
        return {
          ...field,
          component: field.list ? "group-list" : "group",
          fields: templateInfo.template.fields.map(
            (field2) => resolveField(field2, schema)
          ),
          ...extraFields
        };
      } else if (templateInfo.type === "union") {
        const templates2 = {};
        const typeMap2 = {};
        templateInfo.templates.forEach((template) => {
          const extraFields2 = template.ui || {};
          const templateName = lastItem(template.namespace);
          typeMap2[templateName] = NAMER.dataTypeName(template.namespace);
          templates2[lastItem(template.namespace)] = {
            label: template.label || templateName,
            key: templateName,
            namespace: [...field.namespace, templateName],
            fields: template.fields.map((field2) => resolveField(field2, schema)),
            ...extraFields2
          };
          return true;
        });
        return {
          ...field,
          typeMap: typeMap2,
          namespace: field.namespace,
          component: field.list ? "blocks" : "not-implemented",
          templates: templates2,
          ...extraFields
        };
      } else {
        throw new Error(`Unknown object for resolveField function`);
      }
    }
    case "rich-text":
      const templates = {};
      (_a = field.templates) == null ? void 0 : _a.forEach((template) => {
        if (typeof template === "string") {
          throw new Error(`Global templates not yet supported for rich-text`);
        } else {
          const extraFields2 = template.ui || {};
          const templateName = lastItem(template.namespace);
          NAMER.dataTypeName(template.namespace);
          templates[lastItem(template.namespace)] = {
            label: template.label || templateName,
            key: templateName,
            inline: template.inline,
            name: templateName,
            match: template.match,
            fields: template.fields.map((field2) => resolveField(field2, schema)),
            ...extraFields2
          };
          return true;
        }
      });
      return {
        ...field,
        templates: Object.values(templates),
        component: "rich-text",
        ...extraFields
      };
    case "password":
      return {
        component: "password",
        ...field,
        ...extraFields
      };
    case "reference":
      return {
        ...field,
        component: "reference",
        ...extraFields
      };
    default:
      throw new Error(`Unknown field type ${field.type}`);
  }
};
const resolveForm = ({
  collection,
  basename,
  template,
  schema
}) => {
  return {
    id: basename,
    label: collection.label,
    name: basename,
    fields: template.fields.map((field) => {
      return resolveField(field, schema);
    })
  };
};
const CONTENT_FORMATS = [
  "mdx",
  "md",
  "markdown",
  "json",
  "yaml",
  "yml",
  "toml"
];
const parseZodError = ({ zodError }) => {
  var _a, _b, _c, _d;
  const errors = zodError.flatten((issue) => {
    const moreInfo = [];
    if (issue.code === "invalid_union") {
      issue.unionErrors.map((unionError) => {
        moreInfo.push(parseZodError({ zodError: unionError }));
      });
    }
    const errorMessage = `${issue == null ? void 0 : issue.message}
Additional information: 
	- Error found at path ${issue.path.join(
      "."
    )}
`;
    const errorMessages = [errorMessage, ...moreInfo];
    return {
      errors: errorMessages
    };
  });
  const formErrors = errors.formErrors.flatMap((x) => x.errors);
  const parsedErrors = [
    ...((_b = (_a = errors.fieldErrors) == null ? void 0 : _a.collections) == null ? void 0 : _b.flatMap((x) => x.errors)) || [],
    ...((_d = (_c = errors.fieldErrors) == null ? void 0 : _c.config) == null ? void 0 : _d.flatMap((x) => x.errors)) || [],
    ...formErrors
  ];
  return parsedErrors;
};
const name = z.string({
  required_error: "Name is required but not provided",
  invalid_type_error: "Name must be a string"
}).superRefine((val, ctx) => {
  if (val.match(/^[a-zA-Z0-9_]*$/) === null) {
    ctx.addIssue({
      code: "custom",
      message: `name, "${val}" must be alphanumeric and can only contain underscores. (No spaces, dashes, special characters, etc.)
If you only want to display this value in the CMS UI, you can use the label property to customize it.

If you need to use this value in your content you can use the \`nameOverride\` property to customize the value. For example:
\`\`\`
{
  "name": ${val.replace(/[^a-zA-Z0-9]/g, "_")},
  "nameOverride": ${val},
  // ...
}
\`\`\``
    });
  }
});
const duplicateFieldErrorMessage = (fields) => `Fields must have unique names. Found duplicate field names: [${fields}]`;
const duplicateTemplateErrorMessage = (templates) => `Templates must have unique names. Found duplicate template names: [${templates}]`;
const duplicateCollectionErrorMessage = (collection) => `Collections must have unique names. Found duplicate collection names: [${collection}]`;
const TypeName = [
  "string",
  "boolean",
  "number",
  "datetime",
  "image",
  "object",
  "reference",
  "rich-text"
];
const formattedTypes = `  - ${TypeName.join("\n  - ")}`;
const typeTypeError = `Invalid \`type\` property. \`type\` expected to be one of the following values:
${formattedTypes}`;
const typeRequiredError = `Missing \`type\` property. Please add a \`type\` property with one of the following:
${formattedTypes}`;
const Option = z.union(
  [
    z.string(),
    z.object({ label: z.string(), value: z.string() }),
    z.object({ icon: z.any(), value: z.string() })
  ],
  {
    errorMap: () => {
      return {
        message: "Invalid option array. Must be a string[] or {label: string, value: string}[] or {icon: React.ComponentType<any>, value: string}[]"
      };
    }
  }
);
const TinaField = z.object({
  name,
  label: z.string().or(z.boolean()).optional(),
  description: z.string().optional(),
  required: z.boolean().optional()
});
const FieldWithList = TinaField.extend({ list: z.boolean().optional() });
const TinaScalerBase = FieldWithList.extend({
  options: z.array(Option).optional(),
  uid: z.boolean().optional()
});
const StringField = TinaScalerBase.extend({
  type: z.literal("string", {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError
  }),
  isTitle: z.boolean().optional()
});
const PasswordField = TinaScalerBase.extend({
  type: z.literal("password", {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError
  })
});
const BooleanField = TinaScalerBase.extend({
  type: z.literal("boolean", {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError
  })
});
const NumberField = TinaScalerBase.extend({
  type: z.literal("number", {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError
  })
});
const ImageField = TinaScalerBase.extend({
  type: z.literal("image", {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError
  })
});
const DateTimeField = TinaScalerBase.extend({
  type: z.literal("datetime", {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError
  }),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional()
});
const ReferenceField = FieldWithList.extend({
  type: z.literal("reference", {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError
  })
});
const TinaFieldZod = z.lazy(() => {
  const TemplateTemp = z.object({
    label: z.string().optional(),
    name,
    fields: z.array(TinaFieldZod),
    match: z.object({
      start: z.string(),
      end: z.string(),
      name: z.string().optional()
    }).optional()
  }).superRefine((val, ctx) => {
    const dups = findDuplicates(val == null ? void 0 : val.fields.map((x) => x.name));
    if (dups) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: duplicateFieldErrorMessage(dups)
      });
    }
  });
  const ObjectField = FieldWithList.extend({
    // needs to be redefined here to avoid circle deps
    type: z.literal("object", {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError
    }),
    fields: z.array(TinaFieldZod).min(1, "Property `fields` cannot be empty.").optional().superRefine((val, ctx) => {
      const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: duplicateFieldErrorMessage(dups)
        });
      }
    }),
    templates: z.array(TemplateTemp).min(1, "Property `templates` cannot be empty.").optional().superRefine((val, ctx) => {
      const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: duplicateTemplateErrorMessage(dups)
        });
      }
    })
  });
  const RichTextField = FieldWithList.extend({
    type: z.literal("rich-text", {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError
    }),
    templates: z.array(TemplateTemp).optional().superRefine((val, ctx) => {
      const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: duplicateTemplateErrorMessage(dups)
        });
      }
    })
  });
  return z.discriminatedUnion(
    "type",
    [
      StringField,
      BooleanField,
      NumberField,
      ImageField,
      DateTimeField,
      ReferenceField,
      ObjectField,
      RichTextField,
      PasswordField
    ],
    {
      errorMap: (issue, ctx) => {
        var _a, _b;
        if (issue.code === "invalid_union_discriminator") {
          if (!((_a = ctx.data) == null ? void 0 : _a.type)) {
            return {
              message: `Missing \`type\` property in field \`${ctx.data.name}\`. Please add a \`type\` property with one of the following:
${formattedTypes}`
            };
          }
          return {
            message: `Invalid \`type\` property in field \`${ctx.data.name}\`. In the schema is 'type: ${(_b = ctx.data) == null ? void 0 : _b.type}' but expected one of the following:
${formattedTypes}`
          };
        }
        return {
          message: issue.message || ""
        };
      }
    }
  ).superRefine((val, ctx) => {
    if (val.type === "string") {
      const stringifiedField = JSON.stringify(val, null, 2);
      if (val.isTitle && val.list) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `\`list: true\` is not allowed when using \`isTitle\` for fields of \`type: string\`. Error found in field:
${stringifiedField}`
        });
      }
      if (val.isTitle && !val.required) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Property \`required: true\` is required when using \`isTitle\` for fields of \`type: string\`. Error found in field:
${stringifiedField}`
        });
      }
      if (val.uid && val.list) {
        if (val.list) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `\`list: true\` is not allowed when using \`uid\` for fields of \`type: string\`. Error found in field:
${stringifiedField}`
          });
        }
      }
      if (val.uid && !val.required) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Property \`required: true\` is required when using \`uid\` for fields of \`type: string\`. Error found in field:
${stringifiedField}`
        });
      }
    }
    if (val.type === "object") {
      if (!(val == null ? void 0 : val.templates) && !(val == null ? void 0 : val.fields)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fields of `type: object` must have either `templates` or `fields` property."
        });
        return false;
      }
      if ((val == null ? void 0 : val.templates) && (val == null ? void 0 : val.fields)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fields of `type: object` must have either `templates` or `fields` property, not both."
        });
        return false;
      }
    }
    return true;
  });
});
const tinaConfigKey = z$1.object({
  publicFolder: z$1.string(),
  mediaRoot: z$1.string(),
  static: z$1.boolean().nullish()
}).strict().optional();
const tinaSearchKey = z$1.object({
  indexerToken: z$1.string().optional(),
  stopwordLanguages: z$1.array(z$1.string()).nonempty().optional(),
  tokenSplitRegex: z$1.string().optional()
}).strict().optional();
const tinaConfigZod = z$1.object({
  client: z$1.object({ referenceDepth: z$1.number().optional() }).optional(),
  media: z$1.object({
    tina: tinaConfigKey,
    loadCustomStore: z$1.function().optional()
  }).optional(),
  search: z$1.object({
    tina: tinaSearchKey,
    searchClient: z$1.any().optional(),
    indexBatchSize: z$1.number().gte(1).optional(),
    maxSearchIndexFieldLength: z$1.number().gte(1).optional()
  }).optional()
});
const validateTinaCloudSchemaConfig = (config) => {
  const newConfig = tinaConfigZod.parse(config);
  return newConfig;
};
const Template = z.object({
  label: z.string({
    invalid_type_error: "Invalid data type for property `label`. Must be of type `string`",
    required_error: "Missing `label` property. Property `label` is required."
  }),
  name,
  fields: z.array(TinaFieldZod)
}).superRefine((val, ctx) => {
  var _a;
  const dups = findDuplicates((_a = val.fields) == null ? void 0 : _a.map((x) => x.name));
  if (dups) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: duplicateFieldErrorMessage(dups)
    });
  }
});
const CollectionBaseSchema = z.object({
  label: z.string().optional(),
  name: name.superRefine((val, ctx) => {
    if (val === "relativePath") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid `name` property. `name` cannot be 'relativePath' as it is a reserved field name."
      });
    }
  }),
  path: z.string().transform((val) => val.replace(/^\/|\/$/g, "")).superRefine((val, ctx) => {
    if (val === ".") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid `path` property. `path` cannot be '.'. Please use '/' or '' instead."
      });
    }
  }),
  format: z.enum(CONTENT_FORMATS).optional(),
  isAuthCollection: z.boolean().optional(),
  isDetached: z.boolean().optional()
});
const TinaCloudCollection = CollectionBaseSchema.extend({
  fields: z.array(TinaFieldZod).min(1, "Property `fields` cannot be empty.").optional().superRefine((val, ctx) => {
    const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
    if (dups) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: duplicateFieldErrorMessage(dups)
      });
    }
  }).superRefine((val, ctx) => {
    const arr = (val == null ? void 0 : val.filter((x) => x.type === "string" && x.isTitle)) || [];
    if (arr.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The following fields have the property \`isTitle\`: [${arr.map((field) => field.name).join(", ")}]. Only one can contain the property \`isTitle\`.`
      });
    }
  }).superRefine((val, ctx) => {
    const arr = (val == null ? void 0 : val.filter((x) => x.uid)) || [];
    if (arr.length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The following fields have the property \`uid\`: [${arr.map((field) => field.name).join(", ")}]. Only one can contain the property \`uid\`.`
      });
    }
  }).superRefine((val, ctx) => {
    const arr = (val == null ? void 0 : val.filter((x) => x.type === "password")) || [];
    if (arr.length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The following fields have \`type: password\`: [${arr.map((field) => field.name).join(", ")}]. Only one can be of \`type: password\`.`
      });
    }
  }),
  templates: z.array(Template).min(1, "Property `templates` cannot be empty.").optional().superRefine((val, ctx) => {
    const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
    if (dups) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: duplicateFieldErrorMessage(dups)
      });
    }
  })
}).superRefine((val, ctx) => {
  if (!(val == null ? void 0 : val.templates) && !(val == null ? void 0 : val.fields)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Fields of `type: object` must have either `templates` or `fields` property."
    });
    return false;
  }
  if ((val == null ? void 0 : val.templates) && (val == null ? void 0 : val.fields)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Fields of `type: object` must have either `templates` or `fields` property, not both."
    });
    return false;
  }
});
const TinaCloudSchemaZod = z.object({
  collections: z.array(TinaCloudCollection),
  config: tinaConfigZod.optional()
}).superRefine((val, ctx) => {
  var _a, _b, _c, _d;
  const dups = findDuplicates((_a = val.collections) == null ? void 0 : _a.map((x) => x.name));
  if (dups) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: duplicateCollectionErrorMessage(dups),
      fatal: true
    });
  }
  if (((_b = val.collections) == null ? void 0 : _b.filter((x) => x.isAuthCollection).length) > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Only one collection can be marked as `isAuthCollection`.",
      fatal: true
    });
  }
  const media = (_c = val == null ? void 0 : val.config) == null ? void 0 : _c.media;
  if (media && media.tina && media.loadCustomStore) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Cannot have both `loadCustomStore` and `tina`. Must use one or the other.",
      fatal: true,
      path: ["config", "media"]
    });
  }
  const search = (_d = val == null ? void 0 : val.config) == null ? void 0 : _d.search;
  if (search && search.tina && search.searchClient) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Cannot have both `searchClient` and `tina`. Must use one or the other.",
      fatal: true,
      path: ["config", "search"]
    });
  }
});
class TinaSchemaValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "TinaSchemaValidationError";
  }
}
const validateSchema = ({ schema }) => {
  try {
    TinaCloudSchemaZod.parse(schema);
  } catch (e) {
    if (e instanceof ZodError) {
      const errors = parseZodError({ zodError: e });
      throw new TinaSchemaValidationError(errors.join("\n"));
    }
    throw new Error(e);
  }
};
export {
  CONTENT_FORMATS,
  NAMER,
  TINA_HOST,
  TinaSchema,
  TinaSchemaValidationError,
  addNamespaceToSchema,
  canonicalPath,
  normalizePath,
  parseURL,
  resolveField,
  resolveForm,
  validateSchema,
  validateTinaCloudSchemaConfig
};
