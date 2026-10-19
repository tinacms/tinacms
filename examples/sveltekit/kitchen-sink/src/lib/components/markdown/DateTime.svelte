<script lang="ts">
let {
  format = 'local',
}: {
  format?: string;
} = $props();

const now = new Date();

function formatDisplay(fmt: string): string {
  switch (fmt) {
    case 'iso':
      return now.toISOString();
    case 'utc':
      return now.toUTCString();
    case 'local':
    default:
      return now.toLocaleDateString();
  }
}

const formatted = $derived(formatDisplay(format));
</script>

<time datetime={now.toISOString()} class="date-time-badge">{formatted}</time>

<style>
  .date-time-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background-color: var(--theme-50);
    color: var(--theme-700);
  }
</style>
