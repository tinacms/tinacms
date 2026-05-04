/**
 * Generate a field identifier for Tina to associate DOM elements with form fields.
 * Format: "queryId---path.to.field" or "queryId---path.to.array.index"
 *
 * Mirror of `tinacms/tina-field` so non-React frontends can consume it without
 * pulling tinacms (and its React deps) into their bundle. Source-of-truth lives
 * in packages/tinacms/src/tina-field.ts; keep these two in sync.
 */
export const tinaField = <
  T extends
    | {
        _content_source?: {
          queryId: string;
          path: (number | string)[];
        };
      }
    | Record<string, unknown>
    | null
    | undefined,
>(
  object: T,
  property?: keyof Omit<NonNullable<T>, '__typename' | '_sys'>,
  index?: number
): string => {
  const contentSource = object?._content_source as
    | { queryId: string; path: (number | string)[] }
    | undefined;

  if (!contentSource) {
    return '';
  }

  const { queryId, path } = contentSource;

  if (!property) {
    return `${queryId}---${path.join('.')}`;
  }

  const fullPath =
    typeof index === 'number'
      ? [...path, property, index]
      : [...path, property];

  return `${queryId}---${fullPath.join('.')}`;
};
