<script lang="ts">
import { onMount } from 'svelte';
import { afterNavigate } from '$app/navigation';

let refreshForms: (() => void) | undefined;

afterNavigate(() => refreshForms?.());

onMount(() => {
  if (window.parent === window) return;

  let active = true;
  const bridgeUrl = new URL('/admin/bridge.js', window.location.href).href;

  void import(/* @vite-ignore */ bridgeUrl)
    .then((bridge) => {
      if (!active) return;
      bridge.init();
      refreshForms = bridge.refreshForms;
    })
    .catch((error: unknown) => {
      console.error(
        '[@tinacms/sveltekit] could not load the Tina bridge',
        error
      );
    });

  return () => {
    active = false;
    refreshForms = undefined;
  };
});
</script>
