<script lang="ts">
import TinaMarkdown from '@tinacms/sveltekit/TinaMarkdown.svelte';

let {
  children,
  foo,
}: {
  children?: any;
  foo?: string;
} = $props();
</script>

<aside class="pull-quote">
  {#if foo}
    <span class="pull-quote-badge">{foo}</span>
  {/if}
  <div class="pull-quote-content">
    {#if children}
      <TinaMarkdown content={children} />
    {/if}
  </div>
</aside>

<style>
  .pull-quote {
    margin: var(--space-8) auto;
    padding: var(--space-6) var(--space-8);
    border-top: 2px solid var(--theme-500);
    border-bottom: 2px solid var(--theme-500);
    background-color: var(--bg-tint);
    border-radius: var(--radius-md);
    text-align: center;
    max-width: 36rem;
  }

  .pull-quote-badge {
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--theme-500);
    margin-bottom: var(--space-2);
  }

  .pull-quote-content {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.5;
  }
</style>
