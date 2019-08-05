"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gatsby_plugin_xeditor_cms_1 = require("@forestryio/gatsby-plugin-xeditor-cms");
gatsby_plugin_xeditor_cms_1.cms.registerApi('git', {
    onChange: function (data) {
        writeToDisk(data);
    },
    isAuthenticated: function () {
        return true;
    },
});
function writeToDisk(data) {
    // @ts-ignore
    return fetch('http://localhost:4567/markdownRemark', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data),
    })
        .then(function (response) {
        console.log(response.json());
    })
        .catch(function (e) {
        console.error(e);
    });
}
