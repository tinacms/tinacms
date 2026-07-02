import {
  type FieldSchema,
  type TinaDocument,
  corePlugins,
} from '@tinacms/tinacms';
import {
  Field,
  FormProvider,
  type FormStatus,
  TinaProvider,
  toFieldAddress,
  useFormId,
  useFormSave,
  useFormStatus,
  useIsFieldDirty,
  useIsFormDirty,
  usePreviewConnection,
} from '@tinacms/tinacms/react';
import { useRef, useState } from 'react';
import { DOCUMENT_PATH, postCollection, sampleDocument } from './content';
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

export function App() {
  const [savedDocument, setSavedDocument] = useState<TinaDocument | null>(null);
  return (
    <TinaProvider plugins={corePlugins}>
      <FormProvider
        collection={postCollection}
        path={DOCUMENT_PATH}
        document={sampleDocument}
        onSave={setSavedDocument}
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
            <header
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <strong>{DOCUMENT_PATH}</strong>
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
    </TinaProvider>
  );
}
