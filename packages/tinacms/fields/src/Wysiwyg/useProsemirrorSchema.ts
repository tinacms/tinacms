import { defaultBlockSchema } from './schema'

export function useProsemirrorSchema() {
  // TODO: Use `wysiwyg:schema:node` plugins
  return [defaultBlockSchema]
}
