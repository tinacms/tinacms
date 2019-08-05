"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
exports.GitlabContext = React.createContext(null);
function useGitlab() {
    return React.useContext(exports.GitlabContext);
}
exports.useGitlab = useGitlab;
