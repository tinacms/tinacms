'use strict'
/**

*/
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
exports.__esModule = true
exports.sequential = exports.buildIt = exports.init = exports.run = void 0
var vite_1 = require('vite')
var esbuild_1 = require('esbuild')
var fs_extra_1 = require('fs-extra')
var path_1 = require('path')
var chokidar_1 = require('chokidar')
var child_process_1 = require('child_process')
var chalk_1 = require('chalk')
var commander = require('commander')
var program = new commander.Command('Tina Build')
var registerCommands = function (commands, noHelp) {
  if (noHelp === void 0) {
    noHelp = false
  }
  commands.forEach(function (command, i) {
    var newCmd = program
      .command(command.command, { noHelp: noHelp })
      .description(command.description)
      .action(function () {
        var args = []
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i]
        }
        command.action.apply(command, args)
      })
    if (command.alias) {
      newCmd = newCmd.alias(command.alias)
    }
    newCmd.on('--help', function () {
      if (command.examples) {
        console.log('\nExamples:\n  '.concat(command.examples))
      }
      if (command.subCommands) {
        console.log('\nCommands:')
        var optionTag_1 = ' [options]'
        command.subCommands.forEach(function (subcommand, i) {
          var commandStr = ''
            .concat(subcommand.command)
            .concat((subcommand.options || []).length ? optionTag_1 : '')
          var padLength =
            Math.max.apply(
              Math,
              command.subCommands.map(function (sub) {
                return sub.command.length
              })
            ) + optionTag_1.length
          console.log(
            ''
              .concat(commandStr.padEnd(padLength), ' ')
              .concat(subcommand.description)
          )
        })
      }
      console.log('')
    })
    ;(command.options || []).forEach(function (option) {
      newCmd.option(option.name, option.description)
    })
    if (command.subCommands) {
      registerCommands(command.subCommands, true)
    }
  })
}
var run = function (args) {
  return __awaiter(void 0, void 0, void 0, function () {
    var packageDir, packageJSON, _a, _b, successMessage, entries, e_1
    var _c
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          if (args.dir) {
            process.chdir(args.dir)
          }
          packageDir = process.cwd()
          _b = (_a = JSON).parse
          return [
            4 /*yield*/,
            fs_extra_1['default']
              .readFileSync(path_1['default'].join(packageDir, 'package.json'))
              .toString(),
          ]
        case 1:
          packageJSON = _b.apply(_a, [_d.sent()])
          if (
            ['@tinacms/scripts', '@tinacms/webpack-helpers'].includes(
              packageJSON.name
            )
          ) {
            console.log('skipping '.concat(packageJSON.name))
            return [2 /*return*/]
          }
          successMessage = ''.concat(
            chalk_1['default'].blue(''.concat(packageJSON.name)),
            ' built in'
          )
          console.time(successMessage)
          entries = ((_c =
            packageJSON === null || packageJSON === void 0
              ? void 0
              : packageJSON.buildConfig) === null || _c === void 0
            ? void 0
            : _c.entryPoints) || ['src/index.ts']
          _d.label = 2
        case 2:
          _d.trys.push([2, 4, , 5])
          return [
            4 /*yield*/,
            (0, exports.sequential)(entries, function (entry) {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  return [
                    2 /*return*/,
                    (0, exports.buildIt)(entry, packageJSON),
                  ]
                })
              })
            }),
          ]
        case 3:
          _d.sent()
          if (args.dir) {
            console.timeEnd(successMessage)
          }
          return [3 /*break*/, 5]
        case 4:
          e_1 = _d.sent()
          console.log('Error building '.concat(packageJSON.name))
          throw new Error(e_1)
        case 5:
          return [2 /*return*/]
      }
    })
  })
}
exports.run = run
var watch = function () {
  ;(0, child_process_1.exec)(
    'pnpm list -r --json',
    function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: '.concat(error))
        return
      }
      var json = JSON.parse(stdout)
      var watchPaths = []
      json.forEach(function (pkg) {
        if (pkg.path.includes(path_1['default'].join('packages', ''))) {
          watchPaths.push(pkg.path)
        }
      })
      chokidar_1['default']
        .watch(
          watchPaths.map(function (p) {
            return path_1['default'].join(p, 'src', '**/*')
          }),
          { ignored: ['**/spec/**/*', 'node_modules'] }
        )
        .on('change', function (path) {
          return __awaiter(void 0, void 0, void 0, function () {
            var changedPackagePath
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  changedPackagePath = watchPaths.find(function (p) {
                    return path.startsWith(p)
                  })
                  return [
                    4 /*yield*/,
                    (0, exports.run)({ dir: changedPackagePath }),
                  ]
                case 1:
                  _a.sent()
                  return [2 /*return*/]
              }
            })
          })
        })
    }
  )
}
function init(args) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      registerCommands([
        {
          command: 'build',
          description: 'Build',
          options: [
            {
              name: '--watch',
              description: 'Watch for file changes and rebuild',
            },
          ],
          action: function (options) {
            return (0, exports.run)(options)
          },
        },
        {
          command: 'watch',
          description: 'Watch',
          action: function () {
            return watch()
          },
        },
      ])
      program.usage('command [options]')
      // error on unknown commands
      program.on('command:*', function () {
        console.error(
          'Invalid command: %s\nSee --help for a list of available commands.',
          args.join(' ')
        )
        process.exit(1)
      })
      program.on('--help', function () {
        console.log(
          '\nYou can get help on any command with "-h" or "--help".\ne.g: "forestry types:gen --help"\n    '
        )
      })
      if (!process.argv.slice(2).length) {
        // no subcommands
        program.help()
      }
      program.parse(args)
      return [2 /*return*/]
    })
  })
}
exports.init = init
var buildIt = function (entryPoint, packageJSON) {
  return __awaiter(void 0, void 0, void 0, function () {
    var entry,
      target,
      deps,
      peerDeps,
      external,
      globals,
      out,
      outInfo,
      peerDeps_1,
      extension,
      defaultBuildConfig,
      buildConfig
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          entry = typeof entryPoint === 'string' ? entryPoint : entryPoint.name
          target =
            typeof entryPoint === 'string' ? 'browser' : entryPoint.target
          deps = packageJSON.dependencies
          peerDeps = packageJSON.peerDependencies
          external = Object.keys(__assign(__assign({}, deps), peerDeps))
          globals = {}
          out = function (entry) {
            var _a = path_1['default'].parse(entry),
              dir = _a.dir,
              name = _a.name
            var outdir = dir.replace('src', 'dist')
            var outfile = name
            var relativeOutfile = path_1['default'].join(
              outdir
                .split('/')
                .map(function () {
                  return '..'
                })
                .join('/'),
              dir,
              name
            )
            return {
              outdir: outdir,
              outfile: outfile,
              relativeOutfile: relativeOutfile,
            }
          }
          outInfo = out(entry)
          if (['@tinacms/app'].includes(packageJSON.name)) {
            console.log('skipping @tinacms/app')
            return [2 /*return*/]
          }
          external.forEach(function (ext) {
            return (globals[ext] = 'NOOP')
          })
          if (!(target === 'node')) return [3 /*break*/, 11]
          if (
            !['@tinacms/graphql', '@tinacms/datalayer'].includes(
              packageJSON.name
            )
          )
            return [3 /*break*/, 3]
          return [
            4 /*yield*/,
            (0, esbuild_1.build)({
              entryPoints: [path_1['default'].join(process.cwd(), entry)],
              bundle: true,
              platform: 'node',
              // FIXME: no idea why but even though I'm on node14 it doesn't like
              // the syntax for optional chaining, should be supported on 14
              // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
              target: 'node12',
              // Use the outfile if it is provided
              outfile: outInfo.outfile
                ? path_1['default'].join(
                    process.cwd(),
                    'dist',
                    ''.concat(outInfo.outfile, '.js')
                  )
                : path_1['default'].join(process.cwd(), 'dist', 'index.js'),
              external: external.filter(function (item) {
                return !packageJSON.buildConfig.entryPoints[0].bundle.includes(
                  item
                )
              }),
            }),
          ]
        case 1:
          _a.sent()
          return [
            4 /*yield*/,
            (0, esbuild_1.build)({
              entryPoints: [path_1['default'].join(process.cwd(), entry)],
              bundle: true,
              platform: 'node',
              target: 'es2020',
              format: 'esm',
              outfile: outInfo.outfile
                ? path_1['default'].join(
                    process.cwd(),
                    'dist',
                    ''.concat(outInfo.outfile, '.mjs')
                  )
                : path_1['default'].join(process.cwd(), 'dist', 'index.mjs'),
              external: external,
            }),
          ]
        case 2:
          _a.sent()
          return [3 /*break*/, 9]
        case 3:
          if (!['@tinacms/mdx'].includes(packageJSON.name))
            return [3 /*break*/, 7]
          peerDeps_1 = packageJSON.peerDependencies
          return [
            4 /*yield*/,
            (0, esbuild_1.build)({
              entryPoints: [path_1['default'].join(process.cwd(), entry)],
              bundle: true,
              platform: 'node',
              // FIXME: no idea why but even though I'm on node14 it doesn't like
              // the syntax for optional chaining, should be supported on 14
              // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
              target: 'node12',
              format: 'cjs',
              outfile: path_1['default'].join(
                process.cwd(),
                'dist',
                'index.js'
              ),
              external: Object.keys(__assign({}, peerDeps_1)),
            }),
          ]
        case 4:
          _a.sent()
          return [
            4 /*yield*/,
            (0, esbuild_1.build)({
              entryPoints: [path_1['default'].join(process.cwd(), entry)],
              bundle: true,
              platform: 'node',
              target: 'es2020',
              format: 'esm',
              outfile: path_1['default'].join(
                process.cwd(),
                'dist',
                'index.mjs'
              ),
              // Bundle dependencies, the remark ecosystem only publishes ES modules
              // and includes "development" export maps which actually throw errors during
              // development, which we don't want to expose our users to.
              external: Object.keys(__assign({}, peerDeps_1)),
            }),
            // The ES version is targeting the browser, this is used by the rich-text's raw mode
          ]
        case 5:
          _a.sent()
          // The ES version is targeting the browser, this is used by the rich-text's raw mode
          return [
            4 /*yield*/,
            (0, esbuild_1.build)({
              entryPoints: [path_1['default'].join(process.cwd(), entry)],
              bundle: true,
              platform: 'browser',
              target: 'es2020',
              format: 'esm',
              outfile: path_1['default'].join(
                process.cwd(),
                'dist',
                'index.browser.mjs'
              ),
              // Bundle dependencies, the remark ecosystem only publishes ES modules
              // and includes "development" export maps which actually throw errors during
              // development, which we don't want to expose our users to.
              external: Object.keys(__assign({}, peerDeps_1)),
            }),
          ]
        case 6:
          // The ES version is targeting the browser, this is used by the rich-text's raw mode
          _a.sent()
          return [3 /*break*/, 9]
        case 7:
          return [
            4 /*yield*/,
            (0, esbuild_1.build)({
              entryPoints: [path_1['default'].join(process.cwd(), entry)],
              bundle: true,
              platform: 'node',
              outfile: path_1['default'].join(
                process.cwd(),
                'dist',
                ''.concat(outInfo.outfile, '.js')
              ),
              external: external,
              target: 'node12',
            }),
          ]
        case 8:
          _a.sent()
          _a.label = 9
        case 9:
          extension = path_1['default'].extname(entry)
          // TODO: When we're building for real, swap this out
          return [
            4 /*yield*/,
            fs_extra_1['default'].writeFileSync(
              path_1['default'].join(
                process.cwd(),
                'dist',
                entry.replace('src/', '').replace(extension, '.d.ts')
              ),
              'export * from "../'.concat(entry.replace(extension, ''), '"')
            ),
          ]
        case 10:
          // TODO: When we're building for real, swap this out
          _a.sent()
          return [2 /*return*/, true]
        case 11:
          defaultBuildConfig = {
            resolve: {
              alias: {
                '@toolkit': path_1['default'].resolve(
                  process.cwd(),
                  'src/toolkit'
                ),
                '@tinacms/toolkit': path_1['default'].resolve(
                  process.cwd(),
                  'src/toolkit/index.ts'
                ),
              },
            },
            build: {
              minify: false,
              assetsInlineLimit: 0,
              lib: {
                entry: path_1['default'].resolve(process.cwd(), entry),
                name: packageJSON.name,
                fileName: function (format) {
                  return format === 'umd'
                    ? ''.concat(outInfo.outfile, '.js')
                    : ''.concat(outInfo.outfile, '.mjs')
                },
              },
              outDir: outInfo.outdir,
              emptyOutDir: false,
              sourcemap: false,
              rollupOptions: {
                // /**
                //  * FIXME: rollup-plugin-node-polyfills is only needed for node targets
                //  */
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
                  globals: globals,
                },
                external: external,
              },
            },
          }
          buildConfig = packageJSON.buildConfig
            ? __assign(
                __assign({}, defaultBuildConfig),
                packageJSON.buildConfig
              )
            : defaultBuildConfig
          return [4 /*yield*/, (0, vite_1.build)(__assign({}, buildConfig))]
        case 12:
          _a.sent()
          return [
            4 /*yield*/,
            fs_extra_1['default'].outputFileSync(
              path_1['default'].join(
                outInfo.outdir,
                ''.concat(outInfo.outfile, '.d.ts')
              ),
              'export * from "'.concat(outInfo.relativeOutfile, '"')
            ),
          ]
        case 13:
          _a.sent()
          return [2 /*return*/, true]
      }
    })
  })
}
exports.buildIt = buildIt
var sequential = function (items, callback) {
  return __awaiter(void 0, void 0, void 0, function () {
    var accum, reducePromises, result
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          accum = []
          if (!items) {
            return [2 /*return*/, []]
          }
          reducePromises = function (previous, endpoint) {
            return __awaiter(void 0, void 0, void 0, function () {
              var prev
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [
                      4 /*yield*/,
                      previous,
                      // initial value will be undefined
                    ]
                  case 1:
                    prev = _a.sent()
                    // initial value will be undefined
                    if (prev) {
                      accum.push(prev)
                    }
                    return [2 /*return*/, callback(endpoint, accum.length)]
                }
              })
            })
          }
          return [4 /*yield*/, items.reduce(reducePromises, Promise.resolve())]
        case 1:
          result = _a.sent()
          if (result) {
            // @ts-ignore FIXME: this can be properly typed
            accum.push(result)
          }
          return [2 /*return*/, accum]
      }
    })
  })
}
exports.sequential = sequential
