/**
 * Server-side mirror of the addMetadata + hashFromQuery helpers in
 * packages/tinacms/src/react.tsx. We need them server-side here so
 * `tinaField()` markers stamped into Astro templates resolve to the
 * same query id and field path the admin sidebar uses.
 */
const SYSTEM_KEYS = new Set([
  '__typename',
  '_sys',
  '_internalSys',
  '_values',
  '_internalValues',
  '_content_source',
  '_tina_metadata',
]);

export function addContentSourceMetadata<T>(
  id: string,
  obj: T,
  path: (string | number)[] = [],
): T {
  if (obj === null) return obj;
  if (isScalarOrUndefined(obj)) return obj;
  if (obj instanceof String) return obj.valueOf() as unknown as T;

  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      addContentSourceMetadata(id, item, [...path, index]),
    ) as unknown as T;
  }

  const next = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SYSTEM_KEYS.has(key)) {
      next[key] = value;
    } else {
      next[key] = addContentSourceMetadata(id, value, [...path, key]);
    }
  }

  if (
    next &&
    typeof next === 'object' &&
    'type' in next &&
    next.type === 'root'
  ) {
    return next as unknown as T;
  }

  return { ...next, _content_source: { queryId: id, path } } as unknown as T;
}

function isScalarOrUndefined(value: unknown): boolean {
  const type = typeof value;
  if (type === 'string') return true;
  if (type === 'number') return true;
  if (type === 'boolean') return true;
  if (type === 'undefined') return true;
  if (value == null) return true;
  if (value instanceof String) return true;
  if (value instanceof Number) return true;
  if (value instanceof Boolean) return true;
  return false;
}

export function hashFromQuery(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xffffffff;
  }
  return Math.abs(hash).toString(36);
}
