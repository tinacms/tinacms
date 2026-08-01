---
"@tinacms/app": patch
"tinacms": patch
---

Drop `@headlessui/react` (~50 MB).

Headless UI v2 pulls in the entire React Aria stack (`react-aria` 34.8 MB, `react-stately` 9.4 MB, `@internationalized/*`) — about 50 MB installed — to provide components Radix already covers. `tinacms` was shipping three headless component libraries at once (`@radix-ui/*` in 22 files, `@headlessui/react` in 11, `@ariakit/react` in 1).

The 11 Headless UI files now use Radix (`Popover`, `DropdownMenu`) and local state, consolidating on the library that was already the majority. No new dependencies were added.

`Transition`/`TransitionChild` are replaced by a small local equivalent with the same prop API (`show`, `appear`, `enter*`/`leave*`). It uses `element.getAnimations({ subtree: true })` so a parent transition with no classes of its own still waits for its children to finish leaving before unmounting.
