---
title: Upgrading from Alpha to Beta
---

## Beta Changes

Aside from some user interface improvements in the Tina Cloud Dashboard, we've also been making a bunch of changes
under the hood. One of the biggest of these changes is how we handle user accounts.

Previously when you created a Tina Cloud account you were creating an **organization** that you accessed at `https://OrgName.tina.io`. We thought that giving each organization its own unique subdomain and pool of users would be neat, but after spending some time in that paradigm it turned out to be a lot of added complexity that didn't add much value.

With the release of the beta we're moving user accounts to the forefront. Whenever you create a Tina Cloud account you'll always access it at https://app.tina.io. This means that even
if you are part of multiple organizations, you'll only have a single Tina account.

> Tools for creating/managing organizations within Tina Cloud accounts are coming. For now we create a default organization, which you'll still be able to invite users to.

## Migration Path

Since we're changing how user accounts work within Tina Cloud, existing alpha users must **recreate their Tina Cloud account** and **update their Tina Cloud Site**. The good news is that since we don't control your content, there really isn't anything else to do.

### Recreate your Tina Cloud Account

- Head to https://app.tina.io and sign up for a new account.
- Log in to your newly created account [recreate any existing **Apps**](/docs/tina-cloud/dashboard/#apps).
- Invite any users to your newly created account.

### Update your Tina Cloud site

1. Remove the `tina-graphql-gateway` and `tina-graphql-gateway-cli` dependencies.

```
yarn remove tina-graphql-gateway-cli tina-graphql-gateway
```

2. Add the new Tina dependencies.

```
yarn add tinacms @tinacms/auth
yarn add -D @tinacms/cli
```

3. Change any existing import from `tina-graphql-gateway` to `tinacms`.

4. Update `package.json`. Replace `yarn tina-gql` calls with `yarn tinacms`.

5. Update your site's environment variables.

- Delete `NEXT_PUBLIC_ORGANIZATION_NAME`
- Change `NEXT_PUBLIC_TINA_CLIENT_ID` to the Client ID found in your new Tina Cloud Account.

That's it! With any luck you should be able to keep working on your Tina enabled site the same as before. We're not expecting to have to repeat this process when we make it to our first full release.

If you come across any problems or have any questions feel free to [head over to our Discord](https://discord.com/invite/zumN63Ybpf)! We'd love to hear from you.
