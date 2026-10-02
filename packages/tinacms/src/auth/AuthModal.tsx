import {
  Button,
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  ModalPopup,
} from '@tinacms/toolkit';
import React, { useCallback, useEffect, useState } from 'react';

interface ModalBuilderProps {
  title: string;
  message?: React.ReactNode;
  error?: string;
  actions: ButtonProps[];
  close(): void;
  children?: React.ReactNode;
  busy?: boolean;
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
            <AsyncButton key={action.name} {...action} busy={modalProps.busy} />
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
  busy?: boolean;
}

export const AsyncButton = ({ name, primary, action, busy }: ButtonProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const onClick = useCallback(async () => {
    if (!mounted || busy) return;
    setSubmitting(true);
    try {
      await action();
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
      throw e;
    }
  }, [action, setSubmitting, mounted, busy]);

  const isBusy = busy || submitting;

  return (
    <Button
      data-test={name.replace(/\s/g, '-').toLowerCase()}
      variant={primary ? 'primary' : 'secondary'}
      onClick={onClick}
      busy={isBusy}
      disabled={isBusy}
    >
      {name}
    </Button>
  );
};
