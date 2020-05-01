type Callback = Function
type Unsubscribe = Function

interface CMSEvent {
  type: string
}

class Listener {
  constructor(private callback: Callback, private events: string[] = []) {}

  handleEvent(event: CMSEvent) {
    if (this.watchesEvent(event)) {
      this.callback(event)
    }
  }

  watchesEvent(event: CMSEvent) {
    if (!this.events.length) return true

    const watchesThisEvent = !!this.events.find(name => {
      const eventParts = event.type.split(':')
      const watchedParts = name.split(':')

      return watchedParts.reduce<boolean>((watching, part, index) => {
        return watching && part === eventParts[index]
      }, true)
    })

    return watchesThisEvent
  }
}

class EventBus {
  private listeners: Listener[] = []

  subscribe(callback: Callback): Unsubscribe {
    this.listeners.push(new Listener(callback))
    return () => {}
  }

  dispatch(event: CMSEvent) {
    this.listeners.forEach(listener => listener.handleEvent(event))
  }
}

describe('EventBus', () => {
  it('calls listener and passes it the dispatched event', () => {
    const listener = jest.fn()
    const events = new EventBus()
    const event = { type: 'example' }

    events.subscribe(listener)
    events.dispatch(event)

    expect(listener).toHaveBeenCalledWith(event)
  })
})

describe('Listener', () => {
  describe('handleEvent', () => {
    it("invokes it's callback if it watches the event", () => {
      const cb = jest.fn()
      const listener = new Listener(cb, ['example'])
      const event = { type: 'example' }

      listener.watchesEvent = jest.fn(() => true)
      listener.handleEvent(event)

      expect(cb).toHaveBeenCalledWith(event)
    })
    it('does not invoke callback if it does not watch the event', () => {
      const cb = jest.fn()
      const listener = new Listener(cb)
      const event = { type: 'example' }

      listener.watchesEvent = jest.fn(() => false)
      listener.handleEvent(event)

      expect(cb).not.toHaveBeenCalledWith(event)
    })
  })

  describe('watchesEvent(event): boolean', () => {
    describe('when no events specified', () => {
      it('watches all events', () => {
        const listener = new Listener(() => {})

        expect(listener.watchesEvent({ type: 'whatever' })).toBeTruthy()
      })
    })
    describe('with an event "foo" specified', () => {
      it('is true when event is "foo"', () => {
        const listener = new Listener(() => {}, ['foo'])

        expect(listener.watchesEvent({ type: 'foo' })).toBeTruthy()
      })
      it('is false when the event is not "foo"', () => {
        const listener = new Listener(() => {}, ['foo'])

        expect(listener.watchesEvent({ type: 'something' })).toBeFalsy()
      })
      it('is true for namespaced-event "foo:bar"', () => {
        const listener = new Listener(() => {}, ['foo'])

        expect(listener.watchesEvent({ type: 'foo:bar' })).toBeTruthy()
      })
      it('is true for namespaced-event "foo:bar:baz"', () => {
        const listener = new Listener(() => {}, ['foo'])

        expect(listener.watchesEvent({ type: 'foo:bar:baz' })).toBeTruthy()
      })
      it('is false for similarly named event "footsies"', () => {
        const listener = new Listener(() => {}, ['foo'])

        expect(listener.watchesEvent({ type: 'footsies' })).toBeFalsy()
      })
    })
    describe('with a namespaced event "foo:bar" specified', () => {
      const listener = new Listener(() => {}, ['foo:bar'])
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
  })
})
