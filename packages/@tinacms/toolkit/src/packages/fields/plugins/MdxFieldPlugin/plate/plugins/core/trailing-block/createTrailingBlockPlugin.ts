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

import {
  createPluginFactory,
  ELEMENT_DEFAULT,
  getPluginType,
  QueryNodeOptions,
} from '@udecode/plate-core'
import { withTrailingBlock } from './withTrailingBlock'

export interface TrailingBlockPlugin extends QueryNodeOptions {
  /**
   * Level where the trailing node should be, the first level being 0.
   */
  level?: number
}

export const KEY_TRAILING_BLOCK = 'trailingBlock'

/**
 * @see {@link withTrailingNode}
 */
export const createTrailingBlockPlugin =
  createPluginFactory<TrailingBlockPlugin>({
    key: KEY_TRAILING_BLOCK,
    withOverrides: withTrailingBlock,
    options: {
      level: 0,
    },
    then: (editor) => ({
      type: getPluginType(editor, ELEMENT_DEFAULT),
    }),
  })
