import { type CollectedForm, addForm } from '@tinacms/bridge/form-payload';

export type { CollectedForm };

export const TINA_FORMS: unique symbol = Symbol.for(
  '@tinacms/sveltekit/forms'
) as never;

export interface TinaLocals {
  [TINA_FORMS]?: CollectedForm[];
}

export function recordForm(locals: TinaLocals, form: CollectedForm): void {
  const forms = locals[TINA_FORMS];
  if (forms) addForm(forms, form);
}
