// Assert a boot/config invariant: throw when `condition` is falsy, and narrow the type
// afterwards (`asserts condition`) so callers drop the manual `if (!x) throw` at guard
// sites. tiny-invariant strips messages in production; here production throws the stable
// grep-able `code` instead, so a stripped error still points at its guard, while
// development gets `code: message` in full.
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
