# TinaCMS & TinaCloud sprint review content

This folder holds TinaCMS & TinaCloud's Sprint Reviews, Retros and Forecasts, and nothing else. The site code lives in SSW's
starter, https://github.com/SSWConsulting/SSW.SprintReview.Starter, in a checkout that every team on the machine
shares. Below, `<starter>` is that checkout: `tina_starter` in the project's `sprint-emails/.project.json`, normally
`~/sprint-review-starter`. Nobody commits to it.

This folder sits inside https://github.com/tinacms/tinacms, and TinaCloud's content path points at it. It holds:

- `content/settings/settings.json`: the team name, board link, signature and logo.
- `content/sprint-review/` and `content/sprint-forecast/`: one JSON file per Sprint.
- `public/uploads/`: pictures, such as the logo and each Sprint's captured figures.
- `.claude/CLAUDE.md`: this file.

`main` there is protected, so saves and Sprint writes reach it through a reviewed PR, not a direct push.

## Run it

From the starter checkout, not from this folder:

```bash
cd <starter>
npm run dev:team -- --content <this folder>
```

The site is http://localhost:3000 and the editor is http://localhost:3000/admin. Add `--port`, `--tina-port` and
`--datalayer-port` when those are taken. One server runs per starter checkout, so stop one team's before starting
another's. `/prepare-sprint-review` leaves this folder's server running after each run, and its summary gives the
address and the command that stops it. A save in the editor writes the file in this folder, and `git status` here shows
what changed.

## Each Sprint

Run `/prepare-sprint-review` (from the ssw-scrum plugin of SSWConsulting/SSW.AISkills) before the Sprint
Review, from the folder that holds the team's `sprint-emails/.project.json` (often the product repo),
not from this folder. It reads the board and hands the data to the starter's writer, which writes Sprint N's
review and Sprint N+1's forecast here. Run it again after Sprint Planning and the forecast takes the board's plan. In
the meeting, people fill in goal outcomes, attendees, figures and the retro in Tina, then Copy for Email.

Rules for writing the files:

- Write with `node <skill>/scripts/tina-site.mjs write --site <this folder> --starter <starter> --cache <file>`. It
  runs the starter's writer from this folder after its guards, and adds the `format` field the writer needs. Never run
  `npm run write-sprint`, which writes into the starter's own content. `<starter>/docs/write-sprint.md` is the writer's
  contract.
- Never overwrite an existing Sprint file by hand. The writer only refreshes the backlog of a review that has no
  meeting notes yet, and of a forecast after Sprint Planning. `<starter>/CLAUDE.md` and `<starter>/README.md` hold the
  shape of a Sprint file (the `details` group, the rich-text fields, the Table and Call notes sections) for anyone who
  has to edit one.
- Goals, highlights, the retro, Call notes and every FROM CALL note (`fromCall`) are the team's words. Leave them
  empty for people to fill.
- An open Tina editor tab holds its own copy of the document and writes all of it back on save. After a
  script writes a file, tell anyone with it open to reload `/admin`.
- Commit with `node <skill>/scripts/tina-site.mjs commit --site <this folder> --message "<one sentence>"`, on a branch and
  never on `main`, because the command commits to whatever branch is checked out. It stages only the content files, so a
  Finder `.DS_Store` or an editor folder stays out. Never run `git add -A .` here. Before writing, run `git fetch origin
  main` and bring your branch up to date by hand, because `tina-site.mjs pull` skips a folder inside a bigger repo. Open a
  PR only when the person says so. A change lands on `main` after a maintainer approves it and the required checks pass.
  Saves at a deployed `/admin` reach `main` the same way, through the PR Editorial Workflow opens.

## Files this folder owns

All of it. Colours and section types are starter code, so they are the same for every team. For a bug or a change to
either, raise an issue on https://github.com/SSWConsulting/SSW.SprintReview.Starter, so every team gets it.

## Pulling starter changes

Run `/prepare-sprint-review`, which asks before it updates the starter checkout. Its pull step skips this folder, so bring
your clone up to date by hand first, because the migration rewrites these files and a later merge can collide with them. The starter's main is not protected, so read what is incoming before the checkout moves to it. From
`~/sprint-review-starter` (or wherever `tina_starter` points), with `tina-site.mjs` from the skill. `<skill>` is the
prepare-sprint-review skill's folder, which Claude Code shows as the skill's base directory when the skill loads:

```bash
node <skill>/scripts/tina-site.mjs update --check --starter <starter> --site <this folder>
node <skill>/scripts/tina-site.mjs stop --site <this folder> --starter <starter>   # update --to refuses while a server runs
node <skill>/scripts/tina-site.mjs update --to <sha> --starter <starter> --site <this folder>
```

`--check` prints `UP TO DATE` or `BEHIND`, then one line per incoming commit with its author and subject, then a `CODE`
line naming the code files the update changes. Anyone who pushes writes their own author and subject, so read the `CODE`
line too, then pass `--to` the sha on the `BEHIND` line, the only one it takes. `update` fast-forwards the starter to exactly that commit, runs `npm ci` when it is needed
and migrates this folder. A starter from before content folders has no `scripts/dev-team.mjs`, and `update` stops there
rather than rewrite the starter's own samples. The migration brings saved Sprints to the new schema and changes nothing
when they are up to date. Commit what it changed on a branch, then open a PR when the person says so.
