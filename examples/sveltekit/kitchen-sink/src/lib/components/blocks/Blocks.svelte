<script lang="ts">
import { tinaField } from '@tinacms/sveltekit';
import Content from './Content.svelte';
import CTA from './CTA.svelte';
import Features from './Features.svelte';
import Hero from './Hero.svelte';
import Testimonial from './Testimonial.svelte';

let { blocks = [] }: { blocks?: Array<any | null> } = $props();

const typeNameMap: Record<string, string> = {
  PageBlocksHero: 'hero',
  PageBlocksFeatures: 'features',
  PageBlocksCta: 'cta',
  PageBlocksTestimonial: 'testimonial',
  PageBlocksContent: 'content',
};

function getTemplate(block: any): string {
  const typename = block.__typename ?? '';
  return block._template || typeNameMap[typename] || typename;
}
</script>

{#if !blocks || blocks.length === 0}
  <div class="empty-blocks">No blocks to render</div>
{:else}
  {#each blocks as block, i (i)}
    {#if block}
      {@const template = getTemplate(block)}
      <div data-tina-field={tinaField(block)}>
        {#if template === 'hero'}
          <Hero data={block} />
        {:else if template === 'features'}
          <Features data={block} />
        {:else if template === 'cta'}
          <CTA data={block} />
        {:else if template === 'testimonial'}
          <Testimonial data={block} />
        {:else if template === 'content'}
          <Content data={block} />
        {:else}
          <div class="unknown-block">
            Unknown block type: {template}
          </div>
        {/if}
      </div>
    {/if}
  {/each}
{/if}

<style>
  .empty-blocks {
    padding: var(--space-8);
    text-align: center;
    color: var(--text-muted);
  }

  .unknown-block {
    padding: var(--space-4);
    background-color: #fef3c7;
    color: #92400e;
    border-radius: var(--radius-md);
    margin: var(--space-4);
  }
</style>
