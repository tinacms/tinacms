import React from "react";
import { Highlight, themes } from "prism-react-renderer";
const Prism = (props) => {
  return /* @__PURE__ */ React.createElement(
    Highlight,
    {
      theme: themes[props.theme || "github"],
      code: props.value || "",
      language: props.lang || ""
    },
    ({ className, style, tokens, getLineProps, getTokenProps }) => /* @__PURE__ */ React.createElement("pre", { className, style }, tokens.map((line, i) => /* @__PURE__ */ React.createElement("div", { ...getLineProps({ line, key: i }) }, line.map((token, key) => /* @__PURE__ */ React.createElement("span", { ...getTokenProps({ token, key }) })))))
  );
};
export {
  Prism
};
