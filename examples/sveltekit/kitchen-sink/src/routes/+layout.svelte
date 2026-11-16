<script lang="ts">
import '#lib/styles/theme.css';
import '#lib/styles/prose.css';
import TinaBridge from '@tinacms/sveltekit/TinaBridge.svelte';
import { useTina } from '@tinacms/sveltekit/use-tina';
import favicon from '#lib/assets/favicon.svg';
import Footer from '#lib/components/layout/Footer.svelte';
import Header from '#lib/components/layout/Header.svelte';
import type { LayoutProps } from './$types';

let { data, children }: LayoutProps = $props();

const FONT_STYLESHEETS: Record<string, string> = {
  nunito:
    'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap',
  lato: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap',
};

const tina = useTina(() => data.globalQuery);
const globalData = $derived(tina.data.global);

const header = $derived(globalData?.header);
const footer = $derived(globalData?.footer);
const theme = $derived(globalData?.theme);
const themeColor = $derived(theme?.color || 'blue');
const themeFont = $derived(theme?.font || 'sans');
const darkMode = $derived(theme?.darkMode || 'system');
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
  {#if FONT_STYLESHEETS[themeFont]}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href={FONT_STYLESHEETS[themeFont]} />
  {/if}
</svelte:head>

<div class="app-root" data-theme={themeColor} data-font={themeFont} data-mode={darkMode}>
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
