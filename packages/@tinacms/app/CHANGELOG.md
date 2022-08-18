# @tinacms/app

## 0.0.6

### Patch Changes

- Updated dependencies [9fbb4e557]
  - @tinacms/scripts@0.51.1
  - tinacms@0.69.1

## 0.0.5

### Patch Changes

- Updated dependencies [9ea28113e]
  - tinacms@0.69.1

## 0.0.4

### Patch Changes

- 8183b638c: ## Adds a new "Static" build option.

  This new option will build tina into a static `index.html` file. This will allow someone to use tina without having react as a dependency.

  ### How to update

  1.  Add a `.tina/config.{js,ts,tsx,jsx}` with the default export of define config.

  ```ts
  // .tina/config.ts
  import schema from './schema'

  export default defineConfig({
    schema: schema,
    //.. Everything from define config in `schema.ts`
    //.. Everything from `schema.config`
  })
  ```

  2. Add Build config

  ```
  .tina/config.ts

  export default defineConfig({
     build: {
       outputFolder: "admin",
       publicFolder: "public",
    },
    //... other config
  })
  ```

  3. Go to `http://localhost:3000/admin/index.html` and view the admin

- Updated dependencies [7b0dda55e]
- Updated dependencies [8183b638c]
  - @tinacms/scripts@0.51.0
  - tinacms@0.69.0
