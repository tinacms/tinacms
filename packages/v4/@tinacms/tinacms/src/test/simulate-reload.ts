import { clearHeldDrafts } from '../form/drafts';
import { useFormStore } from '../form/form-store';

export const simulateReload = () => {
  clearHeldDrafts();
  useFormStore.setState({ userId: undefined, forms: {}, active: null });
};
