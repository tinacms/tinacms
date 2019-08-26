import { FormManager, FieldPlugin } from './cms-forms'
import { PluginManager, PluginType, Plugin } from './plugins'

export class CMS {
  forms: FormManager
  plugins: PluginManager
  api: { [key: string]: API } = {}
  constructor() {
    this.forms = new FormManager()
    this.plugins = new PluginManager()
  }

  get fields(): PluginType<FieldPlugin> {
    return this.plugins.findOrCreateMap('field')
  }

  get screens(): PluginType<ScreenPlugin> {
    return this.plugins.findOrCreateMap('screen')
  }

  registerApi(name: string, api: API): void {
    // TODO: Make sure we're not overwriting an existing API.
    this.api[name] = api
  }
}

export interface API {
  onSubmit?(data: any): any
  onChange?(data: any): any
  onDelete?(data: any): any
  isAuthenticated?(): any
  authenticate?(): Promise<any>
  removeAuthentication?(): any
}

export interface ScreenPlugin extends Plugin {
  __type: 'screen'
  Component: any
}
