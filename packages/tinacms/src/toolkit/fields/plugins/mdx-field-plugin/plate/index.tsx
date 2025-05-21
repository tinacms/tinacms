import React, { useMemo } from "react";
import { Components } from "./plugins/ui/components";
import { helpers } from "./plugins/core/common";
import { uuid } from "./plugins/ui/helpers";
import type { RichTextType } from "..";
import { Editor, EditorContainer } from "./components/editor";
import { FixedToolbar } from "./components/plate-ui/fixed-toolbar";
import { TooltipProvider } from "./components/plate-ui/tooltip";
import FixedToolbarButtons from "./components/fixed-toolbar-buttons";
import { ToolbarProvider } from "./toolbar/toolbar-provider";
import { Plate, usePlateEditor } from "@udecode/plate/react";
import { useCreateEditor } from "./hooks/use-create-editor";
import { editorPlugins } from "./plugins/editor-plugins";
import { FloatingToolbar } from "./components/plate-ui/floating-toolbar";
import FloatingToolbarButtons from "./components/floating-toolbar-buttons";

export const RichEditor = ({ input, tinaForm, field }: RichTextType) => {
  const initialValue = React.useMemo(
    () =>
      input.value?.children?.length
        ? input.value.children.map(helpers.normalize)
        : [{ type: "p", children: [{ type: "text", text: "" }] }],
    []
  );

  //TODO try with a wrapper?
  const editor = useCreateEditor({
    plugins: [...editorPlugins],
    value: initialValue,
    components: Components(),
  });

  console.log("♻️ Initial Value", initialValue);

  // This should be a plugin customization
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        // Slate/Plate doesn't expose it's underlying element
        // as a ref, so we need to query for it ourselves
        const plateElement = ref.current?.querySelector(
          '[role="textbox"]'
        ) as HTMLElement;
        if (field.experimental_focusIntent && plateElement) {
          if (plateElement) plateElement.focus();
        }
        // Slate takes a second to mount
      }, 100);
    }
  }, [field.experimental_focusIntent, ref]);
  //
  return (
    <div ref={ref}>
      <Plate
        editor={editor}
        onChange={(value) => {
          console.log("changes 🎯", value.value);
          input.onChange({
            type: "root",
            //TODO(Plate upgrade) : Check with Jeff, value.value is used because the new Plate seperate the editor instance and causing the editor to passed as well int he value change, so value.value is a quick work around to extract the value of the editor (if not we will have error down the track to the final form, circular dependency error)
            children: value.value,
          });
        }}
      >
        <EditorContainer>
          <TooltipProvider>
            <ToolbarProvider
              tinaForm={tinaForm}
              templates={field.templates}
              overrides={
                field?.toolbarOverride ? field.toolbarOverride : field.overrides
              }
            >
              <></>
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>
              {field?.overrides?.showFloatingToolbar !== false ? (
                <FloatingToolbar>
                  <FloatingToolbarButtons />
                </FloatingToolbar>
              ) : null}
            </ToolbarProvider>
            <Editor />
          </TooltipProvider>
        </EditorContainer>
      </Plate>
    </div>
  );
};
