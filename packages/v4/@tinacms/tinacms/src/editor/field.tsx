import { use } from 'react';
import { toFieldAddress } from '../core/field/address';
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

  const Component = descriptor.Component;
  return (
    <FieldAddressContext value={toFieldAddress(address)}>
      <FieldSchemaContext value={node}>
        <Component />
      </FieldSchemaContext>
    </FieldAddressContext>
  );
}
