<script lang="ts">
import { onMount } from 'svelte';
import { afterNavigate, beforeNavigate } from '$app/navigation';

let refreshForms: (() => void) | undefined;

// tinaHandle only adds a page's form payloads to full HTML responses, so inside the
// editor a navigation to another page loads the whole document instead of `__data.json`.
beforeNavigate((navigation) => {
  const { from, to, type, willUnload } = navigation;
  if (window.parent === window || willUnload || !to) return;
  if (
    from &&
    from.url.pathname === to.url.pathname &&
    from.url.search === to.url.search
  ) {
    return;
  }

  // On back/forward the browser has already moved to `to.url`, and cancelling makes
  // SvelteKit step back again, so reload the entry we're on instead.
  if (type === 'popstate') {
    location.reload();
    return;
  }

  navigation.cancel();
  location.assign(to.url.href);
});

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
