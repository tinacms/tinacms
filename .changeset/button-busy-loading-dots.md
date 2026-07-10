---
"tinacms": patch
---

`Button` now renders the shared loading-dots indicator automatically when `busy`, so every busy button gets a consistent spinner instead of each call site wiring its own (and some, like the account password form, were missing it entirely). The dots inherit the button text color so they stay visible across variants.
