<script lang="ts">
import { tinaField } from '@tinacms/sveltekit';
import type { QueryResult } from '@tinacms/sveltekit/data';
import TinaMarkdown from '@tinacms/sveltekit/TinaMarkdown.svelte';
import { useTina } from '@tinacms/sveltekit/use-tina';
import { customComponents } from '#lib/components/markdown/index.ts';
import { formatDate, sanitizeImageSrc, withBase } from '#lib/utils.ts';
import Container from '../layout/Container.svelte';
import Section from '../layout/Section.svelte';
import GradientTitle from '../ui/GradientTitle.svelte';
import NoData from '../ui/NoData.svelte';

let {
  query,
  formattedDate: initialFormattedDate,
}: {
  query: QueryResult<any>;
  formattedDate?: string;
} = $props();

const tina = useTina(() => query);

const post = $derived(tina.data?.post);

const formattedDate = $derived(
  post?.date ? formatDate(post.date) : (initialFormattedDate ?? '')
);

const authorFilename = $derived(post?.author?._sys?.filename);
const avatarSrc = $derived(
  post?.author?.avatar ? sanitizeImageSrc(post.author.avatar) : ''
);
const heroSrc = $derived(post?.heroImg ? sanitizeImageSrc(post.heroImg) : '');
</script>

{#if !post}
  <NoData message="No post found" />
{:else}
  <Section class="post-section">
    <Container width="small" size="large">
      <GradientTitle as="h1" data-tina-field={tinaField(post, 'title')}>
        {post.title}
      </GradientTitle>

      <div class="author-bar" data-tina-field={tinaField(post, 'author')}>
        {#if post.author}
          {#if avatarSrc}
            <img
              src={avatarSrc}
              alt={post.author.name || ''}
              class="author-avatar"
              width="56"
              height="56"
            />
          {/if}
          <div class="author-meta">
            {#if authorFilename}
              <a href={withBase(`/authors/${authorFilename}`)} class="author-name-link">
                {post.author.name}
              </a>
            {:else}
              <span class="author-name">{post.author.name}</span>
            {/if}
            {#if formattedDate}
              <span class="post-date">— {formattedDate}</span>
            {/if}
          </div>
        {/if}
      </div>

      {#if heroSrc}
        <div class="hero-image-wrap" data-tina-field={tinaField(post, 'heroImg')}>
          <img src={heroSrc} alt={post.title} class="hero-image" />
        </div>
      {/if}

      <div class="post-body" data-tina-field={tinaField(post, '_body')}>
        <TinaMarkdown content={post._body || post.body} components={customComponents} />
      </div>
    </Container>
  </Section>
{/if}

<style>
  :global(.post-section) {
    min-height: 80vh;
  }

  .author-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    margin-bottom: var(--space-12);
  }

  .author-avatar {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--radius-full);
    object-fit: cover;
    box-shadow: var(--shadow-sm);
  }

  .author-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 1rem;
    font-weight: 500;
  }

  .author-name-link {
    color: var(--text-secondary);
    transition: color 150ms ease;
  }

  .author-name-link:hover {
    color: var(--theme-500);
    text-decoration: underline;
  }

  .post-date {
    color: var(--text-muted);
  }

  .hero-image-wrap {
    margin-bottom: var(--space-12);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .hero-image {
    width: 100%;
    height: auto;
    display: block;
  }

  .post-body {
    font-size: 1.125rem;
    line-height: 1.8;
  }
</style>
