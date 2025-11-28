import React, { useState } from 'react';
import { useToolbarContext } from '../../toolbar/toolbar-provider';
import { type PlateEditor, useEditorState } from '@udecode/plate/react';
import type { MdxTemplate } from '../../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';
import { insertMDX } from '../../plugins/create-mdx-plugins';

export default function TemplatesToolbarButton() {
  const { templates } = useToolbarContext();
  const editor = useEditorState();

  return <EmbedButton templates={templates} editor={editor} />;
}

interface EmbedButtonProps {
  editor: PlateEditor;
  templates: MdxTemplate[];
}

const EmbedButton: React.FC<EmbedButtonProps> = ({ editor, templates }) => {
  const {open, onOpenChange} = useOpenState();
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  const filterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filterText = e.target.value.toLowerCase();
    setFilteredTemplates(
      templates.filter((template) =>
        template.name.toLowerCase().includes(filterText)
      )
    );
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen} >
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          showArrow
          isDropdown
          pressed={openState.open}
          tooltip='Embed'
        >
          Embed
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='max-h-72 overflow-y-auto border-border rounded-none rounded-bl rounded-br'
      >
        {templates.length > 10 && (
          <input
            type='text'
            placeholder='Filter templates...'
            className='w-full p-2 border border-gray-300 rounded'
            onChange={filterChange}
          />
        )}
        {filteredTemplates.map((template) => (
          <DropdownMenuItem
            key={template.name}
            onMouseDown={(e) => {
              e.preventDefault();
              onOpenChange(false);
              insertMDX(editor, template);
            }}
            className={''}
          >
            {template.label || template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
