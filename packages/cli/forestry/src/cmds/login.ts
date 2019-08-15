import inquirer from 'inquirer'
import { writeConfig } from '../config'

export async function login() {
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

  writeConfig({ token: 'abc123' })

  // TODO - Post to forestry and grab token
  // TODO - Store token in ~/.forestry credentials file
  // TODO - Display the below warning when login fails
  console.log(`Failed to log in ${fieldValues.email} - Not yet implemented`)
}
