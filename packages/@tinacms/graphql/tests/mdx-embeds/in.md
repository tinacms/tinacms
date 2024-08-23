---
embeds:
  defghi: |
    Quote from [Somebody](https://example.com)

    ```
    some other block
    ```
  def: |
    # Hello, world!
---

<Quote description={embeds.defghi}>
  # Hello, world!
</Quote>

---

<Quote description={embeds.def}>
  # Hello, again
</Quote>
