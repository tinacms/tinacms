"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var fs = require("fs");
exports.onPreBootstrap = function () {
    var app = express();
    app.use(cors({
        origin: function (origin, callback) {
            // TODO: Only accept from localhost.
            callback(null, true);
        },
    }));
    app.use(express.json());
    app.put('/markdownRemark', function (req, res) {
        fs.writeFileSync(req.body.fileAbsolutePath, req.body.content);
        res.send(req.body.content);
    });
    app.listen(4567, function () {
        console.log('------------------------------------------');
        console.log('xeditor local backend running on port 4567');
        console.log('------------------------------------------');
    });
};
