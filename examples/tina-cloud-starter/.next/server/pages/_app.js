module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../ssr-module-cache.js');
/******/
/******/ 	// object to store loaded chunks
/******/ 	// "0" means "already loaded"
/******/ 	var installedChunks = {
/******/ 		"pages/_app": 0
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var promises = [];
/******/
/******/
/******/ 		// require() chunk loading for javascript
/******/
/******/ 		// "0" is the signal for "already loaded"
/******/ 		if(installedChunks[chunkId] !== 0) {
/******/ 			var chunk = require("../" + ({}[chunkId]||chunkId) + ".js");
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids;
/******/ 			for(var moduleId in moreModules) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 			for(var i = 0; i < chunkIds.length; i++)
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 		}
/******/ 		return Promise.all(promises);
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// uncaught error handler for webpack runtime
/******/ 	__webpack_require__.oe = function(err) {
/******/ 		process.nextTick(function() {
/******/ 			throw err; // catch this error by using import().catch()
/******/ 		});
/******/ 	};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../.yarn/$$virtual/tinacms-virtual-40934a69c2/1/packages/tinacms/dist/chunk-DIL6RFAC.js":
/*!************************************************************************************************************************!*\
  !*** /Users/jeffsee/code/tinacms/.yarn/$$virtual/tinacms-virtual-40934a69c2/1/packages/tinacms/dist/chunk-DIL6RFAC.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("Object.defineProperty(exports, \"__esModule\", {value: true});var __defProp = Object.defineProperty;\nvar __defProps = Object.defineProperties;\nvar __getOwnPropDescs = Object.getOwnPropertyDescriptors;\nvar __getOwnPropSymbols = Object.getOwnPropertySymbols;\nvar __hasOwnProp = Object.prototype.hasOwnProperty;\nvar __propIsEnum = Object.prototype.propertyIsEnumerable;\nvar __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;\nvar __spreadValues = (a, b) => {\n  for (var prop in b || (b = {}))\n    if (__hasOwnProp.call(b, prop))\n      __defNormalProp(a, prop, b[prop]);\n  if (__getOwnPropSymbols)\n    for (var prop of __getOwnPropSymbols(b)) {\n      if (__propIsEnum.call(b, prop))\n        __defNormalProp(a, prop, b[prop]);\n    }\n  return a;\n};\nvar __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));\nvar __objRest = (source, exclude) => {\n  var target = {};\n  for (var prop in source)\n    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)\n      target[prop] = source[prop];\n  if (source != null && __getOwnPropSymbols)\n    for (var prop of __getOwnPropSymbols(source)) {\n      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))\n        target[prop] = source[prop];\n    }\n  return target;\n};\n\n\n\n\n\nexports.__spreadValues = __spreadValues; exports.__spreadProps = __spreadProps; exports.__objRest = __objRest;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vL1VzZXJzL2plZmZzZWUvY29kZS90aW5hY21zLy55YXJuLyR2aXJ0dWFsL3RpbmFjbXMtdmlydHVhbC00MDkzNGE2OWMyLzEvcGFja2FnZXMvdGluYWNtcy9kaXN0L2NodW5rLURJTDZSRkFDLmpzP2RmNjciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQWEsOENBQThDLFlBQVksRUFBRTtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFLDhEQUE4RDtBQUMzSTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FBTUEsd0NBQXdDLHVDQUF1QyIsImZpbGUiOiIuLi8uLi8ueWFybi8kJHZpcnR1YWwvdGluYWNtcy12aXJ0dWFsLTQwOTM0YTY5YzIvMS9wYWNrYWdlcy90aW5hY21zL2Rpc3QvY2h1bmstRElMNlJGQUMuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHt2YWx1ZTogdHJ1ZX0pO3ZhciBfX2RlZlByb3AgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG52YXIgX19kZWZQcm9wcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xudmFyIF9fZ2V0T3duUHJvcERlc2NzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnM7XG52YXIgX19nZXRPd25Qcm9wU3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgX19oYXNPd25Qcm9wID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBfX3Byb3BJc0VudW0gPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xudmFyIF9fZGVmTm9ybWFsUHJvcCA9IChvYmosIGtleSwgdmFsdWUpID0+IGtleSBpbiBvYmogPyBfX2RlZlByb3Aob2JqLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSwgdmFsdWUgfSkgOiBvYmpba2V5XSA9IHZhbHVlO1xudmFyIF9fc3ByZWFkVmFsdWVzID0gKGEsIGIpID0+IHtcbiAgZm9yICh2YXIgcHJvcCBpbiBiIHx8IChiID0ge30pKVxuICAgIGlmIChfX2hhc093blByb3AuY2FsbChiLCBwcm9wKSlcbiAgICAgIF9fZGVmTm9ybWFsUHJvcChhLCBwcm9wLCBiW3Byb3BdKTtcbiAgaWYgKF9fZ2V0T3duUHJvcFN5bWJvbHMpXG4gICAgZm9yICh2YXIgcHJvcCBvZiBfX2dldE93blByb3BTeW1ib2xzKGIpKSB7XG4gICAgICBpZiAoX19wcm9wSXNFbnVtLmNhbGwoYiwgcHJvcCkpXG4gICAgICAgIF9fZGVmTm9ybWFsUHJvcChhLCBwcm9wLCBiW3Byb3BdKTtcbiAgICB9XG4gIHJldHVybiBhO1xufTtcbnZhciBfX3NwcmVhZFByb3BzID0gKGEsIGIpID0+IF9fZGVmUHJvcHMoYSwgX19nZXRPd25Qcm9wRGVzY3MoYikpO1xudmFyIF9fb2JqUmVzdCA9IChzb3VyY2UsIGV4Y2x1ZGUpID0+IHtcbiAgdmFyIHRhcmdldCA9IHt9O1xuICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSlcbiAgICBpZiAoX19oYXNPd25Qcm9wLmNhbGwoc291cmNlLCBwcm9wKSAmJiBleGNsdWRlLmluZGV4T2YocHJvcCkgPCAwKVxuICAgICAgdGFyZ2V0W3Byb3BdID0gc291cmNlW3Byb3BdO1xuICBpZiAoc291cmNlICE9IG51bGwgJiYgX19nZXRPd25Qcm9wU3ltYm9scylcbiAgICBmb3IgKHZhciBwcm9wIG9mIF9fZ2V0T3duUHJvcFN5bWJvbHMoc291cmNlKSkge1xuICAgICAgaWYgKGV4Y2x1ZGUuaW5kZXhPZihwcm9wKSA8IDAgJiYgX19wcm9wSXNFbnVtLmNhbGwoc291cmNlLCBwcm9wKSlcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgIH1cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cblxuXG5cblxuZXhwb3J0cy5fX3NwcmVhZFZhbHVlcyA9IF9fc3ByZWFkVmFsdWVzOyBleHBvcnRzLl9fc3ByZWFkUHJvcHMgPSBfX3NwcmVhZFByb3BzOyBleHBvcnRzLl9fb2JqUmVzdCA9IF9fb2JqUmVzdDtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///../../.yarn/$$virtual/tinacms-virtual-40934a69c2/1/packages/tinacms/dist/chunk-DIL6RFAC.js\n");

/***/ }),

