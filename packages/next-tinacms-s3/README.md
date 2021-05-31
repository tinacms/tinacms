# _next-tinacms-s3_

This package provides helpers for managing TinaCMS media in **Amazon S3**.

## Installation

```bash
yarn add next-tinacms-s3
```

Any functions in the `pages/api` directory are mapped to `/api/*` endpoints. The below helpers tend to be added to the `pages/api` directory in a Next.js project.

### `s3StsToken`

Helper for creating a `s3StsToken` server function.

**pages/api/s3-sts-token.ts**

```js
import { s3StsToken } from 'next-tinacms-s3'

export default s3StsToken(
  process.env.S3_UPLOAD_KEY,
  process.env.S3_UPLOAD_SECRET,
  process.env.S3_UPLOAD_REGION,
  process.env.S3_UPLOAD_BUCKET,
)
```

_See [Next's documentation](https://nextjs.org/docs/api-reference/next.config.js/environment-variables) for adding environment variables_

[See here](https://github.com/ryanto/next-s3-upload) for instructions on creating an S3 bucket and an IAM user, and on configuring the **Upload Key**, **Upload Secret**, **Upload Region**, and **Upload Bucket** variables.

## _NextS3bMediaStore_

`next-tinacms-s3` includes a media store for managing media files with Amazon S3. It includes **logic for serving uploads directly from S3**, or from a CDN (such as CloudFront) pointing to an S3 bucket.

This media store is initialized as follows:

```ts
import { TinaCMS } from 'tinacms'
import { NextS3MediaStore } from 'next-tinacms-s3'

const mediaStore = new NextS3MediaStore({
  s3Bucket: process.env.S3_UPLOAD_BUCKET,
  s3ReadUrl: process.env.S3_READ_URL,
  s3ServerSideEncryption: process.env.S3_SERVER_SIDE_ENCRYPTION
})

const cms = new TinaCMS({
  media: mediaStore
})

```

**Read URL** is optional, it should be set to the endpoint from which files in the S3 bucket can be downloaded, e.g. `//a1b2c3d4e5f6.cloudfront.net` or `//somedomainpointingatyourcdn.com`, when using a CDN such as CloudFront. If not set, the endpoint defaults to `//S3_UPLOAD_BUCKET.s3.amazonaws.com`.

**Server Side Encryption** is also optional, it can be set to one of the allowed values for the `ServerSideEncryption` request parameter of the S3 `upload` API, e.g. `AES256`. If not set, then files are uploaded to S3 unencrypted.
