import { Badge } from '@tinacms/ui/components/badge';
import { type FormId, useIsFormDirty } from '../form/form-store';

// The nav row carries only the Unsaved tag. The form header keeps its own
// "No changes" and "Saved" words through `FormStatusBadge`.
export function NavDocumentStatus({ formId }: { formId: FormId }) {
  return useIsFormDirty(formId) ? <Badge kind='unsaved' /> : null;
}