/***/ "../../.yarn/$$virtual/tinacms-virtual-40934a69c2/1/packages/tinacms/dist/edit-state.js":
/*!********************************************************************************************************************!*\
  !*** /Users/jeffsee/code/tinacms/.yarn/$$virtual/tinacms-virtual-40934a69c2/1/packages/tinacms/dist/edit-state.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("Object.defineProperty(exports, \"__esModule\", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n\nvar _chunkDIL6RFACjs = __webpack_require__(/*! ./chunk-DIL6RFAC.js */ \"../../.yarn/$$virtual/tinacms-virtual-40934a69c2/1/packages/tinacms/dist/chunk-DIL6RFAC.js\");\n\n// src/edit-state.tsx\nvar _react = __webpack_require__(/*! react */ \"react\"); var _react2 = _interopRequireDefault(_react);\nvar TinaEditProvider = (_a) => {\n  var _b = _a, {\n    showEditButton\n  } = _b, props = _chunkDIL6RFACjs.__objRest.call(void 0, _b, [\n    \"showEditButton\"\n  ]);\n  return /* @__PURE__ */ _react2.default.createElement(EditProvider, null, showEditButton && /* @__PURE__ */ _react2.default.createElement(ToggleButton, null), /* @__PURE__ */ _react2.default.createElement(TinaEditProviderInner, _chunkDIL6RFACjs.__spreadValues.call(void 0, {}, props)));\n};\nvar ToggleButton = () => {\n  const { edit } = useEditState();\n  return edit ? null : /* @__PURE__ */ _react2.default.createElement(\"div\", {\n    style: { position: \"fixed\", bottom: \"56px\", left: \"0px\" }\n  }, /* @__PURE__ */ _react2.default.createElement(\"a\", {\n    href: \"/admin\",\n    style: {\n      borderRadius: \"0 50px 50px 0\",\n      textDecoration: \"none\",\n      background: \"rgb(34, 150, 254)\",\n      boxShadow: \"0px 1px 3px rgb(0 0 0 / 10%), 0px 2px 6px rgb(0 0 0 / 20%)\",\n      color: \"white\",\n      padding: \"14px 20px\",\n      border: \"none\"\n    }\n  }, \"Edit with Tina\"));\n};\nvar TinaEditProviderInner = ({ children, editMode }) => {\n  const { edit } = useEditState();\n  if (edit) {\n    return editMode;\n  }\n  return children;\n};\nvar LOCALSTORAGEKEY = \"tina.isEditing\";\nvar isSSR = typeof window === \"undefined\";\nvar isEditing = () => {\n  if (!isSSR) {\n    const isEdit = window.localStorage.getItem(LOCALSTORAGEKEY);\n    return isEdit && isEdit === \"true\";\n  }\n  return false;\n};\nvar setEditing = (isEditing2) => {\n  if (!isSSR) {\n    window.localStorage.setItem(LOCALSTORAGEKEY, isEditing2 ? \"true\" : \"false\");\n  }\n};\nvar EditContext = _react2.default.createContext({\n  edit: isEditing(),\n  setEdit: (editing) => {\n  }\n});\nvar EditProvider = ({ children }) => {\n  const [edit, setEditState] = _react.useState.call(void 0, isEditing());\n  const setEdit = (edit2) => {\n    setEditState(edit2);\n    setEditing(edit2);\n    if (true) {\n      window.location.reload();\n    }\n  };\n  return /* @__PURE__ */ _react2.default.createElement(EditContext.Provider, {\n    value: { edit, setEdit }\n  }, children);\n};\nvar useEditState = () => _react.useContext.call(void 0, EditContext);\n\n\n\n\n\n\nexports.EditProvider = EditProvider; exports.TinaEditProvider = TinaEditProvider; exports.isEditing = isEditing; exports.setEditing = setEditing; exports.useEditState = useEditState;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vL1VzZXJzL2plZmZzZWUvY29kZS90aW5hY21zLy55YXJuLyR2aXJ0dWFsL3RpbmFjbXMtdmlydHVhbC00MDkzNGE2OWMyLzEvcGFja2FnZXMvdGluYWNtcy9kaXN0L2VkaXQtc3RhdGUuanM/MDE0YiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBYSw4Q0FBOEMsWUFBWSxFQUFFLHVDQUF1Qyx1Q0FBdUMsZ0JBQWdCOzs7QUFHdkssdUJBQXVCLG1CQUFPLENBQUMsdUhBQXFCOztBQUVwRDtBQUNBLGFBQWEsbUJBQU8sQ0FBQyxvQkFBTyxFQUFFO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0Esb1JBQW9SO0FBQ3BSO0FBQ0E7QUFDQSxTQUFTLE9BQU87QUFDaEI7QUFDQSxZQUFZO0FBQ1osR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsOEJBQThCLHFCQUFxQjtBQUNuRCxTQUFTLE9BQU87QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxxQkFBcUIsV0FBVztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBc0M7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1osR0FBRztBQUNIO0FBQ0E7Ozs7Ozs7QUFPQSxvQ0FBb0MsNkNBQTZDLCtCQUErQixpQ0FBaUMiLCJmaWxlIjoiLi4vLi4vLnlhcm4vJCR2aXJ0dWFsL3RpbmFjbXMtdmlydHVhbC00MDkzNGE2OWMyLzEvcGFja2FnZXMvdGluYWNtcy9kaXN0L2VkaXQtc3RhdGUuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHt2YWx1ZTogdHJ1ZX0pOyBmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5cbnZhciBfY2h1bmtESUw2UkZBQ2pzID0gcmVxdWlyZSgnLi9jaHVuay1ESUw2UkZBQy5qcycpO1xuXG4vLyBzcmMvZWRpdC1zdGF0ZS50c3hcbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpOyB2YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcbnZhciBUaW5hRWRpdFByb3ZpZGVyID0gKF9hKSA9PiB7XG4gIHZhciBfYiA9IF9hLCB7XG4gICAgc2hvd0VkaXRCdXR0b25cbiAgfSA9IF9iLCBwcm9wcyA9IF9jaHVua0RJTDZSRkFDanMuX19vYmpSZXN0LmNhbGwodm9pZCAwLCBfYiwgW1xuICAgIFwic2hvd0VkaXRCdXR0b25cIlxuICBdKTtcbiAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChFZGl0UHJvdmlkZXIsIG51bGwsIHNob3dFZGl0QnV0dG9uICYmIC8qIEBfX1BVUkVfXyAqLyBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChUb2dnbGVCdXR0b24sIG51bGwpLCAvKiBAX19QVVJFX18gKi8gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoVGluYUVkaXRQcm92aWRlcklubmVyLCBfY2h1bmtESUw2UkZBQ2pzLl9fc3ByZWFkVmFsdWVzLmNhbGwodm9pZCAwLCB7fSwgcHJvcHMpKSk7XG59O1xudmFyIFRvZ2dsZUJ1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgeyBlZGl0IH0gPSB1c2VFZGl0U3RhdGUoKTtcbiAgcmV0dXJuIGVkaXQgPyBudWxsIDogLyogQF9fUFVSRV9fICovIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBzdHlsZTogeyBwb3NpdGlvbjogXCJmaXhlZFwiLCBib3R0b206IFwiNTZweFwiLCBsZWZ0OiBcIjBweFwiIH1cbiAgfSwgLyogQF9fUFVSRV9fICovIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XG4gICAgaHJlZjogXCIvYWRtaW5cIixcbiAgICBzdHlsZToge1xuICAgICAgYm9yZGVyUmFkaXVzOiBcIjAgNTBweCA1MHB4IDBcIixcbiAgICAgIHRleHREZWNvcmF0aW9uOiBcIm5vbmVcIixcbiAgICAgIGJhY2tncm91bmQ6IFwicmdiKDM0LCAxNTAsIDI1NClcIixcbiAgICAgIGJveFNoYWRvdzogXCIwcHggMXB4IDNweCByZ2IoMCAwIDAgLyAxMCUpLCAwcHggMnB4IDZweCByZ2IoMCAwIDAgLyAyMCUpXCIsXG4gICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgcGFkZGluZzogXCIxNHB4IDIwcHhcIixcbiAgICAgIGJvcmRlcjogXCJub25lXCJcbiAgICB9XG4gIH0sIFwiRWRpdCB3aXRoIFRpbmFcIikpO1xufTtcbnZhciBUaW5hRWRpdFByb3ZpZGVySW5uZXIgPSAoeyBjaGlsZHJlbiwgZWRpdE1vZGUgfSkgPT4ge1xuICBjb25zdCB7IGVkaXQgfSA9IHVzZUVkaXRTdGF0ZSgpO1xuICBpZiAoZWRpdCkge1xuICAgIHJldHVybiBlZGl0TW9kZTtcbiAgfVxuICByZXR1cm4gY2hpbGRyZW47XG59O1xudmFyIExPQ0FMU1RPUkFHRUtFWSA9IFwidGluYS5pc0VkaXRpbmdcIjtcbnZhciBpc1NTUiA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCI7XG52YXIgaXNFZGl0aW5nID0gKCkgPT4ge1xuICBpZiAoIWlzU1NSKSB7XG4gICAgY29uc3QgaXNFZGl0ID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKExPQ0FMU1RPUkFHRUtFWSk7XG4gICAgcmV0dXJuIGlzRWRpdCAmJiBpc0VkaXQgPT09IFwidHJ1ZVwiO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG52YXIgc2V0RWRpdGluZyA9IChpc0VkaXRpbmcyKSA9PiB7XG4gIGlmICghaXNTU1IpIHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxTVE9SQUdFS0VZLCBpc0VkaXRpbmcyID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpO1xuICB9XG59O1xudmFyIEVkaXRDb250ZXh0ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNvbnRleHQoe1xuICBlZGl0OiBpc0VkaXRpbmcoKSxcbiAgc2V0RWRpdDogKGVkaXRpbmcpID0+IHtcbiAgfVxufSk7XG52YXIgRWRpdFByb3ZpZGVyID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xuICBjb25zdCBbZWRpdCwgc2V0RWRpdFN0YXRlXSA9IF9yZWFjdC51c2VTdGF0ZS5jYWxsKHZvaWQgMCwgaXNFZGl0aW5nKCkpO1xuICBjb25zdCBzZXRFZGl0ID0gKGVkaXQyKSA9PiB7XG4gICAgc2V0RWRpdFN0YXRlKGVkaXQyKTtcbiAgICBzZXRFZGl0aW5nKGVkaXQyKTtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIikge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChFZGl0Q29udGV4dC5Qcm92aWRlciwge1xuICAgIHZhbHVlOiB7IGVkaXQsIHNldEVkaXQgfVxuICB9LCBjaGlsZHJlbik7XG59O1xudmFyIHVzZUVkaXRTdGF0ZSA9ICgpID0+IF9yZWFjdC51c2VDb250ZXh0LmNhbGwodm9pZCAwLCBFZGl0Q29udGV4dCk7XG5cblxuXG5cblxuXG5leHBvcnRzLkVkaXRQcm92aWRlciA9IEVkaXRQcm92aWRlcjsgZXhwb3J0cy5UaW5hRWRpdFByb3ZpZGVyID0gVGluYUVkaXRQcm92aWRlcjsgZXhwb3J0cy5pc0VkaXRpbmcgPSBpc0VkaXRpbmc7IGV4cG9ydHMuc2V0RWRpdGluZyA9IHNldEVkaXRpbmc7IGV4cG9ydHMudXNlRWRpdFN0YXRlID0gdXNlRWRpdFN0YXRlO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///../../.yarn/$$virtual/tinacms-virtual-40934a69c2/1/packages/tinacms/dist/edit-state.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! styled-jsx/style */ \"styled-jsx/style\");\n/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(styled_jsx_style__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_dynamic__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dynamic */ \"next/dynamic\");\n/* harmony import */ var next_dynamic__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dynamic__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var tinacms_dist_edit_state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tinacms/dist/edit-state */ \"../../.yarn/$$virtual/tinacms-virtual-40934a69c2/1/packages/tinacms/dist/edit-state.js\");\n/* harmony import */ var tinacms_dist_edit_state__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(tinacms_dist_edit_state__WEBPACK_IMPORTED_MODULE_3__);\nvar _jsxFileName = \"/Users/jeffsee/code/tinacms/examples/tina-cloud-starter/pages/_app.js\";\n\n\nvar __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;\n\nfunction _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }\n\n/**\nCopyright 2021 Forestry.io Holdings, Inc.\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n    http://www.apache.org/licenses/LICENSE-2.0\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n*/\n\n // InnerApp that handles rendering edit mode or not\n\nfunction InnerApp({\n  Component,\n  pageProps\n}) {\n  const {\n    edit\n  } = Object(tinacms_dist_edit_state__WEBPACK_IMPORTED_MODULE_3__[\"useEditState\"])();\n\n  if (edit) {\n    // Dynamically load Tina only when in edit mode so it does not affect production\n    // see https://nextjs.org/docs/advanced-features/dynamic-import#basic-usage\n    const TinaWrapper = next_dynamic__WEBPACK_IMPORTED_MODULE_2___default()(() => __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ../components/tina-wrapper */ \"./components/tina-wrapper.tsx\")), {\n      loadableGenerated: {\n        webpack: () => [/*require.resolve*/(/*! ../components/tina-wrapper */ \"./components/tina-wrapper.tsx\")],\n        modules: ['../components/tina-wrapper']\n      }\n    });\n    return __jsx(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, __jsx(TinaWrapper, _extends({}, pageProps, {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 27,\n        columnNumber: 9\n      }\n    }), props => __jsx(Component, _extends({}, props, {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 28,\n        columnNumber: 23\n      }\n    }))), __jsx(EditToggle, {\n      isInEditMode: true,\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 30,\n        columnNumber: 9\n      }\n    }));\n  }\n\n  return __jsx(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, __jsx(Component, _extends({}, pageProps, {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 36,\n      columnNumber: 7\n    }\n  })), __jsx(EditToggle, {\n    isInEditMode: true,\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 37,\n      columnNumber: 7\n    }\n  }));\n}\n\nconst EditToggle = () => {\n  const {\n    edit,\n    setEdit\n  } = Object(tinacms_dist_edit_state__WEBPACK_IMPORTED_MODULE_3__[\"useEditState\"])();\n  return __jsx(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, (Number(process.env.NEXT_PUBLIC_SHOW_EDIT_BTN) || edit) && __jsx(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, __jsx(\"button\", {\n    onClick: () => {\n      setEdit(!edit);\n    },\n    className: \"jsx-2066523395\" + \" \" + \"editLink\",\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 48,\n      columnNumber: 11\n    }\n  }, edit ? 'Exit edit mode' : 'Enter edit mode'), __jsx(styled_jsx_style__WEBPACK_IMPORTED_MODULE_0___default.a, {\n    id: \"2066523395\",\n    __self: undefined,\n    __source: void 0\n  }, \".editLink.jsx-2066523395{border:none;position:fixed;top:0;right:0;background:var(--orange);color:var(--white);padding:0.5rem 0.75rem;font-weight:bold;-webkit-text-decoration:none;text-decoration:none;display:inline-block;border-bottom-left-radius:0.5rem;cursor:pointer;font-size:20px;}\\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qZWZmc2VlL2NvZGUvdGluYWNtcy9leGFtcGxlcy90aW5hLWNsb3VkLXN0YXJ0ZXIvcGFnZXMvX2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF1RHNCLEFBRzJCLFlBQ0csZUFDVCxNQUNFLFFBQ2lCLHlCQUNOLG1CQUNJLHVCQUNOLGlCQUNJLGtEQUNBLHFCQUNZLGlDQUNsQixlQUNBLGVBQ2pCIiwiZmlsZSI6Ii9Vc2Vycy9qZWZmc2VlL2NvZGUvdGluYWNtcy9leGFtcGxlcy90aW5hLWNsb3VkLXN0YXJ0ZXIvcGFnZXMvX2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuQ29weXJpZ2h0IDIwMjEgRm9yZXN0cnkuaW8gSG9sZGluZ3MsIEluYy5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgZHluYW1pYyBmcm9tICduZXh0L2R5bmFtaWMnXG5cbmltcG9ydCB7IEVkaXRQcm92aWRlciwgdXNlRWRpdFN0YXRlIH0gZnJvbSAndGluYWNtcy9kaXN0L2VkaXQtc3RhdGUnXG5cbi8vIElubmVyQXBwIHRoYXQgaGFuZGxlcyByZW5kZXJpbmcgZWRpdCBtb2RlIG9yIG5vdFxuZnVuY3Rpb24gSW5uZXJBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9KSB7XG4gIGNvbnN0IHsgZWRpdCB9ID0gdXNlRWRpdFN0YXRlKClcbiAgaWYgKGVkaXQpIHtcbiAgICAvLyBEeW5hbWljYWxseSBsb2FkIFRpbmEgb25seSB3aGVuIGluIGVkaXQgbW9kZSBzbyBpdCBkb2VzIG5vdCBhZmZlY3QgcHJvZHVjdGlvblxuICAgIC8vIHNlZSBodHRwczovL25leHRqcy5vcmcvZG9jcy9hZHZhbmNlZC1mZWF0dXJlcy9keW5hbWljLWltcG9ydCNiYXNpYy11c2FnZVxuICAgIGNvbnN0IFRpbmFXcmFwcGVyID0gZHluYW1pYygoKSA9PiBpbXBvcnQoJy4uL2NvbXBvbmVudHMvdGluYS13cmFwcGVyJykpXG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICAgIDxUaW5hV3JhcHBlciB7Li4ucGFnZVByb3BzfT5cbiAgICAgICAgICB7KHByb3BzKSA9PiA8Q29tcG9uZW50IHsuLi5wcm9wc30gLz59XG4gICAgICAgIDwvVGluYVdyYXBwZXI+XG4gICAgICAgIDxFZGl0VG9nZ2xlIGlzSW5FZGl0TW9kZT17dHJ1ZX0gLz5cbiAgICAgIDwvPlxuICAgIClcbiAgfVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgICA8RWRpdFRvZ2dsZSBpc0luRWRpdE1vZGU9e3RydWV9IC8+XG4gICAgPC8+XG4gIClcbn1cblxuY29uc3QgRWRpdFRvZ2dsZSA9ICgpID0+IHtcbiAgY29uc3QgeyBlZGl0LCBzZXRFZGl0IH0gPSB1c2VFZGl0U3RhdGUoKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7KE51bWJlcihwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TSE9XX0VESVRfQlROKSB8fCBlZGl0KSAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRFZGl0KCFlZGl0KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImVkaXRMaW5rXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ZWRpdCA/ICdFeGl0IGVkaXQgbW9kZScgOiAnRW50ZXIgZWRpdCBtb2RlJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8c3R5bGUganN4PntgXG4gICAgICAgICAgICAuZWRpdExpbmsge1xuICAgICAgICAgICAgICBib3JkZXI6IG5vbmU7XG4gICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgICByaWdodDogMDtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tb3JhbmdlKTtcbiAgICAgICAgICAgICAgY29sb3I6IHZhcigtLXdoaXRlKTtcbiAgICAgICAgICAgICAgcGFkZGluZzogMC41cmVtIDAuNzVyZW07XG4gICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogMC41cmVtO1xuICAgICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgICAgICAgIGZvbnQtc2l6ZTogMjBweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBgfTwvc3R5bGU+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyBPdXIgYXBwIGlzIHdyYXBwZWQgd2l0aCBlZGl0IHByb3ZpZGVyXG5mdW5jdGlvbiBBcHAocHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8RWRpdFByb3ZpZGVyPlxuICAgICAgPElubmVyQXBwIHsuLi5wcm9wc30gLz5cbiAgICA8L0VkaXRQcm92aWRlcj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBcbiJdfQ== */\\n/*@ sourceURL=/Users/jeffsee/code/tinacms/examples/tina-cloud-starter/pages/_app.js */\")));\n}; // Our app is wrapped with edit provider\n\n\nfunction App(props) {\n  return __jsx(tinacms_dist_edit_state__WEBPACK_IMPORTED_MODULE_3__[\"EditProvider\"], {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 82,\n      columnNumber: 5\n    }\n  }, __jsx(InnerApp, _extends({}, props, {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 83,\n      columnNumber: 7\n    }\n  })));\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (App);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9fYXBwLmpzP2Q1MzAiXSwibmFtZXMiOlsiSW5uZXJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJlZGl0IiwidXNlRWRpdFN0YXRlIiwiVGluYVdyYXBwZXIiLCJkeW5hbWljIiwicHJvcHMiLCJFZGl0VG9nZ2xlIiwic2V0RWRpdCIsIk51bWJlciIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TSE9XX0VESVRfQlROIiwiQXBwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Q0FJQTs7QUFDQSxTQUFTQSxRQUFULENBQWtCO0FBQUVDLFdBQUY7QUFBYUM7QUFBYixDQUFsQixFQUE0QztBQUMxQyxRQUFNO0FBQUVDO0FBQUYsTUFBV0MsNEVBQVksRUFBN0I7O0FBQ0EsTUFBSUQsSUFBSixFQUFVO0FBQ1I7QUFDQTtBQUNBLFVBQU1FLFdBQVcsR0FBR0MsbURBQU8sQ0FBQyxNQUFNLGdKQUFQO0FBQUE7QUFBQSw0Q0FBYyxpRUFBZDtBQUFBLGtCQUFjLDRCQUFkO0FBQUE7QUFBQSxNQUEzQjtBQUNBLFdBQ0UsbUVBQ0UsTUFBQyxXQUFELGVBQWlCSixTQUFqQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBQ0lLLEtBQUQsSUFBVyxNQUFDLFNBQUQsZUFBZUEsS0FBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BRGQsQ0FERixFQUlFLE1BQUMsVUFBRDtBQUFZLGtCQUFZLEVBQUUsSUFBMUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUpGLENBREY7QUFRRDs7QUFDRCxTQUNFLG1FQUNFLE1BQUMsU0FBRCxlQUFlTCxTQUFmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FERixFQUVFLE1BQUMsVUFBRDtBQUFZLGdCQUFZLEVBQUUsSUFBMUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUZGLENBREY7QUFNRDs7QUFFRCxNQUFNTSxVQUFVLEdBQUcsTUFBTTtBQUN2QixRQUFNO0FBQUVMLFFBQUY7QUFBUU07QUFBUixNQUFvQkwsNEVBQVksRUFBdEM7QUFDQSxTQUNFLG1FQUNHLENBQUNNLE1BQU0sQ0FBQ0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLHlCQUFiLENBQU4sSUFBaURWLElBQWxELEtBQ0MsbUVBQ0U7QUFDRSxXQUFPLEVBQUUsTUFBTTtBQUNiTSxhQUFPLENBQUMsQ0FBQ04sSUFBRixDQUFQO0FBQ0QsS0FISDtBQUFBLHdDQUlZLFVBSlo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQU1HQSxJQUFJLEdBQUcsZ0JBQUgsR0FBc0IsaUJBTjdCLENBREY7QUFBQTtBQUFBO0FBQUE7QUFBQSxtc0lBRkosQ0FERjtBQWlDRCxDQW5DRCxDLENBcUNBOzs7QUFDQSxTQUFTVyxHQUFULENBQWFQLEtBQWIsRUFBb0I7QUFDbEIsU0FDRSxNQUFDLG9FQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FDRSxNQUFDLFFBQUQsZUFBY0EsS0FBZDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBREYsQ0FERjtBQUtEOztBQUVjTyxrRUFBZiIsImZpbGUiOiIuL3BhZ2VzL19hcHAuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbkNvcHlyaWdodCAyMDIxIEZvcmVzdHJ5LmlvIEhvbGRpbmdzLCBJbmMuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGR5bmFtaWMgZnJvbSAnbmV4dC9keW5hbWljJ1xuXG5pbXBvcnQgeyBFZGl0UHJvdmlkZXIsIHVzZUVkaXRTdGF0ZSB9IGZyb20gJ3RpbmFjbXMvZGlzdC9lZGl0LXN0YXRlJ1xuXG4vLyBJbm5lckFwcCB0aGF0IGhhbmRsZXMgcmVuZGVyaW5nIGVkaXQgbW9kZSBvciBub3RcbmZ1bmN0aW9uIElubmVyQXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xuICBjb25zdCB7IGVkaXQgfSA9IHVzZUVkaXRTdGF0ZSgpXG4gIGlmIChlZGl0KSB7XG4gICAgLy8gRHluYW1pY2FsbHkgbG9hZCBUaW5hIG9ubHkgd2hlbiBpbiBlZGl0IG1vZGUgc28gaXQgZG9lcyBub3QgYWZmZWN0IHByb2R1Y3Rpb25cbiAgICAvLyBzZWUgaHR0cHM6Ly9uZXh0anMub3JnL2RvY3MvYWR2YW5jZWQtZmVhdHVyZXMvZHluYW1pYy1pbXBvcnQjYmFzaWMtdXNhZ2VcbiAgICBjb25zdCBUaW5hV3JhcHBlciA9IGR5bmFtaWMoKCkgPT4gaW1wb3J0KCcuLi9jb21wb25lbnRzL3RpbmEtd3JhcHBlcicpKVxuICAgIHJldHVybiAoXG4gICAgICA8PlxuICAgICAgICA8VGluYVdyYXBwZXIgey4uLnBhZ2VQcm9wc30+XG4gICAgICAgICAgeyhwcm9wcykgPT4gPENvbXBvbmVudCB7Li4ucHJvcHN9IC8+fVxuICAgICAgICA8L1RpbmFXcmFwcGVyPlxuICAgICAgICA8RWRpdFRvZ2dsZSBpc0luRWRpdE1vZGU9e3RydWV9IC8+XG4gICAgICA8Lz5cbiAgICApXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgPEVkaXRUb2dnbGUgaXNJbkVkaXRNb2RlPXt0cnVlfSAvPlxuICAgIDwvPlxuICApXG59XG5cbmNvbnN0IEVkaXRUb2dnbGUgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZWRpdCwgc2V0RWRpdCB9ID0gdXNlRWRpdFN0YXRlKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgeyhOdW1iZXIocHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU0hPV19FRElUX0JUTikgfHwgZWRpdCkgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0RWRpdCghZWRpdClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJlZGl0TGlua1wiXG4gICAgICAgICAgPlxuICAgICAgICAgICAge2VkaXQgPyAnRXhpdCBlZGl0IG1vZGUnIDogJ0VudGVyIGVkaXQgbW9kZSd9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPHN0eWxlIGpzeD57YFxuICAgICAgICAgICAgLmVkaXRMaW5rIHtcbiAgICAgICAgICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLW9yYW5nZSk7XG4gICAgICAgICAgICAgIGNvbG9yOiB2YXIoLS13aGl0ZSk7XG4gICAgICAgICAgICAgIHBhZGRpbmc6IDAuNXJlbSAwLjc1cmVtO1xuICAgICAgICAgICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IDAuNXJlbTtcbiAgICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgICBmb250LXNpemU6IDIwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYH08L3N0eWxlPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC8+XG4gIClcbn1cblxuLy8gT3VyIGFwcCBpcyB3cmFwcGVkIHdpdGggZWRpdCBwcm92aWRlclxuZnVuY3Rpb24gQXBwKHByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPEVkaXRQcm92aWRlcj5cbiAgICAgIDxJbm5lckFwcCB7Li4ucHJvcHN9IC8+XG4gICAgPC9FZGl0UHJvdmlkZXI+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwXG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ 0:
