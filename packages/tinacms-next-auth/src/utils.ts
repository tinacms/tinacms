import bcrypt from 'bcryptjs'

export const checkPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}
