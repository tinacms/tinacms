# `@forestryio/template`

This directory contains a template for creating new Typescript packages.

## Creating a Typescript Package

Let's create a package called `foobar`

### Step 1: Copy the Template into `packages`.

```
cd forestryio
cp -R template packages/foobar
```

### Step 2: Replace `example` with `foobar` in the `package.json`.

**packages/foobar/package.json**

```git
{
  - "name": "@forestryio/example",
  + "name": "@forestryio/foobar",,

  ...

  - "types": "build/example/src/index.d.ts",
  + "types": "build/foobar/src/index.d.ts",,
}
```
