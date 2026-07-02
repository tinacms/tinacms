import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { useFormStore } from '../form/form-store';

// The form-store is a module-level singleton, so its state bleeds across tests.
// Reset it here for every test file rather than mandating a beforeEach per file.
beforeEach(() => {
  useFormStore.setState({ forms: {}, active: null });
});
