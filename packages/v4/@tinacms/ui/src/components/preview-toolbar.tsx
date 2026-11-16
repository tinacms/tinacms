import { Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react';
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from 'react';

import { Button } from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuHeading,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import {
  InputGroup,
  InputGroupInput,
} from '@tinacms/ui/components/input-group';
import type {
  PreviewDevice,
  PreviewScale,
} from '@tinacms/ui/components/preview-frame';
import { type Tier, useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';

const DEVICES = [
  { value: 'fit', label: 'Fit', icon: Monitor, width: 'fills the preview' },
  { value: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { value: 'phone', label: 'Phone', icon: Smartphone, width: '390px' },
] as const;

const SCALES: PreviewScale[] = ['fit', 100, 75, 50];

type PreviewToolbarProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The page's address without a scheme, such as "localhost:3000/". Editable: Enter sends the text to `onNavigate`. */
  address: string;
  onNavigate?: (address: string) => void;
  /** Called on each keystroke in the address box. */
  onAddressInput?: () => void;
  /** Why the typed address was refused. Shows under the box and is announced. */
  addressError?: string;
  device?: PreviewDevice;
  onDeviceChange?: (device: PreviewDevice) => void;
  /** At Fit: the width the page is drawn at, in px. */
  fitWidth?: number;
  /** At Tablet and Phone: the scale chosen. */
  scale?: PreviewScale;
  /** At Tablet and Phone with `scale` `fit`: the percentage Fit gives. */
  fitScale?: number;
  onScaleChange?: (scale: PreviewScale) => void;
  onReload?: () => void;
  onOpenInNewTab?: () => void;
  /** True while the preview is expanded: the button reads "Collapse preview". */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** The layout to draw. Follows the window by default. */
  width?: Tier;
};

const scaleWord = (scale: PreviewScale, fitScale = 100) =>
  `${scale === 'fit' ? fitScale : scale}%`;

/**
 * The bar over the preview, 44px: the page's address, the device size, the width or scale readout,
 * Preview actions (⋯) and Expand preview. A tablet-width window moves the device sizes into ⋯;
 * a phone-width window keeps the address and ⋯ only.
 */
function PreviewToolbar({
  address,
  onNavigate,
  onAddressInput,
  addressError,
  device = 'fit',
  onDeviceChange,
  fitWidth,
  scale = 'fit',
  fitScale,
  onScaleChange,
  onReload,
  onOpenInNewTab,
  expanded = false,
  onExpandedChange,
  width,
  className,
  ...props
}: PreviewToolbarProps) {
  const tier = useTier();
  const shown = width ?? tier;
  const at = DEVICES.find((d) => d.value === device) ?? DEVICES[0];
  const errorId = useId();

  const addressInput = useRef<HTMLInputElement>(null);
  const typing = useRef(false);
  const waiting = useRef<string | null>(null);
  useEffect(() => {
    const input = addressInput.current;
    if (!input) return;
    if (typing.current) waiting.current = address;
    else input.value = address;
  }, [address]);

  const actions = (
    <>
      <DropdownMenuItem icon={RotateCw} onClick={onReload}>
        Reload
      </DropdownMenuItem>
      <DropdownMenuItem icon='external' onClick={onOpenInNewTab}>
        Open in new tab
      </DropdownMenuItem>
    </>
  );
  const deviceRows = (
    <>
      <DropdownMenuHeading heading='Device size' />
      {DEVICES.map((d) => (
        <DropdownMenuCheckboxItem
          key={d.value}
          icon={d.icon}
          hint={d.value === 'fit' ? 'Fills the preview' : d.width}
          checked={d.value === device}
          onCheckedChange={() => onDeviceChange?.(d.value)}
        >
          {d.label}
        </DropdownMenuCheckboxItem>
      ))}
      <DropdownMenuSeparator />
    </>
  );
  const more = (withDevices: boolean) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='icon' icon='more' tooltipSide='bottom'>
            Preview actions
          </Button>
        }
      />
      <DropdownMenuContent align='end' aria-label='Preview actions'>
        {withDevices ? deviceRows : null}
        {actions}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const scaleControl =
    device === 'fit' ? null : (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              iconEnd='chevron-down'
              size='sm'
              className='text-xs'
              aria-label={`${at.width}, scale ${scaleWord(scale, fitScale)}`}
            >
              {`${at.width} · ${scaleWord(scale, fitScale)}`}
            </Button>
          }
        />
        <DropdownMenuContent align='center' aria-label='Scale'>
          <DropdownMenuHeading heading='Scale' />
          {SCALES.map((s) => (
            <DropdownMenuCheckboxItem
              key={s}
              checked={s === scale}
              onCheckedChange={() => onScaleChange?.(s)}
            >
              {s === 'fit' ? 'Fit to the preview' : `${s}%`}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  const expand = (
    <Button
      variant='icon'
      icon={expanded ? 'restore' : 'maximise'}
      shortcut={expanded ? 'Esc' : undefined}
      aria-keyshortcuts={expanded ? 'Escape' : undefined}
      tooltipSide='bottom'
      onClick={() => onExpandedChange?.(!expanded)}
    >
      {expanded ? 'Collapse preview' : 'Expand preview'}
    </Button>
  );

  return (
    <div
      role='group'
      aria-label='Preview toolbar'
      data-slot='preview-toolbar'
      className={cn(
        'relative box-border min-h-11 flex-none items-center gap-1.5 border-b border-border-subtle bg-card px-2 font-sans',
        shown === 'desktop'
          ? 'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'
          : 'flex',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex min-w-0 items-center gap-1.5',
          shown !== 'desktop' && 'flex-1'
        )}
      >
        <InputGroup className='min-w-0 flex-1'>
          <InputGroupInput
            ref={addressInput}
            aria-label='Page address'
            aria-invalid={addressError ? true : undefined}
            aria-describedby={addressError ? errorId : undefined}
            defaultValue={address}
            spellCheck={false}
            onChange={() => {
              typing.current = true;
              onAddressInput?.();
            }}
            onBlur={() => {
              typing.current = false;
              if (waiting.current !== null && addressInput.current) {
                addressInput.current.value = waiting.current;
              }
              waiting.current = null;
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              typing.current = false;
              waiting.current = null;
              onNavigate?.(event.currentTarget.value);
            }}
          />
        </InputGroup>
      </div>
      {addressError ? (
        <p
          id={errorId}
          role='alert'
          className='absolute top-full left-2 z-30 m-0 rounded-sm bg-card px-2 py-1 text-xs text-destructive shadow-popover'
        >
          {addressError}
        </p>
      ) : null}
      {shown === 'phone' ? (
        more(false)
      ) : shown === 'tablet' ? (
        <>
          <div className='flex flex-none items-center gap-0.5'>
            {scaleControl}
            {more(true)}
          </div>
          {expand}
        </>
      ) : (
        <>
          <div className='flex flex-none items-center gap-0.5'>
            <div
              role='group'
              aria-label='Device size'
              className='flex flex-none items-center gap-0.5'
            >
              {DEVICES.map((d) => (
                <Button
                  key={d.value}
                  variant='icon'
                  icon={d.icon}
                  selected={d.value === device}
                  aria-pressed={d.value === device}
                  tooltipSide='bottom'
                  onClick={() => onDeviceChange?.(d.value)}
                >
                  {`${d.label}, ${d.width}`}
                </Button>
              ))}
            </div>
            {device === 'fit' ? (
              <span className='flex-none px-1 text-xs text-muted-foreground tabular-nums'>
                {fitWidth ? `${fitWidth}px` : null}
              </span>
            ) : (
              scaleControl
            )}
            {more(false)}
          </div>
          <div className='flex min-w-0 items-center justify-end'>{expand}</div>
        </>
      )}
    </div>
  );
}

export type { PreviewToolbarProps };
export { PreviewToolbar };
