import { expect, vi } from 'vitest';
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
  const opened = () => vi.waitFor(() => expect(open).toHaveBeenCalled());
  const complete = async (data: unknown = loginTokens()) => {
    await opened();
    postMessageFrom(popup, data);
  };
  return { popup, open, opened, complete };
};

export const tinaCloudUser = {
  id: 'ada',
  email: 'ada@example.com',
  fullName: 'Ada Lovelace',
  verified: true,
  enabled: true,
};

/** Answers the TinaCloud identity lookups that sign-in makes. */
export const tinaCloudIdentity = (
  url: string,
  {
    user = tinaCloudUser,
    role = 'admin',
    workosEnabled = false,
  }: { user?: object; role?: string; workosEnabled?: boolean } = {}
) => {
  if (url.endsWith('/v2/auth/config')) return Response.json({ workosEnabled });
  return Response.json(url.endsWith('/currentUser') ? user : { role });
};
