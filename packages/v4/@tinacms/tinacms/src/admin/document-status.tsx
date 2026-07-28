import { Badge } from '@tinacms/ui/components/badge';
import { useFormId } from '../editor/hooks';
import {
  type FormId,
  type FormStatus,
  useFormStatus,
} from '../form/form-store';

// Mapped onto the variants the design system has, rather than inventing tokens for
// them: there is no success/warning pair in globals.css, and a badge is the wrong
// place to introduce one. The ordering still reads correctly — the state that wants
// action is the loudest, and both settled states recede.
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

// Reads any form's status, mounted or not — the document list badges closed
// documents with it, which is the whole point of the store being the single
// pristine/dirty/clean authority (ADR-010) rather than RHF.
export function FormStatusBadge({ formId }: { formId: FormId }) {
  const status = useFormStatus(formId);
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function DocumentStatus() {
  return <FormStatusBadge formId={useFormId()} />;
}
