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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_tinacms_1 = require("@tinacms/react-tinacms");
var react_1 = require("react");
function useJsonForm(jsonNode, formOptions) {
    if (formOptions === void 0) { formOptions = {}; }
    if (!jsonNode) {
        return [{}, null];
    }
    // TODO: Only required when saving to local filesystem.
    if (typeof jsonNode.fields === 'undefined' ||
        typeof jsonNode.fields.fileRelativePath === 'undefined') {
        // TODO
        // throw new Error(ERROR_MISSING_REMARK_PATH)
    }
    try {
        var cms_1 = react_tinacms_1.useCMS();
        var _a = react_tinacms_1.useCMSForm(__assign({ name: jsonNode.fields.fileRelativePath, initialValues: jsonNode, fields: generateFields(jsonNode), onSubmit: function (data) {
                if (process.env.NODE_ENV === 'development') {
                    //
                }
                else {
                    console.log('Not supported');
                }
            } }, formOptions)), values = _a[0], form_1 = _a[1];
        react_1.useEffect(function () {
            if (!form_1)
                return;
            return form_1.subscribe(function (formState) {
                var _a = formState.values, fields = _a.fields, data = __rest(_a, ["fields"]);
                cms_1.api.git.onChange({
                    fileRelativePath: fields.fileRelativePath,
                    content: JSON.stringify(data, null, 2),
                });
            }, { values: true });
        }, [form_1]);
        return [jsonNode, form_1];
    }
    catch (e) {
        // throw new Error(ERROR_MISSING_CMS_GATSBY)
        throw e;
    }
}
exports.useJsonForm = useJsonForm;
function generateFields(post) {
    var fields = post.fields, dataFields = __rest(post, ["fields"]);
    return Object.keys(dataFields).map(function (key) { return ({
        component: 'text',
        name: key,
    }); });
}
function JsonForm(_a) {
    var data = _a.data, render = _a.render, options = __rest(_a, ["data", "render"]);
    var _b = useJsonForm(data, options), currentData = _b[0], form = _b[1];
    return render({ form: form, data: currentData });
}
exports.JsonForm = JsonForm;
