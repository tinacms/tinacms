/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { Subscribable } from '@tinacms/core'

export interface ToolbarStateOptions {
  hidden?: boolean
  buttons?: ToolbarButtons
}

export interface ToolbarButtons {
  save: string
  reset: string
}

export class ToolbarState extends Subscribable {
  _hidden: boolean = true
  buttons: ToolbarButtons = {
    save: 'Save',
    reset: 'Reset',
  }

  constructor(options: ToolbarStateOptions = {}) {
    super()
    // Defaults to 'hidden' if config property not set
    this._hidden = options.hidden == undefined ? true : !!options.hidden

    /*
     ** TODO: Do we want to handle buttons
     ** the same as sidebar? Or make them plugins?
     ** maybe remove these
     */
    if (options.buttons?.save) {
      this.buttons.save = options.buttons.save
    }
    if (options.buttons?.reset) {
      this.buttons.reset = options.buttons.reset
    }
  }

  get hidden() {
    return this._hidden
  }

  set hidden(nextValue: boolean) {
    this._hidden = nextValue
    this.notifiySubscribers()
  }
}
