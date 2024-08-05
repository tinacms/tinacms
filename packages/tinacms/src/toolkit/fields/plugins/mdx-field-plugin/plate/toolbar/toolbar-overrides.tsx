import React from 'react'

export type ToolbarOverrideType =
  | 'heading'
  | 'link'
  | 'image'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'code'
  | 'codeBlock'
  | 'bold'
  | 'italic'
  | 'raw'
  | 'embed'

export const ICON_WIDTH = 32
export const EMBED_ICON_WIDTH = 78
export const HEADING = 138

export default function ToolbarOverrideButtons() {
  return <div>ToolbarOverrides</div>
}
