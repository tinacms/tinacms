<script lang="ts">
let {
  message = 'No data found',
}: {
  message?: string;
} = $props();
</script>

<div class="no-data">
  <p>{message}</p>
</div>

<style>
  .no-data {
    padding: var(--space-8);
    text-align: center;
    color: var(--text-muted);
    font-size: 1.125rem;
  }
</style>
