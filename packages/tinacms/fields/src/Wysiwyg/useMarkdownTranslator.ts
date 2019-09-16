import React = require('react')
import { MarkdownTranslator } from './Translator'
import { Schema } from 'prosemirror-model'

export function useMarkdownTranslator(schema: Schema) {
  // TODO: Use `wysiwyg:markdown` plugins
  let translator = React.useMemo(
    () => MarkdownTranslator.fromSchema(schema, {}),
    [schema]
  )

  return [translator]
}
