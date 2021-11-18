import { EventBus } from './event'

export interface SetFlagEvent {
  type: 'flag:set'
  key: string
  value: boolean
}

export class Flags {
  private _flags = new Map<string, boolean>()

  constructor(private events: EventBus) {}

  get(key) {
    return this._flags.get(key)
  }

  set(key, value) {
    this._flags.set(key, value)
    this.events.dispatch<SetFlagEvent>({ type: 'flag:set', key, value })
  }
}
