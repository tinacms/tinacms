import React from 'react'
import { TinaAdminWrapper } from './Tina'
import { TinaEditProvider, useEditState } from 'tinacms/dist/edit-state'

function App() {
  return (
    <TinaEditProvider editMode={<TinaAdminWrapper />}>
      <GoToEdit />
    </TinaEditProvider>
  )
}

const GoToEdit = () => {
  const { setEdit } = useEditState()
  setEdit(true)
  return <div>Going into edit mode</div>
}

export default App
