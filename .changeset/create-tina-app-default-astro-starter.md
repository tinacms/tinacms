---
"create-tina-app": minor
---

Make Astro the default starter. The interactive `What starter code would you like to use?` prompt now pre-selects `Astro Starter` (moved to the top of the list). When `create-tina-app` runs without a TTY and without a `--template` flag, the Astro starter is now selected automatically instead of the prompt receiving empty input and exiting as `user cancelled`.

Note that a fully non-interactive run still needs `--pkg-manager` and a project name. Those two prompts have no non-TTY fallback yet, so a bare `create-tina-app` in CI still stops at the package manager question.
