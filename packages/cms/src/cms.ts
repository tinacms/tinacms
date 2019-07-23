import { FormManager } from './cms-forms'
export class CMS {
  form: FormManager
  constructor() {
    this.form = new FormManager()
  }
}
