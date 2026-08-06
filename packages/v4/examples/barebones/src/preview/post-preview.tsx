import { tinaField, useTina } from '@tinacms/tinacms/adapters/react';
import { sampleDocument } from '../content';

// The site side of visual editing, written as a real site would write it. useTina seeds
// from the document that the site rendered, which is the whole document when a browser
// opens / directly. Inside the editor, useTina adopts the values that
// arrive. tinaField marks the elements that an author can click.
export function PostPreview() {
  const { data: post, isEditing } = useTina({ data: sampleDocument });

  return (
    <article style={{ maxWidth: '42rem', margin: '0 auto', padding: '3rem' }}>
      <span
        {...tinaField('featured')}
        style={{
          display: 'inline-block',
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontFamily: 'system-ui, sans-serif',
          background: post.featured ? '#fef3c7' : '#f3f4f6',
          color: post.featured ? '#92400e' : '#6b7280',
        }}
      >
        {post.featured ? '★ Featured' : '☆ Not featured'}
      </span>
      <h1 {...tinaField('title')}>{String(post.title ?? '')}</h1>
      {/* The custom field renders like any other: click the stars to focus it. */}
      <p
        {...tinaField('stars')}
        aria-label='Stars'
        style={{ color: '#f59e0b' }}
      >
        {'★'.repeat(post.stars ?? 0)}
        {'☆'.repeat(5 - (post.stars ?? 0))}
      </p>
      <p style={{ color: '#6b7280' }}>
        {isEditing
          ? 'This preview renders the document streamed from the editor. Click the title or the badge to focus its field in the sidebar.'
          : 'Standalone preview — rendering the static document.'}
      </p>
    </article>
  );
}
