export type Unsubscribe = () => void

export class Subscribeable {
  protected __subscribers: Function[] = []

  subscribe(listener: Function): Unsubscribe {
    this.__subscribers.push(listener)
    return () => this.unsubscribe(listener)
  }

  unsubscribe(listener: Function) {
    let index = this.__subscribers.indexOf(listener)
    this.__subscribers.splice(index, 1)
  }

  protected notifiySubscribers() {
    this.__subscribers.forEach(cb => cb())
  }
}
