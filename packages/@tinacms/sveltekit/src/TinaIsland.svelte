<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  name: string;
  wrapper: { tag: string; className?: string };
  params?: Record<string, string | number>;
  primary?: boolean;
  managed?: boolean;
  basePath?: string;
  children?: Snippet;
}

let {
  name,
  wrapper,
  params,
  primary = false,
  managed = false,
  basePath = '',
  children,
}: Props = $props();

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const marker = $derived.by(() =>
  buildIslandMarker(name, wrapper.tag, params, basePath)
);

function buildIslandMarker(
  islandName: string,
  wrapperTag: string,
  islandParams: Props['params'],
  pathBase: string
): string {
  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(islandName)) {
    throw new TypeError('Tina island name must be a valid URL path segment');
  }
  if (
    !/^[A-Za-z][A-Za-z0-9-]*$/.test(wrapperTag) ||
    VOID_ELEMENTS.has(wrapperTag.toLowerCase())
  ) {
    throw new TypeError('Tina island wrapper must be a non-void HTML tag');
  }
  if (pathBase && (!pathBase.startsWith('/') || pathBase.startsWith('//'))) {
    throw new TypeError('Tina island basePath must be a local path');
  }

  const base = pathBase.replace(/\/+$/, '');
  const endpoint = `${base}/tina-island/${encodeURIComponent(islandName)}`;
  if (!islandParams) return endpoint;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(islandParams)) {
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${endpoint}?${query}` : endpoint;
}
</script>

<svelte:element
  this={wrapper.tag}
  class={wrapper.className}
  data-tina-island={marker}
  data-tina-island-primary={primary ? '' : undefined}
  data-tina-island-managed={managed ? '' : undefined}
>
  {@render children?.()}
</svelte:element>
