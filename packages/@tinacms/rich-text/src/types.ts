import type { BaseEditor } from 'slate'
import type { ReactEditor } from 'slate-react'
import type { SlateElementType } from '@tinacms/mdx'

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: SlateElementType
    // Text: CustomText
  }
}
