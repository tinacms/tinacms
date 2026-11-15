import { useEditorRef } from '@udecode/plate/react';
import React from 'react';
import { insertMDX } from '../plugins/create-mdx-plugins';
import type { InsertTool } from '../toolbar/toolbar-layout';
import { useToolbarContext } from '../toolbar/toolbar-provider';
import { insertCodeBlock } from './plate-ui/code-block-toolbar-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useOpenState,
} from './plate-ui/dropdown-menu';
import { insertHorizontalRule } from './plate-ui/hr-toolbar-button';
import { Icons } from './plate-ui/icons';
import { insertMermaid } from './plate-ui/mermaid-toolbar-button';
import { TableInsertSubMenu } from './plate-ui/table/table-dropdown-menu';
import { ToolbarButton } from './plate-ui/toolbar';
import { useToolBlocked } from './use-tool-blocked';

const TEMPLATE_COUNT_NEEDING_FILTER = 10;

const MenuIcon = ({ children }: { children: React.ReactNode }) => (
  <span
    aria-hidden
    className='flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-full'
  >
    {children}
  </span>
);

/** The Insert trigger and menu: the field's templates first, then the inserts, with a line between. */
export function InsertMenu({
  inserts,
  templates: showTemplates,
  disabled = false,
}: {
  inserts: readonly InsertTool[];
  templates: boolean;
  disabled?: boolean;
}) {
  const { templates } = useToolbarContext();
  const editor = useEditorRef();
  const { open, onOpenChange } = useOpenState();
  const { isBlocked } = useToolBlocked();
  const [filterText, setFilterText] = React.useState('');

  const visibleTemplates = showTemplates
    ? templates.filter((template) =>
        (template.label || template.name)
          .toLowerCase()
          .includes(filterText.toLowerCase())
      )
    : [];
  const hasTemplates = showTemplates && templates.length > 0;
  const hasInserts = inserts.length > 0;

  return (
    <DropdownMenu
      modal={false}
      open={open}
      onOpenChange={(next) => {
        if (!next) setFilterText('');
        onOpenChange(next);
      }}
    >
      <DropdownMenuTrigger asChild disabled={disabled}>
        <ToolbarButton
          open={open}
          showArrow
          disabled={disabled}
          tooltip='Insert'
          className='px-2'
        >
          Insert
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        aria-label='Insert'
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          editor.tf.focus();
        }}
      >
        {hasTemplates && templates.length > TEMPLATE_COUNT_NEEDING_FILTER ? (
          <input
            type='search'
            aria-label='Filter templates'
            placeholder='Filter templates...'
            className='mb-1 box-border h-9 w-full rounded-sm border border-input bg-card px-2.5 text-base outline-none focus-visible:border-ring focus-visible:shadow-focus-field'
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
          />
        ) : null}
        {visibleTemplates.map((template) => (
          <DropdownMenuItem
            key={template.name}
            onSelect={() => insertMDX(editor, template)}
          >
            {template.label || template.name}
          </DropdownMenuItem>
        ))}
        {hasTemplates && hasInserts ? <DropdownMenuSeparator /> : null}
        {inserts.map((key) => {
          switch (key) {
            case 'image':
              return (
                <DropdownMenuItem key={key} disabled>
                  <MenuIcon>
                    <Icons.image />
                  </MenuIcon>
                  Image
                </DropdownMenuItem>
              );
            case 'table':
              return <TableInsertSubMenu key={key} />;
            case 'codeBlock':
              return (
                <DropdownMenuItem
                  key={key}
                  disabled={isBlocked(key)}
                  onSelect={() => insertCodeBlock(editor)}
                >
                  <MenuIcon>
                    <Icons.codeBlock />
                  </MenuIcon>
                  Code block
                </DropdownMenuItem>
              );
            case 'mermaid':
              return (
                <DropdownMenuItem
                  key={key}
                  disabled={isBlocked(key)}
                  onSelect={() => insertMermaid(editor)}
                >
                  <MenuIcon>
                    <Icons.mermaid />
                  </MenuIcon>
                  Mermaid
                </DropdownMenuItem>
              );
            case 'hr':
              return (
                <DropdownMenuItem
                  key={key}
                  disabled={isBlocked(key)}
                  onSelect={() => insertHorizontalRule(editor)}
                >
                  <MenuIcon>
                    <Icons.horizontalRule />
                  </MenuIcon>
                  Horizontal rule
                </DropdownMenuItem>
              );
          }
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
