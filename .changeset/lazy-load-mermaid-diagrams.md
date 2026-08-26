---
'tinacms': patch
---

Download the mermaid diagram library only when a document actually contains a mermaid code block. The rich-text editor imported mermaid at the top of its code-block component, so the admin shipped the whole library to every editor session even when no project file used a diagram. The import now happens inside the code that parses and renders a diagram, which lets the bundler split mermaid into its own chunk. In the kitchen-sink admin build the entry chunk drops from 6,339,116 to 5,698,025 bytes (1,974,875 to 1,823,566 gzipped), and the 635,594-byte mermaid chunk (150,677 gzipped) is fetched on demand instead. A diagram preview shows a placeholder while the chunk loads, and a chunk that fails to load is reported in the same place the editor already reports diagram syntax errors.
