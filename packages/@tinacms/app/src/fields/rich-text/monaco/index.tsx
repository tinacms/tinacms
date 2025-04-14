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
 * to when monaco has instantiated.
 */
const retryFocus = (editor) => {
  if (editor && editor.focus) {
    try {
      editor.focus();
    } catch (err) {
      console.warn('Error focusing editor:', err);
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

  // Get initial value safely
  const inputValue = React.useMemo(() => {
    try {
      // @ts-ignore no access to the rich-text type from this package
      const res = stringifyMDX(props.input.value, field, (value) => value);
      return typeof props.input.value === 'string' ? props.input.value : res;
    } catch (err) {
      console.error('Error stringifying MDX:', err);
      return '';
    }
  }, []); // Empty dependency array to only run once

  const [value, setValue] = React.useState(inputValue);
  const [error, setError] = React.useState<InvalidMarkdownElement>(null);

  const debouncedValue = useDebounce(value, 500);

  // Update parsed MDX when value changes
  React.useEffect(() => {
    let isMounted = true;

    try {
      // @ts-ignore no access to the rich-text type from this package
      const parsedValue = parseMDX(debouncedValue, field, (value) => value);

      if (!isMounted) return;

      if (
        parsedValue.children[0] &&
        parsedValue.children[0].type === 'invalid_markdown'
      ) {
        setError(parsedValue.children[0]);
      } else {
        setError(null);
        props.input.onChange(parsedValue);
      }
    } catch (err) {
      console.error('Error parsing MDX:', err);
    }

    return () => {
      isMounted = false;
    };
  }, [debouncedValue, field]); // Only dependency should be the debounced value and field

  // Handle error markers in editor
  React.useEffect(() => {
    if (!monacoInstance || !editorRef.current) return;

    try {
      const model = editorRef.current.getModel();
      if (!model) return;

      if (error) {
        const errorMessage = buildError(error);

        // Make sure all position properties are numbers (not undefined)
        const markerData = {
          message: errorMessage.message,
          severity: monacoInstance.MarkerSeverity?.Error || 8,
          startLineNumber: errorMessage.position?.startLineNumber || 1,
          endLineNumber: errorMessage.position?.endLineNumber || 1,
          startColumn: errorMessage.position?.startColumn || 1,
          endColumn: errorMessage.position?.endColumn || 1,
        };

        monacoInstance.editor.setModelMarkers(model, id, [markerData]);
      } else {
        monacoInstance.editor.setModelMarkers(model, id, []);
      }
    } catch (err) {
      console.error('Error setting model markers:', err);
    }
  }, [error, monacoInstance, id]);

  // Configure TypeScript settings once when Monaco loads
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
    if (!editor) return;

    try {
      editorRef.current = editor;

      // Focus the editor once when mounted
      setTimeout(() => editor.focus(), 100);

      // Set up content size listener
      editor.onDidContentSizeChange(() => {
        const contentHeight = editor.getContentHeight();
        setHeight(Math.min(Math.max(100, contentHeight), 1000));
        editor.layout();
      });
    } catch (err) {
      console.error('Error in editor mount handler:', err);
    }
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
