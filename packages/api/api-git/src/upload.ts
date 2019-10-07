// @ts-ignore TODO: check if there's types
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
