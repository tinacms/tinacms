---
title: Creating a custom field component
id: '/docs/advanced/creating-field-component'
next: '/docs/advanced/customizing-forms'
---

A field plugin's `Component` is a React component that accepts three props:

- `field`: The [field definition](https://tinacms.org/docs/reference/toolkit/fields) for the current field.
- `input`: The data and callbacks necessary to make an input.
- `meta`: Metadata about the field in the form. (e.g. `dirty`, `valid`)

Checkout the [react-final-form](https://github.com/final-form/react-final-form#fieldrenderprops) docs for a more detailed description of the `input` and `meta` props.

## Creating a Custom Component For Our New Field Plugin

Let's create a basic slider component:

```ts
export default function RangeInput({ field, input, meta }) {
  return (
    <>
      <div>
        <label htmlFor="saturation">Image Saturation</label>
      </div>
      <div>
        <input
          name="saturation"
          id="saturation"
          type="range"
          min="0"
          max="10"
          step=".1"
          {...input} // This will pass along props.input.onChange to set our form values as this input changes.
        />
      </div>
    </>
  )
}
```

Now that we have a custom field component, we can:

- [Create/register a new field plugin for it](/docs/advanced/extending-field-plugin/#creating-a-custom-field-plugin).
- [Apply the new field plugin to fields in our schema](/docs/advanced/extending-field-plugin/#3-use-field-in-tinaschemats).

Once that's wired up, our editors will be able to use our new range field in their site.

![saturation-custom-field-gif](https://res.cloudinary.com/forestry-demo/image/upload/v1645712782/tina-io/docs/saturate-custom-field.gif)

## Using Tina Styles

If you want to style the custom field to fit in with the rest of the Tina sidebar, you'll need to use the [CSS custom properties](/docs/advanced/customizing-ui/) defined in [`@tinacms/styles`](https://github.com/tinacms/tinacms/blob/main/packages/%40tinacms/toolkit/src/packages/styles/Styles.tsx).

**Example**

```jsx
import styled from 'styled-components'

// Use the Tina CSS variables in your styled component
const Label = styled.h3`
  color: var(--tina-color-primary);
  font-size: var(--tina-font-size-3);
  font-weight: var(--tina-font-weight-bold);
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-primary-light);
  transition: color linear ease var(--tina-timing-medium);
  padding: var(--tina-padding-small);
`
```

Now you should have a working slider component! The next steps would be to [create a field plugin](/docs/advanced/extending-field-plugin/) that uses this component, and update a field in your schema to use this new field plugin.
