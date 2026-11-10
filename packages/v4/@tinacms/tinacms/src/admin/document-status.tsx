import { Badge } from '@tinacms/ui/components/badge';
import type { ReactNode } from 'react';
import { useFormId, useStaleDraft } from '../editor/hooks';
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

// `quiet` drops the "No changes" chip while the Resume prompt asks about waiting edits.
export function FormStatusBadge({
  formId,
  quiet = false,
}: {
  formId: FormId;
  quiet?: boolean;
}) {
  const status = useFormStatus(formId);
  if (quiet && status === 'pristine') return null;
  return STATUS_BADGES[status];
}

export function DocumentStatus() {
  return (
    <span role='status'>
      <FormStatusBadge
        formId={useFormId()}
        quiet={useStaleDraft()?.cause !== undefined}
      />
    </span>
  );
}
