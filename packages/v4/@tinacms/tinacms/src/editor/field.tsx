import { use } from 'react';
import { toFieldAddress } from '../core/field/address';
import {
  CollectionContext,
  FieldAddressContext,
  FieldSchemaContext,
  RegistryContext,
} from './context';

export interface FieldProps {
  address: string;
}

export function Field({ address }: FieldProps) {
  const registry = use(RegistryContext);
  const collection = use(CollectionContext);
  if (!registry || !collection) {
    throw new Error(
      '<Field> must be used within a TinaProvider and FormProvider'
    );
  }

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
