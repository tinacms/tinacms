// Assert an invariant of the boot or of the config. It throws when `condition` is false,
// and it then narrows the type with `asserts condition`. A caller therefore needs no
// `if (!x) throw` at a guard. tiny-invariant removes its messages in production. This
// function throws the `code` there instead. The code is stable, and a search finds it, so
// a stripped error still points at its guard. Development gets `code: message` in full.
const isProduction =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

export function invariant(
  condition: unknown,
  code: string,
  message: string
): asserts condition {
  if (condition) return;
  throw new Error(isProduction ? code : `${code}: ${message}`);
}
