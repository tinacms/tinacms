<script lang="ts">
import Section from '../layout/Section.svelte';
import Container from '../layout/Container.svelte';
import GradientTitle from '../ui/GradientTitle.svelte';
import NoData from '../ui/NoData.svelte';
import TinaMarkdown from '@tinacms/sveltekit/TinaMarkdown.svelte';
import { tinaField } from '@tinacms/sveltekit';
import type { QueryResult } from '@tinacms/sveltekit/data';
import { useTina } from '@tinacms/sveltekit/use-tina';
import { sanitizeImageSrc, formatDate } from '#lib/utils.ts';
import { customComponents } from '#lib/components/markdown/index.ts';

let {
  query,
  formattedPubDate: initialPubDate,
  formattedUpdatedDate: initialUpdatedDate,
}: {
  query: QueryResult<any>;
  formattedPubDate?: string;
  formattedUpdatedDate?: string;
} = $props();

const tina = useTina(() => query);

const blog = $derived(tina.data?.blog);

const formattedDate = $derived(
  blog?.pubDate ? formatDate(blog.pubDate) : (initialPubDate ?? '')
);
const formattedUpdatedDate = $derived(
  blog?.updatedDate ? formatDate(blog.updatedDate) : (initialUpdatedDate ?? '')
);

const avatarSrc = $derived(
  blog?.author?.avatar ? sanitizeImageSrc(blog.author.avatar) : ''
);
const heroSrc = $derived(
  blog?.heroImage ? sanitizeImageSrc(blog.heroImage) : ''
);
</script>

{#if !blog}
  <NoData message="No blog post found" />
{:else}
  <Section class="blog-section">
    <Container width="small" size="large">
      <GradientTitle as="h1" data-tina-field={tinaField(blog, 'title')}>
        {blog.title}
      </GradientTitle>

      {#if blog.description}
        <p class="blog-desc" data-tina-field={tinaField(blog, 'description')}>
          {blog.description}
        </p>
      {/if}

      <div class="author-row" data-tina-field={tinaField(blog, 'author')}>
        {#if avatarSrc}
          <img
            src={avatarSrc}
            alt={blog.author?.name || ''}
            class="author-img"
            width="40"
            height="40"
          />
        {/if}
        <div class="author-info">
          {#if blog.author?.name}
            <span class="author-name">{blog.author.name}</span>
          {/if}
          <div class="date-row">
            {#if formattedDate}
              <span data-tina-field={tinaField(blog, 'pubDate')}>
                Published {formattedDate}
              </span>
            {/if}
            {#if formattedUpdatedDate && formattedUpdatedDate !== formattedDate}
              <span class="date-sep">·</span>
              <span data-tina-field={tinaField(blog, 'updatedDate')}>
                Updated {formattedUpdatedDate}
              </span>
            {/if}
          </div>
        </div>
      </div>
    </Container>

    {#if heroSrc}
      <div class="hero-container" data-tina-field={tinaField(blog, 'heroImage')}>
        <div class="hero-box">
          <img src={heroSrc} alt={blog.title} class="hero-img" width="600" height="400" />
        </div>
      </div>
    {/if}

    <Container width="small" size="large">
      <div class="blog-body" data-tina-field={tinaField(blog, '_body')}>
        <TinaMarkdown content={blog._body} components={customComponents} />
      </div>
    </Container>
  </Section>
{/if}

<style>
  :global(.blog-section) {
    min-height: 80vh;
  }

  .blog-desc {
    font-size: 1.125rem;
    color: var(--text-secondary);
    max-width: 42rem;
    margin: 0 auto var(--space-6) auto;
    text-align: center;
  }

  .author-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    margin-bottom: var(--space-12);
  }

  .author-img {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-full);
    object-fit: cover;
  }

  .author-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .author-name {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .date-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .date-sep {
    color: var(--border-subtle);
  }

  .hero-container {
    padding: 0 var(--space-4);
    width: 100%;
    margin-bottom: var(--space-12);
  }

  .hero-box {
    max-width: 48rem;
    margin: 0 auto;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .hero-img {
    width: 100%;
    height: auto;
    display: block;
  }

  .blog-body {
    font-size: 1.125rem;
    line-height: 1.8;
  }
</style>
