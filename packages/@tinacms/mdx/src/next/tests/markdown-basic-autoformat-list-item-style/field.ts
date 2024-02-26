import { RichTextField } from '@strivemath/tinacms-schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
}
