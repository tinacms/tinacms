<script lang="ts">
import type { Snippet } from 'svelte';

let {
  children,
  size = 'md',
  class: className = '',
}: {
  children?: Snippet;
  size?: 'sm' | 'md';
  class?: string;
} = $props();
</script>

<span class="badge badge-{size} {className}">
  {#if children}
    {@render children()}
  {/if}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    background-color: var(--theme-50);
    color: var(--theme-700);
    border-radius: var(--radius-full);
    font-weight: 500;
  }

  .badge-sm {
    font-size: 0.8125rem;
    padding: 0.125rem 0.5rem;
  }

  .badge-md {
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
  }
</style>
