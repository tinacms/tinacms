import { Menu } from '@base-ui/react/menu';

export interface MenuAction {
  label: string;
  onSelect: () => void;
  disabledReason?: string;
  destructive?: boolean;
  separatorBefore?: boolean;
}

function MoreIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className='size-4'
      fill='currentColor'
    >
      <circle cx='3.5' cy='8' r='1.25' />
      <circle cx='8' cy='8' r='1.25' />
      <circle cx='12.5' cy='8' r='1.25' />
    </svg>
  );
}

export function ItemMenu({
  label,
  actions,
  disabled,
}: {
  label: string;
  actions: MenuAction[];
  disabled?: boolean;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={label}
        disabled={disabled}
        className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted data-popup-open:text-foreground'
      >
        <MoreIcon />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className='isolate z-50'
          side='bottom'
          align='end'
          sideOffset={4}
        >
          <Menu.Popup
            data-slot='menu-content'
            className='min-w-44 rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none'
          >
            {actions.map((action) => (
              <div key={action.label}>
                {action.separatorBefore ? (
                  <Menu.Separator className='-mx-1 my-1 h-px bg-border-subtle' />
                ) : null}
                <Menu.Item
                  disabled={Boolean(action.disabledReason)}
                  onClick={action.onSelect}
                  className={`flex cursor-pointer items-baseline justify-between gap-4 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-disabled:cursor-not-allowed data-disabled:text-muted-foreground data-highlighted:bg-accent ${action.destructive ? 'text-destructive' : ''}`}
                >
                  {action.label}
                  {action.disabledReason ? (
                    <span className='text-xs'>{action.disabledReason}</span>
                  ) : null}
                </Menu.Item>
              </div>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
