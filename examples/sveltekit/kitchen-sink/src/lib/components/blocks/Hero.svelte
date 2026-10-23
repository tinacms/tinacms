<script lang="ts">
import { tinaField } from '@tinacms/sveltekit';
import TinaMarkdown from '@tinacms/sveltekit/TinaMarkdown.svelte';
import { sanitizeImageSrc } from '#lib/utils.ts';
import Actions from '../layout/Actions.svelte';
import Container from '../layout/Container.svelte';
import Section from '../layout/Section.svelte';
import { customComponents } from '../markdown/index.ts';

let { data }: { data: any } = $props();

const imgSrc = $derived(
  data.image?.src ? sanitizeImageSrc(data.image.src) : ''
);
const isPrimary = $derived(data.color === 'primary');
</script>

<Section color={data.color}>
  <Container size="large" class="hero-container">
    <div class="hero-content">
      {#if data.tagline}
        <h2 data-tina-field={tinaField(data, 'tagline')} class="hero-tagline">
          {data.tagline}
        </h2>
      {/if}

      {#if data.headline}
        <h3 data-tina-field={tinaField(data, 'headline')} class="hero-headline">
          {data.headline}
        </h3>
      {/if}

      {#if data.text}
        <div data-tina-field={tinaField(data, 'text')} class="hero-text {isPrimary ? 'text-primary-mode' : ''}">
          <TinaMarkdown content={data.text} components={customComponents} />
        </div>
      {/if}

      {#if data.actions}
        <div data-tina-field={tinaField(data, 'actions')} class="hero-actions">
          <Actions parentColor={data.color} actions={data.actions} />
        </div>
      {/if}
    </div>

    {#if imgSrc}
      <div data-tina-field={tinaField(data, 'image')} class="hero-media">
        <div class="media-glow" aria-hidden="true"></div>
        <img
          src={imgSrc}
          alt={data.image?.alt || ''}
          class="hero-img"
          width="800"
          height="600"
        />
      </div>
    {/if}
  </Container>
</Section>

<style>
  :global(.hero-container) {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-12);
    align-items: center;
  }

  @media (min-width: 900px) {
    :global(.hero-container) {
      grid-template-columns: 3fr 2fr;
    }
  }

  .hero-content {
    text-align: center;
  }

  @media (min-width: 900px) {
    .hero-content {
      text-align: left;
    }
  }

  .hero-tagline {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    margin-bottom: var(--space-6);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    border-radius: var(--radius-full);
    background-color: var(--theme-50);
    color: var(--theme-700);
  }

  .hero-headline {
    margin: 0 0 var(--space-6) 0;
    font-size: clamp(2.25rem, 5vw, 3.5rem);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .hero-text {
    margin-bottom: var(--space-8);
    font-size: 1.15rem;
    line-height: 1.7;
    opacity: 0.9;
  }

  .hero-actions {
    display: flex;
    justify-content: center;
  }

  @media (min-width: 900px) {
    .hero-actions {
      justify-content: flex-start;
    }
  }

  .hero-media {
    position: relative;
    display: flex;
    justify-content: center;
  }

  .media-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, var(--theme-400), transparent 70%);
    filter: blur(40px);
    opacity: 0.3;
    border-radius: var(--radius-xl);
  }

  .hero-img {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 450px;
    height: auto;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
  }
</style>
