import { TinaCMS } from '../tina-cms'
import { Field, Plugin } from '@tinacms/core'

export interface AddContentPlugin extends Plugin {
  __type: 'content-button'
  onSubmit(value: string, cms: TinaCMS): Promise<void> | void
  fields: Field[]
}
