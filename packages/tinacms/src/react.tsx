import { addMetadata, hashFromQuery } from '@tinacms/bridge/metadata';
import { QUICK_EDIT_CSS } from '@tinacms/bridge/quick-edit-css';
import React from 'react';

export { addMetadata, hashFromQuery };

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
      style.textContent = QUICK_EDIT_CSS;
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
        if (fieldName && isInTinaIframe) {
          parent.postMessage(
            { type: 'field:selected', fieldName: fieldName },
            window.location.origin
          );
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

export { tinaField } from './tina-field';
