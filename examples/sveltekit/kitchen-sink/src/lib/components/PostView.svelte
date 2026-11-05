<script lang="ts">
import type { QueryResult } from '@tinacms/sveltekit/data';
import type { PostQuery } from '#tina/__generated__/types.ts';
import PostDetail from './tina/PostDetail.svelte';

let { query }: { query: QueryResult<PostQuery> } = $props();
</script>

<PostDetail {query} />
