import type { ValidatorRegistry } from '../core/field/contract';
import { resolveClientSegments } from '../core/plugin';
import { createValidatorRegistry } from '../core/validator/registry';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';

/**
 * The registry that `required`, `min`, `max` and `pattern` resolve through.
 * A unit test of one field plugin builds its own field registry, so it needs
 * this to exercise the rules a collection attaches.
 */
export const coreValidatorRegistry: ValidatorRegistry = createValidatorRegistry(
  await resolveClientSegments([coreValidatorsPlugin])
);
