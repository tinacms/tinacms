<script lang="ts">
import { withBase } from '#lib/utils.ts';
import Container from './Container.svelte';
import Icon from './Icon.svelte';

export interface SocialLink {
  icon?: string | null;
  url?: string | null;
}

let {
  social = [],
}: {
  social?: Array<SocialLink | null>;
} = $props();
</script>

<footer class="site-footer">
  <Container size="small" class="footer-container">
    <div class="footer-inner">
      <a href={withBase('/')} class="footer-brand" aria-label="Home">
        <Icon data={{ name: 'Tina', style: 'float', size: 'small' }} class="footer-icon" />
      </a>

      <div class="social-links">
        {#each social ?? [] as item, i (i)}
          {#if item?.url}
            {@const iconName = item.icon?.toLowerCase() ?? ''}
            <a href={item.url} target="_blank" rel="noopener noreferrer" class="social-link" aria-label={iconName || 'Social'}>
              {#if iconName === 'github'}
                <svg viewBox="0 0 24 24" fill="currentColor" class="social-svg">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                </svg>
              {:else if iconName === 'twitter'}
                <svg viewBox="0 0 24 24" fill="currentColor" class="social-svg">
                  <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74A11.64 11.64 0 0 1 3.39 4.88a4.1 4.1 0 0 0 1.27 5.48 4.07 4.07 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.4a11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.36 8.36 0 0 0 22 5.8z"/>
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="currentColor" class="social-svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              {/if}
            </a>
          {/if}
        {/each}
      </div>
    </div>
  </Container>
</footer>

<style>
  .site-footer {
    border-top: 1px solid var(--border-subtle);
    background-color: var(--bg-surface);
    color: var(--text-secondary);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .footer-brand {
    opacity: 0.7;
    transition: opacity 150ms ease;
  }

  .footer-brand:hover {
    opacity: 1;
  }

  .social-links {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .social-link {
    color: var(--text-muted);
    transition: color 150ms ease;
    display: inline-flex;
    align-items: center;
  }

  .social-link:hover {
    color: var(--theme-500);
  }

  .social-svg {
    width: 1.5rem;
    height: 1.5rem;
  }
</style>
