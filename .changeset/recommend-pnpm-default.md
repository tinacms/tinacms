---
"create-tina-app": patch
---

Recommend pnpm in the package manager prompt. pnpm now appears first and pre-selected (labelled "recommended"), with npm shown last. pnpm's stricter dependency resolution avoids version-skew issues (e.g. multiple major versions of Vite) that can break builds under npm.
