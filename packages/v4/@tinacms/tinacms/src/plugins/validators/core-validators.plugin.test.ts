import { describe, expect, it } from 'vitest';
import { resolveServerSegments } from '../../core/resolve';
import { createServerValidatorRegistry } from '../../core/validator/server-registry';
import coreValidatorsPlugin from './core-validators.plugin';
import { CORE_VALIDATOR_NAMES } from './core-validators.schema';

describe('the core validators plugin on the server', () => {
  it('supplies a factory for each built-in name with no setup', async () => {
    const plugins = [coreValidatorsPlugin];
    const registry = createServerValidatorRegistry(
      plugins,
      await resolveServerSegments(plugins)
    );
    expect([...registry.keys()].sort()).toEqual(
      [...CORE_VALIDATOR_NAMES].sort()
    );
  });
});
