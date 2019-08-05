"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var cms_connector_gitlab_1 = require("@forestryio/cms-connector-gitlab");
var index_1 = require("./index");
var gatsby_plugin_xeditor_cms_1 = require("@forestryio/gatsby-plugin-xeditor-cms");
var gitlab;
exports.wrapRootElement = function (_a) {
    var element = _a.element;
    return (React.createElement(index_1.GitlabContext.Provider, { value: gitlab }, element));
};
exports.onClientEntry = function (_, pluginOptions) {
    gitlab = new cms_connector_gitlab_1.GitlabConnector(__assign({ apiBaseURI: 'https://gitlab.com/' }, pluginOptions));
    gitlab.bootstrap();
    gatsby_plugin_xeditor_cms_1.cms.registerApi('gitlab', gitlab);
};
