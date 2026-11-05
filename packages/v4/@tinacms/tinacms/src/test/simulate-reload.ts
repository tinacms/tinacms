import { useFormStore } from '../form/form-store';

export const simulateReload = () => {
  useFormStore.setState({
    userId: undefined,
    forms: {},
    waiting: {},
    held: {},
    unstored: {},
    failures: {},
    hidden: {},
    active: null,
  });
};
