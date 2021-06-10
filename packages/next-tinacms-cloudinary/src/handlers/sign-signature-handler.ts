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

import { NextApiHandler } from 'next'
import { v2 as cloudinary } from 'cloudinary'

// TODO: refactor this to return a nextAPIHandeler
export const signSignatureHandler: NextApiHandler = (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const params = JSON.parse((req.query.params as string) || '{}')
  const signature = cloudinary.utils.api_sign_request(
    {
      ...params,
      timestamp: timestamp,
    },
    process.env.CLOUDINARY_API_SECRET
  )
  res.json({ signature, timestamp })
}
