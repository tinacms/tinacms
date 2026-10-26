import { type ComponentProps, useState } from 'react';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { Icon } from '@tinacms/ui/components/icon';
import { KbdShortcut } from '@tinacms/ui/components/kbd';
import { cn } from '@tinacms/ui/lib/utils';

const ADD_ROW =
  'box-border flex h-8.5 w-full min-w-0 items-center justify-start gap-0.5 rounded-sm border border-transparent bg-transparent py-0 pr-1 pl-0.5 text-left font-sans text-base font-normal text-muted-foreground hover:border-border-subtle hover:bg-list-add-hover hover:text-foreground focus-within:border-ring focus-within:bg-card focus-within:shadow-focus-field';

function PlusMark() {
  return (
    <span
      aria-hidden='true'
      className='flex h-8 w-6 flex-none items-center justify-center'
    >
      <span className='flex size-5 items-center justify-center rounded-xs bg-card text-muted-foreground shadow-xs ring-1 ring-border-subtle'>
        <Icon glyph='plus' size={14} className='size-3.5' />
      </span>
    </span>
  );
}

type AddButtonProps = Omit<ButtonPrimitive.Props, 'children'> & {
  /** What the row adds, such as "Add author". */
  children: string;
};

/** The quiet "+ Add …" row at the end of a list. */
function AddButton({ children, className, type, ...props }: AddButtonProps) {
  return (
    <ButtonPrimitive
      data-slot='add-button'
      type={type ?? 'button'}
      className={cn(
        ADD_ROW,
        'cursor-pointer outline-none transition-all select-none disabled:pointer-events-none disabled:opacity-60',
        className
      )}
      {...props}
    >
      <PlusMark />
      <span className='min-w-0 truncate px-1.5'>{children}</span>
    </ButtonPrimitive>
  );
}

type AddInputProps = Omit<
  ComponentProps<'input'>,
  'children' | 'onChange' | 'value' | 'defaultValue'
> & {
  /** The field's name and placeholder, such as "Add a tag". */
  label: string;
  /** Called with the trimmed text when the editor presses Enter. The input then clears. */
  onAdd?: (value: string) => void;
};

/** The "+ Add …" row as a text field: type, press Enter, and the value is added. */
function AddInput({
  label,
  onAdd,
  disabled,
  className,
  type = 'text',
  ...props
}: AddInputProps) {
  const [draft, setDraft] = useState('');
  return (
    <div
      data-slot='add-input'
      data-disabled={disabled ? '' : undefined}
      className={cn(
        ADD_ROW,
        'cursor-text data-disabled:opacity-60 data-disabled:hover:border-transparent data-disabled:hover:bg-transparent',
        className
      )}
    >
      <PlusMark />
      <input
        type={type}
        aria-label={label}
        placeholder={label}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          const text = draft.trim();
          if (!text) return;
          onAdd?.(text);
          setDraft('');
        }}
        className='h-8 min-w-0 flex-1 border-0 bg-transparent px-1.5 font-sans text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-default'
        {...props}
      />
      {draft.trim() ? <KbdShortcut keys='↵' size='sm' /> : null}
    </div>
  );
}

export type { AddButtonProps, AddInputProps };
export { AddButton, AddInput };
