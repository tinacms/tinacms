import { useFormId } from '../editor/hooks';
import {
  type FormId,
  type FormStatus,
  useFormStatus,
} from '../form/form-store';

const STATUS_STYLES: Record<FormStatus, string> = {
  pristine: 'bg-neutral-100 text-neutral-600',
  dirty: 'bg-amber-100 text-amber-800',
  clean: 'bg-emerald-100 text-emerald-800',
};

const STATUS_LABELS: Record<FormStatus, string> = {
  pristine: 'No changes',
  dirty: 'Unsaved',
  clean: 'Saved',
};

// Reads any form's status, mounted or not — the document list badges closed
// documents with it, which is the whole point of the store being the single
// pristine/dirty/clean authority (ADR-010) rather than RHF.
export function FormStatusBadge({ formId }: { formId: FormId }) {
  const status = useFormStatus(formId);
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function DocumentStatus() {
  return <FormStatusBadge formId={useFormId()} />;
}
