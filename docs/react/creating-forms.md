# Creating Forms

Often, the premade form helpers (e.g. [useRemarkForm](./editing-markdown.md#creating-forms))
provide all the behaviour we need. Eventually you may need something more custom, and in that case
you'll want to reach for the `useCMSForm` hook in `@forestryio/react-cms`.

## useCMSForm

```typescript
function useCMSForm(options: FormOption): [object, Form]

interface FormOptions {
  name: string
  initialValues: object
  fields: Field[]
  onSubmit(object): Promise<object | null>
}
```

- `name`: The name of the form being edited.
- `initialValues`: The initial values being edited by the form.
- `fields`: A list of field definitions. This is used to render the form widgets so the values can be edited.
- `onSubmit`: A javascript function to be called when the form is submitted. See the [`final-form`](https://github.com/final-form/final-form#onsubmit-values-object-form-formapi-callback-errors-object--void--object--promiseobject--void) docs for more details.

### Example

```javascript
import { useCMSForm } from '@forestryio/react-cms'

function PageTemplate(props) {
  let [someData] = useCMSForm({
    name: 'someData',
    initialValues: props.data.someData,
    fields: [{ name: 'someField', component: 'text' }],
    onSubmit(someData) {
      // ...
    },
  })

  return (
    <div>
      Some Field: <span>{someData.someField}</span>
    </div>
  )
}
```

## Resources

- [Forms](../concepts/forms.md)
