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

import { Schema } from 'prosemirror-model'

import { code } from './marks/code'
import { em } from './marks/em'
import { link } from './marks/link'
import { anchor } from './marks/anchor'
import { strike } from './marks/strike'
import { subscript } from './marks/subscript'
import { superscript } from './marks/superscript'
import { strong } from './marks/strong'

import { doc } from './nodes/doc'
import { blockquote } from './nodes/blockquote'
import { bullet_list } from './nodes/list-bullet'
import { code_block } from './nodes/code-block'
import { hard_break } from './nodes/hard-break'
import { heading } from './nodes/heading'
import { horizontal_rule } from './nodes/hr'
import { image } from './nodes/image'
import { list_item } from './nodes/list-item'
import { ordered_list } from './nodes/list-ordered'
import { paragraph } from './nodes/paragraph'
import { text } from './nodes/text'
import { tables } from './nodes/tables'

export const marks = { code, em, link, anchor,strike, strong, subscript, superscript }

export const nodes = {
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
}

export const buildSchema = () => {
  return new Schema({
    nodes,
    marks,
  } as any)
}
