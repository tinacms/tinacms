---
'@tinacms/schema-tools': minor
'@tinacms/cli': minor
---

Support custom VitePlugins in the Tina config. This is intended to provide advanced ways to customise the Admin Portal build output. One example use case is to provide a custom tailwind plugin (similar to the TinaTailwind plugin) and build CSS for any custom React components we load in the Tina Admin portal via Tina field plugins. Otherwise the Tailwind classes we use in Tina field plugins do not appear in the Tina Admin portal CSS.
