import React, { useEffect } from 'react';
import {
  Editor,
  Element,
  type BaseRange,
  Transforms,
  unwrapNodes,
  wrapNodes,
} from 'slate';
import { NestedForm } from '../../nested-form';
import { Button } from '@tinacms/toolkit';
import { LinkPlugin } from '@udecode/plate-link/react';
import { PlateEditor } from '@udecode/plate/react';
import { Value } from '@udecode/plate';

type LinkElement = {
  url?: string;
  title?: string;
  text: string | undefined;
};

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
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        getPluginType(editor, LinkPlugin.key),
    });
    Transforms.select(editor, path);
  }
  if (isLinkActive(editor)) {
    const [link] = getLinks(editor);
    baseLink.url = link[0].url;
    baseLink.title = link[0].title;

    unwrapLink(editor);
  }

  wrapNodes(editor, baseLink, { split: true });
};

const matchLink = (n: ENode<Value>) =>
  !Editor.isEditor(n) && Element.isElement(n) && n.type === LinkPlugin.key;

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

export const unwrapLink = (editor: PlateEditor, selection?: BaseRange) => {
  unwrapNodes(editor, {
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
