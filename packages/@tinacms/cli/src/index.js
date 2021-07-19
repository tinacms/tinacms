"use strict";
/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.init = exports.unstable_defineSchema = exports.defineSchema = void 0;
var commander = require("commander");
//@ts-ignore
var package_json_1 = require("../package.json");
var baseCmds_1 = require("./cmds/baseCmds");
var theme_1 = require("./utils/theme");
var compile_1 = require("./cmds/compile");
__createBinding(exports, compile_1, "defineSchema");
__createBinding(exports, compile_1, "unstable_defineSchema");
var logger_1 = require("./logger");
var program = new commander.Command(package_json_1.name);
var registerCommands = function (commands, noHelp) {
    if (noHelp === void 0) { noHelp = false; }
    commands.forEach(function (command, i) {
        var newCmd = program
            .command(command.command, { noHelp: noHelp })
            .description(command.description)
            .action(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            logger_1.logger.info('');
            command.action.apply(command, args);
        });
        if (command.alias) {
            newCmd = newCmd.alias(command.alias);
        }
        newCmd.on('--help', function () {
            if (command.examples) {
                logger_1.logger.info("\nExamples:\n  " + command.examples);
            }
            if (command.subCommands) {
                logger_1.logger.info('\nCommands:');
                var optionTag_1 = ' [options]';
                command.subCommands.forEach(function (subcommand, i) {
                    var commandStr = "" + subcommand.command + ((subcommand.options || []).length ? optionTag_1 : '');
                    var padLength = Math.max.apply(Math, command.subCommands.map(function (sub) { return sub.command.length; })) +
                        optionTag_1.length;
                    logger_1.logger.info(commandStr.padEnd(padLength) + " " + subcommand.description);
                });
            }
            logger_1.logger.info('');
        });
        (command.options || []).forEach(function (option) {
            newCmd.option(option.name, option.description);
        });
        if (command.subCommands) {
            registerCommands(command.subCommands, true);
        }
    });
};
function init(args) {
    return __awaiter(this, void 0, void 0, function () {
        var commands;
        return __generator(this, function (_a) {
            program.version(package_json_1.version);
            commands = __spreadArray([], baseCmds_1.baseCmds);
            registerCommands(commands);
            program.usage('command [options]');
            // error on unknown commands
            program.on('command:*', function () {
                logger_1.logger.error('Invalid command: %s\nSee --help for a list of available commands.', args.join(' '));
                process.exit(1);
            });
            program.on('--help', function () {
                logger_1.logger.info(theme_1.logText("\nYou can get help on any command with \"-h\" or \"--help\".\ne.g: \"forestry types:gen --help\"\n    "));
            });
            if (!process.argv.slice(2).length) {
                // no subcommands
                program.help();
            }
            program.parse(args);
            return [2 /*return*/];
        });
    });
}
exports.init = init;
