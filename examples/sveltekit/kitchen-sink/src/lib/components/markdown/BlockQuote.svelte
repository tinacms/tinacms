<script lang="ts">
import TinaMarkdown from '@tinacms/sveltekit/TinaMarkdown.svelte';

let {
  children,
  authorName,
}: {
  children?: any;
  authorName?: string;
} = $props();
</script>

<div class="custom-blockquote-wrap">
  <blockquote class="custom-blockquote">
    {#if children}
      <TinaMarkdown content={children} />
    {/if}
    {#if authorName}
      <cite class="author-cite">— {authorName}</cite>
    {/if}
  </blockquote>
</div>

<style>
  .custom-blockquote-wrap {
    margin: var(--space-8) 0;
  }

  .custom-blockquote {
    margin: 0;
    padding: var(--space-6) var(--space-8);
    border-left: 4px solid var(--theme-500);
    background-color: var(--bg-surface);
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    box-shadow: var(--shadow-sm);
    font-size: 1.15rem;
    font-style: italic;
    color: var(--text-primary);
  }

  .author-cite {
    display: block;
    margin-top: var(--space-4);
    font-size: 0.95rem;
    font-weight: 600;
    font-style: normal;
    color: var(--theme-500);
  }
</style>
