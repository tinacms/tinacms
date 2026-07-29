// The command dispatch of the `tinacms` bin. v4 puts the CLI in the runtime package
// (ADR-001), so this file sits beside the code that it drives. There is no separate
// @tinacms/cli package.
//
// parseArgs from node:util reads the arguments. The command surface is four flags wide,
// which does not need a dependency.

import path from 'node:path';
import { parseArgs } from 'node:util';
import type { ModuleLoader } from '../codegen/load-config';
import { type CodegenResult, runCodegen } from './commands/codegen';

export interface CliContext {
  // The Vite server that the bin used to load this module. The bin passes it down, so
  // the config read uses it and does not start a second one.
  loader?: ModuleLoader;
  cwd?: string;
  log?: (message: string) => void;
  logError?: (message: string) => void;
}

const USAGE = `tinacms <command> [options]

Commands:
  codegen     Compile the schema in tina/config.ts to tina/tina-lock.json

Options:
  --root <dir>      Project root (default: the working directory)
  --config <path>   Path to the config, when it is not under tina/
  --check           Write nothing; exit 1 when the committed lock is stale
  -h, --help        Show this message
`;

const describe = (result: CodegenResult): string => {
  const target = `${result.lockPath}`;
  if (result.outcome === 'created') return `Wrote ${target}`;
  if (result.outcome === 'updated') return `Updated ${target}`;
  return `${target} is up to date`;
};

const codegenCommand = async (
  values: { root?: string; config?: string; check?: boolean },
  context: Required<Pick<CliContext, 'cwd' | 'log' | 'logError'>> & CliContext
): Promise<number> => {
  const result = await runCodegen({
    rootDir: values.root ? resolveFrom(context.cwd, values.root) : context.cwd,
    configPath: values.config
      ? resolveFrom(context.cwd, values.config)
      : undefined,
    load: { loader: context.loader },
    write: !values.check,
  });
  // Under --check the lock on disk is the answer, and the command reports it instead
  // of repairing it. The pipeline of the project never runs this bin (refer to the CLI
  // rule in packages/v4/README.md), so this is how CI catches a config that changed
  // without its lock.
  if (values.check) {
    if (result.outcome === 'unchanged') {
      context.log(`${result.lockPath} is up to date`);
      return 0;
    }
    context.logError(
      `${result.lockPath} is out of date. Run \`tinacms codegen\` and commit the result.`
    );
    return 1;
  }
  // A stale lock is written again, and does not fail the build, so this states the
  // reason. A change to the lock with no explanation in a commit hides the drift.
  if (result.warning) context.log(result.warning);
  context.log(describe(result));
  return 0;
};

// path.resolve, not a `/` test: `C:\\site` is absolute and `startsWith('/')` says it
// is not, so it was concatenated onto cwd and reported as a missing config.
const resolveFrom = (cwd: string, target: string): string =>
  path.resolve(cwd, target);

export const runCli = async (
  argv: string[],
  context: CliContext = {}
): Promise<number> => {
  const cwd = context.cwd ?? process.cwd();
  const log = context.log ?? ((message: string) => console.log(message));
  const logError =
    context.logError ?? ((message: string) => console.error(message));

  const [command, ...rest] = argv;
  if (!command || command === '-h' || command === '--help') {
    log(USAGE);
    return command ? 0 : 1;
  }

  try {
    // Inside the try. An unknown flag, or `--root` with no value, makes parseArgs
    // throw, and outside this block that reached the caller as a stack trace — which
    // is what the comment below promises it never does.
    const { values } = parseArgs({
      args: rest,
      options: {
        root: { type: 'string' },
        config: { type: 'string' },
        check: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
    });
    // The command is checked before --help, so a typo does not exit 0 just because
    // the user also asked for usage.
    if (command !== 'codegen') {
      logError(`Unknown command "${command}".\n\n${USAGE}`);
      return 1;
    }
    if (values.help) {
      log(USAGE);
      return 0;
    }
    return await codegenCommand(values, { ...context, cwd, log, logError });
  } catch (cause) {
    // A failure of the config or of the lock is a message for the developer, and not
    // a stack trace. Every throw on this path carries an explanation.
    logError(cause instanceof Error ? cause.message : String(cause));
    return 1;
  }
};
