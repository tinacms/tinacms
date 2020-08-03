# react-tinacms-inline

This package provides the components and helpers for [Inline Editing](https://tinacms.org/docs/ui/inline-editing). 

## Install

```bash
yarn add react-tinacms-inline
```

> For specific steps on setting up Inline Editing on a page, refer to the [Inline Editing](https://tinacms.org/docs/ui/inline-editing) documentation.

## Inline Form

The `InlineForm` component provides an inline editing [context](https://reactjs.org/docs/context.html). To use, wrap the component where you want to render inline fields and pass the form.

### Usage

```jsx
export function Page(props) {
  const [, form] = useForm(props.data)
  usePlugin(form)

  return (
    <InlineForm form={form}>
      <main>
        {
            //... 
        }
      </main>
    </InlineForm>
  )
}
```

### Interface 

```ts
interface InlineFormProps {
  form: Form
  children: React.ReactElement | React.ReactElement[] | InlineFormRenderChild
}

interface InlineFormRenderChild {
  (props: InlineFormRenderChildOptions):
    | React.ReactElement
    | React.ReactElement[]
}

type InlineFormRenderChildOptions = InlineFormState &
  Omit<FormRenderProps<any>, 'form'>

/**
 * This state is available via context
*/
interface InlineFormState {
  form: Form
  focussedField: string
  setFocussedField(field: string): void
}
```

| Key           | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `form`        | A [Tina Form](/docs/plugins/forms).                                                          |
| `children`    | Child components to render — Either [React Elements](https://reactjs.org/docs/rendering-elements.html) or [Render Props](https://reactjs.org/docs/render-props.html) Children that receive the form state and other [Form Render Props](https://final-form.org/docs/react-final-form/types/FormRenderProps)                                                                                   |


### _useInlineForm_

The `useInlineForm` [hook](https://reactjs.org/docs/hooks-intro.html) can be used to access the inline editing context. It must be used within a child component of `InlineForm`.

## Inline Field

Inline Fields should provide basic inputs for editing data on the page and account for both [enabled / disabled CMS states](https://tinacms.org/docs/cms#disabling--enabling-the-cms). All Inline Fields must be children of an `InlineForm`. 

### Interface 

```ts
export interface InlineFieldProps {
  name: string
  children(fieldProps: InlineFieldRenderProps): React.ReactElement
}

export interface InlineFieldRenderProps<V = any>
  extends FieldRenderProps<V>,
    InlineFormState {}
```

| Key           | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `name`        | The path to the editable data.                                                          |
| `children`    | Child components to render — [React Elements](https://reactjs.org/docs/rendering-elements.html) that receive the form state and [Field Render Props](https://final-form.org/docs/react-final-form/types/FieldRenderProps).                                                                                  |

### Available Inline Fields

See the full list of [inline fields](https://tinacms.org/docs/ui/inline-editing#all-inline-fields) or learn how to make [custom inline fields](https://tinacms.org/docs/ui/inline-editing#creating-custom-inline-fields).

Below is a list of fields provided by the `react-tinacms-inline` package: 
- [Inline Text](https://tinacms.org/docs/ui/inline-editing/inline-text)
- [InlineTextarea](https://tinacms.org/docs/ui/inline-editing/inline-textarea)
- [Inline Group](https://tinacms.org/docs/ui/inline-editing/inline-group)
- [Inline Image](https://tinacms.org/docs/ui/inline-editing/inline-image)
- [Inline Blocks](https://tinacms.org/docs/ui/inline-editing/inline-blocks)

## Inline Field Styles

Styles are stripped as much as possible to prevent interference with base site styling. When toggling between [enabled / disabled states](https://tinacms.org/docs/cms#disabling--enabling-the-cms), the default inline fields will switch between rendering child elements with any additional editing UI and just passing the child elements alone.

For example with `InlineText`:

```tsx
export function InlineText({
  name,
  className,
  focusRing = true,
}: InlineTextProps) {
  const cms: CMS = useCMS()

  return (
    <InlineField name={name}>
      {({ input }) => {
        /**
        * If the cms is enabled, render the input
        * with the focus ring
        */
        if (cms.enabled) {
          if (!focusRing) {
            return <Input type="text" {...input} className={className} />
          }

          return (
            <FocusRing name={name} options={focusRing}>
              <Input type="text" {...input} className={className} />
            </FocusRing>
          )
        }
        /**
        * Otherwise, pass the input value
        */
        return <>{input.value}</>
      }}
    </InlineField>
  )
}
```

`Input` is a styled-component with some [base styling](https://github.com/tinacms/tinacms/blob/master/packages/react-tinacms-inline/src/fields/inline-text-field.tsx#L64) aimed at making this component mesh well with the surrounding site. If you ever need to override default Inline Field styles, read about this workaround to [extend styles](https://tinacms.org/docs/ui/inline-editing#extending-inline-field-styles). 

### Focus Ring

The common UI element on all Inline Fields is the `FocusRing`. The focus ring provides context to which field is active / available to edit. 

**Interface**

```ts
interface FocusRingProps {
  name?: string
  children?:  React.ReactNode
  options?: boolean | FocusRingOptions
}

interface FocusRingOptions {
  offset?: number | { x: number; y: number }
  borderRadius?: number
  nestedFocus?: boolean
}
```

**Focus Ring Props**

You would only use these options if you were creating custom inline fields and working with the `FocusRing` directly.

| Key           | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `children`    | _Optional_: Child elements to render.                                                                    |
| `name`        | _Optional_: This value is used to set the focused / active field.                            |
| `options`     | _Optional_: The `FocusRingOptions` outlined below.                                           |

**Focus Ring Options**

These options are passed to default [inline fields](https://tinacms.org/docs/ui/inline-editing#all-inline-fields) or inline block fields via the `focusRing` prop on most default inline fields. The options are configurable by the developer setting up the inline form & fields. Refer to individual [inline field documentation](https://tinacms.org/docs/ui/inline-editing#all-inline-fields) for examples.

| Key           | Description                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `offset`      | _Optional_: Sets the distance from the focus ring to the edge of the child element(s). It can either be a number (in pixels) for both x & y offsets, or individual x & y offset values passed in an object.|
| `borderRadius`| _Optional_: Determines (in pixels) the [rounded corners](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius) of the focus ring.                                                                |
| `nestedFocus` | _Optional_:  Disables [pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events) (clicking) and hides blocks empty state.|

## Inline Blocks

[Inline Blocks](https://tinacms.org/docs/ui/inline-editing/inline-blocks#inlineblocks-interface) consist of an array of [Blocks](https://tinacms.org/blog/what-are-blocks) to render in an Inline Form. Refer to the Inline Blocks Documentation for [code examples]().

### Actions

The Inline Blocks Actions are used by the Inline Blocks Controls. Use these if you are building your own custom Inline Block Field Controls. These actions are avaiable in the _Inline Blocks Context_.

```ts
interface InlineBlocksActions {
  count: number
  insert(index: number, data: any): void
  move(from: number, to: number): void
  remove(index: number): void
  blocks: {
    [key: string]: Block
  }
  activeBlock: number | null
  setActiveBlock: any
  direction: 'vertical' | 'horizontal'
  min?: number
  max?: number
}
```

### _useInlineBlocks_

`useInlineBlocks` is a hook that can be used to access the _Inline Blocks Context_ when creating custom controls.

## Inline Block Field Controls

Editors can add / delete / rearrange blocks with the [blocks controls](https://tinacms.org/docs/ui/inline-editing/inline-blocks#blocks-controls-options). They can also access additional fields in a [Settings Modal](https://tinacms.org/docs/ui/inline-editing/inline-blocks#using-the-settings-modal).


## Inline Block Definition

A block is made of two parts: a [component](https://tinacms.org/docs/ui/inline-editing/inline-blocks#part-1-block-component) that renders in edit mode, and a [template](https://tinacms.org/docs/ui/inline-editing/inline-blocks#part-2-block-template) to configure fields, defaults and other required data.


> Checkout this guide to learn more on using [Inline Blocks](https://tinacms.org/guides/general/inline-blocks/overview).