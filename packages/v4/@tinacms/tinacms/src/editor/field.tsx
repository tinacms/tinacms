import { use, useLayoutEffect, useRef } from 'react';
import type { FieldAddress } from '../core/field/address';
import { toFieldAddress } from '../core/field/address';
import type { FieldSchema } from '../core/schema/types';
import { useStore } from 'zustand';
import { useFormStore } from '../form/form-store';
import { DrillInField } from './drill-in-field';
import { DRILL_DEPTH, fieldDepth } from './form-view-state';
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

  const openAddress = useStore(
    scope.view,
    (state) => state.openLevels.at(-1)?.address
  );
  const drills =
    descriptor.metadata?.drillable === true &&
    fieldDepth(address) >= DRILL_DEPTH &&
    openAddress !== address;
  // Widgets own their input, so the help text is linked from here: the input
  // is the element with the field's id, or the group named by the field label.
  const frame = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!node.description) return;
    const target = frame.current?.querySelector(
      `[id="${address}"], [aria-labelledby="${address}-label"]`
    );
    target?.setAttribute('aria-describedby', `${address}-help`);
  }, [address, node.description]);

  const Component = drills ? DrillInField : descriptor.Component;
  return (
    <FieldAddressContext value={address}>
      <FieldSchemaContext value={node}>
        <div
          ref={frame}
          style={{ display: 'contents' }}
          onFocus={markActive}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              scope.view.getState().touch(address);
            }
          }}
        >
          <Component />
        </div>
      </FieldSchemaContext>
    </FieldAddressContext>
  );
}

export interface NestedFieldRowProps {
  address: string;
  node: FieldSchema;
}

// The row a compound field (array, object) renders for each of its child
// fields. The child's own FieldWrapper draws the label.
export function NestedFieldRow({ address, node }: NestedFieldRowProps) {
  if (node.hidden) return null;
  return (
    <div className='mb-3 min-w-0 last:mb-0'>
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
  if (node.hidden) return null;

  return <FieldNode address={toFieldAddress(address)} node={node} />;
}
