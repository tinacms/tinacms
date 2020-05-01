type Listener = Function
type Unsubscribe = Function

interface CMSEvent {
  type: string
}

class EventBus {
  private listeners: Listener[] = []

  subscribe(listener: Listener): Unsubscribe {
    this.listeners.push(listener)
    return () => {}
  }

  dispatch(event: CMSEvent) {
    this.listeners.forEach(listener => listener(event))
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
