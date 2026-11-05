<script lang="ts">
export interface IconData {
  name?: string | null;
  color?: string | null;
  style?: string | null;
  size?: string | null;
}

let {
  data,
  class: className = '',
  parentThemeColor = 'blue',
}: {
  data?: IconData | null;
  class?: string;
  parentThemeColor?: string;
} = $props();

const name = $derived(data?.name ?? 'Tina');
const size = $derived(data?.size ?? 'medium');
const isTina = $derived(name === 'Tina');
</script>

<div class="icon-wrapper size-{size} {className}">
  {#if isTina}
    <svg viewBox="0 0 66 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
      <title>Tina</title>
      <path
        d="M39.4615 36.1782C42.763 33.4475 44.2259 17.3098 45.6551 11.5091C47.0843 5.70828 52.995 6.0025 52.995 6.0025C52.995 6.0025 51.4605 8.67299 52.0864 10.6658C52.7123 12.6587 57 14.4401 57 14.4401L56.0752 16.8781C56.0752 16.8781 54.1441 16.631 52.995 18.9297C51.8459 21.2283 53.7336 43.9882 53.7336 43.9882C53.7336 43.9882 46.8271 57.6106 46.8271 63.3621C46.8271 69.1136 49.5495 73.9338 49.5495 73.9338H45.7293C45.7293 73.9338 40.1252 67.2648 38.9759 63.9318C37.8266 60.5988 38.2861 57.2658 38.2861 57.2658C38.2861 57.2658 32.1946 56.921 26.7931 57.2658C21.3915 57.6106 17.7892 62.2539 17.1391 64.8512C16.4889 67.4486 16.2196 73.9338 16.2196 73.9338H13.1991C11.3606 68.2603 9.90043 66.2269 10.6925 63.3621C12.8866 55.4269 12.4557 50.9263 11.9476 48.9217C11.4396 46.9172 8 45.1676 8 45.1676C9.68492 41.7349 11.4048 40.0854 18.8029 39.9133C26.201 39.7413 36.1599 38.9088 39.4615 36.1782Z"
        fill="currentColor"
      />
      <path
        d="M20.25 63.03C20.25 63.03 21.0305 70.2533 25.1773 73.9342H28.7309C25.1773 69.9085 24.7897 59.415 24.7897 59.415C22.9822 60.0035 20.4799 62.1106 20.25 63.03Z"
        fill="currentColor"
      />
    </svg>
  {:else if name === 'BiTerminal'}
    <svg viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
      <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V6h16l.002 12H4z"/>
      <path d="m7.707 9.293-1.414 1.414L8.586 13l-2.293 2.293 1.414 1.414L11.414 13zM13 15h5v2h-5z"/>
    </svg>
  {:else if name === 'BiSearchAlt2'}
    <svg viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
      <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"/>
    </svg>
  {:else}
    <!-- Default Layer Icon -->
    <svg viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
      <path d="M12 2 2 7l10 5 10-5-10-5zm0 18-8-4v3l8 4 8-4v-3l-8 4zm0-5-8-4v3l8 4 8-4v-3l-8 4z"/>
    </svg>
  {/if}
</div>

<style>
  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .size-xs { width: 1.5rem; height: 1.5rem; }
  .size-small { width: 2rem; height: 2rem; }
  .size-medium { width: 3rem; height: 3rem; }
  .size-large { width: 3.5rem; height: 3.5rem; }
  .size-xl { width: 4rem; height: 4rem; }
</style>
