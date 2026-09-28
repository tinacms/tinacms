import type { ResolvedConfig, TinaSchema } from '../config';
import { fieldConflictError, overridesFieldKey } from '../core/field/registry';
import { hookConflictError, overridesHookKey } from '../core/form/hooks';
import { invariant } from '../core/invariant';
import { composeOverridableRegistry } from '../core/overridable-registry';
import type { FieldProvision, PluginManifest } from '../core/plugin';
import type {
  CollectionSchema,
  FieldSchema,
  TemplateFieldSchema,
  TemplateSchema,
} from '../core/schema/types';
import {
  overridesValidatorKey,
  validatorConflictError,
} from '../core/validator/registry';
import { type PackageVersion, packageVersion } from './package-version';

export const LOCK_VERSION = 5;

export interface TinaLock {
  version: number;
  schema: TinaSchema & { version: PackageVersion };
  primitives: Record<string, number>;
}

const fieldProvisionsOf = (
  plugins: PluginManifest[]
): Map<string, FieldProvision> =>
  composeOverridableRegistry(
    plugins.flatMap((plugin) =>
      plugin.field
        ? [
            {
              key: plugin.field.type,
              value: plugin.field,
              isOverride: overridesFieldKey(plugin, plugin.field.type),
            },
          ]
        : []
    ),
    fieldConflictError
  );

const registeredValidatorsOf = (plugins: PluginManifest[]): Set<string> =>
  new Set(
    composeOverridableRegistry(
      plugins.flatMap((plugin) =>
        (plugin.validators ?? []).map((name) => ({
          key: name,
          value: plugin,
          isOverride: overridesValidatorKey(plugin, name),
        }))
      ),
      validatorConflictError
    ).keys()
  );

const templateFieldTypesIn = (templates: TemplateSchema[] = []): string[] =>
  templates.flatMap((template) =>
    (template.fields ?? []).flatMap((nested) => [
      ...(nested.type ? [nested.type] : []),
      ...templateFieldTypesIn(nested.templates),
    ])
  );

const fieldTypesIn = (fields: FieldSchema[]): string[] =>
  fields.flatMap((field) => [
    field.type,
    ...templateFieldTypesIn(field.templates),
  ]);

const usedFieldTypes = (collections: CollectionSchema[]): string[] => [
  ...new Set(
    collections.flatMap((collection) => fieldTypesIn(collection.fields))
  ),
];

const validatorNamesIn = (fields: TemplateFieldSchema[]): string[] =>
  fields.flatMap((field) => [
    ...(field.validators ?? []).map((ref) => ref.name),
    ...(field.templates ?? []).flatMap((template) =>
      validatorNamesIn(template.fields ?? [])
    ),
  ]);

const usedValidators = (collections: CollectionSchema[]): string[] => [
  ...new Set(
    collections.flatMap((collection) => validatorNamesIn(collection.fields))
  ),
];

const registeredHooksOf = (plugins: PluginManifest[]): Set<string> =>
  new Set(
    composeOverridableRegistry(
      plugins.flatMap((plugin) =>
        (plugin.hooks ?? []).map((name) => ({
          key: name,
          value: plugin,
          isOverride: overridesHookKey(plugin, name),
        }))
      ),
      hookConflictError
    ).keys()
  );

const usedHooks = (collections: CollectionSchema[]): string[] => [
  ...new Set(
    collections.flatMap((collection) =>
      (collection.hooks ?? []).map((ref) => ref.name)
    )
  ),
];

export const compileSchema = (config: ResolvedConfig): TinaLock => {
  const provisions = fieldProvisionsOf(config.plugins);
  const primitives: Record<string, number> = {};
  for (const type of usedFieldTypes(config.schema.collections).sort()) {
    const provision = provisions.get(type);
    invariant(
      provision,
      'schema-unknown-field-type',
      `The schema uses the field type "${type}", but no installed plugin provides ` +
        'the `field` capability at that type.'
    );
    primitives[type] = provision.contractVersion;
  }
  const registered = registeredValidatorsOf(config.plugins);
  for (const name of usedValidators(config.schema.collections).sort()) {
    invariant(
      registered.has(name),
      'schema-unknown-validator',
      `The schema uses the validator "${name}", but no installed plugin ` +
        'registers it.'
    );
  }
  const registeredHooks = registeredHooksOf(config.plugins);
  for (const name of usedHooks(config.schema.collections).sort()) {
    invariant(
      registeredHooks.has(name),
      'schema-unknown-hook',
      `The schema uses the form hook "${name}", but no installed plugin ` +
        'registers it.'
    );
  }
  return {
    version: LOCK_VERSION,
    schema: { ...config.schema, version: packageVersion() },
    primitives,
  };
};

export type LockCheck =
  | { status: 'current' }
  | { status: 'unreadable'; message: string }
  | { status: 'stale'; message: string }
  | { status: 'incompatible'; message: string };

export const checkLock = (
  lock: TinaLock,
  config: ResolvedConfig
): LockCheck => {
  if (lock.version > LOCK_VERSION) {
    return {
      status: 'unreadable',
      message:
        `tina-lock.json is version ${lock.version}, and this version of tinacms ` +
        `writes version ${LOCK_VERSION}. Upgrade tinacms rather than regenerating ` +
        'the lock, which would downgrade a file your team has committed.',
    };
  }
  const fresh = compileSchema(config);
  const pinned: Record<string, number> = Object.assign(
    Object.create(null),
    lock.primitives
  );
  const changed = Object.entries(fresh.primitives).filter(
    ([type, version]) => pinned[type] !== undefined && pinned[type] !== version
  );
  if (changed.length > 0) {
    return {
      status: 'incompatible',
      message:
        `tina-lock.json pins ${changed
          .map(
            ([type, version]) =>
              `"${type}" at contract version ${pinned[type]}, but the installed plugin is version ${version}`
          )
          .join('; ')}. ` +
        'That field type changed shape. Run `tinacms migrate` to update your content ' +
        'and the lock together.',
    };
  }
  if (JSON.stringify(lock) !== JSON.stringify(fresh)) {
    return {
      status: 'stale',
      message:
        'tina-lock.json is out of date with your schema, your installed plugins, ' +
        'or your tinacms version. Regenerating it.',
    };
  }
  return { status: 'current' };
};
