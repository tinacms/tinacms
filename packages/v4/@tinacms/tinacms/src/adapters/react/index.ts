// Public entry: `@tinacms/tinacms/adapters/react` — the React binding of the
// site-side visual-editing protocol. The wire protocol itself (`./preview`) is
// framework-agnostic; each framework gets an adapter like this one. React is
// first. tinaField is re-exported so a React site imports from one place.
export { TINA_FIELD_ATTR, tinaField } from '../../preview/protocol';
// The renderer for a rich-text field's value: the same mdx AST the editor edits
// and the GraphQL pipeline serves, turned into React. Ported from v3 unchanged,
// so a site's existing custom `components` map keeps working.
export {
  type Components,
  TinaMarkdown,
  type TinaMarkdownContent,
} from '../../rich-text';
export {
  useTina,
  type UseTinaOptions,
  type UseTinaResult,
} from './use-tina';
