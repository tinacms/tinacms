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
import TinaCMS, { TinaAdmin } from 'tinacms'
import { TinaEditProvider, useEditState } from 'tinacms/dist/edit-state'
import { Preview } from './preview'

// TODO: Resolve this to local file in tsconfig.json
// @ts-expect-error
import config from 'TINA_IMPORT'

export const TinaAdminWrapper = () => {
  return (
    <TinaCMS {...config}>
      <TinaAdmin />
    </TinaCMS>
  )
}

const GoToEdit = () => {
  const { setEdit } = useEditState()
  setEdit(true)
  return <div>Going into edit mode</div>
}

function App() {
  return (
    <TinaEditProvider editMode={<TinaAdminWrapper />}>
      <GoToEdit />
    </TinaEditProvider>
  )
}
export default Preview
