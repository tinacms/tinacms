<script lang="ts">
import TinaIsland from '@tinacms/sveltekit/TinaIsland.svelte';
import PostView from '#lib/components/PostView.svelte';

let { data } = $props();

const slug = $derived(data.data.post._sys.breadcrumbs.join('/'));
</script>

<TinaIsland
  name="post"
  wrapper={{ tag: 'article', className: 'post-content' }}
  params={{ slug }}
  primary
  managed
>
  <PostView query={data} />
</TinaIsland>
