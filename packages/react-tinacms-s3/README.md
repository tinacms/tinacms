# _react-tinacms-s3_

This package provides helpers for managing TinaCMS media in **Amazon S3**.

## Installation

```bash
yarn add react-tinacms-s3
```

[See here](https://github.com/ryanto/next-s3-upload) for instructions on creating an S3 bucket and an IAM user, and on configuring the **Upload Region** and **Upload Bucket** variables.

## _S3MediaStore_

`react-tinacms-s3` includes a media store for managing media files with Amazon S3. It includes **logic for serving uploads directly from S3**, or from a CDN (such as CloudFront) pointing to an S3 bucket.

This media store is initialized as follows:

```ts
import { TinaCMS } from 'tinacms'
import { S3MediaStore } from 'react-tinacms-s3'

const mediaStore = new S3MediaStore({
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
