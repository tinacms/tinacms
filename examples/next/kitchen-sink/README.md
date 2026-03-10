# TinaCMS Kitchen Sink — Next.js Example

A comprehensive [Next.js 15](https://nextjs.org) App Router example demonstrating the full breadth of [TinaCMS](https://tina.io) features. This project is used for both acceptance testing and as a reference implementation for real-world TinaCMS integrations.

## What this app demonstrates

- **Collections**: Posts, Blog, Authors, Documentation, Tags, Pages, and Global settings
- **Rich-text editing**: `TinaMarkdown` with custom components, MDX support
- **References**: Author references on Posts, Tag references on Posts and Documentation
- **Image handling**: Hero images and author avatars with `sanitizeImageSrc` guards
- **Block-based pages**: `PageBlockPage` and `PageShowcase` with multiple block types
- **Global config**: Site-wide header colour, navigation, and social links via TinaCMS
- **Search**: TinaCMS search index integration
- **GraphQL explorer**: Interactive in-app GQL query runner (`/gql`)
- **Dark mode**: Full Tailwind dark-mode support
- **Playwright E2E tests**: Baseline suite covering navigation, content pages, and the CMS admin

## Getting Started

Install dependencies (from the monorepo root):

```bash
pnpm install
```

Run the development server with TinaCMS in local mode:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app and [http://localhost:3000/admin](http://localhost:3000/admin) to open the CMS.

## Running E2E Tests

```bash
pnpm test:e2e
# or with the Playwright UI
pnpm test:e2e:ui
```

## Project Structure

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages and API routes |
| `components/` | Shared UI components (layout, blocks, markdown) |
| `content/` | Markdown/MDX content files managed by TinaCMS |
| `tina/` | TinaCMS config, collections, and generated client |
| `e2e/` | Playwright acceptance tests |

## Learn More

- [TinaCMS Documentation](https://tina.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
