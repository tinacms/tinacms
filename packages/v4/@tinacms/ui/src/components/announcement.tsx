import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

type AnnouncementProps = Omit<ComponentProps<'span'>, 'children' | 'role'> & {
  /** What screen readers hear, once and politely. Nothing shows on screen. An empty string says nothing. */
  words: string;
  /** Change it, such as a count of tries, to say the same `words` again. */
  sayAgain?: number | string;
};

/**
 * Words for screen readers only, for a change that shows nothing new on screen. The status empties,
 * then fills a moment later, so a screen reader says each new `words`.
 */
function Announcement({
  words,
  sayAgain,
  className,
  ...props
}: AnnouncementProps) {
  const [said, setSaid] = useState('');
  useEffect(() => {
    setSaid('');
    if (!words) return;
    const fill = window.setTimeout(() => setSaid(words), 50);
    return () => window.clearTimeout(fill);
  }, [words, sayAgain]);
  return (
    <span
      data-slot='announcement'
      role='status'
      className={cn('sr-only', className)}
      {...props}
    >
      {said}
    </span>
  );
}

export type { AnnouncementProps };
export { Announcement };
