import type { ComponentProps } from 'react';

import { Icon } from '@tinacms/ui/components/icon';
import { useLoadingWords } from '@tinacms/ui/hooks/use-loading-words';
import { cn } from '@tinacms/ui/lib/utils';

type SpinnerProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** The words that say what is loading, such as "Loading the page". Screen readers hear them once, politely. */
  children: string;
  /**
   * beside (default): a 16px spinner before the words, for a loading line in a list, menu or dialog.
   * above: a 20px spinner above the words, centred, for a cover or a veil over a picture.
   */
  layout?: 'beside' | 'above';
};

/**
 * A spinner with its words. Mount it while something loads and unmount it when the load ends: the
 * polite status fills after it mounts, so screen readers hear the words once.
 */
function Spinner({
  children,
  layout = 'beside',
  className,
  ...props
}: SpinnerProps) {
  const above = layout === 'above';
  const said = useLoadingWords(true, children);
  return (
    <span
      data-slot='spinner'
      data-layout={layout}
      className={cn(
        'flex items-center font-sans text-muted-foreground',
        above ? 'flex-col justify-center gap-2 text-center' : 'gap-2',
        className
      )}
      {...props}
    >
      <span role='status' className='sr-only'>
        {said}
      </span>
      <Icon glyph='spinner' size={above ? 20 : 16} aria-hidden='true' />
      <span aria-hidden='true'>{children}</span>
    </span>
  );
}

export type { SpinnerProps };
export { Spinner };
