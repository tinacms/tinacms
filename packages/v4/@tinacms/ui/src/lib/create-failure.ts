/** Why a branch create failed, shared by the core slice and the switcher. */
export const CREATE_FAILURES = [
  'timeout',
  'exists',
  'refused',
  'auth',
  'forbidden',
  'network',
  'other',
] as const;

export type CreateFailure = (typeof CREATE_FAILURES)[number];

/** Retry helps only when the same request could succeed. */
export const canRetry = (failure?: CreateFailure): boolean =>
  failure !== 'exists' &&
  failure !== 'refused' &&
  failure !== 'auth' &&
  failure !== 'forbidden';

/** The name itself cannot work, so the same name stays blocked; other failures leave Create on. */
export const blocksName = (failure?: CreateFailure): boolean =>
  failure === 'exists' || failure === 'refused';
