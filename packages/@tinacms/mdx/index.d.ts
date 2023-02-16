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
