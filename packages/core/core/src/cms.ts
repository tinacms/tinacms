import { FormManager, FieldPlugin } from './cms-forms'
import { PluginManager, PluginType, Plugin } from './plugins'

export class CMS {
  forms: FormManager
  plugins: PluginManager
  api: { [key: string]: any } = {}

  constructor() {
    this.forms = new FormManager()
    this.plugins = new PluginManager()
  }

  registerApi(name: string, api: any): void {
    // TODO: Make sure we're not overwriting an existing API.
    this.api[name] = api
  }
}

export interface ScreenPlugin extends Plugin {
  __type: 'screen'
  Component: any
}
