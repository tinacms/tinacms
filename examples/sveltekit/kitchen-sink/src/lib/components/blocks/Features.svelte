<script lang="ts">
import Section from '../layout/Section.svelte';
import Container from '../layout/Container.svelte';
import Icon from '../layout/Icon.svelte';
import Actions from '../layout/Actions.svelte';
import Card from '../ui/Card.svelte';
import { tinaField } from '@tinacms/sveltekit';

let { data }: { data: any } = $props();

const normalizedItems = $derived(
  data.items?.map((item: any) => {
    if (typeof item === 'string') {
      return { title: item };
    }
    return item;
  }) ?? []
);

const isSimpleLayout = $derived(
  data.items?.every((item: any) => typeof item === 'string')
);
</script>

<Section color={data.color}>
  <Container size="large">
    {#if isSimpleLayout}
      <div class="features-simple">
        {#if data.title}
          <div class="header-center">
            <h2 data-tina-field={tinaField(data, 'title')} class="features-title">
              {data.title}
            </h2>
            {#if data.description}
              <p data-tina-field={tinaField(data, 'description')} class="features-desc">
                {data.description}
              </p>
            {/if}
          </div>
        {/if}

        <div class="cards-grid">
          {#each normalizedItems as item, idx (idx)}
            {#if item}
              <Card class="feature-card" data-tina-field={tinaField(item)}>
                <h3 class="card-title">{item.title}</h3>
                {#if item.text}
                  <p class="card-text">{item.text}</p>
                {/if}
              </Card>
            {/if}
          {/each}
        </div>
      </div>
    {:else}
      <div class="features-grid">
        {#each normalizedItems as block, i (i)}
          {#if block}
            <div data-tina-field={tinaField(block)} class="feature-item">
              {#if block.icon}
                <div data-tina-field={tinaField(block, 'icon')} class="feature-icon">
                  <Icon data={{ size: 'large', ...block.icon }} />
                </div>
              {/if}
              {#if block.title}
                <h3 data-tina-field={tinaField(block, 'title')} class="item-title">
                  {block.title}
                </h3>
              {/if}
              {#if block.text}
                <p data-tina-field={tinaField(block, 'text')} class="item-text">
                  {block.text}
                </p>
              {/if}
              {#if block.actions}
                <div data-tina-field={tinaField(block, 'actions')}>
                  <Actions actions={block.actions} parentColor={data.color} />
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </Container>
</Section>

<style>
  .header-center {
    text-align: center;
    margin-bottom: var(--space-12);
  }

  .features-title {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    margin: 0;
  }

  .features-desc {
    margin-top: var(--space-4);
    font-size: 1.125rem;
    opacity: 0.85;
    max-width: 42rem;
    margin-left: auto;
    margin-right: auto;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-6);
  }

  .card-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .card-text {
    margin: 0;
    color: var(--text-secondary);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-12) var(--space-8);
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    align-items: flex-start;
  }

  .item-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .item-text {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }
</style>
