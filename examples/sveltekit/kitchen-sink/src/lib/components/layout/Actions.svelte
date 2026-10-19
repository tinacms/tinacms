<script lang="ts">
import { isFileLink, sanitizeHref, withBase } from '#lib/utils.ts';
import { tinaField } from '@tinacms/sveltekit';

export interface NavAction {
  label?: string | null;
  type?: string | null;
  link?: string | null;
  icon?: boolean | null;
}

let {
  parentColor = 'default',
  class: className = '',
  actions = [],
}: {
  parentColor?: string | null;
  class?: string;
  actions?: Array<NavAction | null>;
} = $props();
</script>

<div class="actions-group {className}">
  {#each actions ?? [] as action, index (index)}
    {#if action}
      {@const isButton = action.type === 'button'}
      {@const isPrimary = parentColor === 'primary'}
      {@const href = sanitizeHref(action.link, withBase('/'))}
      <a
        {href}
        data-sveltekit-reload={isFileLink(href) || undefined}
        data-tina-field={tinaField(action as Record<string, unknown>)}
        class="action-item {isButton ? 'action-button' : 'action-link'} {isPrimary ? 'primary-mode' : 'default-mode'}"
      >
        <span>{action.label}</span>
        {#if action.icon}
          <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        {/if}
      </a>
    {/if}
  {/each}
</div>

<style>
  .actions-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4) var(--space-6);
  }

  .action-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-size: 1.125rem;
    font-weight: 600;
    transition: all 150ms ease-out;
    text-decoration: none;
    cursor: pointer;
  }

  .action-button {
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .action-button.default-mode {
    background-color: var(--theme-500);
    color: var(--theme-on);
  }

  .action-button.default-mode:hover {
    background-color: var(--theme-600);
    box-shadow: var(--shadow-md);
  }

  .action-button.primary-mode {
    background-color: #ffffff;
    color: var(--theme-500);
  }

  .action-button.primary-mode:hover {
    background-color: var(--bg-page);
  }

  .action-link.default-mode {
    color: var(--theme-500);
  }

  .action-link.default-mode:hover {
    color: var(--theme-600);
    text-decoration: underline;
  }

  .action-link.primary-mode {
    color: var(--theme-on);
  }

  .action-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-left: var(--space-2);
  }
</style>
