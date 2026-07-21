import {
  type DocumentEntry,
  type FieldSchema,
  type TinaDocument,
  localContentPlugin,
} from '@tinacms/tinacms';
import {
  Field,
  FormProvider,
  type FormStatus,
  TinaProvider,
  toFieldAddress,
  toFormId,
  useCollectionDocuments,
  useContentSlice,
  useFormErrors,
  useFormId,
  useFormSave,
  useFormStatus,
  useIsFieldDirty,
  useIsFormDirty,
  usePreviewConnection,
} from '@tinacms/tinacms/react';
import { useMemo, useRef, useState } from 'react';
import { postCollection } from './content';
import { PluginsPanel } from './plugins-panel';

const STATUS_COLORS: Record<FormStatus, string> = {
  pristine: '#6b7280',
  dirty: '#b45309',
  clean: '#15803d',
};

function StatusBadge() {
  const status = useFormStatus(useFormId());
  return (
    <span
      style={{
        padding: '0.15rem 0.5rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        color: '#fff',
        background: STATUS_COLORS[status],
      }}
    >
      {status}
    </span>
  );
}

function FieldRow({ node }: { node: FieldSchema }) {
  const dirty = useIsFieldDirty(useFormId(), toFieldAddress(node.name));
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
        {node.label ?? node.name}
        {dirty && <span style={{ color: '#b45309' }}> ●</span>}
      </div>
      <Field address={node.name} />
    </div>
  );
}

// The collection-level view: one tab per document, badged from the store's
// mirror — a dirty dot and an error dot stay live for BOTH documents no matter
// which form is hosted (useIsFormDirty/useFormErrors read any open form).
function DocumentTabs({
  documents,
  activePath,
  onSelect,
}: {
  documents: DocumentEntry[];
  activePath: string;
  onSelect: (path: string) => void;
}) {
  return (
    <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      {documents.map(({ path }) => (
        <DocumentTab
          key={path}
          path={path}
          active={path === activePath}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}

function DocumentTab({
  path,
  active,
  onSelect,
}: {
  path: string;
  active: boolean;
  onSelect: (path: string) => void;
}) {
  const formId = toFormId(path);
  const dirty = useIsFormDirty(formId);
  const hasErrors = Object.keys(useFormErrors(formId)).length > 0;
  const name = path.split('/').at(-1) ?? path;
  return (
    <button
      type='button'
      onClick={() => onSelect(path)}
      style={{
        padding: '0.25rem 0.6rem',
        borderRadius: '0.375rem',
        border: '1px solid #e5e7eb',
        background: active ? '#eef2ff' : '#fff',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
      }}
    >
      {name}
      {dirty && <span style={{ color: '#b45309' }}> ●</span>}
      {hasErrors && <span style={{ color: '#dc2626' }}> !</span>}
    </button>
  );
}

// Hosts the preview iframe and wires it to the editor: usePreviewConnection
// streams the form's values over and sets preview clicks active.
function PreviewPane() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  usePreviewConnection(iframeRef);
  return (
    <iframe
      ref={iframeRef}
      src='/preview.html'
      title='Preview'
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  );
}

function SaveButton() {
  const dirty = useIsFormDirty(useFormId());
  const save = useFormSave();
  return (
    <button type='button' disabled={!dirty} onClick={() => void save()}>
      Save
    </button>
  );
}

// Loads the collection through the content capability and hosts one document's
// form at a time. Saves flow back through the same slice — the local data layer
// writes the real file (ADR-018).
function Workspace() {
  const content = useContentSlice();
  const [savedDocument, setSavedDocument] = useState<TinaDocument | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const documents = useCollectionDocuments(postCollection.name);
  const active =
    documents.find(({ path }) => path === activePath) ?? documents[0];
  // Pin the hosted entry per form instance: live cache updates (e.g. the
  // persisted entry a save feeds back) keep the tab badges fresh but must not
  // re-seed the mounted form — that would reset RHF and wipe keystrokes typed
  // while the save was in flight.
  const hosted = useMemo(() => active, [active?.path]);
  if (!hosted) return <p style={{ padding: '1rem' }}>Loading content…</p>;

  const saveHostedDocument = async (document: TinaDocument) => {
    const saved = await content.saveDocument(
      postCollection.name,
      hosted.path,
      document
    );
    // Show what was persisted (unknown fields merged), not the raw form value.
    setSavedDocument(saved.document);
  };

  return (
    // Keyed remount per document: a switch tears the form down (the store
    // keeps its edits, ADR-012) and hosts the other one.
    <FormProvider
      key={hosted.path}
      collection={postCollection}
      path={hosted.path}
      document={hosted.document}
      onSave={saveHostedDocument}
    >
      <div style={{ display: 'flex', height: '100vh' }}>
        <aside
          style={{
            width: '22rem',
            flexShrink: 0,
            borderRight: '1px solid #e5e7eb',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <DocumentTabs
            documents={documents}
            activePath={hosted.path}
            onSelect={setActivePath}
          />
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <strong>{hosted.path}</strong>
            <StatusBadge />
          </header>
          {postCollection.fields.map((node) => (
            <FieldRow key={node.name} node={node} />
          ))}
          <SaveButton />
          <PluginsPanel savedDocument={savedDocument} />
        </aside>
        <main style={{ flex: 1 }}>
          <PreviewPane />
        </main>
      </div>
    </FormProvider>
  );
}

export function App() {
  return (
    <TinaProvider plugins={[localContentPlugin()]}>
      <Workspace />
    </TinaProvider>
  );
}
