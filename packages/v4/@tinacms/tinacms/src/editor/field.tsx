import { Label } from '@tinacms/ui/components/label';
import { use, useLayoutEffect, useRef } from 'react';
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

  // Widgets own their input, so the description is linked from here: the input
  // is the element with the field's id, or the group named by the field label.
  const frame = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!node.description) return;
    const target = frame.current?.querySelector(
      `[id="${address}"], [aria-labelledby="${address}-label"]`
    );
    target?.setAttribute('aria-describedby', `${address}-description`);
  }, [address, node.description]);

  const Component = descriptor.Component;
  return (
    <FieldAddressContext value={address}>
      <FieldSchemaContext value={node}>
        <div ref={frame} style={{ display: 'contents' }} onFocus={markActive}>
          <Component />
        </div>
      </FieldSchemaContext>
    </FieldAddressContext>
  );
}

// Help text under a field label. `aria-describedby` wiring is left to the
// widget, which owns its input.
export function FieldDescription({
  address,
  node,
}: {
  address: string;
  node: FieldSchema;
}) {
  if (!node.description) return null;
  return (
    <p
      id={`${address}-description`}
      className='mb-1 text-sm text-muted-foreground'
    >
      {node.description}
    </p>
  );
}

export interface NestedFieldRowProps {
  address: string;
  node: FieldSchema;
}

// The label + <FieldNode> pair a compound field (array, object) renders for
// each of its child fields. A child whose descriptor sets `labelable: false`
// gets no `htmlFor` — its widget reads the row's label id through
// `aria-labelledby` instead.
export function NestedFieldRow({ address, node }: NestedFieldRowProps) {
  const runtime = use(TinaRuntimeContext);
  const labelable =
    runtime?.registry.get(node.type)?.metadata?.labelable !== false;
  if (node.hidden) return null;
  return (
    <div className='mb-3 min-w-0 last:mb-0'>
      <Label
        className='mb-1'
        id={`${address}-label`}
        htmlFor={labelable ? address : undefined}
      >
        {node.label ?? node.name}
      </Label>
      <FieldDescription address={address} node={node} />
      <FieldNode address={toFieldAddress(address)} node={node} />
    </div>
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
