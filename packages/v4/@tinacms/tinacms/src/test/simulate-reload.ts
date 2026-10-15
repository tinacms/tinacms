import { useFormStore } from '../form/form-store';

export const simulateReload = () =>
  useFormStore.setState({ forms: {}, active: null });
