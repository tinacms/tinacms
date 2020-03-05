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
export function subscribable<T extends object>(target: T): T & Sub<T> {
  const subscribableTarget = target as T & Sub<T>

  const subscribers: {
    cb: SubscriptionCallback<T>
    subscription: Subscription<T>
  }[] = []

  function subscribe(
    cb: SubscriptionCallback<T>,
    subscription: Subscription<T>
  ) {
    subscribers.push({
      cb,
      subscription,
    })

    return () => unsubscribe(cb)
  }

  function unsubscribe(removeCB: SubscriptionCallback<T>) {
    const index = subscribers.findIndex(({ cb }) => cb === removeCB)
    subscribers.splice(index, 1)
  }

  function notifyChangeFor(prop: keyof (T & Subscription<T>), obj: T) {
    subscribers.forEach(({ subscription, cb }) => {
      if (!subscription || subscription[prop]) {
        cb(obj)
      }
    })
  }

  const p = new Proxy<T & Sub<T>>(subscribableTarget, {
    get: function(obj, prop: keyof (T & Subscription<T>)) {
      if (prop === 'subscribe') {
        return subscribe
      }
      if (prop === 'unsubscribe') {
        return unsubscribe
      }

      return obj[prop]
    },
    set: function(obj, prop: keyof (T & Subscription<T>), value) {
      if (prop === 'subscribe' || prop === 'unsubscribe') {
        return true
      }

      obj[prop] = value
      notifyChangeFor(prop, { ...obj })

      return true
    },
  })

  return p
}

export interface Sub<T> {
  subscribe(
    cb: SubscriptionCallback<T>,
    subscription?: Subscription<T>
  ): Unsubscribe
  unsubscribe(cb: SubscriptionCallback<T>): void
}

export type SubscriptionCallback<T> = (t: T) => void
export type Unsubscribe = () => void
export type Subscription<T> = {
  [P in keyof T]?: boolean
}
