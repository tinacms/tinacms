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
