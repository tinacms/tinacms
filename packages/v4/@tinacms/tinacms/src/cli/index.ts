// The `tinacms` bin's command dispatch. v4 folds the CLI into the runtime package
// (ADR-001), so this lives beside the code it drives rather than in a separate
// @tinacms/cli.
//
// Arguments are parsed with node:util's parseArgs — the command surface is four
// flags wide, which is not worth a dependency.

import { parseArgs } from 'node:util';
import type { ModuleLoader } from '../codegen/load-config';
import { type CodegenResult, runCodegen } from './commands/codegen';

export interface CliContext {
  // The Vite server the bin used to load this module. Handed down so the config
  // read reuses it instead of booting a second one.
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
  -h, --help        Show this message
`;

const describe = (result: CodegenResult): string => {
  const target = `${result.lockPath}`;
  if (result.outcome === 'created') return `Wrote ${target}`;
  if (result.outcome === 'updated') return `Updated ${target}`;
  return `${target} is up to date`;
};

const codegenCommand = async (
  values: { root?: string; config?: string },
  context: Required<Pick<CliContext, 'cwd' | 'log'>> & CliContext
): Promise<number> => {
  const result = await runCodegen({
    rootDir: values.root ? resolveFrom(context.cwd, values.root) : context.cwd,
    configPath: values.config
      ? resolveFrom(context.cwd, values.config)
      : undefined,
    load: { loader: context.loader },
  });
  // The stale path regenerates rather than failing, so the reason is worth saying
  // out loud — an unexplained lock diff in a commit is how drift gets normalised.
  if (result.warning) context.log(result.warning);
  context.log(describe(result));
  return 0;
};

const resolveFrom = (cwd: string, target: string): string =>
  target.startsWith('/') ? target : `${cwd}/${target}`;

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

  const { values } = parseArgs({
    args: rest,
    options: {
      root: { type: 'string' },
      config: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });
  if (values.help) {
    log(USAGE);
    return 0;
  }

  try {
    if (command === 'codegen') {
      return await codegenCommand(values, { ...context, cwd, log });
    }
    logError(`Unknown command "${command}".\n\n${USAGE}`);
    return 1;
  } catch (cause) {
    // A config or lock failure is a message for the developer, not a stack trace:
    // every throw on this path carries a written explanation.
    logError(cause instanceof Error ? cause.message : String(cause));
    return 1;
  }
};
