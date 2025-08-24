const fs = require('fs')
const path = require('path')
const glob = require('glob')

/**
 * This script runs over all package.json files within this checkout to update the publish config to our registry.
 * 
 * Unfortunately we cannot rely on using the likes of npm_config_publishConfig_registry / @tinacms:registry etc 
 * because publishConfig doesn't have any higher level override.
 * 
 * Note: It is expected to run this script within a CI environment as upstream change these files often where we 
 * only want to update key values within them. Also upstream uses both tabs and spaces across their package.json 
 * files which are merge nightmares.
 * 
 * Call this file via node scripts/update-package-jsons.js
 */

const TARGET_CONFIG = {
  publishConfig: {
    registry: "https://streamliners-npm-368438108069.d.codeartifact.ap-southeast-2.amazonaws.com/npm/tina-cms-snz/"
  },
  repository: {
    url: "https://github.com/StreamlinersNZ/tinacms.git"
  }
}

function updatePackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const packageJson = JSON.parse(content)
    
    // Update or add publishConfig
    packageJson.publishConfig = TARGET_CONFIG.publishConfig
    
    // Update repository URL
    if (packageJson.repository) {
      // Keep the directory if it exists, otherwise use the package name
      const directory = packageJson.repository.directory || `packages/${packageJson.name}`
      packageJson.repository = {
        ...TARGET_CONFIG.repository,
        directory
      }
    } else {
      packageJson.repository = TARGET_CONFIG.repository
    }
    
    // Write back to file with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n')
    console.log(`✅ Updated ${filePath}`)
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error)
  }
}

// Find all package.json files in the @tinacms packages
const packageJsonFiles = glob.sync('packages/**/package.json', {
  ignore: ['**/node_modules/**', '**/dist/**']
})

console.log(`Found ${packageJsonFiles.length} package.json files in packages directory`)

// Process each package.json file
packageJsonFiles.forEach(file => {
  updatePackageJson(file)
})

console.log('Done!') 