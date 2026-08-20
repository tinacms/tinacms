import path from 'node:path';
import { parseArgs } from 'node:util';
import type { ModuleLoader } from '../codegen/load-config';
import { type CodegenResult, runCodegen } from './commands/codegen';
import { INIT_NEXT_STEPS, runInit } from './commands/init';

export interface CliContext {
  loader?: ModuleLoader;
  cwd?: string;
  log?: (message: string) => void;
  logError?: (message: string) => void;
}

const USAGE = `tinacms <command> [options]

Commands:
  init        Write the starter tina/config.ts and a first document
  codegen     Compile the schema in tina/config.ts to tina/tina-lock.json

Options:
  --root <dir>      Project root (default: the working directory)
  --config <path>   Path to the config, when it is not under tina/ (codegen)
  --check           Write nothing; exit 1 when the committed lock is stale (codegen)
  -h, --help        Show this message
`;

const describe = (result: CodegenResult): string => {
  const target = result.lockPath;
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
  if (result.warning) context.log(result.warning);
  context.log(describe(result));
  for (const file of result.admin) {
    if (file.outcome === 'created') context.log(`Wrote ${file.path}`);
  }
  return 0;
};

const initCommand = async (
  values: { root?: string },
  context: Required<Pick<CliContext, 'cwd' | 'log'>>
): Promise<number> => {
  const rootDir = values.root
    ? resolveFrom(context.cwd, values.root)
    : context.cwd;
  const result = await runInit({ rootDir });
  for (const file of result.files) {
    context.log(
      file.outcome === 'created'
        ? `Wrote ${file.path}`
        : `Kept ${file.path} (it already exists)`
    );
  }
  context.log(INIT_NEXT_STEPS);
  return 0;
};

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
    const { values } = parseArgs({
      args: rest,
      options: {
        root: { type: 'string' },
        config: { type: 'string' },
        check: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
    if (command !== 'codegen' && command !== 'init') {
      logError(`Unknown command "${command}".\n\n${USAGE}`);
      return 1;
    }
    if (values.help) {
      log(USAGE);
      return 0;
    }
    if (command === 'init') {
      return await initCommand(values, { cwd, log });
    }
    return await codegenCommand(values, { ...context, cwd, log, logError });
  } catch (cause) {
    logError(cause instanceof Error ? cause.message : String(cause));
    return 1;
  }
};
