---
'@tinacms/starter': patch
'tinacms-gitprovider-github': patch
'@tinacms/vercel-previews': patch
'next-tinacms-cloudinary': patch
'@tinacms/self-hosted-starter': patch
'@tinacms/schema-tools': patch
'@tinacms/datalayer': patch
'tinacms-next-auth': patch
'@tinacms/graphql': patch
'@tinacms/scripts': patch
'next-tinacms-dos': patch
'@tinacms/search': patch
'next-tinacms-s3': patch
'tinacms-clerk': patch
'e2e-next': patch
'@tinacms/app': patch
'@tinacms/cli': patch
'@tinacms/mdx': patch
'tinacms': patch
---

## Summary
- adds authProvider to defineConfig
- adds AbstractAuthProvider class that can be extended to make new auth provider
- Adds a Clerk auth provider
- renames admin.auth to admin.authHooks
- deprecates admin.auth


Adds the auth provider to the Internal client and config.

Instead of passing an object that contains the auth functions you can now use an authProvider class. This makes the DX more clear and allows us to use classes for the AuthProvide, GitProvider and Database Adapter. This also means it will be easier to publish new auth providers as packages.

## Previously  

```js
defineConfig({
    admin: {
        auth: {
            login() {},
            logout() {},
            //...
        }
    }
    //...
})
```

## New API
```js
import { customAuthProvider } from 'tinacms-CUSTOM'
defineConfig({
    authProvider: new CustomAuthProvider()
})
```

## Migration

If you are using admin.auth.onLogin or admin.auth.onLogout you can move those functions to admin.authHooks.

If you are using other function from admin.auth you can move them into a custom auth provider.

## Previously  

```js
defineConfig({
    admin: {
        auth: {
            login() {},
            logout() {},
            //...
        }
    }
    //...
})
```

## Update to be

## New API
```js
import { AbstractAuthProvider } from 'tinacms'
class CustomAuthProvider extends AbstractAuthProvider {
    login() {}
    logout() {}
    //...
}
defineConfig({
    authProvider: new CustomAuthProvider()
    //...
})
```
Now everything should work as it previously did.

