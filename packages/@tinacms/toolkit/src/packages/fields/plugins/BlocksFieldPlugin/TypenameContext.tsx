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

export const BlockTypenameContext = React.createContext({ typename: null })

/**
 * When a field is within a block, it's not clear which template
 * the value is coming from, so the event we emit doesn't tell us
 * the full story. This is mostly ok, but if blocks share some of the same
 * field names, an "change" event from `blocks.2.title` doesn't tell the
 * whole story.
 *
 * More info: https://github.com/tinacms/tinacms/issues/2698
 */
export const useCurrentTypename = () => {
  const typenameContext = React.useContext(BlockTypenameContext)
  return typenameContext.typename
}