/*!****************************************!*\
  !*** multi private-next-pages/_app.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! private-next-pages/_app.js */"./pages/_app.js");


/***/ }),

/***/ "lodash/camelCase":
/*!***********************************!*\
  !*** external "lodash/camelCase" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/camelCase\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvY2FtZWxDYXNlXCI/MmUwNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJsb2Rhc2gvY2FtZWxDYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoL2NhbWVsQ2FzZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/camelCase\n");

/***/ }),

/***/ "lodash/cloneDeep":
/*!***********************************!*\
  !*** external "lodash/cloneDeep" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/cloneDeep\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvY2xvbmVEZWVwXCI/MWE5ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJsb2Rhc2gvY2xvbmVEZWVwLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoL2Nsb25lRGVlcFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/cloneDeep\n");

/***/ }),

/***/ "lodash/debounce":
/*!**********************************!*\
  !*** external "lodash/debounce" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/debounce\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvZGVib3VuY2VcIj8xNGE5Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImxvZGFzaC9kZWJvdW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaC9kZWJvdW5jZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/debounce\n");

/***/ }),

/***/ "lodash/each":
/*!******************************!*\
  !*** external "lodash/each" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/each\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvZWFjaFwiPzY1YzMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoibG9kYXNoL2VhY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb2Rhc2gvZWFjaFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/each\n");

/***/ }),

