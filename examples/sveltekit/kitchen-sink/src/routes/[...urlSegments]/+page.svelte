<script lang="ts">
import PageRenderer from '#lib/components/tina/PageRenderer.svelte';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>

<PageRenderer query={data.pageQuery} />
