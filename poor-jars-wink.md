---
@tinacms/toolkit: patch
---

Update rich-text editor with some

- Use our own components instead of the out-of-the box ones from Plate
- Fix handling focus and selection of block/inline embeds
- Fixes inconsistencies with deleting and adding elements for uncollapsed collections
- For links, instead of a window prompt to get the value, use a Tina form (like the image field)
- Toolbar is now sticky so that it moves down the screen as you scroll
- Support for quick action slash command to MDX elements
