<script lang="ts">
import { useTina } from '../../use-tina.svelte';
import type { QueryResult } from '../../data';

let { query }: { query: QueryResult<{ title: string }> } = $props();
const tina = useTina(() => query);
</script>

<h1>{tina.data.title}</h1>
