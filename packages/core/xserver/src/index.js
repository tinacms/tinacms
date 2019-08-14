"use strict";
exports.__esModule = true;
var cms_1 = require("@forestryio/cms");
var express = require('express');
var XServer = /** @class */ (function () {
    function XServer(config) {
        this.server = express();
        this.plugins = new cms_1.PluginManager();
        this.config = config;
        this.routePrefix = config.routePrefix || '/__xeditor';
        this.envPrefix = config.envPrefix || 'XEDITOR_';
        this.server.get("" + this.routePrefix, function (_, res) { return res.send("Xserver running"); });
    }
    XServer.prototype.start = function (port) {
        var _this = this;
        if (port === void 0) { port = 4567; }
        this.plugins.all('server').map(function (plugin) { return plugin.apply(_this.server, _this.config); });
        this.server.listen(port, function () {
            console.log("\u001B[35m\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\u001B[0m");
            console.log("\u001B[35m\u2502 Xserver (not that one) running on port " + port + " \u2502\u001B[0m");
            console.log("\u001B[35m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\u001B[0m");
        });
    };
    return XServer;
}());
exports.XServer = XServer;
