import type { TinaDocument } from '@tinacms/tinacms';
import { useTina } from '@tinacms/tinacms/adapters/react';
import { useEffect, useState } from 'react';
import { RouterLink } from './declared-app';
import {
  GLOBAL_DOCUMENT,
  readDocument,
  recordsOf,
  textOf,
} from './declared-data';

/** The site nav, drawn from the shared global document on every declared page. */
export function SiteNav() {
  const [data, setData] = useState<TinaDocument | null>(null);
  useEffect(() => {
    void readDocument(GLOBAL_DOCUMENT).then(setData);
  }, []);
  if (!data) return null;
  return <LoadedNav data={data} />;
}

function LoadedNav({ data }: { data: TinaDocument }) {
  const { data: global, tinaField } = useTina({
    data,
    document: GLOBAL_DOCUMENT,
    shared: true,
  });
  return (
    <nav
      data-testid='site-nav'
      style={{
        display: 'flex',
        gap: '1.5rem',
        padding: '1rem 3rem',
        fontFamily: 'system-ui, sans-serif',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <strong {...tinaField('siteName')}>{textOf(global.siteName)}</strong>
      {recordsOf(global.nav).map((item, index) => (
        <RouterLink key={textOf(item.href)} href={textOf(item.href)}>
          <span {...tinaField(`nav.${index}.label`)}>{textOf(item.label)}</span>
        </RouterLink>
      ))}
    </nav>
  );
}
