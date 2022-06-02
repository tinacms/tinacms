/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import { EventBus, Callback } from '../core'
import { NoFormsPlaceholder } from './components/NoFormsPlaceHolder'
import * as React from 'react'

export interface SidebarStateOptions {
  position?: SidebarPosition
  buttons?: SidebarButtons
  placeholder?: React.FC
  defaultWidth?: number
  defaultState?: DefaultSidebarState
  renderNav?: boolean
}

/**
 * @deprecated
 * `buttons` set on the form directly
 * via form config options
 */
export interface SidebarButtons {
  save: string
  reset: string
}

export declare type SidebarPosition = 'displace' | 'overlay'
export declare type DefaultSidebarState = 'open' | 'closed'

export class SidebarState {
  private _isOpen: boolean = false
  placeholder: React.FC

  position: SidebarPosition = 'displace'
  renderNav: boolean = true
  buttons: SidebarButtons = {
    save: 'Save',
    reset: 'Reset',
  }

  constructor(private events: EventBus, options: SidebarStateOptions = {}) {
    // @ts-ignore FIXME twind
    this.position = options.position || 'displace'
    this.renderNav = options.renderNav || true
    this.placeholder = options.placeholder || NoFormsPlaceholder

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

  subscribe(callback: Callback): () => void {
    const unsub = this.events.subscribe('sidebar', callback)

    return () => unsub()
  }
}
