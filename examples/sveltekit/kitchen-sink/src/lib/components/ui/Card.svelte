<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

let {
  children,
  class: className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  children?: Snippet;
  class?: string;
} = $props();
</script>

<div {...rest} class="card {className}">
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .card {
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    transition: transform 150ms ease, box-shadow 150ms ease;
  }

  .card:hover {
    box-shadow: var(--shadow-md);
  }
</style>
