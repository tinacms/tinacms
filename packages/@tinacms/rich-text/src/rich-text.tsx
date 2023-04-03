import React from 'react'
import './types'
// @ts-ignore
import styles from './styles.css?inline'

import { LexicalEditor } from './lexical'
import type { SlateRootType } from '@tinacms/mdx'

export const RichEditor = (props: {
  input: { value: SlateRootType; onChange: (value: unknown) => void }
}) => {
  return (
    <>
      <style>{styles}</style>
      <LexicalEditor {...props} />
    </>
  )
}
