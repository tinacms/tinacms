---
"@tinacms/app": patch
"@tinacms/mdx": patch
"tinacms": patch
---

Harden cross-window message handling and rich-text URL sanitization.

Adds stricter origin/source checks for trusted message flows, use explicit target origins for preview iframe message, and applies URL sanitization to slatejson rich-text parsing and default rich-text link/image rendering.
