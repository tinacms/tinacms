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
var api_git_1 = require("@tinacms/api-git");
var graphql_1 = require("graphql");
exports.setFieldsOnGraphQLNodeType = function (_a) {
    var type = _a.type;
    var pathRoot = process.cwd();
    if (type.name === "MarkdownRemark") {
        return {
            rawFrontmatter: {
                type: graphql_1.GraphQLString,
                args: {
                    myArgument: {
                        type: graphql_1.GraphQLString,
                    },
                },
                resolve: function (source) {
                    return JSON.stringify(source.frontmatter);
                },
            },
            fileRelativePath: {
                type: graphql_1.GraphQLString,
                args: {
                    myArgument: {
                        type: graphql_1.GraphQLString,
                    },
                },
                resolve: function (source) {
                    return source.fileAbsolutePath.replace(pathRoot, '');
                },
            },
        };
    }
    // by default return empty object
    return {};
};
exports.onCreateDevServer = function (_a, options) {
    var app = _a.app;
    app.use('/___tina', api_git_1.router(options));
};
