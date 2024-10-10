---
'next-tinacms-dos': patch
---

When hosted on Vercel and if the query parameters contain an encoded slash they will be split into and array of strings. This leads to elements in a folder not getting deleted because the objectKey is just the name of the first folder. This patch is aiming to solve that by rebuilding the objectKey including its paths.