/***/ "lodash/forOwn":
/*!********************************!*\
  !*** external "lodash/forOwn" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/forOwn\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvZm9yT3duXCI/ZTZkOCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJsb2Rhc2gvZm9yT3duLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoL2Zvck93blwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/forOwn\n");

/***/ }),

/***/ "lodash/has":
/*!*****************************!*\
  !*** external "lodash/has" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/has\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvaGFzXCI/N2RhOCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJsb2Rhc2gvaGFzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoL2hhc1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/has\n");

/***/ }),

/***/ "lodash/isPlainObject":
/*!***************************************!*\
  !*** external "lodash/isPlainObject" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/isPlainObject\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvaXNQbGFpbk9iamVjdFwiPzZlYmQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoibG9kYXNoL2lzUGxhaW5PYmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb2Rhc2gvaXNQbGFpbk9iamVjdFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/isPlainObject\n");

/***/ }),

/***/ "lodash/isString":
/*!**********************************!*\
  !*** external "lodash/isString" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/isString\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvaXNTdHJpbmdcIj83NGY2Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImxvZGFzaC9pc1N0cmluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaC9pc1N0cmluZ1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/isString\n");

/***/ }),

/***/ "lodash/isUndefined":
/*!*************************************!*\
  !*** external "lodash/isUndefined" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/isUndefined\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvaXNVbmRlZmluZWRcIj8zMmQyIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImxvZGFzaC9pc1VuZGVmaW5lZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaC9pc1VuZGVmaW5lZFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/isUndefined\n");

/***/ }),

