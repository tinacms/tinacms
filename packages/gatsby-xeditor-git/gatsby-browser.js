"use strict";
/**

Copyright 2019 Forestry.io Inc

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
Object.defineProperty(exports, "__esModule", { value: true });
var git_client_1 = require("@tinacms/git-client");
var tinacms_1 = require("@tinacms/tinacms");
exports.onClientEntry = function () {
    var _a = window.location, protocol = _a.protocol, hostname = _a.hostname, port = _a.port;
    var baseUrl = protocol + "//" + hostname + (port != '80' ? ":" + port : '') + "/___tina";
    tinacms_1.cms.registerApi('git', new git_client_1.GitClient(baseUrl));
};
