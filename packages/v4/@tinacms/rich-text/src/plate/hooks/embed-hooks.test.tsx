import { act, render } from '@testing-library/react';
import type { Value } from '@udecode/plate';
import {
  Plate,
  PlateContent,
  createPlatePlugin,
  usePlateEditor,
  useSelected,
} from '@udecode/plate/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorContext, type EditorContextValue } from '../editor-context';
import { useEmbedHandles, useHotkey } from './embed-hooks';

const PROBE = 'probe';
const FIELD_NAME = 'body';

type Handles = ReturnType<typeof useEmbedHandles>;

let handles: Handles | undefined;
let hotkeyHits = 0;
let probeSelected = false;

const ProbeElement = ({ attributes, children, element, editor }) => {
  probeSelected = useSelected();
  handles = useEmbedHandles(editor, element, FIELD_NAME);
  useHotkey('enter', () => {
    hotkeyHits += 1;
  });

  return (
    <span {...attributes}>
      <span contentEditable={false}>probe</span>
      {children}
    </span>
  );
};

const probePlugin = createPlatePlugin({
  key: PROBE,
  node: {
    isElement: true,
    isVoid: true,
    isInline: true,
    component: ProbeElement,
  },
});

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const Harness = ({
  value,
  onActivateField,
  onEditorReady,
}: {
  value: Value;
  onActivateField: (address: string) => void;
  onEditorReady: (editor: HarnessEditor) => void;
}) => {
  const editor = usePlateEditor({ plugins: [probePlugin], value });
  onEditorReady(editor);

  const context: EditorContextValue = {
    fieldName: FIELD_NAME,
    templates: [],
    rawMode: false,
    setRawMode: () => {},
    onActivateField,
    embedEditAvailable: false,
  };

  return (
    <EditorContext.Provider value={context}>
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    </EditorContext.Provider>
  );
};

const renderProbe = (value: Value) => {
  const onActivateField = vi.fn();
  let editor: HarnessEditor | undefined;

  const view = render(
    <Harness
      value={value}
      onActivateField={onActivateField}
      onEditorReady={(next) => {
        editor = next;
      }}
    />
  );

  if (!editor) {
    throw new Error('harness did not expose an editor');
  }
  if (!handles) {
    throw new Error('probe element did not render');
  }

  return { editor, onActivateField, view };
};

const topLevelProbe: Value = [
  { type: 'p', children: [{ text: 'before' }] },
  { type: 'p', children: [{ type: PROBE, children: [{ text: '' }] }] },
];

afterEach(() => {
  handles = undefined;
  hotkeyHits = 0;
  vi.useRealTimers();
});

describe('useEmbedHandles', () => {
  /**
   * The admin opens a field by this address. A wrong separator or a missing
   * segment points at no field, so the Edit control opens nothing.
   */
  it('names the props field of the embed by its path', () => {
    const { onActivateField } = renderProbe(topLevelProbe);

    act(() => handles?.handleSelect());

    expect(onActivateField).toHaveBeenCalledWith('body.children.1.children.0.props');
  });

  it('removes the embed node at its own path', () => {
    const { editor } = renderProbe(topLevelProbe);

    expect(JSON.stringify(editor.children)).toContain(PROBE);

    act(() => handles?.handleRemove());

    expect(JSON.stringify(editor.children)).not.toContain(PROBE);
  });

  it('leaves the surrounding blocks alone when it removes the embed', () => {
    const { editor } = renderProbe(topLevelProbe);

    act(() => handles?.handleRemove());

    expect(JSON.stringify(editor.children)).toContain('before');
  });

  it('starts with the nested form closed', () => {
    renderProbe(topLevelProbe);

    expect(handles?.isExpanded).toBe(false);
  });

  /**
   * Closing the nested form must put the caret back on the embed. The select
   * runs on a timer, so nothing moves until the timer fires.
   */
  it('selects the embed after the deferred select runs', () => {
    vi.useFakeTimers();
    const { editor } = renderProbe(topLevelProbe);

    act(() => handles?.handleClose());
    act(() => {
      vi.advanceTimersByTime(5);
    });

    expect(editor.selection).not.toBeNull();
    expect(editor.api.node(editor.selection!)?.[0]).toBeDefined();
  });

  /**
   * The deferred select holds the path of the embed. The embed can leave the
   * document inside the 1ms window. The path then points at no node, and the
   * select throws.
   */
  it('does not throw when the embed leaves the document before the deferred select runs', () => {
    vi.useFakeTimers();
    const { editor } = renderProbe(topLevelProbe);

    act(() => handles?.handleClose());
    act(() => {
      editor.tf.removeNodes({ at: [1] });
    });

    expect(() => {
      vi.advanceTimersByTime(5);
    }).not.toThrow();
  });

  /**
   * A node that leaves the document does not unmount the embed here: Plate
   * re-renders on a microtask, and a synchronous `act` does not flush it. This
   * case pins the other half — the cleanup of the hook stops the timer, so the
   * caret of an editor that the user no longer sees stays where it is.
   */
  it('does not select after the embed unmounts', () => {
    vi.useFakeTimers();
    const { editor, view } = renderProbe(topLevelProbe);

    act(() => handles?.handleClose());
    view.unmount();
    act(() => {
      vi.advanceTimersByTime(5);
    });

    expect(editor.selection).toBeNull();
  });
});

/**
 * `is-hotkey` matches on `event.which`, and happy-dom leaves `which` at 0 on
 * an event built from a `KeyboardEvent` init. A dispatch without this matches
 * no hotkey, so the assertion passes for the wrong reason.
 */
const pressKey = (key: string, which: number) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  Object.defineProperty(event, 'which', { value: which });
  act(() => {
    document.dispatchEvent(event);
  });
};

describe('useHotkey', () => {
  const pressEnter = () => pressKey('Enter', 13);

  /**
   * Every embed in the document mounts this listener on `document`. Without
   * the `selected` test each of them answers one keypress, so a document with
   * three embeds runs the callback three times.
   */
  it('ignores the hotkey while the embed is not selected', () => {
    renderProbe(topLevelProbe);

    pressEnter();

    expect(hotkeyHits).toBe(0);
  });

  it('runs the callback once when the selected embed sees the hotkey', async () => {
    const { editor } = renderProbe(topLevelProbe);

    await act(async () => {
      editor.tf.select([1, 0]);
    });
    expect(probeSelected).toBe(true);
    pressEnter();

    expect(hotkeyHits).toBe(1);
  });

  it('ignores a key that is not the hotkey', async () => {
    const { editor } = renderProbe(topLevelProbe);

    await act(async () => {
      editor.tf.select([1, 0]);
    });
    pressKey('Escape', 27);

    expect(hotkeyHits).toBe(0);
  });

  it('stops listening after the embed unmounts', async () => {
    const { editor, view } = renderProbe(topLevelProbe);

    await act(async () => {
      editor.tf.select([1, 0]);
    });
    view.unmount();
    pressEnter();

    expect(hotkeyHits).toBe(0);
  });
});
