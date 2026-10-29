import { AuthError } from '../../../core/auth/contract';
import {
  ContentError,
  type ContentErrorCode,
  type ContentFieldErrors,
} from '../../../core/content/contract';
import { toFieldAddress } from '../../../core/field/address';
import { TinaCloudError } from '../client';
import { TinaCloudGraphQLError } from './request';

const GRAPHQL_ERROR_CODES = new Map<string | undefined, ContentErrorCode>([
  ['UNAUTHENTICATED', 'unauthorized'],
  ['FORBIDDEN', 'forbidden'],
  ['NOT_FOUND', 'not-found'],
  ['BRANCH_NOT_FOUND', 'branch-not-found'],
  ['NOT_INDEXED', 'not-indexed'],
  ['VALIDATION', 'validation'],
]);

const fromGraphQLError = (cause: TinaCloudGraphQLError): ContentError => {
  const code =
    GRAPHQL_ERROR_CODES.get(cause.errors[0]?.extensions?.code) ??
    'backend-failure';
  if (code !== 'validation') return new ContentError(code, cause.message);
  const fieldErrors: ContentFieldErrors = {};
  for (const { message, extensions } of cause.errors) {
    if (!extensions?.field) continue;
    const address = toFieldAddress(extensions.field);
    fieldErrors[address] = [...(fieldErrors[address] ?? []), message];
  }
  return new ContentError(code, cause.message, fieldErrors);
};

const NOT_FOUND_PATTERNS: [RegExp, ContentErrorCode][] = [
  [/not indexed|indexing/i, 'not-indexed'],
  [/branch .*not found|no such branch/i, 'branch-not-found'],
];

const notFoundCode = (serverMessage: string | undefined): ContentErrorCode =>
  NOT_FOUND_PATTERNS.find(([pattern]) =>
    pattern.test(serverMessage ?? '')
  )?.[1] ?? 'not-found';

export const toContentError = (cause: unknown): ContentError => {
  if (cause instanceof ContentError) return cause;
  if (cause instanceof AuthError) {
    const detail = cause.detail ?? cause.message;
    if (cause.code === 'unauthenticated' || cause.code === 'expired') {
      return new ContentError('unauthorized', detail);
    }
    if (cause.code === 'network') return new ContentError('network', detail);
    return new ContentError('backend-failure', detail);
  }
  if (cause instanceof TinaCloudGraphQLError) return fromGraphQLError(cause);
  if (!(cause instanceof TinaCloudError)) {
    if (cause instanceof Error) {
      return new ContentError('backend-failure', cause.message);
    }
    return new ContentError('backend-failure', String(cause));
  }
  const { serverMessage } = cause;
  const detail =
    serverMessage && serverMessage !== cause.message
      ? `${cause.message} ${serverMessage}`
      : cause.message;
  switch (cause.status) {
    case undefined:
      return new ContentError(
        cause.body === undefined ? 'network' : 'backend-failure',
        detail
      );
    case 401:
      return new ContentError('unauthorized', detail);
    case 403:
      return new ContentError('forbidden', detail);
    case 404:
      return new ContentError(notFoundCode(serverMessage), detail);
    default:
      return new ContentError('backend-failure', detail);
  }
};
