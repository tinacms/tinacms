const fs = require('fs')
const path = require('path')

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

/**
 * Recursively finds all package.json files in a directory
 * @param {string} dir - Directory to search in
 * @param {RegExp[]} ignorePatterns - Array of regex patterns to ignore
 * @returns {string[]} - Array of file paths
 */
function findPackageJsonFiles(dir, ignorePatterns) {
  const results = [];

  // Check if the current directory should be ignored
  if (ignorePatterns.some(pattern => pattern.test(dir))) {
    return results;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Check if the current file/directory should be ignored
    if (ignorePatterns.some(pattern => pattern.test(filePath))) {
      continue;
    }

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      results.push(...findPackageJsonFiles(filePath, ignorePatterns));
    } else if (file === 'package.json') {
      // Found a package.json file
      results.push(filePath);
    }
  }

  return results;
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

// Define ignore patterns as regex
const ignorePatterns = [
  /node_modules/,
  /dist/
];

// Find all package.json files in the @tinacms packages
const packageJsonFiles = findPackageJsonFiles('packages', ignorePatterns);

console.log(`Found ${packageJsonFiles.length} package.json files in packages directory`)

// Process each package.json file
packageJsonFiles.forEach(file => {
  updatePackageJson(file)
})

console.log('Done!')
