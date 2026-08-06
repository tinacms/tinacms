import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { beforeEach } from 'vitest';
import { useFormStore } from '../form/form-store';

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  useFormStore.setState({ forms: {}, active: null });
  localStorage.clear();
});
