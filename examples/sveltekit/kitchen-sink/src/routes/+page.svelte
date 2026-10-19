<script lang="ts">
import PageRenderer from '#lib/components/tina/PageRenderer.svelte';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>TinaCMS SvelteKit Kitchen Sink</title>
</svelte:head>

<PageRenderer query={data.pageQuery} />