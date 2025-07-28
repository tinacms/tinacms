import React from 'react';

export function useTina<T extends object>(props: {
  query: string;
  variables: object;
  data: T;
  experimental___selectFormByFormId?: () => string | false | undefined;
}): { data: T; isClient: boolean } {
  const stringifiedQuery = JSON.stringify({
    query: props.query,
    variables: props.variables,
  });
  const id = React.useMemo(
    () => hashFromQuery(stringifiedQuery),
    [stringifiedQuery]
  );

  const processedData = React.useMemo(() => {
    if (props.data) {
      // We make a deep copy to avoid mutating the original props.data
      const dataCopy = JSON.parse(JSON.stringify(props.data));
      return addMetadata(id, dataCopy, []);
    }
  }, [props.data, id]);

  const [data, setData] = React.useState(processedData);
  const [isClient, setIsClient] = React.useState(false);
  const [quickEditEnabled, setQuickEditEnabled] = React.useState(false);
  const [isInTinaIframe, setIsInTinaIframe] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setData(processedData);
    parent.postMessage({
      type: 'url-changed',
    });
  }, [id, processedData]);

  React.useEffect(() => {
    if (quickEditEnabled) {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = `
        [data-tina-field] {
          outline: 2px dashed rgba(34,150,254,0.5);
          transition: box-shadow ease-out 150ms;
        }
        [data-tina-field]:hover {
          box-shadow: inset 100vi 100vh rgba(34,150,254,0.3);
          outline: 2px solid rgba(34,150,254,1);
          cursor: pointer;
        }
        [data-tina-field-overlay] {
          outline: 2px dashed rgba(34,150,254,0.5);
          position: relative;
        }
        [data-tina-field-overlay]:hover {
          cursor: pointer;
          outline: 2px solid rgba(34,150,254,1);
        }
        [data-tina-field-overlay]::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 20;
          transition: opacity ease-out 150ms;
          background-color: rgba(34,150,254,0.3);
          opacity: 0;
        }
        [data-tina-field-overlay]:hover::after {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
      document.body.classList.add('__tina-quick-editing-enabled');

      function mouseDownHandler(e) {
        const attributeNames = e.target.getAttributeNames();
        // If multiple attributes start with data-tina-field, only the first is used
        const tinaAttribute = attributeNames.find((name) =>
          name.startsWith('data-tina-field')
        );

        let fieldName;
        if (tinaAttribute) {
          e.preventDefault();
          e.stopPropagation();
          fieldName = e.target.getAttribute(tinaAttribute);
        } else {
          const ancestor = e.target.closest(
            '[data-tina-field], [data-tina-field-overlay]'
          );
          if (ancestor) {
            const attributeNames = ancestor.getAttributeNames();
            const tinaAttribute = attributeNames.find((name) =>
              name.startsWith('data-tina-field')
            );
            if (tinaAttribute) {
              e.preventDefault();
              e.stopPropagation();
              fieldName = ancestor.getAttribute(tinaAttribute);
            }
          }
        }
        if (fieldName) {
          if (isInTinaIframe) {
            parent.postMessage(
              { type: 'field:selected', fieldName: fieldName },
              window.location.origin
            );
          } else {
            // if (preview?.redirect) {
            //   const tinaAdminBasePath = preview.redirect.startsWith('/')
            //     ? preview.redirect
            //     : `/${preview.redirect}`
            //   const tinaAdminPath = `${tinaAdminBasePath}/index.html#/~${window.location.pathname}?active-field=${fieldName}`
            //   window.location.assign(tinaAdminPath)
            // }
          }
        }
      }
      document.addEventListener('click', mouseDownHandler, true);

      return () => {
        document.removeEventListener('click', mouseDownHandler, true);
        document.body.classList.remove('__tina-quick-editing-enabled');
        style.remove();
      };
    }
  }, [quickEditEnabled, isInTinaIframe]);

  React.useEffect(() => {
    if (props?.experimental___selectFormByFormId) {
      parent.postMessage({
        type: 'user-select-form',
        formId: props.experimental___selectFormByFormId(),
      });
    }
  }, [id]);

  React.useEffect(() => {
    const { experimental___selectFormByFormId, ...rest } = props;
    parent.postMessage({ type: 'open', ...rest, id }, window.location.origin);
    const handleMessage = (event) => {
      if (event.data.type === 'quickEditEnabled') {
        setQuickEditEnabled(event.data.value);
      }
      if (event.data.id === id && event.data.type === 'updateData') {
        const rawData = event.data.data;
        const newlyProcessedData = addMetadata(
          id,
          JSON.parse(JSON.stringify(rawData)),
          []
        );
        setData(newlyProcessedData);
        setIsInTinaIframe(true);
        const anyTinaField = document.querySelector('[data-tina-field]');
        if (anyTinaField) {
          parent.postMessage(
            { type: 'quick-edit', value: true },
            window.location.origin
          );
        } else {
          parent.postMessage(
            { type: 'quick-edit', value: false },
            window.location.origin
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      parent.postMessage({ type: 'close', id }, window.location.origin);
    };
  }, [id, setQuickEditEnabled]);

  return { data, isClient };
}

export function useEditState(): { edit: boolean } {
  const [edit, setEdit] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      parent.postMessage({ type: 'isEditMode' }, window.location.origin);
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'tina:editMode') {
          setEdit(true);
        }
      });
    }
  }, []);
  return { edit } as any;
}

