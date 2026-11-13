import {
  type FocusEvent,
  type PointerEvent,
  type SyntheticEvent,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import type { FieldAddress } from '../core/field/address';
import { toFieldAddress } from '../core/field/address';
import type { FieldSchema } from '../core/schema/types';
import { useStore } from 'zustand';
import { centerInScroller } from '../utils/center-in-scroller';
import { useFormStore } from '../form/form-store';
import { DrillInField } from './drill-in-field';
import { drillsInAt } from './form-view-state';
import {
  FieldActiveContext,
  FieldAddressContext,
  FieldLockContext,
  FieldSchemaContext,
  FormScopeContext,
  TinaRuntimeContext,
} from './context';

const isInnermostFrame = (event: SyntheticEvent<HTMLElement>) =>
  !(event.target instanceof Element) ||
  event.target.closest('[data-field-frame]') === event.currentTarget;

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
  const parentLock = use(FieldLockContext);
  if (!runtime || !scope) {
    throw new Error(
      '<FieldNode> must be used within a TinaProvider and FormProvider'
    );
  }

  const descriptor = runtime.registry.get(node.type);
  if (!descriptor) {
    throw new Error(`No field plugin registered for type "${node.type}"`);
  }

  const markActive = (event: FocusEvent<HTMLDivElement>) => {
    if (!isInnermostFrame(event)) return;
    const { active, setActive } = useFormStore.getState();
    if (active?.formId === scope.formId && active.address === address) {
      return;
    }
    setActive(scope.formId, address);
  };

  const active = useFormStore(
    (state) =>
      state.active?.formId === scope.formId && state.active.address === address
  );

  const openAddress = useStore(
    scope.view,
    (state) => state.openLevels.at(-1)?.address
  );
  const drills =
    drillsInAt(descriptor, node, address) && openAddress !== address;
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

  // A control that cannot take focus leaves the field off screen, so the frame centres itself.
  useEffect(() => {
    let pending = 0;
    const unsubscribe = useFormStore.subscribe((state, previous) => {
      const { active } = state;
      if (active === previous.active) return;
      if (active?.formId !== scope.formId || active.address !== address) return;
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        const target = frame.current?.firstElementChild;
        if (!target || frame.current?.contains(document.activeElement)) return;
        centerInScroller(target);
      });
    });
    return () => {
      unsubscribe();
      cancelAnimationFrame(pending);
    };
  }, [scope.formId, address]);

  const hoverOver = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    if (!isInnermostFrame(event)) return;
    useFormStore.getState().setHovered(scope.formId, address);
  };
  const hoverOut = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    const { hovered, setHovered } = useFormStore.getState();
    if (hovered?.formId === scope.formId && hovered.address === address) {
      setHovered(scope.formId, null);
    }
  };

  const Component = drills
    ? (descriptor.DrillInComponent ?? DrillInField)
    : descriptor.Component;
  const lock = {
    disabled: parentLock.disabled || node.disabled === true,
    readOnly: parentLock.readOnly || node.readOnly === true,
  };
  return (
    <FieldAddressContext value={address}>
      <FieldSchemaContext value={node}>
        <FieldLockContext value={lock}>
          <FieldActiveContext value={active}>
            <div
              ref={frame}
              data-field-frame=''
              style={{ display: 'contents' }}
              onPointerOver={hoverOver}
              onPointerOut={hoverOut}
              onFocus={markActive}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  scope.view.getState().touch(address);
                }
              }}
            >
              <Component />
            </div>
          </FieldActiveContext>
        </FieldLockContext>
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
