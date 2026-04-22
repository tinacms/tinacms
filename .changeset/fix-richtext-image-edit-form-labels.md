---
"tinacms": patch
---

Fix rich-text image edit form: the URL field now shows the correct `URL` label and loads the existing image (previously it displayed the raw field path like `body.children[10].props.url` and rendered as an empty upload dropzone). The breadcrumb for the image form also now reads "Image" instead of the full path.
