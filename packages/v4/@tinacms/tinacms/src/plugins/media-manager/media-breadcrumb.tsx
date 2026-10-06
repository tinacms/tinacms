import { Button } from '@tinacms/ui/components/button';
import { ArrowLeftIcon } from 'lucide-react';

export function MediaBreadcrumb({
  folder,
  onOpen,
}: {
  folder: string;
  onOpen: (folder: string) => void;
}) {
  const parts = folder ? folder.split('/') : [];
  return (
    <nav
      aria-label='Media folders'
      className='flex min-w-0 flex-wrap items-center gap-1'
    >
      {parts.length > 0 ? (
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          aria-label='Parent folder'
          onClick={() => onOpen(parts.slice(0, -1).join('/'))}
        >
          <ArrowLeftIcon className='size-4' />
        </Button>
      ) : null}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        aria-current={parts.length === 0 ? 'page' : undefined}
        onClick={() => onOpen('')}
      >
        Media
      </Button>
      {parts.map((part, index) => (
        <span key={parts.slice(0, index + 1).join('/')} className='contents'>
          <span aria-hidden='true' className='text-muted-foreground'>
            /
          </span>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='capitalize'
            aria-current={index === parts.length - 1 ? 'page' : undefined}
            onClick={() => onOpen(parts.slice(0, index + 1).join('/'))}
          >
            {part}
          </Button>
        </span>
      ))}
    </nav>
  );
}
