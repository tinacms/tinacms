// Something wrong with the visitor which causes big performance issues
// after visiting a page with `visit` as an import
// Noticed an error "Type instantiation is excessively deep and possibly infinite"
import { Root, Content } from 'mdast'

declare module 'unist-util-visit' {
  export const visit: <T extends Content>(
    root: Root,
    type: T['type'],
    callback: (node: T) => void
  ) => void
}

// Add custom data tracked to turn markdown into a tree.
declare module 'mdast-util-from-markdown' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CompileData {
    /**
     * Current MDX JSX tag.
     */
    mdxJsxTag?: Tag | undefined

    /**
     * Current stack of open MDX JSX tags.
     */
    mdxJsxTagStack?: Tag[] | undefined
  }
}
