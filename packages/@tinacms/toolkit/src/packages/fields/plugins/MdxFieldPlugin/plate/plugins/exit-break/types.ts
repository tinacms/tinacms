/**
Copyright 2021 Forestry.io Holdings, Inc.
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

import { QueryNodeOptions } from '@udecode/plate-core'

export interface ExitBreakRule {
  /**
   * Hotkey to trigger exit break.
   */
  hotkey: string

  /**
   * @see {@link QueryNodeOptions}
   */
  query?: QueryNodeOptions & {
    /**
     * When the selection is at the start of the block above.
     */
    start?: boolean

    /**
     * When the selection is at the end of the block above.
     */
    end?: boolean
  }

  /**
   * Path level where to exit. Default is 1.
   */
  level?: number

  /**
   * Exit before the selected block if true.
   */
  before?: boolean

  defaultType?: string
}

export interface ExitBreakPlugin {
  rules?: ExitBreakRule[]
}
