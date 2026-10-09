import type { z } from 'zod';
import { AuthError } from '../../../core/auth/contract';

const POPUP_POLL_MS = 500;

export const openCenteredPopup = (
  url: URL,
  width: number,
  height: number
): Window => {
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(
    url,
    '_blank',
    `popup,width=${width},height=${height},left=${left},top=${top}`
  );
  if (!popup) {
    throw new AuthError(
      'unauthenticated',
      'The browser blocked the sign-in popup. Allow popups for this site.'
    );
  }
  return popup;
};

export const waitForPopupMessage = <Message>(
  popup: Window,
  {
    origin,
    isCandidate,
    schema,
  }: {
    origin: string;
    isCandidate: (data: unknown) => boolean;
    schema: z.ZodType<Message>;
  }
): Promise<Message> =>
  new Promise((resolve, reject) => {
    const controller = new AbortController();
    const settle = (finish: () => void) => {
      controller.abort();
      finish();
    };
    window.addEventListener(
      'message',
      (event) => {
        if (event.origin !== origin || event.source !== popup) return;
        if (!isCandidate(event.data)) return;
        popup.close();
        const parsed = schema.safeParse(event.data);
        if (parsed.success) {
          settle(() => resolve(parsed.data));
        } else {
          settle(() =>
            reject(
              new AuthError(
                'invalid-response',
                'The sign-in popup sent a message in an unknown format.'
              )
            )
          );
        }
      },
      { signal: controller.signal }
    );
    const poll = setInterval(() => {
      if (!popup.closed) return;
      settle(() =>
        reject(
          new AuthError(
            'unauthenticated',
            'The sign-in popup closed before sign-in finished.'
          )
        )
      );
    }, POPUP_POLL_MS);
    controller.signal.addEventListener('abort', () => clearInterval(poll));
  });
