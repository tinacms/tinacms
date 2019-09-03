# @tinacms/core

A CMS Toolkit

## Installation

Install the package

```
npm install --save @tinacms/core
```

or

```
yarn add @tinacms/core
```

## Getting Started

`@forestry/cms` is the core for building content management systems.

```javascript
import { CMS } from '@tinacms/core'

let cms = new CMS()
```

### Add fields plugins:

```javascript
cms.forms.addFieldPlugin({
  name: "text",
  Component({ input, field }) {
    return (
      <label name={input.name}>
        {field.name}
        <input {...} />
      </label>
    )
  }
})

```

### Field Plugin Props

```
- input: [See Input Props here](https://github.com/final-form/react-final-form#fieldrenderprops)
- meta: [See Meta Props here](https://github.com/final-form/react-final-form#fieldrenderprops)
- field:
  - name: string;
  - component: React.FC<any> | string;
```

### Register a new form:

```javascript
let form = cms.forms.createForm({
  name: 'hello-world',
  initialValues: {
    title: 'Hello World',
    description: 'A fun time can be head with programming.',
  },
  fields: [
    { name: 'title', component: 'text' },
    { name: 'description', component: 'text' },
  ],
})
```

## API

The following can be imported from `@tinacms/cms`

### `CMS`

The base CMS class.

#### `forms: FormManager`

TODO

### `Subscribable`

TODO

## Types

### `Form`

### `FormManager`

#### `create<S>(options: FormOptions<S>): Form<S>`

#### `findForm(name: string): Form`

#### `removeForm(): void`

#### `all(): Form[]`

#### `addFieldPlugin(): void`

#### `getFieldPlugin(name: string): FieldPlugin | null`

### `FormOptions<S>`

### `FieldPlugin`
