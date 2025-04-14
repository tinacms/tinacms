import MonacoEditor from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import React from 'react';
import type { RichTextType } from '..';
import { useEditorContext } from '../plate/editor-context';
import useCustomMonaco from '../plate/plugins/ui/code-block/use-monaco';
import { uuid } from '../plate/plugins/ui/helpers';
import {
  ErrorMessage,
  type InvalidMarkdownElement,
  buildError,
} from './error-message';
import { useDebounce } from './use-debounce';

// Create stable versions of these functions even if they're stubs
const parseMDX = (value: string, field: any, transform: any) => {
  try {
    // This is a stub function - integrate with actual parseMDX if available
    return { type: 'root', children: [] };
  } catch (err) {
    console.error('Error parsing MDX:', err);
    return { type: 'root', children: [] };
  }
};

const stringifyMDX = (value: any, field: any, transform: any) => {
  try {
    // This is a stub function - integrate with actual stringifyMDX if available
    return typeof value === 'string' ? value : '';
  } catch (err) {
    console.error('Error stringifying MDX:', err);
    return '';
  }
};

/**
 * Since monaco lazy-loads we may have a delay from when the block is inserted
 * to when monaco has intantiated, keep trying to focus on it.
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

const RawEditor = (props: RichTextType) => {
  const monaco = useCustomMonaco();
  const { setRawMode } = useEditorContext();
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const [height, setHeight] = React.useState(100);
  const id = React.useMemo(() => uuid(), []);
  const field = props.field;

  // Extract initial value only once - remove dependency on stringified values
  const inputValue = React.useMemo(() => {
    try {
      const res = stringifyMDX(props.input.value, field, (value) => value);
      return typeof props.input.value === 'string' ? props.input.value : res;
    } catch (err) {
      console.error('Error processing input value:', err);
      return '';
    }
  }, []);

  const [value, setValue] = React.useState(inputValue);
  const [error, setError] = React.useState<InvalidMarkdownElement>(null);

  const debouncedValue = useDebounce(value, 500);

  // Parse MDX when debounced value changes
  React.useEffect(() => {
    try {
      const parsedValue = parseMDX(debouncedValue, field, (value) => value);
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
      console.error('Error in MDX parsing effect:', err);
    }
  }, [debouncedValue, field, props.input]);

  // Handle error markers
  React.useEffect(() => {
    if (!monaco || !editorRef.current) return;

    try {
      const model = editorRef.current.getModel();
      if (!model) return;

      if (error) {
        const errorMessage = buildError(error);
        monaco.editor.setModelMarkers(model, id, [
          {
            ...errorMessage.position,
            message: errorMessage.message,
            severity: monaco.MarkerSeverity?.Error || 8,
          },
        ]);
      } else {
        monaco.editor.setModelMarkers(model, id, []);
      }
    } catch (err) {
      console.error('Error setting model markers:', err);
    }
  }, [error, monaco, id]);

  // Configure Monaco
  React.useEffect(() => {
    if (!monaco) return;

    try {
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    } catch (err) {
      console.error('Error configuring Monaco:', err);
    }
  }, [monaco]);

  function handleEditorDidMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: any
  ) {
    if (!editor) return;

    try {
      editorRef.current = editor;

      // Focus the editor
      editor.focus();

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
      <div className='sticky top-1 w-full flex justify-between mb-2 z-50 max-w-full'>
        <Button onClick={() => setRawMode(false)}>
          View in rich-text editor
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
            lineNumbers: 'off',
            formatOnType: true,
            fixedOverflowWidgets: true,
            folding: false,
            renderLineHighlight: 'none',
            scrollbar: {
              verticalScrollbarSize: 1,
              horizontalScrollbarSize: 1,
              alwaysConsumeMouseWheel: false,
            },
          }}
          language={'markdown'}
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
      } shadow rounded-md bg-white cursor-pointer relative inline-flex items-center px-2 py-2 border border-gray-200 hover:text-white text-sm font-medium transition-all ease-out duration-150 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
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
