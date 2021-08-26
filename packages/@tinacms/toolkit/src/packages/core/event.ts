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
