import { writeConfig } from '../../config'
import { promptCredentials } from './prompt-credentials'
import axios from 'axios'
import { any } from 'prop-types'

const FORESTRY_API = ''
export async function login() {
  const fieldValues = await promptCredentials()
  const { token } = await axios.post<any, { token: string }>(
    `${FORESTRY_API}/login`,
    fieldValues
  )
  writeConfig({ token })

  // TODO - Post to forestry and grab token
  // TODO - Store token in ~/.forestry credentials file
  // TODO - Display the below warning when login fails
  console.log(`Failed to log in ${fieldValues.email} - Not yet implemented`)
}
