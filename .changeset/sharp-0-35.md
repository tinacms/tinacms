---
"next-tinacms-azure": minor
---

Bump `sharp` from `^0.33.5` to `^0.35.5`.

sharp 0.35 needs Node.js 20.9 or later. It also tunes lossy AVIF output with a new quality metric, so an AVIF served at the same `quality` setting can come out a different size. sharp 0.35 also refuses images with more than five channels, so the delivery handler now serves a TIFF like that as the original file instead of resizing it.
