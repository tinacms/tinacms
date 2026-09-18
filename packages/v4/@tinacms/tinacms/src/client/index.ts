import type { ClientSegment } from '../core/plugin';

export type { JsonValue } from '../core/json';

export type {
  FieldDescriptor,
  FieldValidationContext,
  PluginValidationContext,
  Validate,
  ValidatorFactory,
} from '../core/field/contract';
export type { FieldEdit, FormHookScope, FormHooks } from '../core/form/hooks';
export type { ClientSegment };
export {
  createRpcClient,
  RpcError,
  type RpcClientConfig,
  type RpcProxy,
} from '../rpc/proxy';

export const defineClientPlugin = (segment: ClientSegment): ClientSegment =>
  segment;
