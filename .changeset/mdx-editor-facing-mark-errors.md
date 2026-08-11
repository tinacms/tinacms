---
"@tinacms/mdx": patch
---

The errors raised for formatting combinations that cannot be saved now say what to change.

Applying inline code and then bolding a word inside it used to fail with "Marks inside inline code are not supported". The raw markdown editor shows that message verbatim in the field, so a content editor was handed a Slate term and no indication of which formatting to undo. It now reads "Inline code can't have other formatting on it. Remove the formatting from the code text." The equivalent message for highlighted text was reworded the same way.
