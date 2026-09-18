import { definePlugin } from '../../core/plugin';
import { CORE_VALIDATOR_NAMES } from './core-validators.schema';

// The validators that v4 supplies. They use bare names; a third-party plugin
// prefixes its own (`_docs/plugins.md`).
export default definePlugin({
  name: 'tina:validators:core',
  provides: ['validator'],
  validators: [...CORE_VALIDATOR_NAMES],
  client: () => import('./core-validators.client'),
});
