---
'@tinacms/toolkit': patch
'@tinacms/mdx': patch
---

Some fixes around image handling in the rich-text editor

- Stop treating images as block-level
- Fix issue where images inside links were being stripped out
- Fix display of .avif images in the media manager
