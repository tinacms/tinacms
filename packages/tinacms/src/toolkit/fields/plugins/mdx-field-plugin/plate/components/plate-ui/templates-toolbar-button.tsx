import React, { useState } from 'react'
import { useToolbarContext } from '../../toolbar/toolbar-provider'
// import { EmbedButton } from "../../plugins/ui/toolbar/toolbar-item";
import { type PlateEditor, useEditorState } from '@udecode/plate-common'
import type { MdxTemplate } from '../../types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { PlusIcon } from './icons'
import { insertMDX } from '../../plugins/create-mdx-plugins'

export default function TemplatesToolbarButton() {
  const { templates } = useToolbarContext()
  const showEmbed = templates.length > 0
  const editor = useEditorState()

  if (!showEmbed) {
    return null
  }

  return <EmbedButton templates={templates} editor={editor} />
}

interface EmbedButtonProps {
  editor: PlateEditor
  templates: MdxTemplate[]
}

const EmbedButton: React.FC<EmbedButtonProps> = ({ editor, templates }) => {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="ring-none focus-none focus-visible:ring-none w-full h-full cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium transition-all ease-out duration-150">
        <span className="text-sm font-semibold tracking-wide align-baseline mr-1">
          Embed
        </span>
        <PlusIcon
          className={`origin-center transition-all ease-out duration-150 ${
            open ? 'rotate-45' : ''
          }`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Templates</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.name}
            onMouseDown={(e) => {
              e.preventDefault()
              close()
              insertMDX(editor, template)
            }}
            className={''}
          >
            {template.label || template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
