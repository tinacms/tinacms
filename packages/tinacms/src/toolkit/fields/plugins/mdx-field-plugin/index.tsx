import React from 'react';
import {
  type InputFieldType,
  wrapFieldsWithMeta,
} from '../wrap-field-with-meta';
import { EditorContext } from './plate/editor-context';

import type { InputProps } from '@toolkit/fields/components';
import { RichEditor } from './plate';
import type {
  ToolbarOverrideType,
  ToolbarOverrides,
} from './plate/toolbar/toolbar-overrides';
import type { MdxTemplate } from './plate/types';

export type RichTextType = React.PropsWithChildren<
  InputFieldType<
    InputProps,
    {
      templates: MdxTemplate[];
      toolbarOverride?: ToolbarOverrideType[];
      overrides?: ToolbarOverrides;
    }
  >
>;

export const MdxFieldPlugin = {
  name: 'rich-text',
  Component: wrapFieldsWithMeta<
    InputProps,
    {
      templates: MdxTemplate[];
      toolbarOverride?: ToolbarOverrideType[];
      overrides?: ToolbarOverrides;
    }
  >((props) => {
    const [rawMode, setRawMode] = React.useState(false);
    const [key, setKey] = React.useState(0);

    /**
     * Since slate keeps track of it's own state, and that state is an object rather
     * than something easily memoizable like a string it can be tricky to ensure
     * resets are properly handled. So we sneak in a callback to the form's reset
     * logic that just remounts slate entirely
     */
    React.useMemo(() => {
      const { reset } = props.form;
      props.form.reset = (initialValues) => {
        setKey((key) => key + 1);
        return reset(initialValues);
      };
    }, []);

    return (
      <EditorContext.Provider
        key={key}
        value={{
          fieldName: props.field.name,
          templates: props.field.templates,
          rawMode,
          setRawMode,
        }}
      >
        <div
          className={
            'min-h-[100px] max-w-full tina-prose relative shadow-inner focus-within:shadow-outline focus-within:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus-within:text-gray-900 rounded pt-0 py-2'
          }
        >
          <RichEditor {...props} />
        </div>
      </EditorContext.Provider>
    );
  }),
};

export const MdxFieldPluginExtendible = {
  name: 'rich-text',
  validate(value: any) {
    if (
      typeof value !== 'undefined' &&
      value !== null &&
      Array.isArray(value.children) &&
      value.children[0] &&
      value.children[0].type === 'invalid_markdown'
    ) {
      return 'Unable to parse rich-text';
    }
    return undefined;
  },
  Component: wrapFieldsWithMeta<
    InputProps,
    {
      templates: MdxTemplate[];
      toolbarOverride?: ToolbarOverrideType[];
      overrides?: ToolbarOverrides;
    }
  >((props) => {
    const [key, setKey] = React.useState(0);

    /**
     * Since slate keeps track of it's own state, and that state is an object rather
     * than something easily memoizable like a string it can be tricky to ensure
     * resets are properly handled. So we sneak in a callback to the form's reset
     * logic that just remounts slate entirely
     */
    React.useMemo(() => {
      const { reset } = props.form;
      props.form.reset = (initialValues) => {
        setKey((key) => key + 1);
        return reset(initialValues);
      };
    }, []);
    return (
      <EditorContext.Provider
        key={key}
        value={{
          fieldName: props.field.name,
          templates: props.field.templates,
          rawMode: props.rawMode,
          setRawMode: props.setRawMode,
        }}
      >
        <div
          className={
            'min-h-[100px] max-w-full tina-prose relative shadow-inner focus-within:shadow-outline focus-within:border-tina-orange-dark block w-full bg-white border border-gray-200 text-gray-600 focus-within:text-gray-900 rounded pt-0 py-2'
          }
        >
          {props.rawMode ? props.rawEditor : <RichEditor {...props} />}
        </div>
      </EditorContext.Provider>
    );
  }),
};
