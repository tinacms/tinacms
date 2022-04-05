---
title: 'Upgrade Notice: Improved GitHub Security'
date: '2020-06-23T13:47:03-03:00'
author: Joel Huggett
last_edited: 'July 30, 2020'
next: content/blog/inline-editing-project.md
prev: content/blog/software-engineering-daily-podcast-tinacms.md
---

We've improved the overall security of our GitHub authentication. Below is an explanation of the changes and further down are the steps required to upgrade to the new authentication flow.

TinaCMS communicates with GitHub using a proxy, so the authentication token provided by GitHub is stored as an httpOnly cookie. This stops the client from accessing the token, and that's all very good. However, this strategy is still vulnerable to [Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) attacks. This means that any calls to the proxy, so long as that cookie is still there, will succeed, and that's not very good.

A common approach to mitigating this problem is to implement the [Token Synchronization Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#synchronizer-token-pattern). The issue is that this pattern requires some form of server-side session storage. That doesn't jive well with the stateless approach of static sites. So, we've introduced a variation that we call the Stateless Token Synchronization Pattern.

**Stateless Token Synchronization** works by storing a CSRF token as an httpOnly cookie and sending an encrypted (signed by the server's secret _Signing Key_) token that is the amalgamation of the CSRF token and the authentication token provided by Github. This amalgamated token is then stored client-side in local storage and sent to the proxy in a bearer authentication header. Then, server-side, the amalgamated token is decrypted and the CSRF tokens are compared to make sure they match. If all is well, the authentication token is extracted and the call is completed.

This new pattern helps mitigate CSRF attacks and provides the authentication token in an encrypted format, all done statelessly.

## Upgrading to the new flow

### **react-tinacms-github**

Nothing needs to be changed. This package can handle both the old flow and the new one on its own without further configuration, just make sure you're using the **latest version**.

### **next-tinacms-github**

**next-tinacms-github** api routes now require a secret _Signing Key_.

The _Signing Key_ should be a random 256-bit key, used server-side to encrypt and decrypt authentication tokens sent to the client.

You can generate a key by running `openssl rand -base64 32` in your terminal, using the output as your _Signing Key_.

The key should be stored in an environment variable; don't forget to add it to your hosted environment configurations.

`createAuthHandler`, `apiProxy`, and `previewHandler` now **require** the _Signing Key_ to be passed as a parameter.

### **Required Changes:**

`create-github-access-token.ts`:

```diff
import { createAuthHandler } from 'next-tinacms-github'

export default createAuthHandler(
  process.env.GITHUB_CLIENT_ID || "",
  process.env.GITHUB_CLIENT_SECRET || "",
+ process.env.SIGNING_KEY || ""
)
```

`preview.ts`:

```diff
import { previewHandler } from 'next-tinacms-github'

- export default previewHandler
+ export default previewHandler(process.env.SIGNING_KEY)
```

`proxy-github.ts`:

```diff
import { apiProxy } from 'next-tinacms-github'

- export default apiProxy
+ export default apiProxy(process.env.SIGNING_KEY)
```

**Also**, `onLogin` needs to pass the new token that is in local storage as an authorization header to the `/api/preview` route, it should be changed to this:

```diff
const onLogin = async () => {
  const token = localStorage.getItem('tinacms-github-token') || null
  const headers = new Headers()

  if (token) {
    headers.append('Authorization', 'Bearer ' + token)
  }

  const resp = await fetch(`/api/preview`, { headers: headers })
  const data = await resp.json()

  if (resp.status == 200) window.location.href = window.location.pathname
  else throw new Error(data.message)
}
```

## Questions?

Discuss it in the [forums](https://community.tinacms.org/t/upgrade-notice-improved-github-security/226).
