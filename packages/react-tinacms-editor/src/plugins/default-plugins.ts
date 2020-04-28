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

import { SchemaMarkPlugin, SchemaNodePlugin } from '../types'

// wysiwyg:schema:marks
import code from '../schema/marks/code'
import em from '../schema/marks/em'
import link from '../schema/marks/link'
import strong from '../schema/marks/strong'

// wysiwyg:schema:nodes
import doc from '../schema/nodes/doc'
import blockquote from '../schema/nodes/blockquote'
import bullet_list from '../schema/nodes/list-bullet'
import code_block from '../schema/nodes/code-block'
import hard_break from '../schema/nodes/hard-break'
import heading from '../schema/nodes/heading'
import horizontal_rule from '../schema/nodes/hr'
import image from '../schema/nodes/image'
import list_item from '../schema/nodes/list-item'
import ordered_list from '../schema/nodes/list-ordered'
import paragraph from '../schema/nodes/paragraph'
import text from '../schema/nodes/text'
import tables from '../schema/nodes/tables'
import { KEYMAP_PLUGINS } from './keymap'

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
