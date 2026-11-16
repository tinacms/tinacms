<script lang="ts">
import type { Snippet } from 'svelte';

type ContainerSize = 'custom' | 'small' | 'medium' | 'large' | 'default';
type ContainerWidth = 'small' | 'medium' | 'large' | 'custom';

let {
  children,
  size = 'medium',
  width = 'large',
  class: className = '',
}: {
  children?: Snippet;
  size?: ContainerSize;
  width?: ContainerWidth;
  class?: string;
} = $props();
</script>

<div class="container container-{width} padding-{size} {className}">
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    box-sizing: border-box;
  }

  .container-small {
    max-width: 56rem; /* 896px */
  }

  .container-medium {
    max-width: 64rem; /* 1024px */
  }

  .container-large {
    max-width: 80rem; /* 1280px */
  }

  .container-custom {
    max-width: 100%;
  }

  .padding-small {
    padding-top: var(--space-8);
    padding-bottom: var(--space-8);
  }

  .padding-medium,
  .padding-default {
    padding-top: var(--space-12);
    padding-bottom: var(--space-12);
  }

  .padding-large {
    padding-top: var(--space-24);
    padding-bottom: var(--space-24);
  }

  .padding-custom {
    padding-top: 0;
    padding-bottom: 0;
  }
</style>
