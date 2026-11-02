import { Badge } from '@tinacms/ui/components/badge';
import { type FormId, useIsFormDirty } from '../form/form-store';

export function NavDocumentStatus({ formId }: { formId: FormId }) {
  return useIsFormDirty(formId) ? <Badge kind='unsaved' /> : null;
}
