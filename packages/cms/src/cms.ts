import { FormManager } from './cms-forms'
export class CMS {
  forms: FormManager
  api: { [key: string]: API } = {}
  constructor() {
    this.forms = new FormManager()
  }
  registerApi(name: string, api: API): void {
    // TODO: Make sure we're not overwriting an existing API.
    this.api[name] = api
  }
}

export interface API {
  onSubmit?(data: any): any
  onChange?(data: any): any
}
