---
'next-tinacms-dos': minor
---

Add an `accept` option to `createMediaHandler`. The handler checks each upload against it, with the same rules as `media.accept` in your Tina config. When `accept` is not set, the default media types apply. If you changed `media.accept`, pass the same value to `accept`.
