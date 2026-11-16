<script lang="ts">
import TinaMarkdown from '@tinacms/sveltekit/TinaMarkdown.svelte';

let {
  children,
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  disclaimer,
}: {
  children?: any;
  placeholder?: string;
  buttonText?: string;
  disclaimer?: any;
} = $props();

let email = $state('');
let submitted = $state(false);

function handleSubmit(e: SubmitEvent) {
  e.preventDefault();
  submitted = true;
  email = '';
}
</script>

<div class="newsletter-wrap">
  <div class="newsletter-inner">
    {#if children}
      <div class="newsletter-header">
        <TinaMarkdown content={children} />
      </div>
    {/if}

    {#if submitted}
      <p class="submitted-msg">Thanks for subscribing!</p>
    {:else}
      <form class="newsletter-form" onsubmit={handleSubmit}>
        <input
          type="email"
          required
          bind:value={email}
          {placeholder}
          class="newsletter-input"
        />
        <button type="submit" class="newsletter-btn">{buttonText}</button>
      </form>
    {/if}

    {#if disclaimer}
      <div class="newsletter-disclaimer">
        <TinaMarkdown content={disclaimer} />
      </div>
    {/if}
  </div>
</div>

<style>
  .newsletter-wrap {
    margin: var(--space-8) 0;
    padding: var(--space-8);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
  }

  .newsletter-inner {
    max-width: 32rem;
    margin: 0 auto;
    text-align: center;
  }

  .newsletter-header {
    margin-bottom: var(--space-6);
  }

  .newsletter-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  @media (min-width: 640px) {
    .newsletter-form {
      flex-direction: row;
    }
  }

  .newsletter-input {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    background-color: var(--bg-page);
    color: var(--text-primary);
    font-size: 1rem;
  }

  .newsletter-btn {
    padding: var(--space-3) var(--space-6);
    background-color: var(--theme-500);
    color: var(--theme-on);
    font-weight: 600;
    font-size: 1rem;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .newsletter-btn:hover {
    background-color: var(--theme-600);
  }

  .newsletter-disclaimer {
    margin-top: var(--space-4);
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .submitted-msg {
    font-weight: 600;
    color: var(--theme-500);
  }
</style>
