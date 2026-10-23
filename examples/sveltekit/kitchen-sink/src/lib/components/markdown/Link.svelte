<script lang="ts">
import type { Snippet } from 'svelte';
import { sanitizeHref } from '#lib/utils.ts';

let { url, children }: { url: string; children?: Snippet } = $props();
</script>

<a href={sanitizeHref(url)}>{@render children?.()}</a>
