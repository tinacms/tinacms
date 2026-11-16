import {
  type ComponentProps,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { EmptyState } from '@tinacms/ui/components/empty-state';
import { Spinner } from '@tinacms/ui/components/spinner';
import { cn } from '@tinacms/ui/lib/utils';

/** The device sizes the preview draws the page at. Fit fills the preview; Tablet is 768px; Phone is 390px. */
type PreviewDevice = 'fit' | 'tablet' | 'phone';
/** The scale at Tablet and Phone: `fit` scales the page down to the room when it is wider, or a percentage. */
type PreviewScale = 'fit' | 100 | 75 | 50;
/** A state of the preview other than the page showing. */
type PreviewCondition = 'loading' | 'reloading' | 'failed' | 'no-preview';

type PreviewFrameProps = Omit<ComponentProps<'div'>, 'children'> & {
  /**
   * The page, such as the site's iframe. It stays at one position in the tree for every device,
   * scale and condition, so it is never remounted. Hidden while `loading` or `failed`.
   */
  children?: ReactNode;
  device?: PreviewDevice;
  /** The scale at Tablet and Phone. Ignored at Fit. */
  scale?: PreviewScale;
  /** Called with the scale `fit` gives, as a whole percentage such as 95. */
  onFitScaleChange?: (percent: number) => void;
  /** Called with the width the page is drawn at when `device` is `fit`, in whole px. */
  onFitWidthChange?: (width: number) => void;
  /**
   * - `loading`: the spinner above "Loading the page", over the ground.
   * - `reloading`: the page stays in place under a light scrim with the spinner and "Reloading the page".
   * - `failed`: a note with Reload.
   * - `no-preview`: a note with How previews are set up.
   */
  condition?: PreviewCondition;
  onReload?: () => void;
  onHowTo?: () => void;
};

const PAGE_WIDTH = {
  tablet: 'var(--pv-tablet-width)',
  phone: 'var(--pv-phone-width)',
} as const;

type Scaled = { k: number; width: number; height: number };

/**
 * Measures the ground and works out the scale and the layout height of a Tablet or Phone page.
 * A measurement taken while the ground has no size is ignored and the last good one stays.
 */
function useMeasured(
  device: PreviewDevice,
  scale: PreviewScale,
  onFitScale: ((percent: number) => void) | undefined,
  onFitWidth: ((width: number) => void) | undefined
) {
  const ground = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<Scaled | null>(null);
  const reportScale = useRef(onFitScale);
  const reportWidth = useRef(onFitWidth);
  reportScale.current = onFitScale;
  reportWidth.current = onFitWidth;

  useLayoutEffect(() => {
    const measure = () => {
      const g = ground.current;
      if (!g) return;
      const style = getComputedStyle(g);
      const padX =
        Number.parseFloat(style.paddingLeft) +
        Number.parseFloat(style.paddingRight);
      const padY =
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom);
      const room = g.clientWidth - padX;
      const roomHeight = g.clientHeight - padY;
      if (room <= 0 || roomHeight <= 0) return;
      if (device === 'fit') {
        setScaled(null);
        reportWidth.current?.(Math.round(room));
        return;
      }
      const width = page.current?.offsetWidth ?? 0;
      if (width <= 0) return;
      const fit = Math.min(1, Math.floor((room / width) * 1000) / 1000);
      const k = scale === 'fit' ? fit : scale / 100;
      setScaled({ k, width, height: Math.floor(roomHeight / k) });
      reportScale.current?.(Math.round(fit * 100));
    };
    measure();
    const seen = new ResizeObserver(measure);
    if (ground.current) seen.observe(ground.current);
    return () => seen.disconnect();
  }, [device, scale]);

  return { ground, page, scaled: device === 'fit' ? null : scaled };
}

/**
 * The preview's area under its toolbar: the grey ground with the page on it. At Fit the page fills
 * the ground. At Tablet and Phone the page is drawn at `--pv-tablet-width` or `--pv-phone-width`,
 * centred, and scaled down to the room by default. The page node keeps one position in the tree
 * whatever the device or condition, because an iframe reloads when it moves.
 */
function PreviewFrame({
  children,
  device = 'fit',
  scale = 'fit',
  onFitScaleChange,
  onFitWidthChange,
  condition,
  onReload,
  onHowTo,
  className,
  ...props
}: PreviewFrameProps) {
  const { ground, page, scaled } = useMeasured(
    device,
    scale,
    onFitScaleChange,
    onFitWidthChange
  );
  const hidden = condition !== undefined && condition !== 'reloading';
  const fit = device === 'fit';
  return (
    <div
      data-slot='preview-frame'
      data-device={device}
      className={cn(
        'relative flex min-h-0 min-w-0 flex-1 flex-col font-sans',
        className
      )}
      {...props}
    >
      <div
        ref={ground}
        className='flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-pv-ground p-4'
      >
        <div
          data-slot='preview-page'
          className={cn(
            'relative',
            fit ? 'min-h-0 w-full flex-1' : 'mx-auto flex-none',
            hidden && 'invisible'
          )}
          style={
            fit
              ? undefined
              : {
                  width: scaled ? scaled.width * scaled.k : PAGE_WIDTH[device],
                  height: scaled ? scaled.height * scaled.k : '100%',
                }
          }
        >
          <div
            ref={page}
            className={cn(
              '@container absolute top-0 left-0 origin-top-left',
              fit && 'size-full'
            )}
            style={
              fit
                ? undefined
                : {
                    width: PAGE_WIDTH[device],
                    height: scaled ? scaled.height : '100%',
                    transform:
                      scaled && scaled.k !== 1
                        ? `scale(${scaled.k})`
                        : undefined,
                  }
            }
          >
            {children}
          </div>
        </div>
      </div>
      {condition === 'loading' ? (
        <div className='absolute inset-0 z-10 flex items-center justify-center'>
          <Spinner layout='above' className='text-sm'>
            Loading the page
          </Spinner>
        </div>
      ) : null}
      {condition === 'failed' ? (
        <div className='absolute inset-0 z-10 flex items-center justify-center'>
          <EmptyState
            variant='plain'
            live
            className='max-w-90'
            text='The page didn’t load. Check that your site is running, then try again.'
            actionLabel='Reload'
            onAction={onReload}
          />
        </div>
      ) : null}
      {condition === 'no-preview' ? (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-pv-ground'>
          <EmptyState
            variant='plain'
            live
            className='max-w-90'
            text='No preview is set up for this site yet. A developer adds it to the admin’s setup.'
            actionLabel='How previews are set up'
            onAction={onHowTo}
          />
        </div>
      ) : null}
      {condition === 'reloading' ? (
        <div className='absolute inset-0 z-20 flex items-center justify-center bg-scrim-light text-sm text-foreground'>
          <span className='rounded-sm bg-card px-3 py-2 shadow-xs'>
            <Spinner>Reloading the page</Spinner>
          </span>
        </div>
      ) : null}
    </div>
  );
}

export type {
  PreviewCondition,
  PreviewDevice,
  PreviewFrameProps,
  PreviewScale,
};
export { PreviewFrame };
