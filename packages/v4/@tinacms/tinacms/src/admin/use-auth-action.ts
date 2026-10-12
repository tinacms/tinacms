import { useState } from 'react';
import { AuthError } from '../core/auth/contract';

export interface AuthAction {
  run: () => Promise<void>;
  pending: boolean;
  error: string | null;
}

export function useAuthAction(
  action: () => Promise<void>,
  fallbackMessage: string
): AuthAction {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      if (cause instanceof AuthError) {
        setError(cause.message);
      } else {
        setError(fallbackMessage);
      }
    } finally {
      setPending(false);
    }
  };
  return { run, pending, error };
}
