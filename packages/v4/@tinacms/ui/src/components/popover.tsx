'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { usePopupEdgePadding } from '@tinacms/ui/components/foot-sheet';
import { cn } from '@tinacms/ui/lib/utils';

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot='popover' {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />;
}

/** Give it an `aria-label`: screen readers name the dialog by it. */
function PopoverContent({
  className,
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  collisionAvoidance,
  collisionPadding,
  sticky,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    | 'align'
    | 'alignOffset'
    | 'side'
    | 'sideOffset'
    | 'collisionAvoidance'
    | 'collisionPadding'
    | 'sticky'
  >) {
  const edge = usePopupEdgePadding();
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        collisionAvoidance={collisionAvoidance}
        collisionPadding={collisionPadding ?? edge}
        sticky={sticky}
        className='isolate z-50 outline-none'
      >
        <PopoverPrimitive.Popup
          data-slot='popover-content'
          className={cn(
            'z-50 box-border flex max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) flex-col gap-2 overflow-y-auto rounded-md bg-popover p-2 font-sans text-base leading-control text-foreground shadow-popover outline-none',
            'transition-[opacity,scale] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

/** Names the pop-up for screen readers. Style it with `className`. */
function PopoverTitle({ ...props }: PopoverPrimitive.Title.Props) {
  return <PopoverPrimitive.Title data-slot='popover-title' {...props} />;
}

export { Popover, PopoverContent, PopoverTitle, PopoverTrigger };
