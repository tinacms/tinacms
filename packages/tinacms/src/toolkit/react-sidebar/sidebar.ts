import { EventBus, Callback } from '../core'
import { NoFormsPlaceholder } from './components/no-forms-placeholder'
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
  defaultState: DefaultSidebarState

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
