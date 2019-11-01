/**

Copyright 2019 Forestry.io Inc

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

import multer from 'multer'
import * as fs from 'fs'

export function createUploader(tmpImgDir: string) {
  const tmpImgStorage = multer.diskStorage({
    destination: function(req: any, file: any, cb: any) {
      verifyUploadPath(tmpImgDir, () => {
        cb(null, tmpImgDir)
      })
    },
    filename: function(req: any, file: any, cb: any) {
      cb(null, file.originalname)
    },
  })
  return multer({ storage: tmpImgStorage })
}

//If an upload path doesnt exist, create it
function verifyUploadPath(uploadPath: string, callback: () => void) {
  fs.exists(uploadPath, function(exists: boolean) {
    if (exists) {
      callback()
    } else {
      fs.mkdir(uploadPath, function() {
        callback()
      })
    }
  })
}
