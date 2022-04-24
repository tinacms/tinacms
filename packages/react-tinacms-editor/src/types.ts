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

import { Decoration, EditorView, NodeView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { ElementType } from 'react'
import { Node } from 'prosemirror-model'
import { Schema } from 'prosemirror-model'

import { Format } from './translator'
import { Form, Media } from '@tinacms/toolkit'

export interface PassedImageProps {
  parse(media: Media): string
  uploadDir?(formValues: any): string
  upload?: (files: File[]) => Promise<string[]>
  previewSrc?: (url: string) => string | Promise<string>
}

export interface ImageProps extends PassedImageProps {
  mediaDir?: string
}

export interface KeymapPlugin {
  __type: 'wysiwyg:keymap'
  name: string
  command(schema: Schema): any // TODO Command
  ifMark?: string
  ifNode?: string
  ifNodes?: string[]
  ifMac?: boolean
  unlessMac?: boolean
  onCondition?(schema: Schema): boolean
}

export type NodeViews = {
  [name: string]: (
    node: Node,
    view: EditorView,
    getPos: () => number,
    decorations: Decoration[]
  ) => NodeView
} | null

export interface Command {
  (state: EditorState, ...options: any[]): void
}

export interface Plugin {
  name: string
  MenuItem: ElementType
}

export interface Input {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export interface EditorProps {
  input: Input
  form?: Form
  plugins?: Plugin[]
  sticky?: boolean | string
  format?: Format
  imageProps?: ImageProps
  className?: string
}
