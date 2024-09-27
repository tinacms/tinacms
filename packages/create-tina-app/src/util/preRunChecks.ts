import { log } from './logger'

export const SUPPORTED_NODE_VERSIONS = ['18', '20', '22']

export function preRunChecks() {
  checkSupportedNodeVersion()
}

function checkSupportedNodeVersion() {
  if (
    !SUPPORTED_NODE_VERSIONS.some((version) =>
      process.version.startsWith(`v${version}`)
    )
  ) {
    log.warn(
      `Version ${process.version} of Node.js is not supported in create-tina-app, please update to the latest LTS version. See https://nodejs.org/en/download/ for more details.`
    )
  }
}
