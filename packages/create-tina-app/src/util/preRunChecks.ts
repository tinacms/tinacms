/**

*/

export const preRunChecks = () => {
  if (process.version.startsWith('v15')) {
    console.warn(
      'WARNING: Version 15 of Node.js is not supported in create-tina-app, please update to the latest LTS version. See https://nodejs.org/en/download/ for more details'
    )
  }
}
