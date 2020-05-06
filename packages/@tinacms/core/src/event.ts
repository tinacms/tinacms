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
export type Callback = (event: CMSEvent) => void

export interface CMSEvent {
  type: string
  [key: string]: any
}

export class EventBus {
  private listeners = new Set<Listener>()

  subscribe = (event: string, callback: Callback): (() => void) => {
    const listener = new Listener(event, callback)

    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  dispatch = (event: CMSEvent) => {
    /**
     * If the `listener` Set is modified during the dispatch then
     * it can cause an infinite loop. Snapshot it and it's fine.
     */
    const listenerSnapshot = Array.from(this.listeners.values())

    listenerSnapshot.forEach(listener => listener.handleEvent(event))
  }
}

export class Listener {
  constructor(private eventPattern: string, private callback: Callback) {}

  handleEvent(event: CMSEvent) {
    if (this.watchesEvent(event)) {
      this.callback(event)
      return true
    }
    return false
  }

  watchesEvent(currentEvent: CMSEvent) {
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
