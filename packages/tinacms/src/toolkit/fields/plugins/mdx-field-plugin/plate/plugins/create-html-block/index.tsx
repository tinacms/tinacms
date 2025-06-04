import { createPlatePlugin } from "@udecode/plate/react";

export const createHTMLBlockPlugin = createPlatePlugin({
    key: "html",
    node: {
      isElement: true,
      isVoid: true,
      isInline: false,
    },
  });
  
export const createHTMLInlinePlugin = createPlatePlugin({
    key: "html_inline",
    node: {
        isElement: true,
        isVoid: true,
        isInline: true,
    },
});
  