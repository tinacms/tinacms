import { type TinaDocument, corePlugins } from '@tinacms/tinacms';
import { useFieldRegistry, useTinaStore } from '@tinacms/tinacms/react';

const sectionStyle = { margin: '0.75rem 0 0' } as const;
const headingStyle = { fontSize: '0.8rem', margin: '0 0 0.25rem' } as const;
const listStyle = {
  margin: 0,
  paddingLeft: '1rem',
  fontSize: '0.8rem',
} as const;

export function PluginsPanel({
  savedDocument,
}: {
  savedDocument: TinaDocument | null;
}) {
  const registry = useFieldRegistry();
  // Select a string, not a fresh array — Object.is equality would re-render forever.
  const namespaces = useTinaStore((state) =>
    Object.keys(state).sort().join(', ')
  );

  return (
    <details style={{ marginTop: '1.5rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Plugins</summary>

      <section style={sectionStyle}>
        <h3 style={headingStyle}>Manifests</h3>
        <ul style={listStyle}>
          {corePlugins.map((plugin) => (
            <li key={plugin.name}>
              <code>{plugin.name}</code> — provides{' '}
              {plugin.provides?.join(', ') ?? 'nothing'}; overrides{' '}
              {plugin.overrides?.length ?? 0}; segments:{' '}
              {[plugin.client && 'client', plugin.server && 'server']
                .filter(Boolean)
                .join(', ') || 'none'}
            </li>
          ))}
        </ul>
      </section>

      <section style={sectionStyle}>
        <h3 style={headingStyle}>Field registry</h3>
        <ul style={listStyle}>
          {[...registry.entries()].map(([type, descriptor]) => (
            <li key={type}>
              <code>{type}</code> — default=
              {JSON.stringify(descriptor.defaultValue)}; layout=
              {descriptor.metadata?.layout ?? 'unset'}; hooks:{' '}
              {[
                descriptor.schema && 'schema',
                descriptor.validate && 'validate',
                descriptor.parse && 'parse',
                descriptor.serialize && 'serialize',
              ]
                .filter(Boolean)
                .join(', ') || 'none'}
            </li>
          ))}
        </ul>
      </section>

      <section style={sectionStyle}>
        <h3 style={headingStyle}>Boot store</h3>
        <p style={{ ...listStyle, paddingLeft: 0 }}>
          Namespaces: {namespaces}. Inspect live state in Redux DevTools (stores{' '}
          <code>TinaStore</code> and <code>TinaFormStore</code>); durable
          namespaces persist under <code>localStorage['tina-store']</code>.
        </p>
      </section>

      {savedDocument && (
        <section style={sectionStyle}>
          <h3 style={headingStyle}>Last saved (digested)</h3>
          <pre
            style={{
              fontSize: '0.75rem',
              background: '#f3f4f6',
              padding: '0.5rem',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(savedDocument, null, 2)}
          </pre>
        </section>
      )}
    </details>
  );
}
