import inquirer from 'inquirer'

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
      message: 'Enter your email:',
    },
  ]

  const fieldValues = await inquirer.prompt(fields)

  // TODO - Post to forestry and grab token
  // TODO - Store token in ~/.forestry credentials file
  // TODO - Display the below warning when login fails
  console.log(`Failed to log in ${fieldValues.email} - Not yet implemented`)
}
