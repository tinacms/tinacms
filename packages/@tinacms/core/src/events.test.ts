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

    const watchesThisEvent = this.events.includes(event.type)

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
    describe('with events specified', () => {
      it('is true if event is specified', () => {
        const listener = new Listener(() => {}, ['test'])

        expect(listener.watchesEvent({ type: 'test' })).toBeTruthy()
      })
      it('is false if event is not specified', () => {
        const listener = new Listener(() => {}, ['test'])

        expect(listener.watchesEvent({ type: 'something' })).toBeFalsy()
      })
    })
  })
})
