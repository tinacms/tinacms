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
export type Callback = Function
export type Unsubscribe = Function

export interface CMSEvent {
  type: string
}

export class EventBus {
  private listeners: Listener[] = []

  subscribe(callback: Callback): Unsubscribe {
    this.listeners.push(new Listener(callback))
    return () => {}
  }

  dispatch(event: CMSEvent) {
    this.listeners.forEach(listener => listener.handleEvent(event))
  }
}

export class Listener {
  constructor(private callback: Callback, private events: string[] = []) {}

  handleEvent(event: CMSEvent) {
    if (this.watchesEvent(event)) {
      this.callback(event)
    }
  }

  watchesEvent(currentEvent: CMSEvent) {
    if (!this.events.length) return true

    const watchCurrentEvent = !!this.events.find(watchedEvent => {
      return matchEventPattern(currentEvent, watchedEvent)
    })

    return watchCurrentEvent
  }
}

function matchEventPattern(event: CMSEvent, pattern: string) {
  const eventParts = event.type.split(':')
  const patternParts = pattern.split(':')

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
