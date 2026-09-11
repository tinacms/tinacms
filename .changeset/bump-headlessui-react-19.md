---
'@tinacms/rich-text': patch
---

Bump `@headlessui/react` from `2.1.8` to `2.2.10`. The pinned `2.1.8` release only declares a React 18 peer dependency, which produces `ERESOLVE overriding peer dependency` npm warnings for any project using React 19. `2.2.10` declares `react`/`react-dom` `^18 || ^19` and is otherwise API-compatible with the `Popover`/`PopoverButton`/`PopoverPanel`/`Transition` components already in use.
