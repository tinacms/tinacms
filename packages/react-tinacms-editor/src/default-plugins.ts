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

import { Plugin } from '@tinacms/core'
import { SchemaMarkPlugin, SchemaNodePlugin } from './plugins'

// wysiwyg:schema:marks
import code from './plugins/schema/marks/code'
import em from './plugins/schema/marks/em'
import link from './plugins/schema/marks/link'
import strong from './plugins/schema/marks/strong'

// wysiwyg:schema:nodes
import doc from './plugins/schema/nodes/doc'
import blockquote from './plugins/schema/nodes/blockquote'
import bullet_list from './plugins/schema/nodes/list-bullet'
import code_block from './plugins/schema/nodes/code-block'
import hard_break from './plugins/schema/nodes/hard-break'
import heading from './plugins/schema/nodes/heading'
import horizontal_rule from './plugins/schema/nodes/hr'
import image from './plugins/schema/nodes/image'
import list_item from './plugins/schema/nodes/list-item'
import ordered_list from './plugins/schema/nodes/list-ordered'
import paragraph from './plugins/schema/nodes/paragraph'
import text from './plugins/schema/nodes/text'
import tables from './plugins/schema/nodes/tables'
import { KEYMAP_PLUGINS } from './plugins/keymap'

export const MARK_PLUGINS: SchemaMarkPlugin[] = [code, em, link, strong]

export const NODE_PLUGINS: SchemaNodePlugin[] = [
  doc,
  paragraph,
  blockquote,
  bullet_list,
  code_block,
  hard_break,
  heading,
  horizontal_rule,
  image,
  list_item,
  ordered_list,
  text,
  ...tables,
]

// all
export const ALL_PLUGINS: Plugin[] = [
  ...MARK_PLUGINS,
  ...NODE_PLUGINS,
  ...KEYMAP_PLUGINS,
]
