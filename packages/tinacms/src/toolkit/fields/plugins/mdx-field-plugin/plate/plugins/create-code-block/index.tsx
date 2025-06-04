import { createPlatePlugin } from "@udecode/plate/react";

// TODO [2025-05-28]: Potentially unused. Searched usage but found none.
// Consider removing after verifying with the team
export const createCodeBlockPlugin = createPlatePlugin({
  key: "code_block",
  options: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
});