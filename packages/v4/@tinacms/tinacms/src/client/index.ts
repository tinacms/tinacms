import type { ClientSegment } from '../core/plugin';

export type { JsonValue } from '../core/json';

export {
  AuthError,
  type AuthErrorCode,
  type AuthSlice,
  type AuthUser,
  toUserId,
  type UserId,
} from '../core/auth/contract';

export type {
  FieldDescriptor,
  FieldValidationContext,
  PluginValidationContext,
  Validate,
  ValidatorFactory,
} from '../core/field/contract';
export type {
  FieldEdit,
  FormHookFactory,
  FormHookScope,
  FormHooks,
} from '../core/form/hooks';
export type {
  ActionTarget,
  GlobalNavEntry,
  NavTarget,
  ScreenTarget,
  SlotContributions,
  UrlTarget,
} from '../core/slot/contract';
export {
  type MediaFeatures,
  type MediaItem,
  type MediaPage,
  type MediaPageRequest,
  type MediaProvider,
  MediaError,
  type MediaErrorCode,
  type MediaSlice,
  type MediaStatus,
  type MediaUrlOptions,
} from '../core/media/contract';
export type { ClientSegment };
export {
  createRpcClient,
  RpcError,
  type RpcClientConfig,
  type RpcProxy,
} from '../rpc/proxy';

export const defineClientPlugin = (segment: ClientSegment): ClientSegment =>
  segment;
