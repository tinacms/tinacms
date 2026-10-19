<script lang="ts">
import Section from '#lib/components/layout/Section.svelte';
import Container from '#lib/components/layout/Container.svelte';
import GradientTitle from '#lib/components/ui/GradientTitle.svelte';
import Card from '#lib/components/ui/Card.svelte';
import { sanitizeImageSrc, withBase } from '#lib/utils.ts';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Authors | TinaCMS SvelteKit Kitchen Sink</title>
</svelte:head>

<Section>
  <Container size="large">
    <GradientTitle size="6xl">Authors</GradientTitle>

    <div class="authors-grid">
      {#each data.authors ?? [] as author (author.slug)}
        {@const avatarSrc = author.avatar ? sanitizeImageSrc(author.avatar) : ''}
        <a href={withBase(`/authors/${author.slug}`)} class="author-card-link">
          <Card class="author-card">
            {#if avatarSrc}
              <img src={avatarSrc} alt={author.name} class="author-avatar" width="80" height="80" />
            {/if}
            <h2 class="author-name">{author.name}</h2>
            {#if author.description}
              <p class="author-bio">{author.description}</p>
            {/if}
          </Card>
        </a>
      {/each}
    </div>
  </Container>
</Section>

<style>
  .authors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-6);
  }

  .author-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  :global(.author-card) {
    align-items: center;
    text-align: center;
  }

  .author-avatar {
    width: 5rem;
    height: 5rem;
    border-radius: var(--radius-full);
    object-fit: cover;
    box-shadow: var(--shadow-sm);
  }

  .author-name {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .author-bio {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }
</style>
