const fs = require('fs')

main().then(packages => {
  packages.filter(deleteUnusedPackage).forEach(prepareForPublishing)
})

async function main() {
  try {
    return fs.readdirSync('./packages')
  } catch (err) {
    console.error(err)
  }
}

function deleteUnusedPackage(packageName) {
  if (packageName === '@testing') {
    return true
  }

  const usedPackages = [
    '@tinacms',
    'next-tinacms-json',
    'next-tinacms-markdown',
    'react-tinacms-date',
    'react-tinacms-editor',
    'react-tinacms-inline',
    'tinacms',
  ]

  if (usedPackages.includes(packageName)) {
    return true
  }

  // delete directory recursively
  const dir = `./packages/${packageName}`
  try {
    fs.rmSync(dir, { recursive: true })
  } catch (err) {
    console.error(err)
  }

  console.log(`Deleted: ${packageName}`)
}

function prepareForPublishing(packageName) {
  if (packageName === '@testing') {
    return
  }

  try {
    if (packageName === '@tinacms') {
      fs.readdir(`./packages/@tinacms`, 'utf8', (err, files) => {
        if (err) {
          throw err
        }

        files
          .filter(file => {
            if (file.startsWith('.')) {
              return false
            }
            return true
          })
          .forEach(atTinacmsPackageName => {
            formatPackageJSON(`@tinacms/${atTinacmsPackageName}`)
          })
      })

      return
    }

    formatPackageJSON(packageName)
  } catch (err) {
    console.error(err)
  }
}

function formatPackageJSON(packageName) {
  const filePath = `./packages/${packageName}/package.json`

  try {
    if (!fs.existsSync(filePath)) {
      return
    }
  } catch (err) {
    console.error(error)
  }

  // console.log(`\npackages/${packageName}/package.json`)

  let json

  try {
    json = fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    console.error(err)
  }

  const data = JSON.parse(json)

  // console.log('Updating fields...\n')

  if (packageName.startsWith('@')) {
    data.name = `@einsteinindustries/${packageName
      .substring(1)
      .replace(/\//, '-')}`
    // console.log(`\t"name": `, data.name)
  } else {
    data.name = `@einsteinindustries/${packageName.replace(/\//, '-')}`
    // console.log(`\t"name": `, data.name)
  }

  if (data?.keywords) {
    data.keywords = []
    // console.log(`\t"keywords: []`)
  }

  if (data?.bugs?.url) {
    data.bugs.url = 'https://github.com/einstein/tinacms/issues'
    // console.log(`\t"bugs": { "url": "${data.bugs.url}" }`)
  }

  if (data?.repository?.url) {
    data.repository.url = 'https://github.com/einstein/tinacms.git'
    // console.log(`\t"repository": { "url": "${data.repository.url}" }`)
  }

  // console.log(JSON.stringify(data, null, 2))

  try {
    json = JSON.stringify(data, null, 2) + '\n'
    fs.writeFileSync(filePath, json)
  } catch (err) {
    console.error(err)
  }

  if (packageName !== data.name) {
    console.log(`✅ ${packageName} → ${data.name}`)
  }
}
