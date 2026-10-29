import { useFormStore } from '../form/form-store';

export const simulateReload = () =>
  useFormStore.setState({ userId: undefined, forms: {}, active: null });
