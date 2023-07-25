import { EventBus, Listener } from './event'
import { describe, it, test, expect, beforeEach, vi } from 'vitest'

describe('EventBus', () => {
  it('calls listener and passes it the dispatched event', () => {
    const listener = vi.fn()
    const events = new EventBus()
    const event = { type: 'example' }

    events.subscribe('*', listener)
    events.dispatch(event)

    expect(listener).toHaveBeenCalledWith(event)
  })
  test('for an array of eventscalls listeners and passes it the dispatched event', () => {
    const listener = vi.fn()
    const events = new EventBus()
    const one = { type: 'one' }
    const two = { type: 'two' }

    events.subscribe(['one', 'two'], listener)
    events.dispatch(one)
    events.dispatch(two)

    expect(listener).toHaveBeenCalledWith(two)
    expect(listener).toHaveBeenCalledWith(one)
  })
  describe('after calling unsubscribe', () => {
    it('does not invoke the listener', () => {
      const listener = vi.fn()
      const events = new EventBus()
      const event = { type: 'example' }

      const unsubscribe = events.subscribe('*', listener)
      unsubscribe()
      events.dispatch(event)

      expect(listener).not.toHaveBeenCalled()
    })
  })
})

describe('Listener', () => {
  describe('handleEvent', () => {
    it("invokes it's callback if it watches the event", () => {
      const cb = vi.fn()
      const listener = new Listener('example', cb)
      const event = { type: 'example' }

      listener.watchesEvent = vi.fn(() => true)
      listener.handleEvent(event)

      expect(cb).toHaveBeenCalledWith(event)
    })
    it('does not invoke callback if it does not watch the event', () => {
      const cb = vi.fn()
      const listener = new Listener('something', cb)
      const event = { type: 'example' }

      listener.watchesEvent = vi.fn(() => false)
      listener.handleEvent(event)

      expect(cb).not.toHaveBeenCalledWith(event)
    })
  })

  describe('watchesEvent(event): boolean', () => {
    describe('when no events specified', () => {
      it('watches all events', () => {
        const listener = new Listener('*', () => {})

        expect(listener.watchesEvent({ type: 'whatever' })).toBeTruthy()
      })
    })

    describe('with an event "foo" specified', () => {
      const listener = new Listener('foo', () => {})

      it('is true when event is "foo"', () => {
        expect(listener.watchesEvent({ type: 'foo' })).toBeTruthy()
      })

      it('is false when the event is not "foo"', () => {
        expect(listener.watchesEvent({ type: 'something' })).toBeFalsy()
      })

      it('is true for namespaced-event "foo:bar"', () => {
        expect(listener.watchesEvent({ type: 'foo:bar' })).toBeTruthy()
      })

      it('is true for namespaced-event "foo:bar:baz"', () => {
        expect(listener.watchesEvent({ type: 'foo:bar:baz' })).toBeTruthy()
      })

      it('is false for similarly named event "footsies"', () => {
        expect(listener.watchesEvent({ type: 'footsies' })).toBeFalsy()
      })
    })

    describe('with a namespaced event "foo:bar" specified', () => {
      const listener = new Listener('foo:bar', () => {})

      it('is false for non-namespaced event "foo"', () => {
        expect(listener.watchesEvent({ type: 'foo' })).toBeFalsy()
      })

      it('is false when the event is not "foo"', () => {
        expect(listener.watchesEvent({ type: 'something' })).toBeFalsy()
      })

      it('is true for namespaced-event "foo:bar"', () => {
        expect(listener.watchesEvent({ type: 'foo:bar' })).toBeTruthy()
      })

      it('is true for namespaced-event "foo:bar:baz"', () => {
        expect(listener.watchesEvent({ type: 'foo:bar:baz' })).toBeTruthy()
      })

      it('is false for similarly named event "footsies:barsies"', () => {
        expect(listener.watchesEvent({ type: 'footsies' })).toBeFalsy()
      })
    })
    describe('with a wildcard event "plugin:*:form" specified', () => {
      const listener = new Listener('plugin:*:form', () => {})

      it('is false for non-namespaced event "plugin"', () => {
        expect(listener.watchesEvent({ type: 'plugin' })).toBeFalsy()
      })

      it('is true for namespaced-event "plugin:add:form"', () => {
        expect(listener.watchesEvent({ type: 'plugin:add:form' })).toBeTruthy()
      })

      it('is false for other namespaced-event "plugin:add:baz"', () => {
        expect(listener.watchesEvent({ type: 'plugin:add:baz' })).toBeFalsy()
      })
    })
  })
})
