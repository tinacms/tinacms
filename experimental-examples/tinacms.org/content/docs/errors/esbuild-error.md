---
title: 'ESbuild compilation and build errors'
---

The `.tina/schema.{ts,js,tsx}` file is built with [esbuild](https://esbuild.github.io/) and executed in a node.js runtime. This allows you to import from outside your `.tina` folder and esbuild will handle this for us. This also can run into some edge cases where some things are being run on the server that should not be.

## ERROR: your schema was not successfully built

This means that there was a syntax or semantic error somewhere in your code. This could be inside the .tina folder or in any file that was imported from your schema file.

## ERROR: your schema.ts was not successfully executed

This error means that the schema was compiled correctly (correct syntax) but when the code was run it produced an error.

Some common issues are

- Importing code that requires a custom compile logic (webpack loader, esbuild loader, babel plugin, etc)
- Importing and running code that needs to be run on the frontend (uses `window`, DOM APIs, etc)

If you run into one of the above issues you can try only importing the code that you need. 

For example you might have
```ts
import { TinaHeroTemplate } from '../components/' 
```
which could be switched to
```ts
import { TinaHeroTemplate } from '../components/blocks/hero'
```

Using this more specific path means it is less likely that you will run into errors


Still confused? Don't worry we are here to help please [reach out to us on discord](https://discord.gg/njvZZYHj2Q) or submit a [github issue](https://github.com/tinacms/tinacms/issues/new/choose) and we will get back to you as soon as possible. 