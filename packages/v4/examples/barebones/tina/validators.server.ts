import { defineServerPlugin } from '@tinacms/tinacms/server';
import {
  differentFromFactory,
  matchesFactory,
  requiredWhenFactory,
} from './validators.factories';

// The server side of the validators in tina/validators.ts. The site's server
// runs them before a save, so a request that skips the admin form is checked too.
export default defineServerPlugin({
  validators: {
    matches: matchesFactory,
    differentFrom: differentFromFactory,
    requiredWhen: requiredWhenFactory,
  },
});
