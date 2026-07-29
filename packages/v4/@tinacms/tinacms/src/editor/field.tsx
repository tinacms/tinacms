import { use } from 'react';
import { toFieldAddress } from '../core/field/address';
import { useFormStore } from '../form/form-store';
import {
  FieldAddressContext,
  FieldSchemaContext,
  FormScopeContext,
  TinaRuntimeContext,
} from './context';

export interface FieldProps {
  address: string;
}

export function Field({ address }: FieldProps) {
  const runtime = use(TinaRuntimeContext);
  const scope = use(FormScopeContext);
  if (!runtime || !scope) {
    throw new Error(
      '<Field> must be used within a TinaProvider and FormProvider'
    );
  }
  const { registry } = runtime;
  const { collection } = scope;

  const node = collection.fields.find((field) => field.name === address);
  if (!node) {
    throw new Error(`No field "${address}" in collection "${collection.name}"`);
  }

  const descriptor = registry.get(node.type);
  if (!descriptor) {
    throw new Error(`No field plugin registered for type "${node.type}"`);
  }

  const fieldAddress = toFieldAddress(address);

  // Focus in the form is a producer of the active field, beside the click in the
  // preview. It sits here, on the one wrapper every field shares, so no field plugin
  // carries it. It writes the store directly, as the preview connection does, because
  // this component must not re-render on the value it writes.
  //
  // The guard is necessary. An activation focuses the field, and that focus arrives
  // back here. An unguarded write would then hand every activation a second entry,
  // and every consumer of the entry would run twice. A focus on the field that is
  // already active therefore writes nothing. The re-activation path keeps its
  // semantics, because setActive itself stays unguarded: activating the same address
  // again is a new entry, and focuses the field again.
  const markActive = () => {
    const { active, setActive } = useFormStore.getState();
    if (active?.formId === scope.formId && active.address === fieldAddress) {
      return;
    }
    setActive(scope.formId, fieldAddress);
  };

  const Component = descriptor.Component;
  return (
    <FieldAddressContext value={fieldAddress}>
      <FieldSchemaContext value={node}>
        {/* display: contents, because this wrapper exists for the focus listener
            alone. It must not become a box in the layout of the form. */}
        <div style={{ display: 'contents' }} onFocus={markActive}>
          <Component />
        </div>
      </FieldSchemaContext>
    </FieldAddressContext>
  );
}