/***/ "lodash/map":
/*!*****************************!*\
  !*** external "lodash/map" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/map\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvbWFwXCI/YTJjMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJsb2Rhc2gvbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoL21hcFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/map\n");

/***/ }),

/***/ "lodash/mapKeys":
/*!*********************************!*\
  !*** external "lodash/mapKeys" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/mapKeys\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvbWFwS2V5c1wiPzZlMDgiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoibG9kYXNoL21hcEtleXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb2Rhc2gvbWFwS2V5c1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/mapKeys\n");

/***/ }),

/***/ "lodash/mapValues":
/*!***********************************!*\
  !*** external "lodash/mapValues" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/mapValues\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvbWFwVmFsdWVzXCI/YjVlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJsb2Rhc2gvbWFwVmFsdWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoL21hcFZhbHVlc1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/mapValues\n");

/***/ }),

/***/ "lodash/merge":
/*!*******************************!*\
  !*** external "lodash/merge" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/merge\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvbWVyZ2VcIj85NWRkIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImxvZGFzaC9tZXJnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaC9tZXJnZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/merge\n");

/***/ }),

/***/ "lodash/snakeCase":
/*!***********************************!*\
  !*** external "lodash/snakeCase" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/snakeCase\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvc25ha2VDYXNlXCI/ZGVjYSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJsb2Rhc2gvc25ha2VDYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoL3NuYWtlQ2FzZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/snakeCase\n");

/***/ }),

