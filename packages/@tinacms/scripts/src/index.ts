import * as fs from 'fs';
import { exec } from 'node:child_process';
import path from 'node:path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import commander from 'commander';
import { build as esbuild } from 'esbuild';
import { outputFileSync } from 'fs-extra';
import jsonDiff from 'json-diff';
import { build } from 'vite';
import { deepMerge, sequential } from './utils';

export interface Command {
  resource?: string;
  command: string;
  alias?: string;
  description: string;
  action: (...args: any[]) => void;
  examples?: string;
  subCommands?: Command[];
  options?: Option[];
}

interface Option {
  name: string;
  description: string;
}

interface Entry {
  name: string;
  target: string;
  bundle: string[] | undefined;
}

type BuildConfig = {
  entryPoints: (string | Entry)[];
};

type PackageJson = {
  name: string;
  dependencies: object | undefined;
  peerDependencies: object | undefined;
  buildConfig: BuildConfig;
};

export class BuildTina {
  program: commander.Command;

  constructor(name: string) {
    this.program = new commander.Command(name);
  }

  registerCommands(commands: Command[], noHelp = false): void {
    for (const command of commands) {
      const options = command.options || [];

      let newCmd = this.program
        .command(command.command, { hidden: noHelp })
        .description(command.description)
        .action((...args) => {
          command.action(...args);
        });

      if (command.alias) {
        newCmd = newCmd.alias(command.alias);
      }

      newCmd.on('--help', () => {
        if (command.examples) console.log(`\nExamples:\n  ${command.examples}`);
        if (command.subCommands) {
          console.log('\nCommands:');
          const optionTag = ' [options]';

          for (const subcommand of command.subCommands) {
            const commandStr = `${subcommand.command}${options.length ? optionTag : ''}`;

            const padLength =
              Math.max(
                ...command.subCommands.map((sub) => sub.command.length)
              ) + optionTag.length;

            console.log(
              `${commandStr.padEnd(padLength)} ${subcommand.description}`
            );
          }
        }

        console.log('');
      });

      for (const option of options) {
        newCmd.option(option.name, option.description);
      }

      if (command.subCommands) this.registerCommands(command.subCommands, true);
    }
  }

