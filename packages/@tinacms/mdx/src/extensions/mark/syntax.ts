/**
 * Micromark syntax extension for `==highlight==` marks.
 *
 * Modelled after `micromark-extension-gfm-strikethrough` (the `~~delete~~`
 * construct) so that `==text==` is tokenised in exactly the same way.
 */

import { splice } from 'micromark-util-chunked';
import { classifyCharacter } from 'micromark-util-classify-character';
import { resolveAll } from 'micromark-util-resolve-all';
import type {
  Code,
  Event,
  Extension,
  Resolver,
  State,
  Token,
  TokenizeContext,
  Tokenizer,
} from 'micromark-util-types';

const EQUALS = 61; // '=' character code

/**
 * Resolve intermediate `highlightSequenceTemporary` tokens into proper
 * `highlight` / `highlightSequence` / `highlightText` tokens.
 */
const resolveAllMark: Resolver = function (events, context) {
  let index = -1;

  while (++index < events.length) {
    if (
      events[index]![0] === 'enter' &&
      events[index]![1].type === 'highlightSequenceTemporary' &&
      events[index]![1]._close
    ) {
      let open = index;

      while (open--) {
        if (
          events[open]![0] === 'exit' &&
          events[open]![1].type === 'highlightSequenceTemporary' &&
          events[open]![1]._open &&
          // Both sequences must be exactly 2 characters long.
          events[index]![1].end.offset - events[index]![1].start.offset ===
            events[open]![1].end.offset - events[open]![1].start.offset
        ) {
          events[index]![1].type = 'highlightSequence';
          events[open]![1].type = 'highlightSequence';

          const highlight: Token = {
            type: 'highlight',
            start: Object.assign({}, events[open]![1].start),
            end: Object.assign({}, events[index]![1].end),
          };

          const highlightText: Token = {
            type: 'highlightText',
            start: Object.assign({}, events[open]![1].end),
            end: Object.assign({}, events[index]![1].start),
          };

          const nextEvents: Event[] = [
            ['enter', highlight, context],
            ['enter', events[open]![1], context],
            ['exit', events[open]![1], context],
            ['enter', highlightText, context],
          ];

          const insideSpan = context.parser.constructs.insideSpan.null;
          if (insideSpan) {
            splice(
              nextEvents,
              nextEvents.length,
              0,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              resolveAll(insideSpan as any, events.slice(open + 1, index) as any, context as any) as any
            );
          }

          splice(nextEvents, nextEvents.length, 0, [
            ['exit', highlightText, context],
            ['enter', events[index]![1], context],
            ['exit', events[index]![1], context],
            ['exit', highlight, context],
          ]);

          splice(events, open - 1, index - open + 3, nextEvents);
          index = open + nextEvents.length - 2;
          break;
        }
      }
    }
  }

  // Any unresolved temporary sequences become plain data.
  index = -1;
  while (++index < events.length) {
    if (events[index]![1].type === 'highlightSequenceTemporary') {
      events[index]![1].type = 'data';
    }
  }

  return events;
};

/**
 * Tokenise a `==` sequence.  Only sequences of exactly 2 `=` characters
 * are accepted (we do NOT support single-`=` highlight).
 */
function tokenizeMark(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: State,
  nok: State
): State {
  const previous = this.previous;
  const events = this.events;
  let size = 0;

  return start;

  function start(code: Code): State | void {
    // Reject if the previous character was also `=` (avoid matching `===`)
    if (
      previous === EQUALS &&
      events[events.length - 1]![1].type !== 'characterEscape'
    ) {
      return nok(code);
    }
    effects.enter('highlightSequenceTemporary');
    return more(code);
  }

  function more(code: Code): State | void {
    const before = classifyCharacter(previous);
    if (code === EQUALS) {
      // Reject a third `=` in a row.
      if (size > 1) return nok(code);
      effects.consume(code);
      size++;
      return more as State;
    }
    // Require exactly 2 `=` signs.
    if (size < 2) return nok(code);
    const token = effects.exit('highlightSequenceTemporary');
    const after = classifyCharacter(code);
    token._open = !after || (after === 2 && Boolean(before));
    token._close = !before || (before === 2 && Boolean(after));
    return ok(code);
  }
}

export function markSyntax(): Extension {
  const tokenizer = {
    tokenize: tokenizeMark,
    resolveAll: resolveAllMark,
  };

  return {
    text: {
      [EQUALS]: tokenizer,
    },
    insideSpan: {
      null: [tokenizer],
    },
    attentionMarkers: {
      null: [EQUALS],
    },
  };
}

