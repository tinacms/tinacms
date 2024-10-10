import React, { useState } from 'react'
import { useToolbarContext } from '../../toolbar/toolbar-provider'
import { type PlateEditor, useEditorState } from '@udecode/plate-common'
import type { MdxTemplate } from '../../types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { PlusIcon } from './icons'
import { insertMDX } from '../../plugins/create-mdx-plugins'

export default function TemplatesToolbarButton() {
  const { templates } = useToolbarContext()
  const editor = useEditorState()

  return <EmbedButton templates={templates} editor={editor} />
}

interface EmbedButtonProps {
  editor: PlateEditor
  templates: MdxTemplate[]
}

const EmbedButton: React.FC<EmbedButtonProps> = ({ editor, templates }) => {
  const [open, setOpen] = useState(false)
  const [filteredTemplates, setFilteredTemplates] = useState(templates)

  const filterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filterText = e.target.value.toLowerCase()
    setFilteredTemplates(
      templates.filter((template) =>
        template.name.toLowerCase().includes(filterText)
      )
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="inline-flex items-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([data-icon])]:size-5 h-9 px-2 bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground my-1 justify-between pr-1">
        <span className="flex">Embed</span>
        <PlusIcon
          className={`origin-center transition-all ease-out duration-150 ${
            open ? 'rotate-45' : ''
          }`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-48 overflow-y-auto">
        {templates.length > 10 && (
          <input
            type="text"
            placeholder="Filter templates..."
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={filterChange}
          />
        )}
        <DropdownMenuSeparator />
        {filteredTemplates.map((template) => (
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
