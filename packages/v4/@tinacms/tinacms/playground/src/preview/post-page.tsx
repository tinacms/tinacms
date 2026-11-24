import type { TinaDocument } from '@tinacms/tinacms';
import {
  TinaMarkdown,
  type TinaMarkdownContent,
  useTina,
} from '@tinacms/tinacms/adapters/react';
import { useEffect, useState } from 'react';
import { isRecord } from '../../../src/utils/is-record';
import { readPost, recordsOf, textOf } from './declared-data';
import { SiteNav } from './site-nav';

const NEXT_POST: Record<string, string> = {
  'content/posts/hello-world.mdx': 'content/posts/second-post.mdx',
  'content/posts/second-post.mdx': 'content/posts/hello-world.mdx',
};

/** The post page. `path` is the post's repo-relative path, which is also its `document`. */
export function PostPage({ path }: { path: string }) {
  const [loaded, setLoaded] = useState<{
    path: string;
    data: TinaDocument;
  } | null>(null);
  useEffect(() => {
    let current = true;
    void readPost(path).then((data) => {
      if (current) setLoaded({ path, data });
    });
    return () => {
      current = false;
    };
  }, [path]);

  return (
    <>
      <SiteNav />
      {loaded?.path === path ? (
        <PostBody path={path} data={loaded.data} />
      ) : null}
    </>
  );
}

function PostBody({ path, data }: { path: string; data: TinaDocument }) {
  const { data: post, tinaField } = useTina({ data, document: path });
  const seo = isRecord(post.seo) ? post.seo : {};
  const social = isRecord(seo.social) ? seo.social : {};
  const author = isRecord(post.author) ? post.author : null;
  const next = NEXT_POST[path];

  return (
    <article style={{ maxWidth: '42rem', margin: '0 auto', padding: '3rem' }}>
      <h1 {...tinaField('title')} data-testid='post-title'>
        {textOf(post.title)}
      </h1>
      {author ? (
        <p {...tinaField('author.name')} data-testid='author-name'>
          {textOf(author.name)}
        </p>
      ) : null}
      <p data-testid='plain-paragraph'>An unmarked paragraph.</p>
      <div {...tinaField('body')}>
        <TinaMarkdown content={post.body as TinaMarkdownContent} />
      </div>
      <section data-testid='blocks'>
        {recordsOf(post.blocks).map((block, index) => (
          <div
            key={index}
            {...tinaField(`blocks.${index}`)}
            data-testid={`block-${index}`}
            style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}
          >
            {block._template === 'quote' ? (
              <blockquote
                {...tinaField(`blocks.${index}.text`)}
                data-testid={`block-${index}-text`}
              >
                {textOf(block.text)}
              </blockquote>
            ) : (
              <>
                <h2 {...tinaField(`blocks.${index}.headline`)}>
                  {textOf(block.headline)}
                </h2>
                <p {...tinaField(`blocks.${index}.tagline`)}>
                  {textOf(block.tagline)}
                </p>
              </>
            )}
          </div>
        ))}
      </section>
      <section
        data-testid='dark-section'
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#111827',
          color: '#f9fafb',
        }}
      >
        <h3 {...tinaField('seo.title')} data-testid='dark-mark'>
          {textOf(seo.title)}
        </h3>
        <p {...tinaField('seo.description')}>{textOf(seo.description)}</p>
        <p {...tinaField('seo.social.handle')} data-testid='social-handle'>
          {textOf(social.handle)}
        </p>
      </section>
      <footer
        style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}
        data-testid='links'
      >
        {next ? (
          <a href={`/declared.html?post=${next}`} data-testid='next-post'>
            Next post
          </a>
        ) : null}
        <a href='https://example.com/' data-testid='off-site-link'>
          Off-site link
        </a>
      </footer>
    </article>
  );
}
