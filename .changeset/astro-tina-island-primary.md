---
"@tinacms/astro": minor
"@tinacms/bridge": minor
---

`<TinaIsland>`: add a `primary` prop so the editor opens the page's main form

When a preview page registers more than one editable form — typically the page document plus a global-config form fetched in the layout — the admin would sometimes land on the multi-document "Referenced Files" list instead of opening the page's form. There was no signal telling the admin which form is primary, and its fallback heuristic (auto-open the first non-global form, but only for the first form list it processes) loses the race when the global form is processed first.

Now: pass `primary` on your page's main `<TinaIsland>` (e.g. `<TinaIsland name="post" params={{ slug }} primary>`). The bridge sends a `user-select-form` to the admin for that form on load, so the editor opens it directly. On `output: 'server'` pages it's optional — the page's first `requestWithMetadata()` call is treated as primary automatically (the middleware marks the first injected `data-tina-form` payload); on `output: 'static'` pages set `primary` explicitly, since the bridge can't otherwise tell which island endpoint is "the page". Mark at most one `<TinaIsland>` per page. If nothing is marked primary, behaviour is unchanged.
