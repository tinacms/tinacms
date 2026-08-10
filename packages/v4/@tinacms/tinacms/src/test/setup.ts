import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { beforeEach } from 'vitest';
import { resolveClientSegments } from '../core/plugin';
import { useFormStore } from '../form/form-store';
import { corePlugins } from '../plugins/fields';

// TinaProvider renders null until its boot resolves each plugin's client() thunk —
// a dynamic import Vite transforms on demand. Load the core segments up front so
// that cost never lands in a test's findBy* budget, where a loaded runner blows it.
await resolveClientSegments(corePlugins);

// Backstop. No test that renders <TinaProvider> should need the headroom.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  useFormStore.setState({ forms: {}, active: null });
  localStorage.clear();
});
