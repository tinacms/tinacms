import { exec } from 'child_process'
import { PKG_MANAGERS } from '..'

export function checkPackageExists(name: (typeof PKG_MANAGERS)[number]) {
  return new Promise((resolve, reject) => {
    exec(`${name} -v`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr)
      }
      resolve(stdout)
    })
  })
}
