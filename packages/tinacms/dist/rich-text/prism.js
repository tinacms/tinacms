(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("react"), require("prism-react-renderer")) : typeof define === "function" && define.amd ? define(["exports", "react", "prism-react-renderer"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.tinacms = {}, global.NOOP, global.NOOP));
})(this, function(exports2, React, prismReactRenderer) {
  "use strict";
  const Prism = (props) => {
    return /* @__PURE__ */ React.createElement(
      prismReactRenderer.Highlight,
      {
        theme: prismReactRenderer.themes[props.theme || "github"],
        code: props.value || "",
        language: props.lang || ""
      },
      ({ className, style, tokens, getLineProps, getTokenProps }) => /* @__PURE__ */ React.createElement("pre", { className, style }, tokens.map((line, i) => /* @__PURE__ */ React.createElement("div", { ...getLineProps({ line, key: i }) }, line.map((token, key) => /* @__PURE__ */ React.createElement("span", { ...getTokenProps({ token, key }) })))))
    );
  };
  exports2.Prism = Prism;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
