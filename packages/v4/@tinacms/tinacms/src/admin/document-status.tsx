import { Badge, type BadgeProps } from '@tinacms/ui/components/badge';
import { useFormId } from '../editor/hooks';
import {
  type FormId,
  type FormStatus,
  useFormStatus,
} from '../form/form-store';

const STATUS_BADGES: Record<FormStatus, Pick<BadgeProps, 'kind' | 'tone'>> = {
  pristine: { kind: 'label' },
  dirty: { kind: 'unsaved' },
  clean: { kind: 'tag', tone: 'success' },
};

const STATUS_LABELS: Record<FormStatus, string> = {
  pristine: 'No changes',
  dirty: 'Unsaved',
  clean: 'Saved',
};

export function FormStatusBadge({ formId }: { formId: FormId }) {
  const status = useFormStatus(formId);
  return <Badge {...STATUS_BADGES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function DocumentStatus() {
  return (
    <span role='status'>
      <FormStatusBadge formId={useFormId()} />
    </span>
  );
}
