import { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import type { Context, Plate } from '../types';
import { ContextManager } from '../../../utils/mdx-context-manager';

export const handleMdxJsxElement = (
  content: MdxJsxFlowElement,
  context: Context
): Plate.BlockElement => {
  const { field, skipMDXProcess } = context;
  const mdxJsxElement = skipMDXProcess
    ? (node: any) => node
    : mdxJsxElementDefault
  return {
    type: 'mdx',
    children: [],
    props: { field, ContextManager.getInstance().getImageCallback() },
  };
};

