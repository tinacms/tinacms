---
title: Manually editing Tina's edit state
id: '/docs/advanced/edit-state'
next: '/docs/tina-cloud'
---

## Manually toggling via `useEditState`

You can manually enter and exit edit mode by tapping into the `useEditState` hook. You should **always** have a  [`/pages/admin/[[...tina]].{js,tsx}` file](/docs/tinacms-context/#toggling-edit-mode) but in some cases you may want to go into edit mode without going to the `/admin` or `/admin/logout` routes. 

In this case you can use the `useEditState` hook. This will enter you into edit mode (and trigger a tina cloud login if applicable). 


For example, you may wish to provide your editors with a button to login and logout without having to navigate to `/admin` and `/admin/logout`.

```tsx
import { useEditState } from 'tinacms/dist/edit-state'

const MyEditButton = () => {
  const { edit, setEdit } = useEditState();

  return (
    <button
      onClick={() => {
        setEdit((editState) => !editState);
      }}
    >
      {edit ? "exit exit mode" : "Enter edit mode"}
    </button>
  );
};
```

Another example is that you may have UI on a page that you only want editors to see. 

```tsx
import { useEditState } from 'tinacms/dist/edit-state'

const MyPublicPage = () => {
  const { edit } = useEditState();

  return (
    <div>
       <main>
          public content....
       </main>
       {edit && <EditorOnlyUI/>}
    </div>
  );
};
```

Note that the `tinacms/dist/edit-state (>2kb)` code _will_ be in your production bundle with this pattern.
