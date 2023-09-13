import { Subscribable } from './subscribable'
import { describe, it, test, expect, beforeEach, vi } from 'vitest'

class Example extends Subscribable {
  notify() {
    this.notifiySubscribers()
  }
}

describe('Subscribable', () => {
  describe('#subscribe', () => {
    it('does not callback initially', () => {
      const subscribable = new Example()
      const callback = vi.fn()

      subscribable.subscribe(callback)

      expect(callback).not.toHaveBeenCalled()
    })
    it('calls the callback when notify', () => {
      const subscribable = new Example()
      const callback = vi.fn()
      subscribable.subscribe(callback)

      subscribable.notify()

      expect(callback).toHaveBeenCalled()
    })
    it('calls the callback on subsequent calls', () => {
      const subscribable = new Example()
      const callback = vi.fn()
      subscribable.subscribe(callback)

      subscribable.notify()
      subscribable.notify()
      subscribable.notify()

      expect(callback).toHaveBeenCalledTimes(3)
    })
    it('returns an unsubscribe function', () => {
      const subscribable = new Example()
      const callback = vi.fn()
      const unsubscribe = subscribable.subscribe(callback)

      subscribable.notify()
      unsubscribe()
      subscribable.notify()

      expect(callback).toHaveBeenCalledTimes(1)
    })
    describe('when there are multiple subscribers', () => {
      it('calls them all each time', () => {
        const subscribable = new Example()
        const cb1 = vi.fn()
        const cb2 = vi.fn()
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
        const cb1 = vi.fn()
        subscribable.subscribe(cb1)

        subscribable.notify()
        subscribable.unsubscribe(cb1)
        subscribable.notify()

        expect(cb1).toHaveBeenCalledTimes(1)
      })
      it('does not unsubscribe other callbacks', () => {
        const subscribable = new Example()
        const cb1 = vi.fn()
        const cb2 = vi.fn()
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
