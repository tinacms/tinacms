<script lang="ts">
import BlogDetail from '#lib/components/tina/BlogDetail.svelte';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.blogQuery.data.blog.title} | Blog</title>
</svelte:head>

<BlogDetail query={data.blogQuery} />
