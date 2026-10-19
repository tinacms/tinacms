<script lang="ts">
import Section from '#lib/components/layout/Section.svelte';
import Container from '#lib/components/layout/Container.svelte';
import GradientTitle from '#lib/components/ui/GradientTitle.svelte';
import Card from '#lib/components/ui/Card.svelte';
import { formatDate, sanitizeImageSrc, withBase } from '#lib/utils.ts';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Blog | TinaCMS SvelteKit Kitchen Sink</title>
</svelte:head>

<Section>
  <Container size="large">
    <GradientTitle size="6xl">Blog</GradientTitle>

    <div class="blogs-grid">
      {#each data.blogs ?? [] as blog (blog.slug)}
        {@const heroSrc = blog.heroImage ? sanitizeImageSrc(blog.heroImage) : ''}
        <a href={withBase(`/blog/${blog.slug}`)} class="blog-card-link">
          <Card class="blog-card">
            {#if heroSrc}
              <div class="blog-thumb-wrap">
                <img src={heroSrc} alt={blog.title} class="blog-thumb" />
              </div>
            {/if}
            <h2 class="blog-card-title">{blog.title}</h2>
            {#if blog.description}
              <p class="blog-card-desc">{blog.description}</p>
            {/if}
            {#if blog.pubDate}
              <span class="blog-card-date">{formatDate(blog.pubDate)}</span>
            {/if}
          </Card>
        </a>
      {/each}
    </div>
  </Container>
</Section>

<style>
  .blogs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--space-8);
  }

  .blog-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  :global(.blog-card) {
    overflow: hidden;
    padding: 0 !important;
  }

  .blog-thumb-wrap {
    width: 100%;
    height: 200px;
    overflow: hidden;
  }

  .blog-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 200ms ease;
  }

  .blog-card-link:hover .blog-thumb {
    transform: scale(1.03);
  }

  .blog-card-title {
    margin: var(--space-4) var(--space-6) 0 var(--space-6);
    font-size: 1.35rem;
    font-weight: 700;
  }

  .blog-card-desc {
    margin: var(--space-2) var(--space-6);
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .blog-card-date {
    margin: auto var(--space-6) var(--space-4) var(--space-6);
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>
