/**

*/
const fs = require('fs')
const path = require('path')

const packPath = path.join(process.cwd(), 'package.json')

const packageJSON = fs
  .readFileSync(packPath)
  .toString()
  .replace(/workspace:\*/gm, 'latest')

fs.writeFileSync(packPath, packageJSON)
