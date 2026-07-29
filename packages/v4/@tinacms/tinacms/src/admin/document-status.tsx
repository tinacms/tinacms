import { Badge } from '@tinacms/ui/components/badge';
import { useFormId } from '../editor/hooks';
import {
  type FormId,
  type FormStatus,
  useFormStatus,
} from '../form/form-store';

// These map onto the variants that the design system has. globals.css holds no success
// colour and no warning colour, and a badge is the wrong place to add them. The order
// still reads correctly. The state that needs action is the loudest, and the two settled
// states are quiet.
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

// This reads the status of any form, mounted or not. The document list marks a closed
// document with it. This is why the store owns the pristine, dirty, and clean status
// (ADR-010), and RHF does not.
export function FormStatusBadge({ formId }: { formId: FormId }) {
  const status = useFormStatus(formId);
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

export function DocumentStatus() {
  return <FormStatusBadge formId={useFormId()} />;
}
