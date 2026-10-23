<script lang="ts">
import AuthorDetail from '#lib/components/tina/AuthorDetail.svelte';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.authorQuery.data.author.name} | Authors</title>
</svelte:head>

<AuthorDetail query={data.authorQuery} />
