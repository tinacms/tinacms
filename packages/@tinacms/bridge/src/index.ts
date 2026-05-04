/**
 * @tinacms/bridge — vanilla JS bridge between the TinaCMS admin iframe and
 * a non-React frontend (Astro, Hugo, plain HTML).
 *
 * Mirrors the postMessage protocol used by the React `useTina` hook in
 * tinacms/react, but writes to the DOM by re-fetching opt-in server islands
 * (`[data-tina-island]`) instead of reconciling React state. Stateless: the
 * admin pushes already-resolved data via postMessage, and the bridge forwards
 * it on island refetches via the `X-Tina-Preview` header. The canonical
 * content store is never touched in edit mode.
 */
import { initEditMode } from './edit-mode';
import { initForms } from './forms';
import { initDataStore } from './data-store';
import { initIslandRefresh } from './island-refresh';
import { initClickToFocus } from './click-to-focus';

export interface BridgeOptions {
  /**
   * Per-island debounce for refetches triggered by subsequent edits.
   * The first refetch after page load fires immediately so newly-created
   * docs reach a populated state ASAP. Default 300ms.
   */
  debounceMs?: number;
}

let initialized = false;

export async function init(options: BridgeOptions = {}): Promise<void> {
  if (initialized) return;
  initialized = true;

  const { debounceMs = 300 } = options;

  const isEditing = await initEditMode();
  if (!isEditing) return;

  const store = initDataStore();
  initForms(store);
  initIslandRefresh(store, { debounceMs });
  initClickToFocus();
}

export { tinaField } from './tina-field';
export type * from './types';
