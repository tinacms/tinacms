import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authenticate,
  AUTH_TOKEN_KEY,
  AuthenticationCancelledError,
} from './authenticate';

vi.mock('./popupWindow', () => ({
  default: vi.fn(),
}));

import popupWindow from './popupWindow';

const FRONTEND_URL = 'https://frontend.example';
const EXPECTED_ORIGIN = 'https://frontend.example';
const UNTRUSTED_ORIGIN = 'https://untrusted.example';

const TINA_LOGIN_EVENT = 'tinaCloudLogin';

const validData = {
  source: TINA_LOGIN_EVENT,
  id_token: 'id-token',
  access_token: 'access-token',
  refresh_token: 'refresh-token',
};

// A stand-in for the Window object returned by window.open.
const makeAuthTab = () => ({
  close: vi.fn(),
  closed: false,
});

// Captured `message` listeners registered against the real window. We spy on
// addEventListener/removeEventListener so the real window object is preserved.
let messageListeners: Array<(e: MessageEvent) => void>;
let authTab: ReturnType<typeof makeAuthTab>;

const dispatch = (e: Partial<MessageEvent>) => {
  for (const listener of [...messageListeners]) {
    listener(e as MessageEvent);
  }
};

beforeEach(() => {
  vi.useFakeTimers();
  messageListeners = [];
  authTab = makeAuthTab();

  vi.mocked(popupWindow).mockReturnValue(authTab as unknown as Window);

  vi.spyOn(window, 'addEventListener').mockImplementation(
    (type: string, cb: EventListenerOrEventListenerObject) => {
      if (type === 'message') {
        messageListeners.push(cb as (e: MessageEvent) => void);
      }
    }
  );
  vi.spyOn(window, 'removeEventListener').mockImplementation(
    (type: string, cb: EventListenerOrEventListenerObject) => {
      if (type === 'message') {
        messageListeners = messageListeners.filter((l) => l !== cb);
      }
    }
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Drive the popup-closed poll so a pending authenticate() promise settles
// deterministically, and assert it rejects with the cancellation error.
const settleViaPopupClose = async (result: Promise<unknown>) => {
  const expectation = expect(result).rejects.toThrowError(
    new AuthenticationCancelledError('Popup was closed')
  );
  authTab.closed = true;
  await vi.advanceTimersByTimeAsync(600);
  await expectation;
};

describe('authenticate origin/source validation', () => {
  it('ignores a message from an untrusted origin', async () => {
    const result = authenticate('client-id', FRONTEND_URL);

    dispatch({
      origin: UNTRUSTED_ORIGIN,
      source: authTab as unknown as Window,
      data: validData,
    });

    // The handler should not have resolved; the listener stays registered.
    expect(messageListeners.length).toBe(1);
    expect(authTab.close).not.toHaveBeenCalled();

    await settleViaPopupClose(result);
  });

  it('ignores a message from the expected origin but a different source', async () => {
    const result = authenticate('client-id', FRONTEND_URL);

    const otherWindow = makeAuthTab();
    dispatch({
      origin: EXPECTED_ORIGIN,
      source: otherWindow as unknown as Window,
      data: validData,
    });

    expect(messageListeners.length).toBe(1);
    expect(authTab.close).not.toHaveBeenCalled();

    await settleViaPopupClose(result);
  });

  it('accepts a message from the expected origin and the exact opened popup source', async () => {
    const result = authenticate('client-id', FRONTEND_URL);

    dispatch({
      origin: EXPECTED_ORIGIN,
      source: authTab as unknown as Window,
      data: validData,
    });

    await expect(result).resolves.toEqual({
      id_token: 'id-token',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(authTab.close).toHaveBeenCalled();
    // Listener cleaned up after a successful login.
    expect(messageListeners.length).toBe(0);
  });

  it('derives expectedOrigin from new URL(frontendUrl).origin, including the port', async () => {
    const result = authenticate('client-id', 'https://frontend.example:8443');

    // Same host but the default port (no :8443) is a different origin.
    dispatch({
      origin: 'https://frontend.example',
      source: authTab as unknown as Window,
      data: validData,
    });
    expect(authTab.close).not.toHaveBeenCalled();

    // Exact origin including the port is accepted.
    dispatch({
      origin: 'https://frontend.example:8443',
      source: authTab as unknown as Window,
      data: validData,
    });

    await expect(result).resolves.toEqual({
      id_token: 'id-token',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(authTab.close).toHaveBeenCalled();
  });

  it('does not read event.data before origin/source validation', async () => {
    const result = authenticate('client-id', FRONTEND_URL);

    let dataAccessed = false;
    const trap = {
      get source() {
        dataAccessed = true;
        return TINA_LOGIN_EVENT;
      },
    };

    // Untrusted origin: the handler must bail out before touching e.data.
    dispatch({
      origin: UNTRUSTED_ORIGIN,
      source: authTab as unknown as Window,
      data: trap,
    });

    expect(dataAccessed).toBe(false);

    await settleViaPopupClose(result);
  });
});

it('exports the auth token key', () => {
  expect(AUTH_TOKEN_KEY).toBe('tinacms-auth');
});
