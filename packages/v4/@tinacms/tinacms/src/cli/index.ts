// Command dispatch of the `tinacms` bin. The CLI lives in the runtime package
// (ADR-001); four flags do not need an argument-parsing dependency.

import path from 'node:path';
import { parseArgs } from 'node:util';
import type { ModuleLoader } from '../codegen/load-config';
import { type CodegenResult, runCodegen } from './commands/codegen';

export interface CliContext {
  // The Vite server the bin used to load this module, so the config read does
  // not start a second one.
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
  // Under --check the lock on disk is the answer: this is how CI catches a
  // config that changed without its lock.
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
  // A stale lock is rewritten without failing the build, so state the reason.
  if (result.warning) context.log(result.warning);
  context.log(describe(result));
  return 0;
};

// path.resolve, not a `/` test: `C:\site` is absolute on Windows.
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
    // Inside the try: an unknown flag makes parseArgs throw.
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
    // Command before --help, so a typo does not exit 0 just because the user
    // also asked for usage.
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
    // A message for the developer, not a stack trace.
    logError(cause instanceof Error ? cause.message : String(cause));
    return 1;
  }
};
