---
"create-tina-app": minor
---

Make Astro the default starter. The interactive `What starter code would you like to use?` prompt now pre-selects `Astro Starter` (moved to the top of the list), and when `create-tina-app` is invoked in a non-interactive context (no TTY) without a `--template` flag, the Astro starter is selected automatically instead of the prompt receiving empty input and exiting as `user cancelled`.
