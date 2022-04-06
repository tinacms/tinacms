---
title: Style Guide
id: /docs/contributing/style-guide
prev: /docs/contributing/troubleshooting
next: null
---

This document should be used as a guideline when writing documentation and blog posts on [tinacms.org](http://tinacms.org)

## Brand

- Capitalization: Tina, TinaCMS
- When discussing the project as a whole, **Tina** and **TinaCMS** can be used interchangeably.
- Prefer **Tina** over **TinaCMS** when discussing specific packages or components and their relation to the project.
  - _Example: "The sidebar is the primary interface in **Tina**."_

## Tone

- Aim for a friendly, personal tone
- Documentation and tutorials should feel free to address the reader
  - _Example: "If **you** want to see a glimpse of what **you** can do with a blocks-based content strategy, fork Tina Grande and give it a try."_
- Tutorial steps should use an inclusive POV ("we" over "you")
  - _Example:"**Let’s** say, instead of a single name, **we’re** storing a list of names like this:"_
- While you don't need to follow it dogmatically, running your drafts through the [Hemingway Editor](http://hemingwayapp.com/) can help identify overly complicated prose.

## Formatting

- Inline and block `code tags` should be reserved **exclusively** for communicating code.
  - "Code" in this case can include source code, terminal commands, variable names, and package names.
  - The above is not meant to be an exhaustive list, but use your best judgement.
  - Avoid `code tags` when discussing interface elements (such as navigation menus and in-app actions). Opt for **bold** text instead.
  - Code blocks should be made [copy-able](https://github.com/tinacms/tinacms.org/blob/master/README.md#copy-able-code-block) unless they show more context then should be copied (i.e. `diffs`)
- Important concepts should be formatted in **bold (strong emphasis)**.
- Other points of emphasis can be formatted in _italics (normal emphasis)_, or **bold (strong emphasis)** as appropriate.
- When _an emphasized phrase_ appears near a **highlighted concept**, opt for _italics_ over **bold** for the former.
- **Avoid emphasis fatigue!** Too much emphasized text clustered together will lose its emphasis. Over-reliance on emphasis may indicate a lack of clarity in the writing.

### Headings

- Each document should have a single top-level heading. On the tinacms.org website, this is handled by the `title` front matter field.
- Headings should follow strict hierarchy. Don't nest an `h3` directly inside an `h1` without an `h2` in between.
- Don't nest headings more than three levels deep, inclusive of the top-level heading (`h1` > `h2` > `h3`). If you find the need to use a fourth-level heading, consider reorganizing the document or splitting it up.
- Headings can include _italics_, but avoid **bold text** or `code tags`.
  - Use _italics_ formatting for code-like items when present in headings
- Make an effort to capitalize titles appropriately. Check out [title.sh](https://title.sh/) for help.

### Links

- Avoid using `code tags` in [links](https://tinacms.org).
- [Links](https://tinacms.org) should stand out _consistently_ from their surrounding text; avoid applying additional formatting. _[Links](https://tinacms.org) appearing within emphasized text_ may be [**formatted**](https://tinacms.org) **appropriately**.
- Link text should flow naturally in prose and relate semantically to the link target. Basically, just don't use "[click here](https://tinacms.org)".
  - _Example: "swing by [our community forum](https://community.tinacms.org/)"_
