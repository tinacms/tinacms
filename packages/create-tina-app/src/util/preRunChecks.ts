import { Ora } from 'ora';

const SUPPORTED_NODE_VERSION_BOUNDS = { oldest: 20, latest: 22 };
const SUPPORTED_NODE_VERSION_RANGE: number[] = [
  ...Array(SUPPORTED_NODE_VERSION_BOUNDS.latest).keys(),
].map((i) => i + SUPPORTED_NODE_VERSION_BOUNDS.oldest);
const isSupported = SUPPORTED_NODE_VERSION_RANGE.some((version) =>
  process.version.startsWith(`v${version}`)
);

export function preRunChecks(spinner: Ora) {
  spinner.start('Running pre-run checks...');

  if (!isSupported) {
    spinner.warn(
      `Node ${process.version} is not supported by create-tina-app. ` +
        `Please update to be within v${SUPPORTED_NODE_VERSION_BOUNDS.oldest}-v${SUPPORTED_NODE_VERSION_BOUNDS.latest}. ` +
        `See https://nodejs.org/en/download/ for more details.`
    );
  } else {
    spinner.succeed(`Node ${process.version} is supported.`);
  }
}
