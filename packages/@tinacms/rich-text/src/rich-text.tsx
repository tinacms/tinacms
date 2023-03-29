import React, { useState } from 'react'
import { createEditor } from 'slate'
import './types'
// @ts-ignore
import styles from './styles.css'

import { Slate, Editable, withReact } from 'slate-react'
import { LexicalEditor } from './lexical'
import type { SlateRootType } from '@tinacms/mdx'

export const RichEditor = (props: {
  input: { value: SlateRootType; onChange: (value: unknown) => void }
}) => {
  const [editor] = useState(() => withReact(createEditor()))

  editor.children.map((child) => {
    child
  })

  return (
    <>
      <style>{styles}</style>
      <LexicalEditor {...props} />
    </>
  )

  return (
    <Slate
      editor={editor}
      value={props.input.value?.children || []}
      onChange={(value) => {
        const nextValue = { type: 'root', children: value }
        console.log(nextValue)
        props.input.onChange(nextValue)
      }}
    >
      <style>{styles}</style>
      <Editable className="prose" />
    </Slate>
  )
}