  async run(args: { watch?: boolean; dir?: string }): Promise<void> {
    if (args.dir) process.chdir(args.dir);

    let packageJson = null;
    try {
      const packageJsonContent: string | Buffer = fs.readFileSync(
        path.join(process.cwd(), 'package.json')
      );
      packageJson = JSON.parse(packageJsonContent.toString());
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to parse package.json: ${error.message}`);
      process.exit(1);
    }

    if (
      ['@tinacms/scripts', '@tinacms/webpack-helpers'].includes(
        packageJson.name
      )
    ) {
      console.info(`Skipping ${packageJson.name}`);
      return;
    }

    const successMessage = `${chalk.blue(`${packageJson.name}`)} built in`;
    console.time(successMessage);

    const entries: Entry[] = packageJson.buildConfig?.entryPoints.map(
      (ep: string | Entry) => {
        if (typeof ep === 'string') {
          return { name: ep, target: 'browser' };
        }
        return ep;
      }
    ) || [{ name: 'src/index.ts', target: 'browser' }];

    try {
      await sequential<Entry, boolean>(entries, async (entry) => {
        return this.buildPackage(entry, packageJson);
      });
      if (args.dir) console.timeEnd(successMessage);
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to build ${packageJson.name}: ${error.message}`);
      process.exit(1);
    }
  }

  watch(): void {
    try {
      exec('pnpm list -r --json', (error, stdout) => {
        if (error) {
          throw error;
        }

        const json = JSON.parse(stdout) as { name: string; path: string }[];
        const watchPaths: string[] = [];

        for (const pkg of json) {
          const pkgPath = 'packages';
          if (pkg.path.includes(pkgPath)) watchPaths.push(pkg.path);
        }

        chokidar
          .watch(
            watchPaths.map((p) => path.join(p, 'src', '**/*')),
            { ignored: ['**/spec/**/*', 'node_modules'] }
          )
          .on('change', async (path) => {
            const changedPackagePath = watchPaths.find((p) =>
              path.startsWith(p)
            );
            await this.run({ dir: changedPackagePath });
          });
      });
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to exec watch command: ${error.message}`);
      process.exit(1);
    }
  }

  diffTinaLock(): void {
    if (!fs.existsSync(`tina/tina-lock.json`)) {
      console.error(
        'No Tina lock found. Please run this command from the root of a Tina project ❌'
      );
      process.exit(1);
    }

    let tinaLock = null;
    try {
      const tinaLockContent: string | Buffer = fs.readFileSync(
        'tina/tina-lock.json'
      );
      tinaLock = JSON.parse(tinaLockContent.toString());
      if (!tinaLock.schema) {
        throw new Error('No schema found in the Tina lock ❌');
      }
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to parse tina/tina-lock.json: ${error.message}`);
      process.exit(1);
    }

    try {
      exec(
        'pnpm exec tinacms dev --no-server',
        { cwd: process.cwd() },
        (error, stdout, stderr) => {
          if (error) {
            throw error;
          }

          if (stderr) {
            throw new Error(stderr);
          }

          if (stdout) {
            console.log(
              stdout
                .split('\n')
                .map((line) => `> ${line}`)
                .join('\n')
            );
          }

          let newTinaLock = null;
          try {
            const newTinaLockContent: string | Buffer = fs.readFileSync(
              'tina/tina-lock.json'
            );
            newTinaLock = JSON.parse(newTinaLockContent.toString());
            if (!newTinaLock.schema) {
              throw new Error('No schema found in the new Tina lock ❌');
            }
          } catch (err) {
            const error = err as Error;
            console.error(
              `Failed to parse tina/tina-lock.json: ${error.message}`
            );
            throw error;
          }

          const { version, ...schema } = tinaLock.schema;
          const { version: newVersion, ...newSchema } = newTinaLock.schema;

          const schemaDiff = jsonDiff.diffString(schema, newSchema);
          if (schemaDiff) {
            console.error('Unexpected change(s) to Tina schema ❌');
            console.error(schemaDiff);
            throw new Error('Unexpected change(s) to Tina schema ❌');
          }

          const graphqlDiff = jsonDiff.diffString(
            tinaLock.graphql,
            newTinaLock.graphql
          );
          if (graphqlDiff) {
            console.error('Unexpected change(s) to Tina graphql schema ❌');
            console.error(graphqlDiff);
            throw new Error('Unexpected change(s) to Tina grahpql schema ❌');
          }

          console.log('No changes found in Tina lock ✅');
        }
      );
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to start dev server: ${error.message}`);
      process.exit(1);
    }
  }

  init(args: any): void {
    this.registerCommands([
      {
        command: 'build',
        description: 'Build',
        options: [
          {
            name: '--watch',
            description: 'Watch for file changes and rebuild',
          },
        ],
        action: (options) => this.run(options),
      },
      {
        command: 'watch',
        description: 'Watch',
        action: () => this.watch(),
      },
      {
        command: 'diff-tina-lock',
        description:
          'Compare the current schema for a tina project with newly generated schema',
        action: () => this.diffTinaLock(),
      },
    ]);

    this.program.usage('command [options]');

    // Error on unknown commands
    this.program.on('command:*', function () {
      console.error(
        `Invalid command: ${args.join(' ')}\nSee --help for a list of available commands.`
      );
      process.exit(1);
    });

    this.program.on('--help', function () {
      console.log(
        'You can get help on any command with "-h" or "--help".\ne.g: "forestry types:gen --help"'
      );
    });

    // No subcommands
    if (!process.argv.slice(2).length) {
      this.program.help();
    }

    this.program.parse(args);
  }

  getOutputPaths(entry: string) {
    const { dir, name } = path.parse(entry);
    const outdir = dir.replace('src', 'dist');
    const outfile = name;
    const relativeOutfile = path.join(
      outdir
        .split('/')
        .map(() => '..')
        .join('/'),
      dir,
      name
    );
    return { outdir, outfile, relativeOutfile };
  }

  async buildPackage(
    entryPoint: Entry,
    packageJSON: PackageJson
  ): Promise<boolean> {
    const entry = entryPoint.name;
    const target = entryPoint.target;
    const extension = path.extname(entry);
    const deps = packageJSON.dependencies;
    const peerDeps = packageJSON.peerDependencies;
    const external = Object.keys({ ...deps, ...peerDeps });
    const outInfo = this.getOutputPaths(entry);
    const globals = {};

    // @tinacms/app is built via @tinacms/cli (vite), no need to build it here.
    if (['@tinacms/app'].includes(packageJSON.name)) {
      console.log('skipping @tinacms/app');
      return;
    }

    // Rollup requires globals for UMD externals — using 'NOOP' as a dummy to silence warnings.
    // This has no effect unless UMD is run in a browser.
    external.forEach((ext) => (globals[ext] = 'NOOP'));

    if (target === 'node') {
      if (
        ['@tinacms/graphql', '@tinacms/datalayer'].includes(packageJSON.name)
      ) {
        await esbuild({
          entryPoints: [path.join(process.cwd(), entry)],
          bundle: true,
          platform: 'node',
          target: 'node20',
          outfile: path.join(
            process.cwd(),
            'dist',
            `${outInfo.outfile ? outInfo.outfile : 'index'}.js`
          ),
          external: external.filter((item) => {
            const entryPoint = packageJSON.buildConfig.entryPoints[0];
            if (typeof entryPoint === 'string') return false;
            return !entryPoint.bundle.includes(item);
          }),
        });

        await esbuild({
          entryPoints: [path.join(process.cwd(), entry)],
          bundle: true,
          platform: 'node',
          target: 'es2020',
          format: 'esm',
          outfile: path.join(
            process.cwd(),
            'dist',
            `${outInfo.outfile ? outInfo.outfile : 'index'}.mjs`
          ),
          external,
        });
      } else if (['@tinacms/mdx'].includes(packageJSON.name)) {
        const peerDeps = packageJSON.peerDependencies;
        await esbuild({
          entryPoints: [path.join(process.cwd(), entry)],
          bundle: true,
          platform: 'node',
          target: 'node20',
          format: 'cjs',
          outfile: path.join(process.cwd(), 'dist', 'index.js'),
          external: Object.keys({ ...peerDeps }),
        });

        await esbuild({
          entryPoints: [path.join(process.cwd(), entry)],
          bundle: true,
          platform: 'node',
          target: 'es2020',
          format: 'esm',
          outfile: path.join(process.cwd(), 'dist', 'index.mjs'),
          // Bundle dependencies, the remark ecosystem only publishes ES modules
          // and includes "development" export maps which actually throw errors during
          // development, which we don't want to expose our users to.
          external: Object.keys({ ...peerDeps }),
        });

        // The ES version is targeting the browser. This is used by the rich-text's raw mode
        await esbuild({
          entryPoints: [path.join(process.cwd(), entry)],
          bundle: true,
          platform: 'browser',
          target: 'es2020',
          format: 'esm',
          outfile: path.join(process.cwd(), 'dist', 'index.browser.mjs'),
          // Bundle dependencies, the remark ecosystem only publishes ES modules
          // and includes "development" export maps which actually throw errors during
          // development, which we don't want to expose our users to.
          external: Object.keys({ ...peerDeps }),
        });
      } else {
        await esbuild({
          entryPoints: [path.join(process.cwd(), entry)],
          bundle: true,
          platform: 'node',
          target: 'node20',
          outfile: path.join(process.cwd(), 'dist', `${outInfo.outfile}.js`),
          external,
        });
      }

      // This allows us to skip Typescript running on all packages during
      // dev mode.
      fs.writeFileSync(
        path.join(
          process.cwd(),
          'dist',
          entry.replace('src/', '').replace(extension, '.d.ts')
        ),
        `export * from "../${entry.replace(extension, '')}"`
      );

      return true;
    }

    const defaultBuildConfig: Parameters<typeof build>[0] = {
      resolve: {
        alias: {
          '@toolkit': path.resolve(process.cwd(), 'src/toolkit'),
          '@tinacms/toolkit': path.resolve(
            process.cwd(),
            'src/toolkit/index.ts'
          ),
        },
      },
      build: {
        minify: false,
        assetsInlineLimit: 0,
        lib: {
          entry: path.resolve(process.cwd(), entry),
          name: packageJSON.name,
          fileName: (format) => {
            return format === 'umd'
              ? `${outInfo.outfile}.js`
              : `${outInfo.outfile}.mjs`;
          },
        },
        outDir: outInfo.outdir,
        emptyOutDir: false, // We build multiple files in to the dir.
        sourcemap: false,
        rollupOptions: {
          onwarn(warning, warn) {
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
              return;
            }
            warn(warning);
          },
          plugins: [],
          /**
           * For some reason Rollup thinks it needs a global, though
           * I'm pretty sure it doesn't, since everything works
           *
           * By setting a global for each external dep we're silencing these warnings
           * No name was provided for external module 'react-beautiful-dnd' in output.globals – guessing 'reactBeautifulDnd'
           *
           * They don't occur for es builds, only UMD and I can't quite find
           * an authoritative response on wny they're needed or how they're
           * used in the UMD context.
           *
           * https://github.com/rollup/rollup/issues/1514#issuecomment-321877507
           * https://github.com/rollup/rollup/issues/1169#issuecomment-268815735
           */
          output: {
            globals,
          },
          external,
        },
      },
    };

    const buildConfig = packageJSON.buildConfig
      ? deepMerge(defaultBuildConfig, packageJSON.buildConfig)
      : defaultBuildConfig;

    await build({
      ...buildConfig,
    });

    outputFileSync(
      path.join(outInfo.outdir, `${outInfo.outfile}.d.ts`),
      `export * from "${outInfo.relativeOutfile}"`
    );

    return true;
  }
}
