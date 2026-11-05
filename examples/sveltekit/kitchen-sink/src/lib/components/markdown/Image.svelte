<script lang="ts">
import { sanitizeImageSrc } from '#lib/utils.ts';

let { url, alt, caption }: { url: string; alt?: string; caption?: string } =
  $props();
</script>

<img src={sanitizeImageSrc(url)} alt={alt ?? ''} title={caption} />
