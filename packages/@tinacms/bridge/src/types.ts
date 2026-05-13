/**
 * postMessage protocol shared between this bridge and the TinaCMS admin
 * (packages/@tinacms/app). Mirrors the messages emitted by useTina in
 * packages/tinacms/src/react.tsx so the admin sees identical traffic.
 */
export type BridgeOutgoing =
  | { type: 'isEditMode' }
  | { type: 'open'; id: string; query: string; variables: object; data: object }
  | { type: 'close'; id: string }
  | { type: 'url-changed' }
  | { type: 'field:selected'; fieldName: string }
  | { type: 'quick-edit'; value: boolean }
  | { type: 'user-select-form'; formId: string };

export type BridgeIncoming =
  | { type: 'tina:editMode' }
  | { type: 'updateData'; id: string; data: object }
  | { type: 'quickEditEnabled'; value: boolean };

export interface FormPayload {
  id: string;
  query: string;
  variables: object;
  data: object;
}

export interface DataStore {
  /** Latest resolved data per form id. */
  get(id: string): object | undefined;
  /** Populate without notifying subscribers (used for the initial seed). */
  seed(id: string, data: object): void;
  /** Replace cached data for a form and notify subscribers. */
  set(id: string, data: object): void;
  /** All known form ids. */
  ids(): string[];
  /** Subscribe to data updates. Returns unsubscribe. */
  subscribe(
    listener: (event: { id: string; firstUpdate: boolean }) => void
  ): () => void;
}
