import { Breadcrumb } from '@tinacms/ui/components/breadcrumb';
import { Button } from '@tinacms/ui/components/button';

export function MediaBreadcrumb({
  folder,
  onOpen,
}: {
  folder: string;
  onOpen: (folder: string) => void;
}) {
  const parts = folder ? folder.split('/') : [];
  const open = (depth: number) => () => onOpen(parts.slice(0, depth).join('/'));
  return (
    <div className='flex min-w-0 items-center gap-1'>
      {parts.length > 0 ? (
        <Button
          variant='icon'
          size='sm'
          icon='arrow-left'
          aria-label='Parent folder'
          onClick={open(parts.length - 1)}
        />
      ) : null}
      <Breadcrumb
        aria-label='Media folders'
        size='sm'
        items={[
          {
            label: 'Media',
            onClick: parts.length > 0 ? open(0) : undefined,
          },
          ...parts.map((part, index) => ({
            label: part,
            onClick: index < parts.length - 1 ? open(index + 1) : undefined,
          })),
        ]}
      />
    </div>
  );
}
