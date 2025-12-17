---
"@tinacms/graphql": patch
---

fix: Security patch to prevent arbitrary code execution in markdown frontmatter

This fixes a security vulnerability where the `gray-matter` package executes JavaScript code by default when processing markdown files with `---js`, `---javascript`, or `---coffee` frontmatter delimiters. Attackers who could control markdown file content could exploit this to execute arbitrary code on the server.

The fix disables JavaScript and CoffeeScript engines in frontmatter parsing. Valid frontmatter formats (YAML, TOML, JSON) continue to work normally, including storing JSX/HTML as string data.

**Breaking Change:** If your content files use `---js`, `---javascript`, or `---coffee` frontmatter delimiters, they will now throw an error. You should migrate these files to use YAML, TOML, or JSON frontmatter instead