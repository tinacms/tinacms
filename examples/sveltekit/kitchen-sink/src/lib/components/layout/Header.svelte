<script lang="ts">
import { isFileLink, sanitizeHref, withBase } from '#lib/utils.ts';
import Container from './Container.svelte';
import Icon from './Icon.svelte';

export interface NavItem {
  href?: string | null;
  label?: string | null;
}

let {
  name = 'Tina Kitchen Sink',
  color = 'default',
  nav = [],
  themeColor = 'blue',
}: {
  name?: string;
  color?: string;
  nav?: Array<NavItem | null>;
  themeColor?: string;
} = $props();

let mobileNavOpen = $state(false);
const isPrimary = $derived(color === 'primary');
</script>

<header class="site-header {isPrimary ? 'header-primary' : 'header-default'}">
  <Container size="custom" class="header-container">
    <div class="header-inner">
      <a href={withBase('/')} class="brand-link">
        <Icon
          data={{ name: 'Tina', style: 'float', size: 'small' }}
          parentThemeColor={themeColor}
          class="brand-icon"
        />
        <span class="brand-name">{name}</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="desktop-nav">
        {#each nav ?? [] as item, i (i)}
          {#if item}
            {@const href = sanitizeHref(item.href, withBase('/'))}
            <a {href} data-sveltekit-reload={isFileLink(href) || undefined} class="nav-link {isPrimary ? 'nav-link-primary' : ''}">
              {item.label}
            </a>
          {/if}
        {/each}
      </nav>

      <!-- Mobile Toggle -->
      <button
        type="button"
        class="mobile-toggle"
        aria-label="Toggle navigation menu"
        onclick={() => (mobileNavOpen = !mobileNavOpen)}
      >
        <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          {#if mobileNavOpen}
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          {/if}
        </svg>
      </button>
    </div>

    <!-- Mobile Drawer -->
    {#if mobileNavOpen}
      <nav class="mobile-drawer">
        {#each nav ?? [] as item, i (i)}
          {#if item}
            {@const href = sanitizeHref(item.href, withBase('/'))}
            <a
              {href}
              data-sveltekit-reload={isFileLink(href) || undefined}
              class="mobile-nav-link"
              onclick={() => (mobileNavOpen = false)}
            >
              {item.label}
            </a>
          {/if}
        {/each}
      </nav>
    {/if}
  </Container>
</header>

<style>
  .site-header {
    position: relative;
    border-bottom: 1px solid var(--border-subtle);
    transition: background-color 150ms ease-out;
  }

  .header-default {
    background-color: var(--bg-surface);
    color: var(--text-primary);
  }

  .header-primary {
    background: linear-gradient(to bottom, var(--theme-500), var(--theme-700));
    color: var(--theme-on);
    border-bottom-color: transparent;
  }

  :global(.header-container) {
    padding-top: var(--space-3) !important;
    padding-bottom: var(--space-3) !important;
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 1.125rem;
    font-weight: 700;
    text-decoration: none;
    color: inherit;
  }

  .brand-name {
    letter-spacing: -0.02em;
  }

  .desktop-nav {
    display: none;
    align-items: center;
    gap: var(--space-6);
  }

  @media (min-width: 640px) {
    .desktop-nav {
      display: flex;
    }
  }

  .nav-link {
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--text-secondary);
    transition: color 150ms ease;
  }

  .nav-link:hover {
    color: var(--theme-500);
  }

  .nav-link-primary {
    color: rgba(255, 255, 255, 0.9);
  }

  .nav-link-primary:hover {
    color: #ffffff;
  }

  .mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: var(--space-2);
  }

  @media (min-width: 640px) {
    .mobile-toggle {
      display: none;
    }
  }

  .toggle-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .mobile-drawer {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding-top: var(--space-4);
    padding-bottom: var(--space-4);
    border-top: 1px solid var(--border-subtle);
  }

  @media (min-width: 640px) {
    .mobile-drawer {
      display: none;
    }
  }

  .mobile-nav-link {
    font-size: 1.1rem;
    font-weight: 500;
    padding: var(--space-2) 0;
  }
</style>
