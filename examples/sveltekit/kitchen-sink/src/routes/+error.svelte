<script lang="ts">
import Container from '#lib/components/layout/Container.svelte';
import { withBase } from '#lib/utils.ts';
import { page } from '$app/state';
</script>

<svelte:head>
  <title>{page.status} | TinaCMS SvelteKit Kitchen Sink</title>
</svelte:head>

<Container>
  <div class="error-page">
    <h1>{page.status}</h1>
    <p>{page.status === 404 ? "Sorry, we couldn't find that page." : page.error?.message}</p>
    <a href={withBase('/')}>Return home</a>
  </div>
</Container>

<style>
  .error-page {
    padding: var(--space-8) 0;
    text-align: center;
  }

  h1 {
    font-size: 4rem;
    margin: 0;
  }

  a {
    color: var(--theme-primary);
  }
</style>
