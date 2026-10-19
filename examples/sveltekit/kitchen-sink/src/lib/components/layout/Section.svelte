<script lang="ts">
import type { Snippet } from 'svelte';

let {
  children,
  color = 'default',
  class: className = '',
}: {
  children?: Snippet;
  color?: string | null;
  class?: string;
} = $props();
</script>

<section class="section section-{color ?? 'default'} {className}">
  {#if children}
    {@render children()}
  {/if}
</section>

<style>
  .section {
    flex: 1;
    position: relative;
    transition: background-color 150ms ease-out;
    overflow: hidden;
  }

  .section-default {
    background-color: var(--bg-page);
    color: var(--text-primary);
  }

  .section-tint {
    background-color: var(--bg-tint);
    color: var(--text-primary);
  }

  .section-primary {
    background: linear-gradient(135deg, var(--theme-500), var(--theme-700));
    color: var(--theme-on);
  }
</style>
