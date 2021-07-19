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
exports.logger = void 0;
var log4js_1 = require("log4js");
exports.logger = log4js_1["default"].getLogger();
// https://log4js-node.github.io/log4js-node/layouts.html
// This disables the logger prefix
log4js_1["default"].configure({
    appenders: {
        out: { type: 'stdout', layout: { type: 'messagePassThrough' } }
    },
    categories: { "default": { appenders: ['out'], level: 'info' } }
});
// set initial level to info
exports.logger.level = 'info';
