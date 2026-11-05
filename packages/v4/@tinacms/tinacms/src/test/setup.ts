import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { toast } from '@tinacms/ui/components/toast';
import { beforeEach } from 'vitest';
import { resolveClientSegments } from '../core/plugin';
import { clearHeldDrafts } from '../form/drafts';
import { useFormStore } from '../form/form-store';
import { corePlugins } from '../plugins/fields';

// TinaProvider renders null until its boot resolves each plugin's client() thunk —
// a dynamic import Vite transforms on demand. Load the core segments up front so
// that cost never lands in a test's findBy* budget, where a loaded runner blows it.
await resolveClientSegments(corePlugins);

// Backstop. No test that renders <TinaProvider> should need the headroom.
configure({ asyncUtilTimeout: 5000 });

// react-aria restores HTMLElement.prototype.focus by assignment on `beforeunload`.
// A render turns that property into a getter-only accessor, so the restore throws.
const keepFocusAssignable = () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'focus'
  );
  if (!descriptor || 'value' in descriptor) return;
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    value: HTMLElement.prototype.focus,
    writable: true,
    configurable: true,
  });
};

beforeEach(() => {
  keepFocusAssignable();
  useFormStore.getState().setBranch(undefined);
  useFormStore.setState({
    userId: undefined,
    forms: {},
    saves: {},
    active: null,
  });
  localStorage.clear();
  clearHeldDrafts();
  toast.dismiss();
});
