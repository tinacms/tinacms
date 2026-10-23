<script lang="ts">
import { tinaField } from '@tinacms/sveltekit';
import TinaMarkdown from '@tinacms/sveltekit/TinaMarkdown.svelte';
import Container from '../layout/Container.svelte';
import Section from '../layout/Section.svelte';
import { customComponents } from '../markdown/index.ts';

let { data }: { data: any } = $props();
</script>

<Section color={data.color}>
  <Container size="large" width="medium" class="content-block-container">
    <div data-tina-field={tinaField(data, 'body')} class="content-body">
      <TinaMarkdown content={data.body} components={customComponents} />
    </div>
  </Container>
</Section>

<style>
  .content-body {
    font-size: 1.125rem;
    line-height: 1.8;
  }
</style>
