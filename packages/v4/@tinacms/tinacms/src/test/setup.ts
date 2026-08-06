import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { beforeEach } from 'vitest';
import { useFormStore } from '../form/form-store';

// Backstop only. A test that renders <TinaProvider> warms its plugin client
// segments in beforeAll (see test/warm-plugins.ts) and must not need the headroom.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  useFormStore.setState({ forms: {}, active: null });
  localStorage.clear();
});
