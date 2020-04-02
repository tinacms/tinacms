import { Subscribable } from '@tinacms/core'

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

export class SidebarState extends Subscribable {
  private _isOpen: boolean = false

  position: SidebarPosition = 'displace'
  _hidden: boolean = false
  buttons: SidebarButtons = {
    save: 'Save',
    reset: 'Reset',
  }

  constructor(options: SidebarStateOptions = {}) {
    super()
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
    this._isOpen = nextValue
    this.notifiySubscribers()
  }

  get hidden() {
    return this._hidden
  }

  set hidden(nextValue: boolean) {
    this._hidden = nextValue
    this.notifiySubscribers()
  }
}
