import { vi } from 'vitest';
import { TINACLOUD_APP_URL } from '../plugins/tinacloud/client';

export const jwtExpiringIn = (seconds: number, subject = 'access') =>
  `header.${btoa(JSON.stringify({ sub: subject, exp: Math.floor(Date.now() / 1000) + seconds }))}.signature`;

export const loginTokens = (expiresInSeconds = 3600) => ({
  source: 'tinaCloudLogin',
  access_token: jwtExpiringIn(expiresInSeconds),
  id_token: 'id-token',
  refresh_token: 'refresh-token',
});

export const postMessageFrom = (
  source: unknown,
  data: unknown,
  origin = TINACLOUD_APP_URL
) => {
  window.dispatchEvent(
    Object.assign(new Event('message'), { origin, source, data })
  );
};

/** Replaces `window.open` with a popup that `complete` signs in through. */
export const stubLoginPopup = () => {
  const popup = {
    closed: false,
    close: vi.fn(() => {
      popup.closed = true;
    }),
  };
  const open = vi
    .spyOn(window, 'open')
    .mockReturnValue(popup as unknown as Window);
  const complete = (data: unknown = loginTokens()) =>
    postMessageFrom(popup, data);
  return { popup, open, complete };
};

export const tinaCloudUser = {
  id: 'ada',
  email: 'ada@example.com',
  fullName: 'Ada Lovelace',
  role: 'admin',
  verified: true,
  enabled: true,
};
