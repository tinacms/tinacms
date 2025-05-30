import { createPlatePlugin } from "@udecode/plate/react";

//TODO : Test this function in UI, not sure if it works after replace with latest api
export const createCodeBlockPlugin = createPlatePlugin({
  key: "code_block",
  options: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
});

//TODO : Test this function in UI, not sure if it works after replace with latest api
export const createHTMLBlockPlugin = createPlatePlugin({
  key: "html",
  options: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
});

//TODO : Test this function in UI, not sure if it works after replace with latest api
export const createHTMLInlinePlugin = createPlatePlugin({
  key: "html_inline",
  options: {
    isElement: true,
    isVoid: true,
    isInline: true,
  },
});
