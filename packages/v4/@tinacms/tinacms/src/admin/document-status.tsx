import { Badge } from '@tinacms/ui/components/badge';
import { useFormId } from '../editor/hooks';
import {
  type FormId,
  type FormStatus,
  useFormStatus,
} from '../form/form-store';

const STATUS_VARIANTS = {
  pristine: 'secondary',
  dirty: 'default',
  clean: 'outline',
} as const satisfies Record<FormStatus, string>;

const STATUS_LABELS: Record<FormStatus, string> = {
  pristine: 'No changes',
  dirty: 'Unsaved',
  clean: 'Saved',
};

export function FormStatusBadge({ formId }: { formId: FormId }) {
  const status = useFormStatus(formId);
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

export function DocumentStatus() {
  return (
    <span role='status'>
      <FormStatusBadge formId={useFormId()} />
    </span>
  );
}
