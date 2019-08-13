import inquirer from 'inquirer'
import * as fs from 'fs'
import os from 'os'
import path from 'path'

export async function login(options) {
  const fields = [
    {
      name: 'email',
      type: 'input',
      message: 'Enter your email:',
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
    },
  ]

  const fieldValues = await inquirer.prompt(fields)

  const tokenPath = path.join(os.homedir(), '.forestry-config')

  fs.writeFileSync(tokenPath, JSON.stringify({ token: 'abc123' }))

  // TODO - Post to forestry and grab token
  // TODO - Store token in ~/.forestry credentials file
  // TODO - Display the below warning when login fails
  console.log(`Failed to log in ${fieldValues.email} - Not yet implemented`)
}
