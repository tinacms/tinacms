# Branch Switcher

This plugin adds an item to the global menu that allows you to switch between branches of your repository via a dropdown menu.

## Usage with Tina Cloud

To use with Tina Cloud, all you need to do is set the `branch-switcher` feature flag in your `cmsCallback`:

```tsx
export default defineConfig({
  cmsCallback: (cms) => {
    cms.flags.set('branch-switcher', true)
    return cms
  },
})
```

Once this flag is set, the branch switcher should automatically appear in the Global Menu.
