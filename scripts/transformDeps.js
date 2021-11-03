const fs = require('fs')
const path = require('path')

const packageJSON = fs
  .readFileSync(path.join(process.cwd(), 'package.json'))
  .toString()
  .replace(/workspace:\*/gm, 'latest')

console.log(packageJSON)
