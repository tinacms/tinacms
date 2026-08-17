import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ora } from 'ora';

// Supported Node majors are derived from this package's own `engines.node`
// (e.g. "22.x || 24.x"). This package is published and run standalone, so it
// must declare its own supported versions — the repo root isn't available at
// runtime.
function getSupportedMajors(): number[] {
  // The published CLI runs from the bundled dist/index.js, so ../package.json
  // resolves to this package's own package.json.
  const here = dirname(fileURLToPath(import.meta.url));
  try {
    const { engines } = JSON.parse(
      readFileSync(join(here, '../package.json'), 'utf8')
    );
    return [...String(engines?.node ?? '').matchAll(/(\d+)\.x/g)].map((m) =>
      Number(m[1])
    );
  } catch {
    return [];
  }
}

export function preRunChecks(spinner: Ora) {
  spinner.start('Running pre-run checks...');

  const supported = getSupportedMajors();
  const currentMajor = Number(process.versions.node.split('.')[0]);
  const isSupported = supported.includes(currentMajor);

  if (!isSupported) {
    const range = supported.length
      ? supported.map((v) => `v${v}`).join(' or ')
      : 'a supported LTS version';
    spinner.warn(
      `Node ${process.version} is not supported by create-tina-app. ` +
        `Please use ${range}. ` +
        `See https://nodejs.org/en/download/ for more details.`
    );
  } else {
    spinner.succeed(`Node ${process.version} is supported.`);
  }
}
