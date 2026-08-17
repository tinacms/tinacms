import { describe, expectTypeOf, it } from 'vitest';
import type {
  BridgeIncoming,
  BridgeOutgoing,
  DataStore,
  FormPayload,
} from './types';

// The bridge ships untyped into third-party frontends (Hugo, plain HTML),
// so its public type surface is the contract. These guard the shapes the
// admin postMessage protocol depends on against silent drift.

describe('DataStore', () => {
  it('exposes the get/has/seed/set/ids surface', () => {
    expectTypeOf<DataStore['get']>().toEqualTypeOf<
      (id: string) => object | undefined
    >();
    expectTypeOf<DataStore['has']>().toEqualTypeOf<(id: string) => boolean>();
    expectTypeOf<DataStore['seed']>().toEqualTypeOf<
      (id: string, data: object) => void
    >();
    expectTypeOf<DataStore['set']>().toEqualTypeOf<
      (id: string, data: object) => void
    >();
    expectTypeOf<DataStore['ids']>().toEqualTypeOf<() => string[]>();
  });
});

describe('FormPayload', () => {
  it('is the flat wire shape seeded from [data-tina-form]', () => {
    expectTypeOf<FormPayload>().toEqualTypeOf<{
      id: string;
      query: string;
      variables: object;
      data: object;
    }>();
  });
});

describe('postMessage protocol unions', () => {
  it('outbound "open" carries the full payload', () => {
    expectTypeOf<Extract<BridgeOutgoing, { type: 'open' }>>().toEqualTypeOf<{
      type: 'open';
      id: string;
      query: string;
      variables: object;
      data: object;
    }>();
  });

  it('outbound "user-select-form" carries only a formId', () => {
    expectTypeOf<
      Extract<BridgeOutgoing, { type: 'user-select-form' }>
    >().toEqualTypeOf<{ type: 'user-select-form'; formId: string }>();
  });

  it('inbound "updateData" is the admin -> bridge data channel', () => {
    expectTypeOf<
      Extract<BridgeIncoming, { type: 'updateData' }>
    >().toEqualTypeOf<{ type: 'updateData'; id: string; data: object }>();
  });
});
