import { DRAFT_STORAGE_KEY, useFormStore } from '../form/form-store';

const draftEntries = () =>
  Object.keys(localStorage)
    .filter((key) => key.startsWith(`${DRAFT_STORAGE_KEY}:`))
    .map((key) => [key, localStorage.getItem(key) ?? ''] as const);

export const simulateReload = async () => {
  const saved = draftEntries();
  useFormStore.setState({ forms: {}, active: null });
  for (const [key, value] of saved) localStorage.setItem(key, value);
  await useFormStore.persist.rehydrate();
};
