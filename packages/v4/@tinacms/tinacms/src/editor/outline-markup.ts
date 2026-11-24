import type { FormId } from '../form/form-store';

/**
 * The DOM markup the preview connection reads to work out which card the page outlines.
 * The array field and `DocumentForm` write it; `usePreviewConnection` reads it.
 */
export const FORM_ROOT_SELECTOR = '[data-form-id]';
export const CARD_SELECTOR = '[data-array-item]';

export const formRootProps = (formId: FormId) => ({ 'data-form-id': formId });

export const cardProps = (address: string) => ({
  'data-array-item': '',
  'data-item-address': address,
});

export const formIdOf = (root: Element): string | null =>
  root.getAttribute('data-form-id');

export const cardAddressOf = (card: Element): string | null =>
  card.getAttribute('data-item-address');

/** `blocks.1` is an item of `blocks`. */
export const listOf = (itemAddress: string): string =>
  itemAddress.slice(0, itemAddress.lastIndexOf('.'));
