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

import aws from 'aws-sdk'
import STS from 'aws-sdk/clients/sts'
import Cookies from 'js-cookie'

export const S3_ACCESS_KEY_ID = 'tina_s3_access_key_id'
export const S3_SECRET_ACCESS_KEY = 'tina_s3_secret_access_key'
export const S3_SESSION_TOKEN = 'tina_s3_session_token'

export class S3StsClient {
  region: string
  s3Bucket: string

  constructor(region: string, s3Bucket: string) {
    const requiredArgs: { [key: string]: string } = {
      region,
      s3Bucket,
    }

    for (let key in requiredArgs) {
      if (!requiredArgs[key]) {
        throw new Error(`Missing ${key} in S3StsClient constructor`)
      }
    }

    this.region = region
    this.s3Bucket = s3Bucket
  }

  get accessKeyId(): string {
    return Cookies.get(S3_ACCESS_KEY_ID) || ''
  }

  set accessKeyId(value: string) {
    Cookies.set(S3_ACCESS_KEY_ID, value)
  }

  get secretAccessKey(): string {
    return Cookies.get(S3_SECRET_ACCESS_KEY) || ''
  }

  set secretAccessKey(value: string) {
    Cookies.set(S3_SECRET_ACCESS_KEY, value)
  }

  get sessionToken(): string {
    return Cookies.get(S3_SESSION_TOKEN) || ''
  }

  set sessionToken(value: string) {
    Cookies.set(S3_SESSION_TOKEN, value)
  }

  async authenticate(accessKeyId: string, secretAccessKey: string) {
    const policy = getS3StsPolicy(this.s3Bucket)
    const token = (await getS3StsToken(
      accessKeyId,
      secretAccessKey,
      this.region,
      policy
    )) as STS.Types.GetFederationTokenResponse

    if (!token.Credentials) {
      // Should never happen, this is just to make typescript happy
      throw new Error('token is missing required Credentials attribute')
    }

    this.accessKeyId = token.Credentials.AccessKeyId
    this.secretAccessKey = token.Credentials.SecretAccessKey
    this.sessionToken = token.Credentials.SessionToken
  }
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
      DurationSeconds: 60 * 60 * 12, // 12 hours
    })
    .promise()
}
