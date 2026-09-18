import type { FormId } from '../../form/form-store';
import type { FieldAddress } from '../field/address';
import { invariant } from '../invariant';
import { HOOKS_CAPABILITY, type ResolvedSegment } from '../plugin';
import type { CollectionSchema, TinaDocument } from '../schema/types';

export interface FormHookScope {
  formId: FormId;
  path: string;
  collection: CollectionSchema;
}

export interface FieldEdit {
  address: FieldAddress;
  value: unknown;
}

export interface FormHooks {
  beforeSave?: (
    document: TinaDocument,
    scope: FormHookScope
  ) => TinaDocument | Promise<TinaDocument>;
  afterSave?: (
    document: TinaDocument,
    scope: FormHookScope
  ) => void | Promise<void>;
  afterEdit?: (edit: FieldEdit, scope: FormHookScope) => void;
}

export type FormHookRegistry = readonly FormHooks[];

export const createFormHookRegistry = (
  resolved: ResolvedSegment[]
): FormHookRegistry =>
  resolved.flatMap(({ manifest, segment }) => {
    if (!segment.hooks) return [];
    invariant(
      manifest.provides.includes(HOOKS_CAPABILITY),
      'hooks-plugin-no-provides',
      `Plugin "${manifest.name}" has form hooks but does not declare provides: ["hooks"].`
    );
    return [segment.hooks];
  });

export const runBeforeSave = async (
  hooks: FormHookRegistry,
  document: TinaDocument,
  scope: FormHookScope
): Promise<TinaDocument> => {
  let current = document;
  for (const hook of hooks) {
    if (hook.beforeSave) current = await hook.beforeSave(current, scope);
  }
  return current;
};

export const runAfterSave = async (
  hooks: FormHookRegistry,
  document: TinaDocument,
  scope: FormHookScope
): Promise<void> => {
  for (const hook of hooks) await hook.afterSave?.(document, scope);
};

export const runAfterEdit = (
  hooks: FormHookRegistry,
  edit: FieldEdit,
  scope: FormHookScope
): void => {
  for (const hook of hooks) hook.afterEdit?.(edit, scope);
};
