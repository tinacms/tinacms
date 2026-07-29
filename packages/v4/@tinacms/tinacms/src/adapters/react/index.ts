// The public entry `@tinacms/tinacms/adapters/react`. It is the React binding of the
// site-side protocol for visual editing. The wire protocol in `./preview` belongs to no
// framework, and each framework gets an adapter like this one. React is the first. This
// file also exports tinaField, so a React site imports from one place.
export { TINA_FIELD_ATTR, tinaField } from '../../preview/protocol';
// The renderer for the value of a rich-text field. It turns the MDX tree into React. The
// editor edits that tree, and the GraphQL pipeline serves it. The walk itself lives in
// ../../rich-text and names no framework, so a binding for another framework starts from
// the same instructions instead of from a rewrite. The surface here is the one v3
// published, so an existing custom `components` map still works.
export {
  type Components,
  StaticTinaMarkdown,
  TinaMarkdown,
  type TinaMarkdownContent,
} from './tina-markdown';
export {
  useTina,
  type UseTinaOptions,
  type UseTinaResult,
} from './use-tina';
