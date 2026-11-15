// A module of its own, so `compileSchema` reads the name without loading
// `@tinacms/rich-text`, which a Vite config cannot load natively.
export const RICH_TEXT_FIELD_TYPE = 'rich-text';
