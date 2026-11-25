# TinaCloud deploy guide: script and scenes

Source material for the YouTube guide in [Make a YouTube guide for the TinaCloud Deploy to Vercel and Deploy to Cloudflare flows (#8100)](https://github.com/tinacms/tinacms/issues/8100). A human records the voice-over, syncs it to the stills, renders and uploads the video.

- `script.md`: the narration, one section per scene, with tab, screen state, wizard step, click target and duration.
- `labels.md`: where every on-screen TinaCloud string comes from, plus the sources for Vercel and Cloudflare labels.
- `<scene ID>-<slug>.html`: one self-contained scene per file (inline CSS, system fonts, no scripts, no network requests).
- `<scene ID>-<slug>.png`: the 1920×1080 still rendered from the HTML file with the same name.
- `deploy-vercel.svg`, `deploy-cloudflare.svg`: the hosts' published deploy badges, stored here so the scenes render offline.

## Render a still

Run from `playwright/tina-playwright` (it uses the repo's existing Playwright install, so nothing new is installed):

```sh
cd playwright/tina-playwright
pnpm exec playwright screenshot --viewport-size=1920,1080 \
  "file://$(git rev-parse --show-toplevel)/_docs/videos/tinacloud-deploy-guide/C7-cloudflare-confirm-worker.html" \
  "$(git rev-parse --show-toplevel)/_docs/videos/tinacloud-deploy-guide/C7-cloudflare-confirm-worker.png"
```

To render every still, three at a time:

```sh
cd playwright/tina-playwright
D="$(git rev-parse --show-toplevel)/_docs/videos/tinacloud-deploy-guide"
for f in "$D"/*.html; do echo "$f"; done | xargs -P 3 -n 1 sh -c \
  'pnpm exec playwright screenshot --viewport-size=1920,1080 "file://$0" "${0%.html}.png"'
```

The command writes only the PNG next to its HTML file. If Playwright says a browser is missing, run `pnpm exec playwright install chromium` in the same folder first.

## Size

The 21 PNGs total 3.3 MB (3,327,041 bytes).

## Before recording

The strings were checked against the TinaCloud dashboard at the commit named in `labels.md`. Compare the stills with the live TinaCloud UI before you record, since the UI may have changed since then.
