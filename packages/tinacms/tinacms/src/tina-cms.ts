import { CMS, PluginType, ScreenPlugin } from '@tinacms/core'
import { FieldPlugin } from '@tinacms/form-builder'

export class TinaCMS extends CMS {
  get fields(): PluginType<FieldPlugin> {
    return this.plugins.findOrCreateMap('field')
  }

  get screens(): PluginType<ScreenPlugin> {
    return this.plugins.findOrCreateMap('screen')
  }
}
