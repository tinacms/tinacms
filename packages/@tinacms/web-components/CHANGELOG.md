# @tinacms/web-components

## 0.2.3

### Patch Changes

- [#7846](https://github.com/tinacms/tinacms/pull/7846) [`3a7c39b`](https://github.com/tinacms/tinacms/commit/3a7c39b1f39ceb2a9d9aa29353465ae0f43d01d4) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update dompurify to 3.4.17 for its sanitizer hardening fixes

## 0.2.2

### Patch Changes

- [#7780](https://github.com/tinacms/tinacms/pull/7780) [`fe16aa5`](https://github.com/tinacms/tinacms/commit/fe16aa5c6585aa5d00bc51798d3716a315684097) Thanks [@kulesy](https://github.com/kulesy)! - Update dompurify to 3.4.16 and make tina-markdown render raw HTML as plain text in DOM environments where the sanitizer cannot remove unsafe markup

## 0.2.1

### Patch Changes

- [#7523](https://github.com/tinacms/tinacms/pull/7523) [`5295e07`](https://github.com/tinacms/tinacms/commit/5295e077f0d279c35686a0e481a15e33a4877e3b) Thanks [@wicksipedia](https://github.com/wicksipedia)! - The `tina-markdown` element now runs link and image URLs through the same `sanitizeUrl` guard the React and Astro renderers use, so a URL whose scheme is not on the allow list renders empty rather than being written to `href` or `src`.

## 0.2.0

### Minor Changes

- [#7392](https://github.com/tinacms/tinacms/pull/7392) [`4b7d9b9`](https://github.com/tinacms/tinacms/commit/4b7d9b9f116f7f649aae1a573c838a663f97d99d) Thanks [@brookjeynes-ssw](https://github.com/brookjeynes-ssw)! - feat: add tina-markdown web component
  feat: add visual-editing library for web components

- [#7392](https://github.com/tinacms/tinacms/pull/7392) [`4b7d9b9`](https://github.com/tinacms/tinacms/commit/4b7d9b9f116f7f649aae1a573c838a663f97d99d) Thanks [@brookjeynes-ssw](https://github.com/brookjeynes-ssw)! - Sanitise `html` / `html_inline` nodes in `tina-markdown` and add a
  `TinaMarkdown.components` map for per-node-type renderers, matching the
  `components` prop on the React and Astro renderers.

### Patch Changes

- Updated dependencies []:
  - @tinacms/bridge@0.3.1
