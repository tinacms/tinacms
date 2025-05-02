// Map content types to their respective handlers

import { defaultHandler } from "./handlers/default.handler";
import { handleTable } from "./handlers/table.handler";
import type { Context, HandlerFunction, Md, Plate } from "./types";

export const contentHandlers: Partial<Record<Md.Content['type'], HandlerFunction>> = {
    table: handleTable,
    blockquote: handleBlockquote,
    heading: handleHeading,
    code: handleCode,
    paragraph: handleBlockContent,
    list: handleList,
    html: handleHtml,
    image: handleImage,(content as Md.List, context)
  default: defaultHandler,
};
