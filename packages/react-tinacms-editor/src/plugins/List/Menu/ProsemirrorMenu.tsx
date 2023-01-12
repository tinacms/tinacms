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

import * as React from 'react'
import {
  UnorderedListIcon,
  OrderedListIcon,
} from '@einsteinindustries/tinacms-icons'

import { commandControl } from '../../../components/MenuHelpers'
import { formatKeymap } from '../../../utils'
import { toggleBulletList, toggleOrderedList } from '../commands'

export const ProsemirrorMenu = (props: any) => (
  <>
    <BulletList {...props} />
    <OrderedList {...props} />
  </>
)

const BulletList = commandControl(
  toggleBulletList,
  UnorderedListIcon,
  'Unordered List',
  formatKeymap('Unordered List Mod-Alt-8')
)

const OrderedList = commandControl(
  toggleOrderedList,
  OrderedListIcon,
  'Ordered List',
  formatKeymap('Ordered List Mod-Alt-7')
)
