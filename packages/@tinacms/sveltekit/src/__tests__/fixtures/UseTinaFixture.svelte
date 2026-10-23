<script lang="ts">
import type { QueryResult } from '../../data';
import { useTina } from '../../use-tina.svelte';

let { query }: { query: QueryResult<{ title: string }> } = $props();
// biome-ignore lint/correctness/useHookAtTopLevel: useTina is a Svelte function, not a React hook.
const tina = useTina(() => query);
</script>

<h1>{tina.data.title}</h1>
