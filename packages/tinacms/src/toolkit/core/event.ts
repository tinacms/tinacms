export type Callback<E extends CMSEvent = CMSEvent> = (event: E) => void

export interface CMSEvent {
  type: string
  [key: string]: any
}

export class EventBus {
  private listeners = new Set<Listener<any>>()

  subscribe<E extends CMSEvent = CMSEvent>(
    event: E['type'] | E['type'][],
    callback: Callback<E>
  ): () => void {
    let events: string[]

    if (typeof event === 'string') {
      events = [event]
    } else {
      events = event
    }

    const newListeners = events.map((event) => new Listener<E>(event, callback))

    newListeners.forEach((newListener) => this.listeners.add(newListener))

    return () => {
      newListeners.forEach((listener) => this.listeners.delete(listener))
    }
  }

  dispatch<E extends CMSEvent = CMSEvent>(event: E) {
    /**
     * If the `listener` Set is modified during the dispatch then
     * it can cause an infinite loop. Snapshot it and it's fine.
     */
    if (!this.listeners) return

    const listenerSnapshot = Array.from(this.listeners.values())

    listenerSnapshot.forEach((listener) => listener.handleEvent(event))
  }
}

export class Listener<E extends CMSEvent = CMSEvent> {
  constructor(private eventPattern: E['type'], private callback: Callback<E>) {}

  handleEvent(event: E) {
    if (this.watchesEvent(event)) {
      this.callback(event)
      return true
    }
    return false
  }

  watchesEvent(currentEvent: E) {
    if (this.eventPattern === '*') return true

    const eventParts = currentEvent.type.split(':')
    const patternParts = this.eventPattern.split(':')

    let index = 0
    let ignoresEvent = false

    while (!ignoresEvent && index < patternParts.length) {
      const wildcard = patternParts[index] === '*'
      const matchingParts = patternParts[index] === eventParts[index]
      ignoresEvent = !(wildcard || matchingParts)
      index++
    }

    return !ignoresEvent
  }
}
