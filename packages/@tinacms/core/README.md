# @tinacms/core

The `@tinacms/core` package provides the core objects for
building amazing content management systems.

## Installation

Install the package

```
npm install --save @tinacms/core
```

or

```
yarn add @tinacms/core
```

## F.A.Q.

Below are the answer to a couple common questions.

If you have any other questions, go to the [TinaCMS Community](https://tinacms.org/community/) page to join our Slack or open an issue on Github!
Every question you ask helps us make working with TinaCMS even better :)

### What does the CMS do?

The responsibility of the `CMS` keeps track of two broad types of objects:

- Plugins, which extend or change the behaviour of the CMS.
- APIs, which allow the CMS to integrate with third party services.

### What? That doesn't seem like a CMS

The name `CMS` is a bit misleading. This object knows nothing of the user
interface or the data storage layer. The purpose of a `CMS` instance is to
provide a common connection point for the various aspects of a content
management system. The `CMS` object effectively a vehicle for dependency injection.

## Examples

### Creating a CMS

```ts
import { CMS } from '@tinacms/core'

let cms = new CMS()
```

### Registering APIs

```ts
import github from 'my-github-client'

cms.registerApi('github', github)

cms.api.github
```

### Adding Plugins

```ts
import github from 'my-github-client'

cms.plugins.add({
  __type: 'some-plugin',
  some: 'value',
})

cms.plugins.all('some-plugin') // [{ __type: 'some-plugin', some: 'value' }]
```
