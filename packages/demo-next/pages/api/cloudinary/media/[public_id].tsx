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

import { ResourceApiResponse, v2 as cloudinary } from 'cloudinary'
import { NextApiRequest, NextApiResponse } from 'next'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default function handleMediaRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { public_id } = req.query

  if (req.method === 'DELETE') {
    cloudinary.uploader.destroy(public_id as string, {}, err => {
      if (err) res.status(500)
      res.json({
        err,
        public_id,
      })
    })
  }
}
