<script lang="ts">
import '#lib/styles/theme.css';
import TinaBridge from '@tinacms/sveltekit/TinaBridge.svelte';
import { useTina } from '@tinacms/sveltekit/use-tina';
import favicon from '#lib/assets/favicon.svg';
import Footer from '#lib/components/layout/Footer.svelte';
import Header from '#lib/components/layout/Header.svelte';
import type { LayoutProps } from './$types';

let { data, children }: LayoutProps = $props();

const tina = useTina(() => data.globalQuery);
const globalData = $derived(tina.data.global);

const header = $derived(globalData?.header);
const footer = $derived(globalData?.footer);
const theme = $derived(globalData?.theme);
const themeColor = $derived(theme?.color || 'blue');
const nav = $derived(
  header?.nav || [
    { href: '/', label: 'Home' },
    { href: '/posts', label: 'Posts' },
    { href: '/blog', label: 'Blog' },
    { href: '/authors', label: 'Authors' },
  ]
);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-root" data-theme={themeColor}>
  <TinaBridge />
  <Header
    name={header?.name || 'Tina Kitchen Sink'}
    color={header?.color || 'default'}
    {nav}
    {themeColor}
  />
  <main class="site-main">
    {@render children()}
  </main>
  <Footer social={footer?.social || []} />
</div>

<style>
  .app-root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .site-main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
