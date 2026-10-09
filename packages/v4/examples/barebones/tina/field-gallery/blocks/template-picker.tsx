import { Popover } from '@base-ui/react/popover';
import { cn } from '@tinacms/ui/lib/utils';
import { useState } from 'react';
import type { PickerArgs } from '../group/item-list';
import {
  type Block,
  type BlockTemplate,
  emptyBlock,
  TEMPLATES,
} from './templates';

// Search shows once the list would scroll: more templates than fit at once.
const SEARCH_FROM = 7;

const matches = (template: BlockTemplate, query: string) => {
  const text = `${template.label} ${template.description}`.toLowerCase();
  return text.includes(query.trim().toLowerCase());
};

function groupsOf(templates: BlockTemplate[]) {
  const groups = new Map<string, BlockTemplate[]>();
  for (const template of templates) {
    groups.set(template.group, [
      ...(groups.get(template.group) ?? []),
      template,
    ]);
  }
  return [...groups.entries()];
}

function PlainOption({
  template,
  onPick,
}: {
  template: BlockTemplate;
  onPick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onPick}
      className='grid w-full cursor-pointer gap-0.5 rounded-sm px-2 py-1.5 text-left outline-none hover:bg-accent focus-visible:bg-accent'
    >
      <span className='text-sm font-medium'>{template.label}</span>
      <span className='text-label text-muted-foreground'>
        {template.description}
      </span>
    </button>
  );
}

function VisualOption({
  template,
  onPick,
}: {
  template: BlockTemplate;
  onPick: () => void;
}) {
  const { Thumbnail } = template;
  return (
    <button
      type='button'
      onClick={onPick}
      className='grid cursor-pointer gap-1.5 rounded-md border border-border-subtle p-1.5 text-left outline-none hover:border-input hover:bg-muted/40 focus-visible:focus-ring'
    >
      <span className='block overflow-hidden rounded-sm bg-muted/70'>
        <Thumbnail />
      </span>
      <span className='grid gap-0.5 px-0.5'>
        <span className='text-sm font-medium'>{template.label}</span>
        <span className='text-xs text-muted-foreground'>
          {template.description}
        </span>
      </span>
    </button>
  );
}

export function TemplatePicker({
  look,
  open,
  anchor,
  onPick,
  onClose,
}: PickerArgs<Block> & { look: 'plain' | 'visual' }) {
  const [query, setQuery] = useState('');
  const shown = TEMPLATES.filter((template) => matches(template, query));
  const choose = (template: BlockTemplate) => {
    setQuery('');
    onPick(emptyBlock(template));
  };
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setQuery('');
          onClose();
        }
      }}
    >
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side='bottom'
          align='start'
          sideOffset={4}
          collisionAvoidance={{ side: 'flip', fallbackAxisSide: 'none' }}
          className='isolate z-50'
        >
          <Popover.Popup
            data-slot='picker-content'
            className={cn(
              'grid max-h-(--available-height) gap-1 overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none',
              'w-(--anchor-width) min-w-72'
            )}
          >
            <Popover.Title className='px-2 pt-1.5 text-xs font-medium text-muted-foreground'>
              Choose a block
            </Popover.Title>
            {TEMPLATES.length >= SEARCH_FROM ? (
              <input
                aria-label='Search blocks'
                placeholder='Search blocks'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className='mx-1 my-1 h-8 rounded-sm border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-focus-glow'
              />
            ) : null}
            {shown.length === 0 ? (
              <p className='px-2 py-3 text-center text-sm text-muted-foreground'>
                No blocks match.
              </p>
            ) : null}
            {groupsOf(shown).map(([group, templates]) => (
              <div
                key={group}
                role='group'
                aria-label={group}
                className='grid gap-0.5'
              >
                <p className='px-2 pt-1.5 pb-0.5 text-xs text-muted-foreground'>
                  {group}
                </p>
                <div
                  className={
                    look === 'visual'
                      ? 'grid grid-cols-2 gap-1.5 px-1 pb-1'
                      : 'grid gap-0.5'
                  }
                >
                  {templates.map((template) =>
                    look === 'visual' ? (
                      <VisualOption
                        key={template.name}
                        template={template}
                        onPick={() => choose(template)}
                      />
                    ) : (
                      <PlainOption
                        key={template.name}
                        template={template}
                        onPick={() => choose(template)}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
