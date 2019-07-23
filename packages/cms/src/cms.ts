import { FormManager } from './cms-forms'
export class CMS {
  forms: FormManager
  constructor() {
    this.forms = new FormManager()
  }
}
