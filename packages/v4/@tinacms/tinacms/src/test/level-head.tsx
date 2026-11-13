import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { use } from 'react';
import { documentTitle } from '../admin/document-title';
import { useLevelTrail } from '../admin/document-form';
import { FormScopeContext } from '../editor/context';
import { useFormStore } from '../form/form-store';

/**
 * The form head the admin draws over a document form: Collections, the
 * collection, the document and the parent levels as a Location trail, with
 * the open level as the heading. For tests that render `DocumentForm` alone.
 */
export function LevelHead() {
  const scope = use(FormScopeContext);
  if (!scope) throw new Error('LevelHead needs a form scope');
  const values = useFormStore((state) => state.forms[scope.formId]?.values);
  const levels = useLevelTrail(scope);
  const title = documentTitle(scope.path, values);
  const noop = () => {};
  return (
    <PanelHeader
      trail={[
        { label: 'Collections', onClick: noop },
        {
          label: scope.collection.label ?? scope.collection.name,
          onClick: noop,
        },
        ...(levels.heading === null
          ? []
          : [
              {
                label: title,
                onClick: levels.closeAll,
                invalid: levels.documentInvalid,
              },
              ...levels.parents,
            ]),
      ]}
      heading={levels.heading ?? title}
    />
  );
}
