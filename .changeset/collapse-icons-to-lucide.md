---
"@tinacms/app": patch
"tinacms": patch
---

Collapse three icon libraries into `lucide-react` (~85 MB).

`tinacms` declared `react-icons` (84 MB), `lucide-react` (32 MB) and `@heroicons/react` as production dependencies, so every user installed all three. Icon usage is entirely internal admin chrome — there is no icon-picker, no `icon` schema field type, and no dynamic whole-set import — so `react-icons` and `@heroicons/react` have been removed in favour of `lucide-react`, which was already the de-facto house set.

Not a breaking change for user content, schemas, or plugins: `ScreenPlugin.Icon` is typed `any`, and `CloudConfigOptions` is not publicly exported. The internal `IconType` prop type is now lucide's `LucideIcon`.

Six icons have no exact lucide counterpart and were substituted: `BsCheckCircleFill`/`BsExclamationOctagonFill` → `CircleCheck`/`OctagonAlert` (lucide is outline-only), `MdSyncProblem` → `RefreshCwOff`, `TbLogs` → `ScrollText`, `BiRename` → `SquarePen`, `MdOutlineDataSaverOff` → `Info`.
