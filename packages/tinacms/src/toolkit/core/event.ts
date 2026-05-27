export type Callback<E extends CMSEvent = CMSEvent> = (event: E) => void;

export interface CMSEvent {
  type: string;
  [key: string]: any;
}

export class EventBus {
  private listeners = new Set<Listener<any>>();

  subscribe<E extends CMSEvent = CMSEvent>(
    event: E['type'] | E['type'][],
    callback: Callback<E>
  ): () => void {
    let events: string[];

    if (typeof event === 'string') {
      events = [event];
    } else {
      events = event;
    }

    const newListeners = events.map(
      (event) => new Listener<E>(event, callback)
    );

    newListeners.forEach((newListener) => this.listeners.add(newListener));

    return () => {
      newListeners.forEach((listener) => this.listeners.delete(listener));
    };
  }

  dispatch<E extends CMSEvent = CMSEvent>(event: E): boolean {
    /**
     * If the `listener` Set is modified during the dispatch then
     * it can cause an infinite loop. Snapshot it and it's fine.
     */
    if (!this.listeners) return false;

    const listenerSnapshot = Array.from(this.listeners.values());

    return listenerSnapshot.reduce(
      (handled, listener) => listener.handleEvent(event) || handled,
      false
    );
  }

  /**
   * Whether any listener *explicitly* targets `eventType`. The catch-all `'*'`
   * pattern does not count — callers use this to detect a purpose-built
   * subscriber (e.g. a mounted UI overlay) without being misled by ambient
   * `'*'` listeners such as the alerts bridge, which would otherwise make
   * {@link dispatch} report every event as "handled".
   */
  hasExplicitListenerFor<E extends CMSEvent = CMSEvent>(
    eventType: E['type']
  ): boolean {
    if (!this.listeners) return false;
    for (const listener of this.listeners) {
      if (listener.isExplicitListenerFor(eventType)) return true;
    }
    return false;
  }
}

export class Listener<E extends CMSEvent = CMSEvent> {
  constructor(
    private eventPattern: E['type'],
    private callback: Callback<E>
  ) {}

  handleEvent(event: E) {
    if (this.watchesEvent(event)) {
      this.callback(event);
      return true;
    }
    return false;
  }

  /**
   * Whether this listener explicitly targets `eventType`. Unlike
   * {@link watchesEvent}, the catch-all `'*'` pattern does NOT match, so this
   * reflects a purpose-built subscription rather than an ambient one.
   */
  isExplicitListenerFor(eventType: E['type']) {
    if (this.eventPattern === '*') return false;
    return this.watchesEvent({ type: eventType } as E);
  }

  watchesEvent(currentEvent: E) {
    if (this.eventPattern === '*') return true;
    const eventParts = currentEvent.type.split(':');
    const patternParts = this.eventPattern.split(':');

    let index = 0;
    let ignoresEvent = false;

    while (!ignoresEvent && index < patternParts.length) {
      const wildcard = patternParts[index] === '*';
      const matchingParts = patternParts[index] === eventParts[index];
      ignoresEvent = !(wildcard || matchingParts);
      index++;
    }

    return !ignoresEvent;
  }
}
