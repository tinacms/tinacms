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
    this.__subscribers.forEach(cb => cb())
  }
}
