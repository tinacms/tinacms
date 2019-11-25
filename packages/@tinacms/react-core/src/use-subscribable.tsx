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

import * as React from 'react'
import { Subscribable } from '@tinacms/core'
/**
 *
 * @param subscribable An object that can be subscribed to
 * @param cb (Optional) A callback to be executed when an event occurs.
 */
export function useSubscribable(subscribable: Subscribable, cb?: Function) {
  const [, s] = React.useState(0)
  React.useEffect(() => {
    return subscribable.subscribe(() => {
      s(x => x + 1)
      if (cb) cb()
    })
  })
}
