import {
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from '@tinacms/toolkit';
import { LoadingDots, Button } from '@tinacms/toolkit';
import React, { useCallback, useEffect, useState } from 'react';

// Debug logging for auth flow investigation
const authLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, data };

  if (typeof window !== 'undefined') {
    (window as any).__TINA_AUTH_LOGS__ =
      (window as any).__TINA_AUTH_LOGS__ || [];
    (window as any).__TINA_AUTH_LOGS__.push(logEntry);
  }

  console.log(
    `[TINA-AUTH ${timestamp}]`,
    message,
    data !== undefined ? data : ''
  );
};

interface ModalBuilderProps {
  title: string;
  message?: React.ReactNode;
  error?: string;
  actions: ButtonProps[];
  close(): void;
  children?: React.ReactNode;
}

export function ModalBuilder(modalProps: ModalBuilderProps) {
  return (
    <Modal>
      <ModalPopup>
        <ModalHeader>{modalProps.title}</ModalHeader>
        <ModalBody padded>
          {modalProps.message &&
            (typeof modalProps.message === 'string' ? (
              <p>{modalProps.message}</p>
            ) : (
              modalProps.message
            ))}
          {modalProps.error && <ErrorLabel>{modalProps.error}</ErrorLabel>}
          {modalProps.children}
        </ModalBody>
        <ModalActions>
          {modalProps.actions.map((action) => (
            <AsyncButton key={action.name} {...action} />
          ))}
        </ModalActions>
      </ModalPopup>
    </Modal>
  );
}

export const ErrorLabel = ({ style = {}, ...props }) => (
  <p style={{ ...style, color: 'var(--tina-color-error)' }} {...props} />
);

interface ButtonProps {
  name: string;
  action(): Promise<void>;
  primary: boolean;
}

export const AsyncButton = ({ name, primary, action }: ButtonProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    authLog('AsyncButton mounted', { name });
    setMounted(true);
    return () => {
      authLog('AsyncButton unmounting', { name });
      setMounted(false);
    };
  }, [name]);

  const onClick = useCallback(async () => {
    authLog('AsyncButton onClick called', { name, mounted, submitting });

    if (!mounted) {
      authLog('AsyncButton onClick aborted - not mounted', { name });
      return;
    }

    authLog('AsyncButton setSubmitting(true)', { name });
    setSubmitting(true);

    try {
      authLog('AsyncButton awaiting action...', { name });
      await action();
      authLog('AsyncButton action completed successfully', { name });
      setSubmitting(false);
      authLog('AsyncButton setSubmitting(false) after success', { name });
    } catch (e) {
      authLog('AsyncButton action threw error', { name, error: String(e) });
      setSubmitting(false);
      authLog('AsyncButton setSubmitting(false) after error', { name });
      throw e;
    }
  }, [action, setSubmitting, mounted, name]);

  return (
    <Button
      data-test={name.replace(/\s/g, '-').toLowerCase()}
      variant={primary ? 'primary' : 'secondary'}
      onClick={onClick}
      busy={submitting}
      disabled={submitting}
    >
      {submitting && <LoadingDots />}
      {!submitting && name}
    </Button>
  );
};
