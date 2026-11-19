import { IDLE_SAVE_ALL, useFormStore } from '../form/form-store';

export const simulateReload = () => {
  useFormStore.setState({
    userId: undefined,
    forms: {},
    waiting: {},
    held: {},
    unstored: {},
    failures: {},
    swapFailures: {},
    hidden: {},
    promptDown: {},
    active: null,
    collections: {},
    revealOnOpen: {},
    savePending: {},
    saveAll: IDLE_SAVE_ALL,
  });
};