/**
 * Grab the field name for the given attribute
 * to signal to Tina which DOM element the field
 * is working with.
 */
/**
 * Generate a field identifier for Tina to associate DOM elements with form fields.
 * Format: "queryId---path.to.field" or "queryId---path.to.array.index"
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

  // Base path without property
  if (!property) {
    return `${queryId}---${path.join('.')}`;
  }

  // Build full path with property and optional index
  const fullPath =
    typeof index === 'number'
      ? [...path, property, index]
      : [...path, property];

  return `${queryId}---${fullPath.join('.')}`;
};

/**
 * FIX: This function is updated to be more robust. It explicitly checks for
 * `null` and `String` objects to prevent them from being processed as
 * iterable objects, which is the root cause of the "Objects are not valid
 * as a React child" error.
 */
export const addMetadata = <T extends object>(
  id: string,
  obj: T,
  path: (string | number)[] = []
): T => {
  // Guard against null values, which have a typeof 'object'
  if (obj === null) {
    return obj;
  }

  // Guard against primitive values
  if (isScalarOrUndefined(obj)) {
    return obj;
  }

  // Guard against String objects, returning their primitive value.
  if (obj instanceof String) {
    return obj.valueOf() as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      addMetadata(id, item, [...path, index])
    ) as unknown as T;
  }

  const transformedObj = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];

    // Safely skip system keys and copy them over without recursion
    if (
      [
        '__typename',
        '_sys',
        '_internalSys',
        '_values',
        '_internalValues',
        '_content_source',
        '_tina_metadata',
      ].includes(key)
    ) {
      transformedObj[key] = value;
    } else {
      transformedObj[key] = addMetadata(id, value, currentPath);
    }
  }

  if (
    transformedObj &&
    typeof transformedObj === 'object' &&
    'type' in transformedObj &&
    (transformedObj as { type?: unknown }).type === 'root'
  ) {
    return transformedObj;
  }

  return { ...transformedObj, _content_source: { queryId: id, path } };
};

function isScalarOrUndefined(value: unknown) {
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
 * This is a pretty rudimentary approach to hashing the query and variables to
 * ensure we treat multiple queries on the page uniquely. It's possible
 * that we would have collisions, and I'm not sure of the likeliness but seems
 * like it'd be rare.
 */
export const hashFromQuery = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xffffffff; // Apply bitwise AND to ensure non-negative value
  }
  const nonNegativeHash = Math.abs(hash);
  const alphanumericHash = nonNegativeHash.toString(36);
  return alphanumericHash;
};
