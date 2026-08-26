import { use } from 'react';
import type { FieldAddress } from '../core/field/address';
import { toFieldAddress } from '../core/field/address';
import type { FieldSchema } from '../core/schema/types';
import { useFormStore } from '../form/form-store';
import {
  FieldAddressContext,
  FieldSchemaContext,
  FormScopeContext,
  TinaRuntimeContext,
} from './context';

export interface FieldNodeProps {
  address: FieldAddress;
  node: FieldSchema;
}

// Renders one resolved field node at an address. <Field> looks up a node in
// `collection.fields` by name. A compound field (e.g. array) has no such
// entry for its item nodes, so it calls this directly instead.
export function FieldNode({ address, node }: FieldNodeProps) {
  const runtime = use(TinaRuntimeContext);
  const scope = use(FormScopeContext);
  if (!runtime || !scope) {
    throw new Error(
      '<FieldNode> must be used within a TinaProvider and FormProvider'
    );
  }

  const descriptor = runtime.registry.get(node.type);
  if (!descriptor) {
    throw new Error(`No field plugin registered for type "${node.type}"`);
  }

  const markActive = () => {
    const { active, setActive } = useFormStore.getState();
    if (active?.formId === scope.formId && active.address === address) {
      return;
    }
    setActive(scope.formId, address);
  };

  const Component = descriptor.Component;
  return (
    <FieldAddressContext value={address}>
      <FieldSchemaContext value={node}>
        <div style={{ display: 'contents' }} onFocus={markActive}>
          <Component />
        </div>
      </FieldSchemaContext>
    </FieldAddressContext>
  );
}

export interface FieldProps {
  address: string;
}

export function Field({ address }: FieldProps) {
  const scope = use(FormScopeContext);
  if (!scope) {
    throw new Error('<Field> must be used within a FormProvider');
  }

  const node = scope.collection.fields.find((field) => field.name === address);
  if (!node) {
    throw new Error(
      `No field "${address}" in collection "${scope.collection.name}"`
    );
  }

  return <FieldNode address={toFieldAddress(address)} node={node} />;
}
