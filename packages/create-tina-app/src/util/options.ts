import { Command } from 'commander';
import { version, name } from '../../package.json';
import { TEMPLATES } from '../templates';
import { PKG_MANAGERS } from './packageManagers';
import { TextStyles } from './textstyles';

export interface CreateOptions {
  template: string;
  pkgManager: string;
  dir: string;
  noTelemetry: boolean;
  projectName: string;
  verbose: boolean;
}

export function extractOptions(args: string[]): CreateOptions {
  let projectName = '';
  const program = new Command(name);
  program
    .version(version)
    .option(
      '-t, --template <template>',
      `Choose which template to start from. Valid templates are: ${TEMPLATES.map(
        (x) => x.value
      )}`
    )
    .option(
      '-p, --pkg-manager <pkg-manager>',
      `Choose which package manager to use. Valid package managers are: ${PKG_MANAGERS}`
    )
    .option(
      '-d, --dir <dir>',
      'Choose which directory to run this script from.'
    )
    .option('-v, --verbose', 'Enable verbose output.')
    .option('--noTelemetry', 'Disable anonymous telemetry that is collected.')
    .arguments('[project-directory]')
    .usage(`${TextStyles.success('<project-directory>')} [options]`)
    .action((name) => {
      projectName = name;
    });

  program.parse(args);
  const opts = program.opts() as CreateOptions;
  if (opts.dir) {
    process.chdir(opts.dir);
  }

  if (projectName) {
    opts.projectName = projectName;
  }

  return opts;
}
