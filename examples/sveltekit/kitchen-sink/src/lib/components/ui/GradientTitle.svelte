<script lang="ts">
import type { Snippet } from 'svelte';

let {
  children,
  size = '6xl',
  as = 'h1',
  class: className = '',
  'data-tina-field': dataTinaField,
}: {
  children?: Snippet;
  size?: '5xl' | '6xl';
  as?: 'h1' | 'h2';
  class?: string;
  'data-tina-field'?: string;
} = $props();
</script>

{#if as === 'h2'}
  <h2 class="gradient-title size-{size} {className}" data-tina-field={dataTinaField}>
    <span class="gradient-text">
      {#if children}
        {@render children()}
      {/if}
    </span>
  </h2>
{:else}
  <h1 class="gradient-title size-{size} {className}" data-tina-field={dataTinaField}>
    <span class="gradient-text">
      {#if children}
        {@render children()}
      {/if}
    </span>
  </h1>
{/if}

<style>
  .gradient-title {
    width: 100%;
    position: relative;
    margin-top: 0;
    margin-bottom: var(--space-8);
    font-weight: 800;
    text-align: center;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .size-5xl {
    font-size: clamp(2rem, 5vw, 3rem);
  }

  .size-6xl {
    font-size: clamp(2.5rem, 6vw, 3.75rem);
  }

  .gradient-text {
    background: linear-gradient(to right, var(--theme-400), var(--theme-600));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
</style>
