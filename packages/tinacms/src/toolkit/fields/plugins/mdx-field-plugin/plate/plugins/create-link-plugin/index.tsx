import React, { useEffect } from 'react';
import { NestedForm } from '../../nested-form';
import { Button } from '@tinacms/toolkit';
import { LinkPlugin } from '@udecode/plate-link/react';
import { PlateEditor, useEditorState } from '@udecode/plate/react';
import { ElementApi, Node, NodeApi } from '@udecode/plate';

type LinkElement = {
  url?: string;
  title?: string;
  text: string | undefined;
};

// TODO [2025-05-28]: Potentially unused. Searched usage but found none.
// Consider removing after verifying with the team
export const wrapOrRewrapLink = (editor) => {
  const baseLink = {
    type: 'a',
    url: '',
    title: '',
    children: [{ text: '' }],
  };

  // if our cursor is inside an existing link, but don't have the text selected, select it now
  if (editor.api.isCollapsed()) {
    const [, path] = editor.api.above({
      match: (n) =>
        !NodeApi.isEditor(n) &&
        ElementApi.isElement(n) &&
        editor.getType(LinkPlugin.key),
    });
    editor.tf.select(path);
  }
  if (isLinkActive(editor)) {
    const [link] = getLinks(editor);
    baseLink.url = link[0].url;
    baseLink.title = link[0].title;

    unwrapLink(editor);
  }

  editor.tf.wrapNodes(baseLink, { split: true });
};

const matchLink = (n: Node) =>
  !NodeApi.isEditor(n) && ElementApi.isElement(n) && n.type === LinkPlugin.key;

// TODO [2025-05-28]: Potentially unused. Searched usage but found none.
// Consider removing after verifying with the team
export const LinkForm = (props) => {
  const [initialValues, setInitialValues] = React.useState<{
    url: string;
    title: string;
  }>({ url: '', title: '' });
  const [formValues, setFormValues] = React.useState<any>({});
  const editor = useEditorState();
  // Memoize selection so we hang onto when editor loses focus
  const selection = React.useMemo(() => editor.selection, []);
  useEffect(() => {
    const [link] = getLinks(editor);
    setInitialValues({
      url: link?.[0].url ? link[0].url : '',
      title: link?.[0].title ? link[0].title : '',
    });
  }, [editor, setInitialValues]);

  const handleUpdate = React.useCallback(() => {
    const linksInSelection = editor.api.nodes<LinkElement>({
      match: matchLink,
      at: selection,
    });
    if (linksInSelection) {
      for (const [, location] of linksInSelection) {
        editor.tf.setNodes(formValues, {
          match: matchLink,
          at: location,
        });
      }
    }

    props.onClose();
  }, [editor, formValues]);

  const UpdateLink = React.useCallback(
    () => (
      <Button variant='primary' onClick={handleUpdate}>
        Update Link
      </Button>
    ),
    [handleUpdate]
  );

  return (
    <NestedForm
      id={props.id}
      label='Link'
      fields={[
        { label: 'URL', name: 'url', component: 'text' },
        { label: 'Title', name: 'title', component: 'text' },
        { component: UpdateLink, name: 'update' },
      ]}
      initialValues={initialValues}
      onChange={(values: object) => setFormValues(values)}
      onClose={() => {
        if (initialValues.title === '' && initialValues.url === '') {
          unwrapLink(editor, selection);
        }
        props.onClose();
      }}
    />
  );
};

export const unwrapLink = (editor: PlateEditor, selection?: any) => {
  editor.tf.unwrapNodes({
    match: matchLink,
    at: selection || undefined,
  });
};

export const getLinks = (editor): LinkElement[] => {
  return editor.api.nodes({
    match: matchLink,
  });
};

export const isLinkActive = (editor) => {
  const [link] = getLinks(editor);
  return !!link;
};
