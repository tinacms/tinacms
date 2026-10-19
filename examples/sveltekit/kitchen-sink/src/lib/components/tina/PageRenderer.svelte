<script lang="ts">
import Blocks from '../blocks/Blocks.svelte';
import { tinaField } from '@tinacms/sveltekit';
import type { QueryResult } from '@tinacms/sveltekit/data';
import { useTina } from '@tinacms/sveltekit/use-tina';

let { query }: { query: QueryResult<any> } = $props();
const tina = useTina(() => query);

const page = $derived(tina.data?.page);
</script>

{#if !page}
  <div class="page-error">Error: No page data found</div>
{:else}
  <div data-tina-field={tinaField(page, 'blocks')}>
    {#if page.blocks && page.blocks.length > 0}
      <Blocks blocks={page.blocks} />
    {:else}
      <div class="empty-page">No blocks to display</div>
    {/if}
  </div>
{/if}

<style>
  .page-error {
    padding: var(--space-8);
    color: #dc2626;
    text-align: center;
  }

  .empty-page {
    padding: var(--space-8);
    text-align: center;
    color: var(--text-muted);
  }
</style>
