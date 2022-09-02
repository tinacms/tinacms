# _next-tinacms-s3_

Manage **S3 Bucket media assets** in TinaCMS.

## Installation

### With Yarn
```bash
yarn add next-tinacms-s3
```

### With NPM
```bash
npm install next-tinacms-s3
```

## Connect with S3 Bucket

You need some credentials provided to access AWS S3 Bucket to set this up properly. 

**next-tinacms-s3** uses environment variables within the context of a Next.js site to properly access your S3 Bucket account.

Add the following variables to an `.env` file.

```
NEXT_PUBLIC_S3_REGION=<Your S3 Bucket Name: ex. us-east-1>
NEXT_PUBLIC_S3_BUCKET=<Your S3 Bucket Name: ex. my-bucket>
NEXT_PUBLIC_S3_ACCESS_KEY=<Your S3 Bucket access key>
S3_SECRET_KEY=<Your S3 Bucket access secret>
```

## Setup S3 Bucket

You need to setup S3 Bucket and IAM user correctly.

- The IAM user should have at least the following permissions for your bucket.

    "s3:ListBucket",
    "s3:PutObject",
    "s3:DeleteObject"

- The S3 bucket should have ACLs enabled.
    
    You should be able to go to the AWS S3 console and navigate to the bucket details for the bucket you try to write objects to. You'll see a tab called 'Permissions'. There you have the option to change the "Object Ownership" at a block with the same title.

    Once there, you can choose the option "ACLs enabled".

- You should ensure objects in the S3 bucket are readable by anonymous users and writable by the IAM user.

    i.e. You can disable `block public access settings` and set up the bucket policy like following:
    ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicRead",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::<S3-Bucket-NAME>/*"
            },
            {
                "Sid": "LimitedWrite",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "<ARN of the IAM user>"
                },
                "Action": [
                    "s3:PutObject",
                    "s3:PutObjectAcl",
                    "s3:DeleteObject"
                ],
                "Resource": "arn:aws:s3:::<S3-Bucket-NAME>/*"
            }
        ]
    }
    ```

## Register the Media Store

Now, you can register the S3 Bucket Media store with the instance of Tina in your app by passing the `TinaCloudS3MediaStore` to the `TinaCMS` instance via its `mediaStore` prop.

This is also where we can update our `mediaOptions` on the cms object.

```tsx
// Typically in the _app.js file of a Next.js project

import dynamic from "next/dynamic";
import { TinaEditProvider } from "tinacms/dist/edit-state";
import { Layout } from "../components/layout";
const TinaCMS = dynamic(() => import("tinacms"), { ssr: false });

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        editMode={
          <TinaCMS
            branch="main"
            clientId={NEXT_PUBLIC_TINA_CLIENT_ID}
            isLocalClient={Boolean(Number(NEXT_PUBLIC_USE_LOCAL_CLIENT))}
            mediaStore={async () => {
              const pack = await import("next-tinacms-s3");
              return pack.TinaCloudS3MediaStore;
            }}
            {...pageProps}
          >
            {(livePageProps) => (
              <Layout
                rawData={livePageProps}
                data={livePageProps.data?.getGlobalDocument?.data}
              >
                <Component {...livePageProps} />
              </Layout>
            )}
          </TinaCMS>
        }
      >
        <Layout
          rawData={pageProps}
          data={pageProps.data?.getGlobalDocument?.data}
        >
          <Component {...pageProps} />
        </Layout>
      </TinaEditProvider>
    </>
  );
};

...
```

## Set up API routes

Set up a new API route in the `pages` directory of your Next.js app, e.g. `pages/api/s3/[...media].ts`.
Then add a new catch all API route for media.

Call `createMediaHandler` to set up routes and connect your instance of the Media Store to your S3 Bucket.

Import `isAuthorized` from [`@tinacms/auth`](https://github.com/tinacms/tinacms/tree/main/packages/%40tinacms/auth).

The `authorized` key will make it so only authorized users within Tina Cloud can upload and make media edits.


```
// pages/api/s3/[...media].ts

import {
  mediaHandlerConfig,
  createMediaHandler,
} from "next-tinacms-s3/dist/handlers";
import { isAuthorized } from "@tinacms/auth";

export const config = mediaHandlerConfig;

export default createMediaHandler({
  config: {
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
    region: process.env.NEXT_PUBLIC_S3_REGION,
  },
  bucket: process.env.NEXT_PUBLIC_S3_BUCKET || '',
  authorized: async (req, _res) => {
    if (process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT === "1") {
      return true;
    }
    try {
      const user = await isAuthorized(req);
      return user && user.verified;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
});

```

## Update Schema

Now that the media store is registered and the API route for media set up, let's add an image to your schema.

In your `.tina/schema.ts` add a new field for the image, e.g:

```
 {
  name: 'hero',
  type: 'image',
  label: 'Hero Image',
 }
 ```

 Now, when editing your site, the image field will allow you to connect to your S3 Bucket via the Media Store to manage your media assets.
