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
  EditProvider,
  isEditing,
  setEditing,
  useEditState,
} from '@tinacms/sharedctx'

import React from 'react'

export { isEditing, setEditing, useEditState }

export const TinaEditProvider = ({
  showEditButton,
  ...props
}: {
  showEditButton?: boolean
  children: React.ReactNode
  editMode: React.ReactNode
}) => {
  return (
    <EditProvider>
      {showEditButton && <ToggleButton />}
      <TinaEditProviderInner {...props} />
    </EditProvider>
  )
}

const ToggleButton = () => {
  const { edit } = useEditState()
  return edit ? null : (
    <div
      style={{ position: 'fixed', bottom: '56px', left: '0px', zIndex: 200 }}
    >
      <a
        href="/admin"
        style={{
          borderRadius: '0 50px 50px 0',
          fontSize: '16px',
          fontFamily:
            "Inter, 'Helvetica Neue', 'Arial Nova', Helvetica, Arial, sans-serif",
          fontWeight: 'bold',
          textDecoration: 'none',
          background: 'rgb(34, 150, 254)',
          boxShadow:
            '0px 1px 3px rgb(0 0 0 / 10%), 0px 2px 6px rgb(0 0 0 / 20%)',
          color: 'white',
          padding: '14px 20px',
          border: 'none',
        }}
      >
        Edit with Tina
      </a>
    </div>
  )
}

const TinaEditProviderInner = ({ children, editMode }) => {
  const { edit } = useEditState()
  if (edit) {
    return editMode
  }

  return children
}
