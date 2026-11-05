<script lang="ts">
import type { CodeBlockComponentProps } from '../../types';

let { value, lang }: CodeBlockComponentProps = $props();
</script>

<figure data-testid="code-block-override" data-language={lang}>
  <figcaption>{lang}</figcaption>
  <pre>{value}</pre>
</figure>
