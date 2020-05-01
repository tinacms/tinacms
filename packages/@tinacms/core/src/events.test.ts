type Callback = Function
type Unsubscribe = Function

interface CMSEvent {
  type: string
}

class EventBus {
  private listeners: Callback[] = []

  subscribe(callback: Callback): Unsubscribe {
    this.listeners.push(callback)
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
