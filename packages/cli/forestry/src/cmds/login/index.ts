import { writeConfig } from '../../config'
import { promptCredentials } from './prompt-credentials'

export async function login() {
  const fieldValues = await promptCredentials()

  writeConfig({ token: 'abc123' })

  // TODO - Post to forestry and grab token
  // TODO - Store token in ~/.forestry credentials file
  // TODO - Display the below warning when login fails
  console.log(`Failed to log in ${fieldValues.email} - Not yet implemented`)
}
