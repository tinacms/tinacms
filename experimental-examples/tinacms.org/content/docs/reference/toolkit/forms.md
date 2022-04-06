---
title: Forms
last_edited: '2021-11-10T00:00:00.000Z'
---

## Form Configuration

Forms in Tina are built upon the [Final Form](https://final-form.org/) library, and inherit all of Final Form's configuration options.

You can see the all of Final Form's form config options in the [Form Config Documentation](https://final-form.org/docs/final-form/types/Config), but the following options will most commonly be used when creating a form:

| key             | description                                         |
| --------------- | --------------------------------------------------- |
| `initialValues` | An object containing the initial state of the form. |
| `onSubmit`      | A function that runs when the form is saved.        |

In addition to Final Form's options, Tina's form hooks accept the following additional configuration options:

```typescript
interface FormOptions<S> {
  id: any
  label: string
  fields: Field[]
  loadInitialValues?: () => Promise<S>
  onSubmit?: () => Promise<any>
  reset?(): void
  onChange?(state): void
  actions?: any[]
  buttons?: {
    save: string
    reset: string
  }
  __type?: string
}
```

| key                 | description                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | A unique identifier for the form. This should be derived from the content to distinguish it from other instances of the form.                 |
| `label`             | A label for the form that will appear in the sidebar.                                                                                         |
| `fields`            | An array of fields that will define the shape of the form and how content is edited.                                                          |
| `loadInitialValues` | _Optional:_ A function to load the initial form state asynchronously. Return a promise that passes an object of form values when it resolves. |
| `onSubmit`          | _Optional:_ An asynchronous function to invoke when the form is saved, i.e. when the 'Save' button is pressed.                                |
| `reset`             | _Optional:_ A function that runs when the form state is reset by the user via the 'Reset' button.                                             |
| `actions`           | _Optional:_ An array of custom actions that will be added to the form.                                                                        |
| `buttons`           | _Optional:_ An object to customize the 'Save' and 'Reset' button text for the form.                                                           |
| `onChange`          | _Optional:_ A function that runs when the form values are changed.                                                                            |
| `__type`            | _Optional:_ Sets the Form's plugin type. Automatically set based on which form hook is used.                                                  |
