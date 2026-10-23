import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

type Tab<T extends string> = { value: T; label: string };

type TabsProps<T extends string> = Omit<
  TabsPrimitive.Root.Props,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
> & {
  /** Such as Fields, History, References and Translations. */
  tabs: readonly Tab<T>[];
  value?: NoInfer<T>;
  /** Defaults to the first tab. */
  defaultValue?: NoInfer<T>;
  onValueChange?: (value: NoInfer<T>) => void;
  /** The tab list's name, such as "Document tools". */
  'aria-label'?: string;
  /** One `TabsPanel` per tab. */
  children?: ReactNode;
};

/**
 * Views of one thing, one shown at a time. To filter a list, use Segmented.
 * Left and Right move between tabs and show them, Home and End jump to the ends,
 * and only the shown tab is a Tab stop, so Tab moves on to its panel.
 */
function Tabs<T extends string>({
  tabs,
  value,
  defaultValue,
  onValueChange,
  'aria-label': label,
  className,
  children,
  ...props
}: TabsProps<T>) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      value={value}
      defaultValue={
        value === undefined ? (defaultValue ?? tabs[0]?.value) : undefined
      }
      onValueChange={(next) => {
        const picked = tabs.find((tab) => tab.value === next)?.value;
        if (picked !== undefined) onValueChange?.(picked);
      }}
      className={cn('flex flex-col', className)}
      {...props}
    >
      <TabsPrimitive.List
        activateOnFocus
        aria-label={label}
        className='flex w-full flex-none items-center gap-4.5 border-b border-border-subtle pr-2 pl-4 font-sans text-base leading-control'
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Tab
            key={tab.value}
            value={tab.value}
            className='-mb-px h-10 flex-none cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-0.5 py-0 font-sans text-base font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-45 data-active:border-primary data-active:text-foreground'
          >
            {tab.label}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}

/** What one tab shows. Its `value` matches the tab's. */
function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot='tabs-panel'
      className={cn(
        'font-sans text-base text-foreground outline-none',
        className
      )}
      {...props}
    />
  );
}

export type { Tab, TabsProps };
export { Tabs, TabsPanel };
