import { Badge } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import { useAdminRoute } from './use-admin-route';

/** Opens the Collections view filtered to the unsaved documents. */
export function ReviewUnsavedButton({
  count,
  full = false,
}: {
  count: number;
  full?: boolean;
}) {
  const { navigate } = useAdminRoute();
  return (
    <Button
      variant='outline'
      full={full}
      onClick={() => navigate({ view: 'collections', unsavedOnly: true })}
    >
      <Badge kind='dot' />
      Review {count} unsaved
    </Button>
  );
}
