import open from 'open'

const signupUrl = 'https://app.forestry.io/signup'
export async function createAccount() {
  open(signupUrl)
}
