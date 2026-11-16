<script lang="ts">
import TinaIsland from '../../TinaIsland.svelte';
</script>

<TinaIsland
  name="post"
  wrapper={{ tag: 'article', className: 'prose' }}
  params={{ slug: 'hello world', version: 2 }}
  primary
  basePath="/preview"
>
  <p>Island content</p>
</TinaIsland>
