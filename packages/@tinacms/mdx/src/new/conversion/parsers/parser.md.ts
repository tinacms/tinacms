import { RichTextField } from "@tinacms/schema-tools"
import { ContextManager } from "../../utils/mdx-context-manager";
import { MarkdownAdapter } from "../../adapters/markdown-adapter";

export const parseMDX = (
  value: string,
  field: RichTextField
) => {
  const imageCallback = ContextManager.getInstance().getImageCallback();
  const tree = MarkdownAdapter.toAst(value, field)
  return postProcess(tree, field, imageCallback)
}


