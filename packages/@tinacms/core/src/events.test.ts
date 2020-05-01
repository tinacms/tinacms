type Callback = Function
type Unsubscribe = Function

interface CMSEvent {
  type: string
}

class Listener {
  constructor(private callback: Callback, private events: string[] = []) {}

  handleEvent(event: CMSEvent) {
    const watchAllEvents = !this.events.length
    const watchesThisEvent = this.events.includes(event.type)

    if (watchAllEvents || watchesThisEvent) {
      this.callback(event)
    }
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
    describe('when no events are explicitly watched', () => {
      it("calls it's callback", () => {
        const cb = jest.fn()
        const listener = new Listener(cb)
        const event = { type: 'example' }

        listener.handleEvent(event)

        expect(cb).toHaveBeenCalledWith(event)
      })
    })
    describe('when an event is explicitly watched', () => {
      it("invokes it's callback when given that event", () => {
        const cb = jest.fn()
        const listener = new Listener(cb, ['example'])
        const event = { type: 'example' }

        listener.handleEvent(event)

        expect(cb).toHaveBeenCalledWith(event)
      })
      it('does not invoke callback when given other event', () => {
        const cb = jest.fn()
        const listener = new Listener(cb, ['example'])
        const event = { type: 'other' }

        listener.handleEvent(event)

        expect(cb).not.toHaveBeenCalledWith(event)
      })
    })
  })
})
