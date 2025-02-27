import { log } from './logger';

const SUPPORTED_NODE_VERSION_BOUNDS = { oldest: 18, latest: 22 };
const SUPPORTED_NODE_VERSION_RANGE: number[] = [
  ...Array(SUPPORTED_NODE_VERSION_BOUNDS.latest).keys(),
].map((i) => i + SUPPORTED_NODE_VERSION_BOUNDS.oldest);
const isSupported = SUPPORTED_NODE_VERSION_RANGE.some((version) =>
  process.version.startsWith(`v${version}`)
);

export function preRunChecks() {
  checkSupportedNodeVersion();
}

function checkSupportedNodeVersion() {
  if (!isSupported) {
    log.warn(
      `Node ${process.version} is not supported by create-tina-app. ` +
        `Please update to be within v${SUPPORTED_NODE_VERSION_BOUNDS.oldest}-v${SUPPORTED_NODE_VERSION_BOUNDS.latest}. ` +
        `See https://nodejs.org/en/download/ for more details.`
    );
  }
}
