import { CMS, PluginType } from '@tinacms/core'
import { FieldPlugin } from '@tinacms/form-builder'
import { ScreenPlugin } from './plugins/screen-plugin'

export class TinaCMS extends CMS {
  get fields(): PluginType<FieldPlugin> {
    return this.plugins.findOrCreateMap('field')
  }

  get screens(): PluginType<ScreenPlugin> {
    return this.plugins.findOrCreateMap('screen')
  }
}
