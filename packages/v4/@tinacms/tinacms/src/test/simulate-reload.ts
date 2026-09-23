import { DRAFT_STORAGE_KEY, useFormStore } from '../form/form-store';

export const simulateReload = async () => {
  const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
  useFormStore.setState({ forms: {}, active: null });
  if (saved) localStorage.setItem(DRAFT_STORAGE_KEY, saved);
  await useFormStore.persist.rehydrate();
};
