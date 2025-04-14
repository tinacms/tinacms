import MonacoEditor, { Monaco } from '@monaco-editor/react';
import { parseMDX, stringifyMDX } from '@tinacms/mdx';
import type * as monaco from 'monaco-editor';
import React from 'react';
import { RichTextType } from 'tinacms';
import {
  ErrorMessage,
  InvalidMarkdownElement,
  buildError,
} from './error-message';
import { useDebounce } from './use-debounce';
import useCustomMonaco from './use-monaco';

export const uuid = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

/**
 * Since monaco lazy-loads we may have a delay from when the block is inserted
 * to when monaco has intantiated, keep trying to focus on it.
 *
 * Will try for 3 seconds before moving on
 */
let retryCount = 0;
const retryFocus = (ref) => {
  if (ref.current) {
    ref.current.focus();
  } else {
    if (retryCount < 30) {
      setTimeout(() => {
        retryCount = retryCount + 1;
        retryFocus(ref);
      }, 100);
    }
  }
};

export const RawEditor = (props: RichTextType) => {
  const monacoInstance = useCustomMonaco();
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const [height, setHeight] = React.useState(100);
  const id = React.useMemo(() => uuid(), []);
  const field = props.field;

  const inputValue = React.useMemo(() => {
    // @ts-ignore no access to the rich-text type from this package
    const res = stringifyMDX(props.input.value, field, (value) => value);
    return typeof props.input.value === 'string' ? props.input.value : res;
  }, [props.input.value, field]);

  const [value, setValue] = React.useState(inputValue);
  const [error, setError] = React.useState<InvalidMarkdownElement>(null);

  const debouncedValue = useDebounce(value, 500);

  // Update parsed MDX when value changes
  React.useEffect(() => {
    try {
      // @ts-ignore no access to the rich-text type from this package
      const parsedValue = parseMDX(debouncedValue, field, (value) => value);
      if (
        parsedValue.children[0] &&
        parsedValue.children[0].type === 'invalid_markdown'
      ) {
        const invalidMarkdown = parsedValue.children[0];
        setError(invalidMarkdown);
      } else {
        setError(null);
      }
      props.input.onChange(parsedValue);
    } catch (err) {
      console.error('Error parsing MDX:', err);
    }
  }, [debouncedValue, field, props.input]);

  // Handle error markers in editor
  React.useEffect(() => {
    if (!monacoInstance || !editorRef.current) return;

    try {
      const model = editorRef.current.getModel();
      if (!model) return;

      if (error) {
        const errorMessage = buildError(error);
        monacoInstance.editor.setModelMarkers(model, id, [
          {
            ...errorMessage.position,
            message: errorMessage.message,
            severity: monacoInstance.MarkerSeverity.Error,
          },
        ]);
      } else {
        monacoInstance.editor.setModelMarkers(model, id, []);
      }
    } catch (err) {
      console.error('Error setting model markers:', err);
    }
  }, [error, monacoInstance, id]);

  // Configure Monaco TypeScript settings
  React.useEffect(() => {
    if (!monacoInstance) return;

    try {
      monacoInstance.languages.typescript.typescriptDefaults.setEagerModelSync(
        true
      );
      monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
        {
          noSemanticValidation: true,
          noSyntaxValidation: true,
        }
      );
    } catch (err) {
      console.error('Error configuring Monaco TypeScript settings:', err);
    }
  }, [monacoInstance]);

  function handleEditorDidMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;

    // Focus the editor when mounted
    if (editor) {
      editor.focus();
      retryCount = 0;
      retryFocus({ current: editor });
    }

    // Set up content size listener for dynamic height
    editor.onDidContentSizeChange(() => {
      const contentHeight = editor.getContentHeight();
      const newHeight = Math.min(Math.max(100, contentHeight), 1000);
      setHeight(newHeight);
      editor.layout();
    });
  }

  return (
    <div className='relative'>
      <div className='sticky top-1 w-full flex justify-between mb-2 z-50 max-w-full bg-white'>
        <Button onClick={() => props.setRawMode(false)}>
          View in rich-text editor 📝
        </Button>
        <ErrorMessage error={error} />
      </div>
      <div style={{ height: `${height}px` }}>
        <MonacoEditor
          path={id}
          onMount={handleEditorDidMount}
          options={{
            scrollBeyondLastLine: false,
            tabSize: 2,
            disableLayerHinting: true,
            accessibilitySupport: 'off',
            codeLens: false,
            wordWrap: 'on',
            minimap: {
              enabled: false,
            },
            fontSize: 14,
            lineHeight: 2,
            formatOnPaste: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 2,
            formatOnType: true,
            fixedOverflowWidgets: true,
            folding: false,
            renderLineHighlight: 'none',
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
              alwaysConsumeMouseWheel: false,
            },
          }}
          language='markdown'
          value={value}
          onChange={(newValue) => {
            if (newValue !== undefined) {
              setValue(newValue);
            }
          }}
        />
      </div>
    </div>
  );
};

const Button = (props) => {
  return (
    <button
      className={`${
        props.align === 'left'
          ? 'rounded-l-md border-r-0'
          : 'rounded-r-md border-l-0'
      } flex justify-center w-full shadow rounded-md bg-white cursor-pointer relative inline-flex items-center px-2 py-2 border border-gray-200 hover:text-white text-sm font-medium transition-all ease-out duration-150 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
      type='button'
      onClick={props.onClick}
    >
      <span className='text-sm font-semibold tracking-wide align-baseline mr-1'>
        {props.children}
      </span>
    </button>
  );
};

export default RawEditor;
