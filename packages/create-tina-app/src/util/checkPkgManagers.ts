import { exec } from 'child_process'
import { PKG_MANAGERS } from '..'

export async function checkPackageExists(name: (typeof PKG_MANAGERS)[number]) {
  try {
    await new Promise((resolve, reject) => {
      exec(`${name} -v`, (error, stdout, stderr) => {
        if (error) {
          reject(stderr)
        }
        resolve(stdout)
      })
    })
    return true
  } catch (_) {
    return false
  }
}
