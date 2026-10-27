import { Button } from '@tinacms/ui/components/button';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { use } from 'react';
import {
  FieldAddressContext,
  FieldSchemaContext,
  FormScopeContext,
} from './context';
import { useFieldFrame } from './hooks';

export function DrillInField() {
  const address = use(FieldAddressContext);
  const node = use(FieldSchemaContext);
  const scope = use(FormScopeContext);
  const frame = useFieldFrame();
  if (address == null || node == null || scope == null) return null;
  return (
    <FieldWrapper {...frame}>
      <Button
        variant='secondary'
        iconEnd='chevron-right'
        onClick={() =>
          scope.view.openLevel({
            address,
            label: node.label ?? node.name,
            node,
          })
        }
      >
        {`Open ${node.label ?? node.name}`}
      </Button>
    </FieldWrapper>
  );
}
