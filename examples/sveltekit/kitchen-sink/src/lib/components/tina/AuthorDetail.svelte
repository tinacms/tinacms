<script lang="ts">
import Section from '../layout/Section.svelte';
import Container from '../layout/Container.svelte';
import GradientTitle from '../ui/GradientTitle.svelte';
import Badge from '../ui/Badge.svelte';
import NoData from '../ui/NoData.svelte';
import { tinaField } from '@tinacms/sveltekit';
import type { QueryResult } from '@tinacms/sveltekit/data';
import { useTina } from '@tinacms/sveltekit/use-tina';
import { sanitizeImageSrc } from '#lib/utils.ts';

let { query }: { query: QueryResult<any> } = $props();

const tina = useTina(() => query);

const author = $derived(tina.data?.author);

const avatarSrc = $derived(
  author?.avatar ? sanitizeImageSrc(author.avatar) : ''
);
</script>

{#if !author}
  <NoData message="No author found" />
{:else}
  <Section class="author-section">
    <Container width="small" size="large">
      <div class="author-profile">
        {#if avatarSrc}
          <img
            src={avatarSrc}
            alt={author.name || ''}
            class="profile-avatar"
            width="128"
            height="128"
            data-tina-field={tinaField(author, 'avatar')}
          />
        {/if}

        <GradientTitle size="5xl" data-tina-field={tinaField(author, 'name')}>
          {author.name}
        </GradientTitle>

        {#if author.description}
          <p class="profile-bio" data-tina-field={tinaField(author, 'description')}>
            {author.description}
          </p>
        {/if}
      </div>

      {#if author.hobbies && author.hobbies.length > 0}
        <div class="hobbies-box" data-tina-field={tinaField(author, 'hobbies')}>
          <h3 class="hobbies-heading">Hobbies & Interests</h3>
          <div class="hobbies-tags">
            {#each author.hobbies as hobby, i (i)}
              {#if hobby}
                <Badge>{hobby}</Badge>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </Container>
  </Section>
{/if}

<style>
  :global(.author-section) {
    min-height: 80vh;
  }

  .author-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: var(--space-12);
  }

  .profile-avatar {
    width: 8rem;
    height: 8rem;
    border-radius: var(--radius-full);
    object-fit: cover;
    margin-bottom: var(--space-6);
    box-shadow: var(--shadow-md);
  }

  .profile-bio {
    font-size: 1.125rem;
    color: var(--text-secondary);
    max-width: 40rem;
    margin: 0;
    line-height: 1.7;
  }

  .hobbies-box {
    margin-top: var(--space-8);
    padding: var(--space-6);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
  }

  .hobbies-heading {
    margin: 0 0 var(--space-4) 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .hobbies-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
</style>
