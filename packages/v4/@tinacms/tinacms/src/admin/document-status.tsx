import { Badge } from '@tinacms/ui/components/badge';
import {
  CircleCheck,
  CircleDot,
  CircleMinus,
  type LucideIcon,
} from 'lucide-react';
import { useFormId } from '../editor/hooks';
import {
  type FormId,
  type FormStatus,
  useFormStatus,
} from '../form/form-store';

const STATUS_VARIANTS = {
  pristine: 'secondary',
  dirty: 'changed',
  clean: 'outline',
} as const satisfies Record<FormStatus, string>;

const STATUS_LABELS: Record<FormStatus, string> = {
  pristine: 'No changes',
  dirty: 'Unsaved',
  clean: 'Saved',
};

const STATUS_ICONS = {
  pristine: CircleMinus,
  dirty: CircleDot,
  clean: CircleCheck,
} as const satisfies Record<FormStatus, LucideIcon>;

export function FormStatusBadge({ formId }: { formId: FormId }) {
  const status = useFormStatus(formId);
  const Icon = STATUS_ICONS[status];
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      <Icon data-icon='inline-start' aria-hidden='true' />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function DocumentStatus() {
  return (
    <span role='status'>
      <FormStatusBadge formId={useFormId()} />
    </span>
  );
}
