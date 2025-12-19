import { execSync } from 'child_process';
import fs from 'fs-extra';
import { Ora } from 'ora';

function isInGitRepository(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (_) {}
  return false;
}

function isInMercurialRepository(): boolean {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true;
  } catch (_) {}
  return false;
}

export function makeFirstCommit(root: string) {
  execSync('git checkout -b main', { stdio: 'ignore' });

  execSync('git add -A', { stdio: 'ignore' });
  execSync('git commit -m "Initial commit from Create Tina App"', {
    stdio: 'ignore',
  });
}

export function initializeGit(spinner: Ora): boolean {
  execSync('git --version', { stdio: 'ignore' });

  if (isInGitRepository() || isInMercurialRepository()) {
    spinner.warn('Already in a Git repository, skipping.');
    return false;
  }

  if (!fs.existsSync('.gitignore')) {
    spinner.warn(
      'There is no .gitignore file in this repository, creating one...'
    );
    fs.writeFileSync(
      '.gitignore',
      `node_modules
.yarn/*
.DS_Store
.cache
.next/
`
    );
  }

  execSync('git init', { stdio: 'ignore' });

  return true;
}
