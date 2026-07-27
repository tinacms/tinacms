// Public entry: `@tinacms/tinacms/adapters/react` — the React binding of the
// site-side visual-editing protocol. The wire protocol itself (`./preview`) is
// framework-agnostic; each framework gets an adapter like this one. React is
// first. tinaField is re-exported so a React site imports from one place.
export { TINA_FIELD_ATTR, tinaField } from '../../preview/protocol';
export {
  useTina,
  type UseTinaOptions,
  type UseTinaResult,
} from './use-tina';
