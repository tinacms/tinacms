import { type PlateEditor, useEditorState } from '@udecode/plate/react';
import React, { useState } from 'react';
import { insertMDX } from '../../plugins/create-mdx-plugins';
import { useToolbarContext } from '../../toolbar/toolbar-provider';
import type { MdxTemplate } from '../../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

export default function TemplatesToolbarButton() {
  const { templates } = useToolbarContext();
  const editor = useEditorState();

  return <EmbedButton templates={templates} editor={editor} />;
}

interface EmbedButtonProps {
  editor: PlateEditor;
  templates: MdxTemplate[];
}

// Below this many, the list is short enough to scan and the input is just noise.
const TEMPLATE_COUNT_NEEDING_FILTER = 10;

const EmbedButton: React.FC<EmbedButtonProps> = ({ editor, templates }) => {
  const { open, onOpenChange } = useOpenState();
  const [filterText, setFilterText] = useState('');

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton showArrow isDropdown pressed={open} tooltip='Embed'>
          Embed
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='max-h-72 overflow-y-auto border-border rounded-none rounded-bl rounded-br'
      >
        {templates.length > TEMPLATE_COUNT_NEEDING_FILTER && (
          <input
            type='text'
            placeholder='Filter templates...'
            className='w-full p-2 border border-gray-300 rounded'
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
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
          >
            {template.label || template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
