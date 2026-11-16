import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

type DiffLineType = 'add' | 'del' | 'ctx';

type DiffLine = {
  type: DiffLineType;
  text: string;
  /** What screen readers hear first. Defaults to "Added: ", "Removed: " or "Unchanged: ". */
  sr?: string;
};

const lineVariants = cva(
  'flex gap-2.5 px-3 py-1.5 font-mono text-sm leading-code break-words whitespace-pre-wrap [&+&]:border-t [&+&]:border-slate-900/4',
  {
    variants: {
      type: {
        add: 'bg-status-published-subtle text-status-published',
        del: 'bg-status-failed-subtle text-status-failed',
        ctx: 'text-muted-foreground',
      },
    },
  }
);

const KIND: Record<DiffLineType, { sign: string; sr: string }> = {
  add: { sign: '+', sr: 'Added: ' },
  del: { sign: '−', sr: 'Removed: ' },
  ctx: { sign: ' ', sr: 'Unchanged: ' },
};

type DiffViewProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The field the lines belong to, such as "Description". */
  label: string;
  lines: DiffLine[];
};

/**
 * What changed in one field, by field and not by file, because editors think in fields. Each line
 * has a sign and screen readers hear "Removed" or "Added" first, so colour is never the only signal.
 */
function DiffView({ label, lines, className, ...props }: DiffViewProps) {
  return (
    <div
      role='group'
      aria-label={`Changes to ${label || 'this field'}`}
      data-slot='diff-view'
      className={cn(
        'overflow-hidden rounded-md border border-border-subtle bg-card font-sans text-foreground',
        className
      )}
      {...props}
    >
      <div className='border-b border-border-subtle bg-background px-3 py-2 text-xs font-medium text-muted-foreground-strong'>
        {label}
      </div>
      <div>
        {lines.map((line, i) => (
          <div key={i} className={lineVariants({ type: line.type })}>
            <span aria-hidden='true' className='w-3 flex-none font-semibold'>
              {KIND[line.type].sign}
            </span>
            <span
              className={cn(
                line.type === 'del' &&
                  'line-through decoration-status-failed/45'
              )}
            >
              <span className='sr-only'>{line.sr ?? KIND[line.type].sr}</span>
              {line.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { DiffLine, DiffLineType, DiffViewProps };
export { DiffView };
