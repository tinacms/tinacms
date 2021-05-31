/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { NextApiRequest, NextApiResponse } from 'next'
import aws from 'aws-sdk'

// Code in this file is based on https://github.com/ryanto/next-s3-upload

type NextRouteHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>

type Configure = (options: Options) => Handler
type Handler = NextRouteHandler & { configure: Configure }

type Options = {
  key?: (req: NextApiRequest) => string
}

export const s3StsToken = (
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  s3Bucket: string
) => async (_req: any, res: any) => {
  const requiredKeys: { [key: string]: string } = {
    accessKeyId,
    secretAccessKey,
    region,
    s3Bucket,
  }

  for (let key in requiredKeys) {
    if (!requiredKeys[key]) {
      const message = `next-tinacms-s3: s3StsToken was called without ${key}.`
      console.error(message)
      return res.status(500).json({ message })
    }
  }

  const createdAt = Date.now()
  const policy = getS3StsPolicy(s3Bucket)
  const token = await getS3StsToken(
    accessKeyId,
    secretAccessKey,
    region,
    policy
  )

  res.statusCode = 200
  res.status(200).json({ token, createdAt })
}

const getS3StsPolicy = (bucket: string) => {
  return {
    Statement: [
      {
        Sid: 'S3ListAssets',
        Effect: 'Allow',
        Action: ['s3:ListBucket'],
        Resource: [`arn:aws:s3:::${bucket}`],
      },
      {
        Sid: 'S3CrudAssets',
        Effect: 'Allow',
        Action: ['s3:DeleteObject', 's3:PutObject', 's3:PutObjectAcl'],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  }
}

const getS3StsToken = async (
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  policy: any
) => {
  const config = {
    accessKeyId,
    secretAccessKey,
    region,
  }

  const sts = new aws.STS(config)

  return await sts
    .getFederationToken({
      Name: 'S3UploadWebToken',
      Policy: JSON.stringify(policy),
      DurationSeconds: 60 * 60, // 1 hour
    })
    .promise()
}
