# Branch Switcher

This plugin adds an item to the global menu that allows you to switch between branches of your repository via a dropdown menu.

## Usage with Tina Cloud

To use with Tina Cloud, all you need to do is set the `branch-switcher` feature flag in your `cmsCallback`:

```tsx
<TinaCMSProvider cmsCallback={(cms) => {
    cms.flags.set('branch-switcher', true)
}}>
```

Once this flag is set, the branch switcher should automatically appear in the Global Menu.

---

## Usage With Other Backends

### BranchData

The current branch is tracked via context. Wrap your app in a `BranchDataProvider` and tell it how to retrieve and set the current branch. The below example uses the `useLocalStorage` hook to persist to localStorage:

```tsx
import { BranchDataProvider, useLocalStorage } from '@tinacms/toolkit'

export const MyCustomProvider = ({ children }) => {
  const [customCurrentBranch, customSetCurrentBranch] = useLocalStorage(
    'my-local-storage-key',
    'my-custom-initial-branch'
  )
  return (
    <BranchDataProvider
      currentBranch={customCurrentBranch}
      setCurrentBranch={(branch) => {
        customSetCurrentBranch(branch)
      }}
    >
      {children}
    </BranchDataProvider>
  )
}
```

`BranchDataProvider` will dispatch a `branch:change` event when the branch is changed, which you can use to re-hydrate your content with data from the branch that was just switched to. This is wrapped up in a `useBranchData` event for convenience.

```tsx
import { useBranchData } from '@tinacms/toolkit'

const MyComponent = () => {
  const { currentBranch } = useBranchData()

  React.useEffect(() => {
    fetchMyData()
  }, [currentBranch])
}
```

`useBranchData` also returns a `setCurrentBranch` function that's used by the branch switcher.



### BranchSwitcher Plugin

The `BranchSwitcher` plugin adds an item to the global menu that provides a way to switch branches from the Tina UI.

```tsx
cms.plugins.add(new BranchSwitcherPlugin({
  listBranches: () => {
    return customGetBranchList()
  },
  createBranch: () => {
    return customCreateBranch()
  },
}))
```