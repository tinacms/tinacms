"use strict";
exports.onCreateNode = function (_a) {
    var node = _a.node, actions = _a.actions, getNode = _a.getNode;
    var createNodeField = actions.createNodeField;
    if (node.internal.type === "DataJson") {
        // const value = createFilePath({ node, getNode })
        var pathRoot = process.cwd();
        var parent_1 = getNode(node.parent);
        createNodeField({
            name: "fileRelativePath",
            node: node,
            value: parent_1.absolutePath.replace(pathRoot, ''),
        });
    }
};
