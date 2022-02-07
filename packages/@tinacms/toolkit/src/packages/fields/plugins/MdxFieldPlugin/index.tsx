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

import React from 'react'
import { RichEditor } from './plate'
import { RichEditor as RichEditorUpdated } from './updated'
import { useCMS } from '../../../react-core'

export const MdxFieldPlugin = {
  name: 'rich-text',
  Component: (props) => {
    const cms = useCMS()
    if (cms.flags.get('rich-text-alt')) {
      return <RichEditorUpdated {...props} />
    }
    return <RichEditor {...props} />
  },
}
