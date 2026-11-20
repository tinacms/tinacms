import type { ValidatorFactory } from '../field/contract';
import { invariant } from '../invariant';
import type { PluginManifest, ResolvedServerSegment } from '../plugin';
import { validatorProvidersOf } from './registry';

export type ServerValidatorRegistry = ReadonlyMap<string, ValidatorFactory>;

// A server factory comes from the plugin that wins the name, as a server hook
// does. Every plugin that declares validators needs a server segment with one
// factory for each name (ADR-028 §9).
export const createServerValidatorRegistry = (
  plugins: PluginManifest[],
  resolved: ResolvedServerSegment[]
): ServerValidatorRegistry => {
  for (const plugin of plugins) {
    invariant(
      !plugin.validators?.length || plugin.server,
      'validator-plugin-no-server',
      `Plugin "${plugin.name}" declares the validators ${plugin.validators
        ?.map((name) => `"${name}"`)
        .join(', ')} but has no server segment to hold their factories.`
    );
  }
  for (const { manifest, ops } of resolved) {
    for (const name of Object.keys(ops.validators ?? {})) {
      invariant(
        manifest.validators?.includes(name),
        'validator-plugin-undeclared-server-factory',
        `Plugin "${manifest.name}" exports a server factory for the validator "${name}" but its manifest does not declare "${name}" in \`validators\`.`
      );
    }
  }
  const registry = new Map<string, ValidatorFactory>();
  for (const [name, plugin] of validatorProvidersOf(plugins)) {
    const factory = resolved.find(({ manifest }) => manifest === plugin)?.ops
      .validators?.[name];
    invariant(
      factory,
      'validator-plugin-missing-server-factory',
      `Plugin "${plugin.name}" declares the validator "${name}" but its server segment has no factory for "${name}".`
    );
    registry.set(name, factory);
  }
  return registry;
};