/***/ "lodash/throttle":
/*!**********************************!*\
  !*** external "lodash/throttle" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash/throttle\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2gvdGhyb3R0bGVcIj85MzhkIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImxvZGFzaC90aHJvdHRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaC90aHJvdHRsZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///lodash/throttle\n");

/***/ }),

/***/ "next/dynamic":
/*!*******************************!*\
  !*** external "next/dynamic" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"next/dynamic\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJuZXh0L2R5bmFtaWNcIj82ZDNmIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6Im5leHQvZHluYW1pYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5leHQvZHluYW1pY1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///next/dynamic\n");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwYXRoXCI/NzRiYiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJwYXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///path\n");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdFwiPzU4OGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoicmVhY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWFjdFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react\n");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react-dom\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdC1kb21cIj81ZTlhIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6InJlYWN0LWRvbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlYWN0LWRvbVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react-dom\n");

/***/ }),

/***/ "styled-components":
/*!************************************!*\
  !*** external "styled-components" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"styled-components\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzdHlsZWQtY29tcG9uZW50c1wiP2Y1YWQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoic3R5bGVkLWNvbXBvbmVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzdHlsZWQtY29tcG9uZW50c1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///styled-components\n");

/***/ }),

/***/ "styled-jsx/style":
/*!***********************************!*\
  !*** external "styled-jsx/style" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"styled-jsx/style\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzdHlsZWQtanN4L3N0eWxlXCI/MmJiYiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJzdHlsZWQtanN4L3N0eWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwic3R5bGVkLWpzeC9zdHlsZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///styled-jsx/style\n");

/***/ })

/******/ });