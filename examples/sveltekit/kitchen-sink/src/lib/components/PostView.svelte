<script lang="ts">
import PostDetail from './tina/PostDetail.svelte';
import type { QueryResult } from '@tinacms/sveltekit/data';
import type { PostQuery } from '#tina/__generated__/types.ts';

let { query }: { query: QueryResult<PostQuery> } = $props();
</script>

<PostDetail {query} />
