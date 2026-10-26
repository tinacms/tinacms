import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';

import { cn } from '@tinacms/ui/lib/utils';

type SeparatorProps = SeparatorPrimitive.Props & {
  /** `subtle` between items in a card or list, `strong` on toolbars and menus. */
  tone?: 'subtle' | 'strong';
};

function Separator({
  className,
  orientation = 'horizontal',
  tone = 'subtle',
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot='separator'
      orientation={orientation}
      className={cn(
        'shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
        tone === 'strong' ? 'bg-border' : 'bg-border-subtle',
        className
      )}
      {...props}
    />
  );
}

export type { SeparatorProps };
export { Separator };
