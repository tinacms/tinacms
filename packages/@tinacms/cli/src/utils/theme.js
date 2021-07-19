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
exports.__esModule = true;
exports.CONFIRMATION_TEXT = exports.warnText = exports.logText = exports.cmdText = exports.labelText = exports.neutralText = exports.dangerText = exports.successText = void 0;
var chalk_1 = require("chalk");
exports.successText = chalk_1["default"].bold.green;
exports.dangerText = chalk_1["default"].bold.red;
exports.neutralText = chalk_1["default"].bold.cyan;
exports.labelText = chalk_1["default"].bold;
exports.cmdText = chalk_1["default"].inverse;
exports.logText = chalk_1["default"].italic.gray;
exports.warnText = chalk_1["default"].yellowBright.bgBlack;
exports.CONFIRMATION_TEXT = chalk_1["default"].dim('enter to confirm');
