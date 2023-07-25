/**
 * This package provides an abstract class for making objects Subscribable.
 *
 * @packageDocumentation
 */

/**
 * @ignore
 */
export type Unsubscribe = () => void

/**
 * A basic class that can be subscribed to.
 */
export class Subscribable {
  /**
   * @ignore
   */
  protected __subscribers: Function[] = []

  /**
   * Adds a listener to the Subscribable object.
   *
   * ### Example
   *
   * ```ts
   * const unsubscribe = someSubscribable.add(() => {
   *   console.log("Update Received")
   * })
   *
   * setTimeout(unsubscribe, 5000)
   * ```
   *
   *
   * @param listener A function to be called when the `Subscribable` is updated.
   * @returns A function that will unsubscribe the listener.
   */
  subscribe(listener: Function): Unsubscribe {
    this.__subscribers.push(listener)
    return () => this.unsubscribe(listener)
  }

  /**
   * Removes the given listener from the `Subscribable` object.
   *
   * @param listener The functioni to be removed.
   */
  unsubscribe(listener: Function) {
    const index = this.__subscribers.indexOf(listener)
    this.__subscribers.splice(index, 1)
  }

  /**
   * Notifies subscribers that the `Subscribable` has changed.
   *
   * ### Example
   *
   * ```ts
   * class Cup extends Subscribable {
   *   isFull: boolean = false
   *
   *   fill() {
   *     this.isFull = true
   *     this.notifySubscribers()
   *   }
   *
   *   empty() {
   *     this.isFull = false
   *     this.notifySubscribers()
   *   }
   *
   * }
   *
   * const cup = new Cup()
   *
   * cup.subscribe(() => console.log(cup.isFull))
   *
   * cup.fill() // Logs: true
   * cup.empty() // Logs: false
   * ```
   */
  protected notifiySubscribers() {
    // TODO: Catch and log errors.
    this.__subscribers.forEach((cb) => cb())
  }
}
