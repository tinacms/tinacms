import crypto from 'crypto'
import scmp from 'scmp'
import { Collectable } from '@tinacms/schema-tools'

const DEFAULT_SALT_LENGTH = 32
const DEFAULT_KEY_LENGTH = 512
const DEFAULT_ITERATIONS = 25000
const DEFAULT_DIGEST = 'sha256'

export type HashOptions = {
  saltLength?: number
  keyLength?: number
  iterations?: number
  digest?: 'sha256' | 'sha512'
}

export const generatePasswordHash = async ({
  password,
  opts: {
    saltLength = DEFAULT_SALT_LENGTH,
    keyLength = DEFAULT_KEY_LENGTH,
    iterations = DEFAULT_ITERATIONS,
    digest = DEFAULT_DIGEST,
  } = {
    saltLength: DEFAULT_SALT_LENGTH,
    keyLength: DEFAULT_KEY_LENGTH,
    iterations: DEFAULT_ITERATIONS,
    digest: DEFAULT_DIGEST,
  },
}: {
  password: string
  opts?: HashOptions
}) => {
  if (!password) {
    throw new Error('Password is required')
  }
  if (password.length < 3) {
    throw new Error('Password must be at least 3 characters')
  }

  const salt = (
    await new Promise<Buffer>((resolve, reject) => {
      crypto.randomBytes(saltLength, (err, saltBuffer) => {
        if (err) {
          reject(err)
        }
        resolve(saltBuffer)
      })
    })
  ).toString('hex')

  const hash = (
    await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        iterations,
        keyLength,
        digest,
        (err, hashBuffer) => {
          if (err) {
            reject(err)
          }
          resolve(hashBuffer)
        }
      )
    })
  ).toString('hex')
  return `${salt}${hash}`
}

export const checkPasswordHash = async ({
  saltedHash,
  password,
  opts: {
    saltLength = DEFAULT_SALT_LENGTH,
    keyLength = DEFAULT_KEY_LENGTH,
    iterations = DEFAULT_ITERATIONS,
    digest = DEFAULT_DIGEST,
  } = {
    saltLength: DEFAULT_SALT_LENGTH,
    keyLength: DEFAULT_KEY_LENGTH,
    iterations: DEFAULT_ITERATIONS,
    digest: DEFAULT_DIGEST,
  },
}: {
  saltedHash: string
  password: string
  opts?: HashOptions
}) => {
  const salt = saltedHash.slice(0, saltLength * 2)
  const hash = saltedHash.slice(saltLength * 2)
  try {
    await new Promise<void>((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        iterations,
        keyLength,
        digest,
        (err, hashBuffer) => {
          if (err) {
            reject(null)
          }

          if (scmp(hashBuffer, Buffer.from(hash, 'hex'))) {
            resolve()
          }
          reject(null)
        }
      )
    })
  } catch (e) {
    return false
  }
  return true
}

export const mapUserFields = (
  collectable: Collectable,
  prefix: string[] = []
) => {
  const results: {
    path: string[]
    collectable: Collectable
    idFieldName?: string
    passwordFieldName?: string
  }[] = []
  const passwordFields =
    collectable.fields?.filter((field) => field.type === 'password') || []
  if (passwordFields.length > 1) {
    throw new Error('Only one password field is allowed')
  }
  const idFields = collectable.fields?.filter((field) => field.uid) || []
  if (idFields.length > 1) {
    throw new Error('Only one uid field is allowed')
  }
  if (passwordFields.length || idFields.length) {
    results.push({
      path: prefix,
      collectable,
      idFieldName: idFields[0]?.name,
      passwordFieldName: passwordFields[0]?.name,
    })
  }
  collectable.fields?.forEach((field) => {
    if (field.type === 'object' && field.fields) {
      results.push(...mapUserFields(field, [...prefix, field.name]))
    }
  })
  return results
}
