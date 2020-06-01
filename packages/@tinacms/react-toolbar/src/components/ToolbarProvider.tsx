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
import { Toolbar } from './Toolbar'
import { ToolbarState } from '../toolbar'
import { useSubscribable } from '@tinacms/react-core'

interface ToolbarProviderProps {
  toolbar: ToolbarState
  hidden?: boolean
}

export function ToolbarProvider({ hidden, toolbar }: ToolbarProviderProps) {
  useSubscribable(toolbar)
  React.useEffect(() => {
    if (typeof hidden !== 'undefined') {
      toolbar.hidden = hidden
    }
  }, [hidden])

  if (toolbar.hidden) return null

  return <Toolbar />
}
