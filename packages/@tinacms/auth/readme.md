# @tinacms/auth
This package contains all the [Next.js](https://nextjs.org/) specific code for Tina Cloud

## Authorize user function

The authorize user function Reaches out to [Tina Cloud](https://tina.io/cloud/) and returns the current user if one exists. The reason for this is to allow one to work with external services and only let those with a Tina CLoud account access the backend code.

An example use case might be allowing logged-in users to upload images to cloudinary or S3.

### Backend code / Serverless function.

In Next.js you can write backend code in the `pages/api/` folder. For more [information checkout the Next.js docs](https://nextjs.org/docs/api-routes/introduction).

For our example lets make a file called `pages/api/upload.ts`.

```ts
import { NextApiHandler } from 'next'
import { isAuthorized } from '@tinacms/auth'
const apiHandler: NextApiHandler = async (req, res) => {

  // This will check if the user is logged in. It will return undefined if the user token is not valid
  const user = await isAuthorized(req)
  if (user && user.verified) {
    console.log('this user is logged in')
    // now you could (for example) upload images
    await imageUploadFunction(req, res)
    res.json({
       validUser: true,
    })
    return
  } else {
    console.log('this user NOT is logged in')
    res.json({
       validUser: false,
    })
  }
}

export default apiHandler
```

The `isAuthorized` function takes in the `req`  and returns `undefined` if there is no user and returns a `TinaCloudUser` if the user is logged in.

```ts
interface TinaCloudUser {
  id: string
  email: string
  verified: boolean
  role: 'admin' | 'user'
  enabled: boolean
  fullName: string
}
```

### Frontend code
Now in our media manager, or someone in the frontend code that is wrapped with `TinaCloudAuthWall` we can do the following.

```ts
const cms = useCMS()
const tinaCloudClient: Client = cms.api.tina
const uploadImage = async () => {
  const req = await tinaCloudClient.fetchWithToken(`/api/upload?clientID=${tinaCloudClient.clientId}`)
  console.log({ test: await test.json() })
}
```
The `fetchWithToken` function is just the normal [fetch function](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) but adds the `authorization` header with the correct token.

You also have to add two query Params to the request; `org` which is the current organization and clientID. Both of these can be found in the `cms.api.tina`.
