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

import { Subscribable } from './subscribable'

class Example extends Subscribable {
  notify() {
    this.notifySubscribers()
  }
}

describe('Subscribable', () => {
  describe('#subscribe', () => {
    it('does not callback initially', () => {
      const subscribable = new Example()
      const callback = jest.fn()

      subscribable.subscribe(callback)

      expect(callback).not.toHaveBeenCalled()
    })
    it('calls the callback when notify', () => {
      const subscribable = new Example()
      const callback = jest.fn()
      subscribable.subscribe(callback)

      subscribable.notify()

      expect(callback).toHaveBeenCalled()
    })
    it('calls the callback on subsequent calls', () => {
      const subscribable = new Example()
      const callback = jest.fn()
      subscribable.subscribe(callback)

      subscribable.notify()
      subscribable.notify()
      subscribable.notify()

      expect(callback).toHaveBeenCalledTimes(3)
    })
    it('returns an unsubscribe function', () => {
      const subscribable = new Example()
      const callback = jest.fn()
      const unsubscribe = subscribable.subscribe(callback)

      subscribable.notify()
      unsubscribe()
      subscribable.notify()

      expect(callback).toHaveBeenCalledTimes(1)
    })
    describe('when there are multiple subscribers', () => {
      it('calls them all each time', () => {
        const subscribable = new Example()
        const cb1 = jest.fn()
        const cb2 = jest.fn()
        subscribable.subscribe(cb1)
        subscribable.subscribe(cb2)

        subscribable.notify()
        subscribable.notify()
        subscribable.notify()

        expect(cb1).toHaveBeenCalledTimes(3)
        expect(cb2).toHaveBeenCalledTimes(3)
      })
    })
  })
  describe('when already subscribed', () => {
    describe('after calling #unsubscribe', () => {
      it('does not call the callback', () => {
        const subscribable = new Example()
        const cb1 = jest.fn()
        subscribable.subscribe(cb1)

        subscribable.notify()
        subscribable.unsubscribe(cb1)
        subscribable.notify()

        expect(cb1).toHaveBeenCalledTimes(1)
      })
      it('does not unsubscribe other callbacks', () => {
        const subscribable = new Example()
        const cb1 = jest.fn()
        const cb2 = jest.fn()
        subscribable.subscribe(cb1)
        subscribable.subscribe(cb2)

        subscribable.notify()
        subscribable.unsubscribe(cb1)
        subscribable.notify()

        expect(cb2).toHaveBeenCalledTimes(2)
      })
    })
  })
})
