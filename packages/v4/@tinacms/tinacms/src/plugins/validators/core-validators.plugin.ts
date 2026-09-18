import { definePlugin } from '../../core/plugin';
import { CORE_VALIDATOR_NAMES } from './core-validators.schema';

/**
 * The validators that v4 supplies: `required`, `min`, `max` and `pattern`.
 * `corePlugins` includes this, so a collection can attach them with no setup.
 *
 * These use bare names. A third-party plugin prefixes its own
 * (`acme.after`), because a validator name is a global registry key.
 */
export default definePlugin({
  name: 'tina:validators:core',
  provides: ['validator'],
  validators: [...CORE_VALIDATOR_NAMES],
  client: () => import('./core-validators.client'),
});
