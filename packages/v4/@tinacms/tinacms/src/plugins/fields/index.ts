import stringFieldPlugin from './string/string-field.plugin';
import { string } from './string/string-field.schema';

// The built-in field plugins TinaCMS ships. The "is this a core plugin" check
// reads this list, not the plugin name.
export const corePlugins = [stringFieldPlugin];

// Schema-authoring helpers, one per built-in field. Kept explicit (rather than
// derived in a loop) so `t.string` stays statically typed; co-located with
// corePlugins so the built-in set lives in one place.
// TODO: once defineConfig (ADR-024) lands, generate `t` from the configured plugin
// set so user-registered field plugins join it (typed). This stays the built-in
// default until then.
export const t = { string };

export type { StringFieldSchema } from './string/string-field.schema';
