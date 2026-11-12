import { escapeAttr } from './escape';
import type { FormPayload } from './types';

/** A form recorded while rendering a request, before it's written into the page. */
export interface CollectedForm extends FormPayload {
  priority?: 'primary';
}

/**
 * Records `form` in `forms`. The same id can appear twice (layout and page
 * both fetch the global): keep the first and upgrade it to `primary` if a
 * later call asserts it.
 */
export function addForm(forms: CollectedForm[], form: CollectedForm): void {
  const existing = forms.find((entry) => entry.id === form.id);
  if (existing) {
    if (form.priority === 'primary') existing.priority = 'primary';
    return;
  }
  forms.push(form);
}

/** Primaries first, otherwise in recorded order. Doesn't mutate `forms`. */
export function sortByPriority(
  forms: readonly CollectedForm[]
): CollectedForm[] {
  return [...forms].sort(
    (a, b) =>
      (a.priority === 'primary' ? 0 : 1) - (b.priority === 'primary' ? 0 : 1)
  );
}

/**
 * The hidden element the bridge reads a form from. Use `template` inside
 * `<head>`: a `<div>` there ends the head early.
 */
export function renderFormPayload(
  form: CollectedForm,
  primary: boolean,
  tag: 'div' | 'template' = 'div'
): string {
  return `<${tag} data-tina-form="${escapeAttr(JSON.stringify(form))}"${
    primary ? ' data-tina-primary' : ''
  } hidden></${tag}>`;
}

/**
 * Every form of a page render. With no explicit priority the first recorded
 * form (page data loads before its layout's) is the primary.
 */
export function renderPageFormPayloads(
  forms: readonly CollectedForm[],
  tag: 'div' | 'template' = 'div'
): string {
  return sortByPriority(forms)
    .map((form, index) => renderFormPayload(form, index === 0, tag))
    .join('');
}
