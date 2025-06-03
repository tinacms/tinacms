import { createPlatePlugin } from "@udecode/plate/react";

//TODO :Do we still need this? We replace custom code block with plate code block
export const createCodeBlockPlugin = createPlatePlugin({
  key: "code_block",
  options: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
});