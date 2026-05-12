/**
 * Canonical content-source metadata helpers.
 *
 * `addMetadata` walks a query result and stamps every non-system object with
 * `_content_source: { queryId, path }`. The pair is what `tinaField()` reads
 * to build the `data-tina-field` markers the admin uses for click-to-focus.
 *
 * `hashFromQuery` derives the queryId from `JSON.stringify({ query, variables })`.
 * Both ends of the wire (page render, admin sidebar) hash the same string so
 * overlay updates address the same form.
 *
 * One source of truth for React (useTina), Astro (server-side overlay), and
 * any future framework integration. Kept dependency-free so it runs in any
 * runtime — browser, Node, edge.
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

export const addMetadata = <T>(
  id: string,
  obj: T,
  path: (string | number)[] = []
): T => {
  if (obj === null) return obj;
  if (isScalarOrUndefined(obj)) return obj;
  if (obj instanceof String) return obj.valueOf() as unknown as T;

  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      addMetadata(id, item, [...path, index])
    ) as unknown as T;
  }

  const next = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SYSTEM_KEYS.has(key)) {
      next[key] = value;
    } else {
      next[key] = addMetadata(id, value, [...path, key]);
    }
  }

  // Rich-text root nodes carry their own children traversal; tagging them
  // with `_content_source` would shadow the field-level marker on the
  // wrapping element.
  if (
    next &&
    typeof next === 'object' &&
    'type' in next &&
    next.type === 'root'
  ) {
    return next as unknown as T;
  }

  return { ...next, _content_source: { queryId: id, path } } as unknown as T;
};

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

/**
 * Rudimentary string hash. Both ends of the wire derive the queryId from
 * the same JSON.stringify({ query, variables }) — collisions are theoretically
 * possible but vanishingly rare in practice.
 */
export const hashFromQuery = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xffffffff;
  }
  return Math.abs(hash).toString(36);
};
