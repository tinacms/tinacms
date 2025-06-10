var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BuildTina: () => BuildTina
});
module.exports = __toCommonJS(index_exports);
var fs = __toESM(require("fs"));
var import_node_child_process = require("child_process");
var import_node_path = __toESM(require("path"));
var import_chalk = __toESM(require("chalk"));
var import_chokidar = __toESM(require("chokidar"));
var import_commander = __toESM(require("commander"));
var import_esbuild = require("esbuild");
var import_fs_extra = require("fs-extra");
var import_json_diff = __toESM(require("json-diff"));
var import_vite = require("vite");

// src/utils.ts
function deepMerge(target, source) {
  for (const key in source) {
    if (!source.hasOwnProperty(key) || key === "__proto__" || key === "constructor")
      continue;
    if (source[key] instanceof Object && !Array.isArray(source[key]) && target.hasOwnProperty(key)) {
      target[key] = deepMerge(target[key], source[key]);
    } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      target[key] = [.../* @__PURE__ */ new Set([...target[key], ...source[key]])];
    } else if (Array.isArray(source[key])) {
      target[key] = [...source[key]];
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
async function sequential(items, callback) {
  const accum = [];
  if (!items) {
    return [];
  }
  const reducePromises = async (previous, endpoint) => {
    const prev = await previous;
    if (prev) accum.push(prev);
    return callback(endpoint, accum.length);
  };
  const result = await items.reduce(reducePromises, Promise.resolve());
  if (result) {
    accum.push(result);
  }
  return accum;
}

// src/index.ts
var BuildTina = class {
  constructor(name) {
    this.program = new import_commander.default.Command(name);
  }
  registerCommands(commands, noHelp = false) {
    for (const command of commands) {
      const options = command.options || [];
      let newCmd = this.program.command(command.command, { hidden: noHelp }).description(command.description).action((...args) => {
        command.action(...args);
      });
      if (command.alias) {
        newCmd = newCmd.alias(command.alias);
      }
      newCmd.on("--help", () => {
        if (command.examples) console.log(`
Examples:
  ${command.examples}`);
        if (command.subCommands) {
          console.log("\nCommands:");
          const optionTag = " [options]";
          for (const subcommand of command.subCommands) {
            const commandStr = `${subcommand.command}${options.length ? optionTag : ""}`;
            const padLength = Math.max(
              ...command.subCommands.map((sub) => sub.command.length)
            ) + optionTag.length;
            console.log(
              `${commandStr.padEnd(padLength)} ${subcommand.description}`
            );
          }
        }
        console.log("");
      });
      for (const option of options) {
        newCmd.option(option.name, option.description);
      }
      if (command.subCommands) this.registerCommands(command.subCommands, true);
    }
  }
  async run(args) {
    var _a;
    if (args.dir) process.chdir(args.dir);
    let packageJson = null;
    try {
      const packageJsonContent = fs.readFileSync(
        import_node_path.default.join(process.cwd(), "package.json")
      );
      packageJson = JSON.parse(packageJsonContent.toString());
    } catch (err) {
      const error = err;
      console.error(`Failed to parse package.json: ${error.message}`);
      process.exit(1);
    }
    if (["@tinacms/scripts", "@tinacms/webpack-helpers"].includes(
      packageJson.name
    )) {
      console.info(`Skipping ${packageJson.name}`);
      return;
    }
    const successMessage = `${import_chalk.default.blue(`${packageJson.name}`)} built in`;
    console.time(successMessage);
    const entries = ((_a = packageJson.buildConfig) == null ? void 0 : _a.entryPoints.map(
      (ep) => {
        if (typeof ep === "string") {
          return { name: ep, target: "browser" };
        }
        return ep;
      }
    )) || [{ name: "src/index.ts", target: "browser" }];
    try {
      await sequential(entries, async (entry) => {
        return this.buildPackage(entry, packageJson);
      });
      if (args.dir) console.timeEnd(successMessage);
    } catch (err) {
      const error = err;
      console.error(`Failed to build ${packageJson.name}: ${error.message}`);
      process.exit(1);
    }
  }
  watch() {
    try {
      (0, import_node_child_process.exec)("pnpm list -r --json", (error, stdout) => {
        if (error) {
          throw error;
        }
        const json = JSON.parse(stdout);
        const watchPaths = [];
        for (const pkg of json) {
          const pkgPath = "packages";
          if (pkg.path.includes(pkgPath)) watchPaths.push(pkg.path);
        }
        import_chokidar.default.watch(
          watchPaths.map((p) => import_node_path.default.join(p, "src", "**/*")),
          { ignored: ["**/spec/**/*", "node_modules"] }
        ).on("change", async (path2) => {
          const changedPackagePath = watchPaths.find(
            (p) => path2.startsWith(p)
          );
          await this.run({ dir: changedPackagePath });
        });
      });
    } catch (err) {
      const error = err;
      console.error(`Failed to exec watch command: ${error.message}`);
      process.exit(1);
    }
  }
  diffTinaLock() {
    if (!fs.existsSync(`tina/tina-lock.json`)) {
      console.error(
        "No Tina lock found. Please run this command from the root of a Tina project \u274C"
      );
      process.exit(1);
    }
    let tinaLock = null;
    try {
      const tinaLockContent = fs.readFileSync(
        "tina/tina-lock.json"
      );
      tinaLock = JSON.parse(tinaLockContent.toString());
      if (!tinaLock.schema) {
        throw new Error("No schema found in the Tina lock \u274C");
      }
    } catch (err) {
      const error = err;
      console.error(`Failed to parse tina/tina-lock.json: ${error.message}`);
      process.exit(1);
    }
    try {
      (0, import_node_child_process.exec)(
        "pnpm exec tinacms dev --no-server",
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
              stdout.split("\n").map((line) => `> ${line}`).join("\n")
            );
          }
          let newTinaLock = null;
          try {
            const newTinaLockContent = fs.readFileSync(
              "tina/tina-lock.json"
            );
            newTinaLock = JSON.parse(newTinaLockContent.toString());
            if (!newTinaLock.schema) {
              throw new Error("No schema found in the new Tina lock \u274C");
            }
          } catch (err) {
            const error2 = err;
            console.error(
              `Failed to parse tina/tina-lock.json: ${error2.message}`
            );
            throw error2;
          }
          const _a = tinaLock.schema, { version } = _a, schema = __objRest(_a, ["version"]);
          const _b = newTinaLock.schema, { version: newVersion } = _b, newSchema = __objRest(_b, ["version"]);
          const schemaDiff = import_json_diff.default.diffString(schema, newSchema);
          if (schemaDiff) {
            console.error("Unexpected change(s) to Tina schema \u274C");
            console.error(schemaDiff);
            throw new Error("Unexpected change(s) to Tina schema \u274C");
          }
          const graphqlDiff = import_json_diff.default.diffString(
            tinaLock.graphql,
            newTinaLock.graphql
          );
          if (graphqlDiff) {
            console.error("Unexpected change(s) to Tina graphql schema \u274C");
            console.error(graphqlDiff);
            throw new Error("Unexpected change(s) to Tina grahpql schema \u274C");
          }
          console.log("No changes found in Tina lock \u2705");
        }
      );
    } catch (err) {
      const error = err;
      console.error(`Failed to start dev server: ${error.message}`);
      process.exit(1);
    }
  }
  init(args) {
    this.registerCommands([
      {
        command: "build",
        description: "Build",
        options: [
          {
            name: "--watch",
            description: "Watch for file changes and rebuild"
          }
        ],
        action: (options) => this.run(options)
      },
      {
        command: "watch",
        description: "Watch",
        action: () => this.watch()
      },
      {
        command: "diff-tina-lock",
        description: "Compare the current schema for a tina project with newly generated schema",
        action: () => this.diffTinaLock()
      }
    ]);
    this.program.usage("command [options]");
    this.program.on("command:*", function() {
      console.error(
        `Invalid command: ${args.join(" ")}
See --help for a list of available commands.`
      );
      process.exit(1);
    });
    this.program.on("--help", function() {
      console.log(
        'You can get help on any command with "-h" or "--help".\ne.g: "forestry types:gen --help"'
      );
    });
    if (!process.argv.slice(2).length) {
      this.program.help();
    }
    this.program.parse(args);
  }
  getOutputPaths(entry) {
    const { dir, name } = import_node_path.default.parse(entry);
    const outdir = dir.replace("src", "dist");
    const outfile = name;
    const relativeOutfile = import_node_path.default.join(
      outdir.split("/").map(() => "..").join("/"),
      dir,
      name
    );
    return { outdir, outfile, relativeOutfile };
  }
  async buildPackage(entryPoint, packageJSON) {
    const entry = entryPoint.name;
    const target = entryPoint.target;
    const extension = import_node_path.default.extname(entry);
    const deps = packageJSON.dependencies;
    const peerDeps = packageJSON.peerDependencies;
    const external = Object.keys(__spreadValues(__spreadValues({}, deps), peerDeps));
    const outInfo = this.getOutputPaths(entry);
    const globals = {};
    if (["@tinacms/app"].includes(packageJSON.name)) {
      console.log("skipping @tinacms/app");
      return;
    }
    external.forEach((ext) => globals[ext] = "NOOP");
    if (target === "node") {
      if (["@tinacms/graphql", "@tinacms/datalayer"].includes(packageJSON.name)) {
        await (0, import_esbuild.build)({
          entryPoints: [import_node_path.default.join(process.cwd(), entry)],
          bundle: true,
          platform: "node",
          target: "node20",
          outfile: import_node_path.default.join(
            process.cwd(),
            "dist",
            `${outInfo.outfile ? outInfo.outfile : "index"}.js`
          ),
          external: external.filter((item) => {
            const entryPoint2 = packageJSON.buildConfig.entryPoints[0];
            if (typeof entryPoint2 === "string") return false;
            return !entryPoint2.bundle.includes(item);
          })
        });
        await (0, import_esbuild.build)({
          entryPoints: [import_node_path.default.join(process.cwd(), entry)],
          bundle: true,
          platform: "node",
          target: "es2020",
          format: "esm",
          outfile: import_node_path.default.join(
            process.cwd(),
            "dist",
            `${outInfo.outfile ? outInfo.outfile : "index"}.mjs`
          ),
          external
        });
      } else if (["@tinacms/mdx"].includes(packageJSON.name)) {
        const peerDeps2 = packageJSON.peerDependencies;
        await (0, import_esbuild.build)({
          entryPoints: [import_node_path.default.join(process.cwd(), entry)],
          bundle: true,
          platform: "node",
          target: "node20",
          format: "cjs",
          outfile: import_node_path.default.join(process.cwd(), "dist", "index.js"),
          external: Object.keys(__spreadValues({}, peerDeps2))
        });
        await (0, import_esbuild.build)({
          entryPoints: [import_node_path.default.join(process.cwd(), entry)],
          bundle: true,
          platform: "node",
          target: "es2020",
          format: "esm",
          outfile: import_node_path.default.join(process.cwd(), "dist", "index.mjs"),
          // Bundle dependencies, the remark ecosystem only publishes ES modules
          // and includes "development" export maps which actually throw errors during
          // development, which we don't want to expose our users to.
          external: Object.keys(__spreadValues({}, peerDeps2))
        });
        await (0, import_esbuild.build)({
          entryPoints: [import_node_path.default.join(process.cwd(), entry)],
          bundle: true,
          platform: "browser",
          target: "es2020",
          format: "esm",
          outfile: import_node_path.default.join(process.cwd(), "dist", "index.browser.mjs"),
          // Bundle dependencies, the remark ecosystem only publishes ES modules
          // and includes "development" export maps which actually throw errors during
          // development, which we don't want to expose our users to.
          external: Object.keys(__spreadValues({}, peerDeps2))
        });
      } else {
        await (0, import_esbuild.build)({
          entryPoints: [import_node_path.default.join(process.cwd(), entry)],
          bundle: true,
          platform: "node",
          target: "node20",
          outfile: import_node_path.default.join(process.cwd(), "dist", `${outInfo.outfile}.js`),
          external
        });
      }
      fs.writeFileSync(
        import_node_path.default.join(
          process.cwd(),
          "dist",
          entry.replace("src/", "").replace(extension, ".d.ts")
        ),
        `export * from "../${entry.replace(extension, "")}"`
      );
      return true;
    }
    const defaultBuildConfig = {
      resolve: {
        alias: {
          "@toolkit": import_node_path.default.resolve(process.cwd(), "src/toolkit"),
          "@tinacms/toolkit": import_node_path.default.resolve(
            process.cwd(),
            "src/toolkit/index.ts"
          )
        }
      },
      build: {
        minify: false,
        assetsInlineLimit: 0,
        lib: {
          entry: import_node_path.default.resolve(process.cwd(), entry),
          name: packageJSON.name,
          fileName: (format) => {
            return format === "umd" ? `${outInfo.outfile}.js` : `${outInfo.outfile}.mjs`;
          }
        },
        outDir: outInfo.outdir,
        emptyOutDir: false,
        // We build multiple files in to the dir.
        sourcemap: false,
        rollupOptions: {
          onwarn(warning, warn) {
            if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
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
            globals
          },
          external
        }
      }
    };
    const buildConfig = packageJSON.buildConfig ? deepMerge(defaultBuildConfig, packageJSON.buildConfig) : defaultBuildConfig;
    await (0, import_vite.build)(__spreadValues({}, buildConfig));
    (0, import_fs_extra.outputFileSync)(
      import_node_path.default.join(outInfo.outdir, `${outInfo.outfile}.d.ts`),
      `export * from "${outInfo.relativeOutfile}"`
    );
    return true;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BuildTina
});
