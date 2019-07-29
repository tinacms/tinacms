"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./markdownRemark/server");
exports.onPreBootstrap = function () {
    server_1.markdownRemarkServer();
};
