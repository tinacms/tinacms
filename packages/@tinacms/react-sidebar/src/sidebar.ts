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

import { EventBus, Callback } from '@tinacms/core'

export interface SidebarStateOptions {
  hidden?: boolean
  position?: SidebarPosition
  buttons?: SidebarButtons
}

export interface SidebarButtons {
  save: string
  reset: string
}

export declare type SidebarPosition = 'fixed' | 'float' | 'displace' | 'overlay'

export class SidebarState {
  private _isOpen: boolean = false

  position: SidebarPosition = 'displace'
  _hidden: boolean = false
  buttons: SidebarButtons = {
    save: 'Save',
    reset: 'Reset',
  }

  constructor(private events: EventBus, options: SidebarStateOptions = {}) {
    this.position = options.position || 'displace'
    this._hidden = !!options.hidden

    if (options.buttons?.save) {
      this.buttons.save = options.buttons.save
    }
    if (options.buttons?.reset) {
      this.buttons.reset = options.buttons.reset
    }
  }

  get isOpen() {
    return this._isOpen
  }

  set isOpen(nextValue: boolean) {
    if (this._isOpen === nextValue) {
      return // No change.
    }

    this._isOpen = nextValue

    if (nextValue) {
      this.events.dispatch({ type: 'sidebar:opened' })
    } else {
      this.events.dispatch({ type: 'sidebar:closed' })
    }
  }

  get hidden() {
    return this._hidden
  }

  set hidden(nextValue: boolean) {
    if (this._hidden === nextValue) {
      return // No change.
    }

    this._hidden = nextValue

    if (nextValue) {
      this.events.dispatch({ type: 'sidebar:disabled' })
    } else {
      this.events.dispatch({ type: 'sidebar:enabled' })
    }
  }

  subscribe(callback: Callback): () => void {
    const unsub = this.events.subscribe(callback, ['sidebar'])

    return () => unsub()
  }
}
