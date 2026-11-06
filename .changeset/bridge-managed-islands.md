---
"@tinacms/bridge": minor
---

Support managed islands. An island element marked `data-tina-island-managed` is kept current by a client-side framework (for example Svelte with `useTina`), so the bridge still primes it for its forms but no longer re-fetches and replaces its HTML on every edit. Replacing it detached the framework's DOM nodes, so event handlers inside the island stopped working and each edit cost a server render. Islands without the attribute behave as before.
