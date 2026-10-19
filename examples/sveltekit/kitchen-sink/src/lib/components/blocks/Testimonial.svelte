<script lang="ts">
import Section from '../layout/Section.svelte';
import Container from '../layout/Container.svelte';
import { tinaField } from '@tinacms/sveltekit';

let { data }: { data: any } = $props();
const isPrimary = $derived(data.color === 'primary');
</script>

<Section color={data.color}>
  <Container size="large">
    <blockquote class="testimonial-quote">
      <p data-tina-field={tinaField(data, 'quote')} class="quote-text {isPrimary ? 'primary-mode' : ''}">
        “{data.quote}”
      </p>

      <div class="divider"></div>

      <footer>
        <cite data-tina-field={tinaField(data, 'author')} class="quote-author {isPrimary ? 'author-primary' : ''}">
          {data.author}
        </cite>
      </footer>
    </blockquote>
  </Container>
</Section>

<style>
  .testimonial-quote {
    margin: 0 auto;
    max-width: 48rem;
    text-align: center;
  }

  .quote-text {
    margin: 0;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .divider {
    width: 4rem;
    height: 2px;
    background-color: var(--border-subtle);
    margin: var(--space-8) auto;
  }

  .quote-author {
    font-style: normal;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--theme-500);
  }

  .author-primary {
    color: var(--theme-on);
    opacity: 0.9;
  }
</style>
