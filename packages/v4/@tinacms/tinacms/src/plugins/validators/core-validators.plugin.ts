import { definePlugin } from '../../core/plugin';
import coreValidatorsServer from './core-validators.server';
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
  // A static import, not a lazy one: the Vite config loader closes its module runner
  // once the config is read, and a later `import()` through it fails on the first save.
  // The module holds only the factories, so a browser bundle gains no node code.
  server: async () => ({ default: coreValidatorsServer }),
});
