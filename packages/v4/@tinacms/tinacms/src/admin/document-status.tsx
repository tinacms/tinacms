import { Badge } from '@tinacms/ui/components/badge';
import type { ReactNode } from 'react';
import { useFormId } from '../editor/hooks';
import {
  type FormId,
  type FormStatus,
  useFormStatus,
} from '../form/form-store';

const STATUS_BADGES: Record<FormStatus, ReactNode> = {
  pristine: <Badge kind='label'>No changes</Badge>,
  dirty: <Badge kind='unsaved' />,
  clean: (
    <Badge kind='tag' tone='success'>
      Saved
    </Badge>
  ),
};

export function FormStatusBadge({ formId }: { formId: FormId }) {
  return STATUS_BADGES[useFormStatus(formId)];
}

export function DocumentStatus() {
  return (
    <span role='status'>
      <FormStatusBadge formId={useFormId()} />
    </span>
  );
}
