<script lang="ts">
import { tinaField } from '@tinacms/sveltekit';
import Actions from '../layout/Actions.svelte';
import Container from '../layout/Container.svelte';
import Section from '../layout/Section.svelte';

let { data }: { data: any } = $props();
</script>

<Section color={data.color}>
  <Container size="large">
    <div class="cta-inner">
      <h2 data-tina-field={tinaField(data, 'title')} class="cta-title">
        {data.title}
      </h2>
      {#if data.description}
        <div data-tina-field={tinaField(data, 'description')} class="cta-desc">
          {data.description}
        </div>
      {/if}

      {#if data.actions}
        <div data-tina-field={tinaField(data, 'actions')} class="cta-actions">
          <Actions parentColor={data.color} actions={data.actions} />
        </div>
      {/if}
    </div>
  </Container>
</Section>

<style>
  .cta-inner {
    text-align: center;
    max-width: 50rem;
    margin: 0 auto;
  }

  .cta-title {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    line-height: 1.2;
  }

  .cta-desc {
    margin-top: var(--space-4);
    font-size: 1.25rem;
    opacity: 0.9;
  }

  .cta-actions {
    margin-top: var(--space-8);
    display: flex;
    justify-content: center;
  }
</style>
