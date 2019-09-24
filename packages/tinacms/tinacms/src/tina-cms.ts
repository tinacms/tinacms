import { CMS, PluginType, FieldPlugin, ScreenPlugin } from '@tinacms/core'

export class TinaCMS extends CMS {
  get fields(): PluginType<FieldPlugin> {
    return this.plugins.findOrCreateMap('field')
  }

  get screens(): PluginType<ScreenPlugin> {
    return this.plugins.findOrCreateMap('screen')
  }
}
