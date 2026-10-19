<script lang="ts">
import { withBase } from '#lib/utils.ts';
import Section from '#lib/components/layout/Section.svelte';
import Container from '#lib/components/layout/Container.svelte';
import GradientTitle from '#lib/components/ui/GradientTitle.svelte';
import Card from '#lib/components/ui/Card.svelte';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Posts | TinaCMS SvelteKit Kitchen Sink</title>
</svelte:head>

<Section>
  <Container size="large">
    <GradientTitle size="6xl">Posts</GradientTitle>

    <div class="posts-grid">
      {#each data.posts ?? [] as post (post.slug)}
        <a href={withBase(`/posts/${post.slug}`)} class="post-card-link">
          <Card class="post-card">
            <h2 class="post-card-title">{post.title}</h2>
            <span class="read-more">Read post &rarr;</span>
          </Card>
        </a>
      {/each}
    </div>
  </Container>
</Section>

<style>
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--space-6);
  }

  .post-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .post-card-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .read-more {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--theme-500);
    margin-top: auto;
  }
</style>