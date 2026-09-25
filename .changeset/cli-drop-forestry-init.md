---
"@tinacms/cli": major
---

`tinacms init` no longer migrates a Forestry site.

The command used to look for `.forestry/settings.yml`, offer to convert the Forestry templates into Tina collections, and write a `tina/templates.ts` file next to the config. That path is gone, and so is the `--forestryPath` option. Running `tinacms init` in a project that still has a `.forestry` directory now sets up TinaCMS the same way it does for any other existing site, with one `post` collection to start from.

If you still need to move a Forestry site, run the migration with `@tinacms/cli` 3.x first, then upgrade. Forestry.io was sunset in 2023, and the conversion has not changed since.

`tinacms init` also no longer runs prettier over the generated `tina/config.ts` and Next.js API route. The files now use single quotes, semicolons and a two-space indent, and their imports are merged per module and sorted. Run your own formatter over them if your project uses a different style. `prettier` is no longer a dependency of `@tinacms/cli`.
