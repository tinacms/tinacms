(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("zod"), require("react"), require("react-dom"), require("@udecode/cn"), require("@udecode/plate"), require("@udecode/plate-common"), require("@udecode/plate-slash-command"), require("@udecode/plate-code-block"), require("@monaco-editor/react"), require("slate-react"), require("@headlessui/react"), require("class-variance-authority"), require("lucide-react"), require("mermaid"), require("@udecode/plate-heading"), require("@ariakit/react"), require("@udecode/plate-combobox"), require("@udecode/plate-table"), require("@udecode/plate-resizable"), require("@radix-ui/react-popover"), require("@radix-ui/react-slot"), require("@radix-ui/react-dropdown-menu"), require("@radix-ui/react-separator"), require("final-form-arrays"), require("final-form-set-field-data"), require("final-form"), require("react-final-form"), require("prop-types"), require("react-beautiful-dnd"), require("react-color"), require("color-string"), require("react-dropzone"), require("clsx"), require("tailwind-merge"), require("cmdk"), require("is-hotkey"), require("slate"), require("@react-hook/window-size"), require("lodash.get"), require("moment"), require("date-fns"), require("@udecode/plate-link"), require("@radix-ui/react-toolbar"), require("@radix-ui/react-tooltip"), require("@udecode/plate-paragraph"), require("@udecode/plate-block-quote"), require("@udecode/plate-floating"), require("graphql"), require("@tinacms/schema-tools"), require("graphql-tag"), require("@graphql-inspector/core"), require("yup"), require("react-router-dom"), require("@tinacms/mdx")) : typeof define === "function" && define.amd ? define(["exports", "zod", "react", "react-dom", "@udecode/cn", "@udecode/plate", "@udecode/plate-common", "@udecode/plate-slash-command", "@udecode/plate-code-block", "@monaco-editor/react", "slate-react", "@headlessui/react", "class-variance-authority", "lucide-react", "mermaid", "@udecode/plate-heading", "@ariakit/react", "@udecode/plate-combobox", "@udecode/plate-table", "@udecode/plate-resizable", "@radix-ui/react-popover", "@radix-ui/react-slot", "@radix-ui/react-dropdown-menu", "@radix-ui/react-separator", "final-form-arrays", "final-form-set-field-data", "final-form", "react-final-form", "prop-types", "react-beautiful-dnd", "react-color", "color-string", "react-dropzone", "clsx", "tailwind-merge", "cmdk", "is-hotkey", "slate", "@react-hook/window-size", "lodash.get", "moment", "date-fns", "@udecode/plate-link", "@radix-ui/react-toolbar", "@radix-ui/react-tooltip", "@udecode/plate-paragraph", "@udecode/plate-block-quote", "@udecode/plate-floating", "graphql", "@tinacms/schema-tools", "graphql-tag", "@graphql-inspector/core", "yup", "react-router-dom", "@tinacms/mdx"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.tinacms = {}, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP, global.NOOP));
})(this, function(exports2, zod, React, reactDom, cn$1, plate, plateCommon, plateSlashCommand, plateCodeBlock, MonacoEditor, slateReact, react, classVarianceAuthority, lucideReact, mermaid, plateHeading, react$1, plateCombobox, plateTable, plateResizable, PopoverPrimitive, reactSlot, DropdownMenuPrimitive, SeparatorPrimitive, arrayMutators, setFieldData, finalForm, reactFinalForm, PropTypes, reactBeautifulDnd, pkg$1, pkg, dropzone, clsx, tailwindMerge, cmdk, isHotkey, slate, windowSize, get, moment, dateFns, plateLink, ToolbarPrimitive, TooltipPrimitive, plateParagraph, plateBlockQuote, plateFloating, graphql, schemaTools, gql, core, yup, reactRouterDom, mdx) {
  "use strict";var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
    if (e) {
      for (const k in e) {
        if (k !== "default") {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }
  const React__namespace = /* @__PURE__ */ _interopNamespaceDefault(React);
  const PopoverPrimitive__namespace = /* @__PURE__ */ _interopNamespaceDefault(PopoverPrimitive);
  const DropdownMenuPrimitive__namespace = /* @__PURE__ */ _interopNamespaceDefault(DropdownMenuPrimitive);
  const SeparatorPrimitive__namespace = /* @__PURE__ */ _interopNamespaceDefault(SeparatorPrimitive);
  const pkg__namespace$1 = /* @__PURE__ */ _interopNamespaceDefault(pkg$1);
  const pkg__namespace = /* @__PURE__ */ _interopNamespaceDefault(pkg);
  const dropzone__namespace = /* @__PURE__ */ _interopNamespaceDefault(dropzone);
  const ToolbarPrimitive__namespace = /* @__PURE__ */ _interopNamespaceDefault(ToolbarPrimitive);
  const TooltipPrimitive__namespace = /* @__PURE__ */ _interopNamespaceDefault(TooltipPrimitive);
  const yup__namespace = /* @__PURE__ */ _interopNamespaceDefault(yup);
  const ModalProvider = ({ children }) => {
    const [modalRootContainerRef, setModalRootContainerRef] = React.useState(
      null
    );
    const setModalRef = React.useCallback((node) => {
      if (node !== null) {
        setModalRootContainerRef(node);
      }
    }, []);
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("div", { id: "modal-root", ref: setModalRef }), /* @__PURE__ */ React__namespace.createElement(
      ModalContainerContext.Provider,
      {
        value: { portalNode: modalRootContainerRef }
      },
      children
    ));
  };
  const ModalContainerContext = React__namespace.createContext(null);
  function useModalContainer() {
    const modalContainer = React__namespace.useContext(ModalContainerContext);
    if (!modalContainer) {
      throw new Error("No Modal Container context provided");
    }
    return modalContainer;
  }
  const ModalOverlay = ({ children }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "fixed inset-0 z-modal w-screen h-dvh overflow-y-auto" }, children, /* @__PURE__ */ React__namespace.createElement("div", { className: "fixed -z-1 inset-0 opacity-80 bg-gradient-to-br from-gray-800 via-gray-900 to-black" }));
  };
  const Modal = (props) => {
    const { portalNode } = useModalContainer();
    if (!portalNode)
      return null;
    return reactDom.createPortal(
      /* @__PURE__ */ React__namespace.createElement(ModalOverlay, null, /* @__PURE__ */ React__namespace.createElement("div", { ...props })),
      portalNode
    );
  };
  const ModalActions = ({ children }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full flex justify-between gap-4 items-center px-5 pb-5 rounded-b-md" }, children);
  };
  const ModalBody = ({ className = "", padded = false, ...props }) => /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `${padded ? "p-5" : "p-0"} m-0 overflow-hidden flex flex-col min-h-[160px] [&:last-child]:rounded-[0_0_5px_5px] ${className}`,
      ...props
    }
  );
  const AddIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M14.9524 4.89689L14.9524 26.8016H16.7461L16.7461 4.89689H14.9524Z" }),
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M4.8969 16.7461H26.8016L26.8016 14.9523H4.89689L4.8969 16.7461Z" })
  );
  const AlignCenter = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement("svg", { viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React__namespace.createElement(
    "path",
    {
      d: "M9.125 24H22.875V26H9.125V24ZM5 18H27V20H5V18ZM5 6H27V8H5V6ZM9.125 12H22.875V14H9.125V12Z",
      fill: "inherit"
    }
  ));
  const AlignLeft = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement("svg", { viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React__namespace.createElement(
    "path",
    {
      d: "M5 24H20.125V26H5V24ZM5 18H27V20H5V18ZM5 6H27V8H5V6ZM5 12H20.125V14H5V12Z",
      fill: "inherit"
    }
  ));
  const AlignRight = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement("svg", { viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React__namespace.createElement(
    "path",
    {
      d: "M11.875 24H27V26H11.875V24ZM5 18H27V20H5V18ZM5 6H27V8H5V6ZM11.875 12H27V14H11.875V12Z",
      fill: "inherit"
    }
  ));
  const CloseIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M5 6.2684L24.7316 26L26 24.7316L6.2684 5L5 6.2684Z" }),
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M6.2684 26L26 6.2684L24.7316 5L5 24.7316L6.2684 26Z" })
  );
  const EllipsisVerticalIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 4 14",
      fill: "#828282",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M2 5.5C1.5625 5.5 1.21875 5.65625 0.9375 5.9375C0.625 6.25 0.5 6.59375 0.5 7C0.5 7.4375 0.625 7.78125 0.9375 8.0625C1.21875 8.375 1.5625 8.5 2 8.5C2.40625 8.5 2.75 8.375 3.0625 8.0625C3.34375 7.78125 3.5 7.4375 3.5 7C3.5 6.59375 3.34375 6.25 3.0625 5.9375C2.75 5.65625 2.40625 5.5 2 5.5ZM0.5 2.25C0.5 1.84375 0.625 1.5 0.9375 1.1875C1.21875 0.90625 1.5625 0.75 2 0.75C2.40625 0.75 2.75 0.90625 3.0625 1.1875C3.34375 1.5 3.5 1.84375 3.5 2.25C3.5 2.6875 3.34375 3.03125 3.0625 3.3125C2.75 3.625 2.40625 3.75 2 3.75C1.5625 3.75 1.21875 3.625 0.9375 3.3125C0.625 3.03125 0.5 2.6875 0.5 2.25ZM0.5 11.75C0.5 11.3438 0.625 11 0.9375 10.6875C1.21875 10.4062 1.5625 10.25 2 10.25C2.40625 10.25 2.75 10.4062 3.0625 10.6875C3.34375 11 3.5 11.3438 3.5 11.75C3.5 12.1875 3.34375 12.5312 3.0625 12.8125C2.75 13.125 2.40625 13.25 2 13.25C1.5625 13.25 1.21875 13.125 0.9375 12.8125C0.625 12.5312 0.5 12.1875 0.5 11.75Z" })
  );
  const HamburgerIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M4 10H28V8H4V10Z" }),
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M4 17H28V15H4V17Z" }),
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M4 24H28V22H4V24Z" })
  );
  const EditIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M24.3324 8.96875C24.754 9.42578 25 9.95312 25 10.5859C25 11.2188 24.754 11.7461 24.3324 12.168L11.9634 24.543L7.85212 25C7.57101 25 7.36018 24.9297 7.21962 24.7188C7.04392 24.543 6.97365 24.332 7.00878 24.0508L7.46559 20.043L19.8346 7.66797C20.2562 7.24609 20.7833 7 21.4158 7C22.0483 7 22.5754 7.24609 23.0322 7.66797L24.3324 8.96875ZM11.1903 22.9258L20.3968 13.7148L18.2884 11.6055L9.08199 20.8164L8.80088 23.207L11.1903 22.9258ZM23.1376 10.9727C23.243 10.8672 23.3133 10.7266 23.3133 10.5859C23.3133 10.4453 23.243 10.3047 23.1376 10.1641L21.8375 8.86328C21.6969 8.75781 21.5564 8.6875 21.4158 8.6875C21.2753 8.6875 21.1347 8.75781 21.0293 8.86328L19.4832 10.4102L21.5915 12.5195L23.1376 10.9727Z" })
  );
  const ChevronDownIcon$2 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M6.708 10.5L5.5 11.7654L14.2939 20.9773C14.9597 21.6747 16.0412 21.6737 16.7061 20.9773L25.5 11.7654L24.292 10.5L15.5 19.7098L6.708 10.5Z" })
  );
  const ChevronUpIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M25.292 21.5L26.5 20.2346L17.7061 11.0227C17.0403 10.3253 15.9588 10.3263 15.2939 11.0227L6.5 20.2346L7.708 21.5L16.5 12.2901L25.292 21.5Z" })
  );
  const ChevronLeftIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M21 7.208L19.7346 6L10.5227 14.7939C9.82527 15.4597 9.82626 16.5412 10.5227 17.2061L19.7346 26L21 24.792L11.7901 16L21 7.208Z" })
  );
  const ChevronRightIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M11 24.792L12.2654 26L21.4773 17.2061C22.1747 16.5403 22.1737 15.4588 21.4773 14.7939L12.2654 6L11 7.208L20.2099 16L11 24.792Z" })
  );
  const DuplicateIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        d: "M24.95,25.85H13.01c-0.5,0-0.9-0.4-0.9-0.9V13.01c0-0.5,0.4-0.9,0.9-0.9h11.94c0.5,0,0.9,0.4,0.9,0.9v11.94\r\n      C25.85,25.45,25.45,25.85,24.95,25.85z M13.91,24.05h10.14V13.91H13.91V24.05z"
      }
    ),
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        d: "M9.93,19.89H7.05c-0.5,0-0.9-0.4-0.9-0.9V7.05c0-0.5,0.4-0.9,0.9-0.9h11.94c0.5,0,0.9,0.4,0.9,0.9v2.89h-1.8V7.95H7.95\r\n      v10.14h1.99V19.89z"
      }
    )
  );
  const DragIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M15 22C15 23.1 14.1 24 13 24C11.9 24 11 23.1 11 22C11 20.9 11.9 20 13 20C14.1 20 15 20.9 15 22ZM13 14C11.9 14 11 14.9 11 16C11 17.1 11.9 18 13 18C14.1 18 15 17.1 15 16C15 14.9 14.1 14 13 14ZM13 8C11.9 8 11 8.9 11 10C11 11.1 11.9 12 13 12C14.1 12 15 11.1 15 10C15 8.9 14.1 8 13 8ZM19 12C20.1 12 21 11.1 21 10C21 8.9 20.1 8 19 8C17.9 8 17 8.9 17 10C17 11.1 17.9 12 19 12ZM19 14C17.9 14 17 14.9 17 16C17 17.1 17.9 18 19 18C20.1 18 21 17.1 21 16C21 14.9 20.1 14 19 14ZM19 20C17.9 20 17 20.9 17 22C17 23.1 17.9 24 19 24C20.1 24 21 23.1 21 22C21 20.9 20.1 20 19 20Z" })
  );
  const LeftArrowIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M21 7.208L19.7346 6L10.5227 14.7939C9.82527 15.4597 9.82626 16.5412 10.5227 17.2061L19.7346 26L21 24.792L11.7901 16L21 7.208Z" })
  );
  const RightArrowIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M11 24.792L12.2654 26L21.4773 17.2061C22.1747 16.5403 22.1737 15.4588 21.4773 14.7939L12.2654 6L11 7.20799L20.2099 16L11 24.792Z" })
  );
  const BoldIcon$1 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M20.8 14.3867C22.0933 13.4933 23 12.0267 23 10.6667C23 7.65334 20.6667 5.33334 17.6667 5.33334H9.33333V24H18.72C21.5067 24 23.6667 21.7333 23.6667 18.9467C23.6667 16.92 22.52 15.1867 20.8 14.3867V14.3867ZM13.3333 8.66667H17.3333C18.44 8.66667 19.3333 9.56 19.3333 10.6667C19.3333 11.7733 18.44 12.6667 17.3333 12.6667H13.3333V8.66667ZM18 20.6667H13.3333V16.6667H18C19.1067 16.6667 20 17.56 20 18.6667C20 19.7733 19.1067 20.6667 18 20.6667Z" })
  );
  const CodeIcon$1 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M12.5333 22.1333L6.40001 16L12.5333 9.86667L10.6667 8L2.66667 16L10.6667 24L12.5333 22.1333ZM19.4667 22.1333L25.6 16L19.4667 9.86667L21.3333 8L29.3333 16L21.3333 24L19.4667 22.1333V22.1333Z" })
  );
  const ExitIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M15.5 23.0129L8.88889 23.0129L8.88889 9.10324L15.5 9.10324L15.5 7.11615L8.88889 7.11615C7.85 7.11615 7 8.01034 7 9.10324L7 23.0129C7 24.1058 7.85 25 8.88889 25L15.5 25L15.5 23.0129Z" }),
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M18.6961 12.4912L21.1328 15.0645L12 15.0645L12 17.0516L21.1328 17.0516L18.6961 19.6249L20.0278 21.0258L24.75 16.0581L20.0278 11.0903L18.6961 12.4912Z" })
  );
  const HeadingIcon$1 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M12 5.33334V9.33334H18.6667V25.3333H22.6667V9.33334H29.3333V5.33334H12ZM4 16H8V25.3333H12V16H16V12H4V16Z" })
  );
  const ItalicIcon$1 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M13.3333 5.33334V9.33334H16.28L11.72 20H8V24H18.6667V20H15.72L20.28 9.33334H24V5.33334H13.3333Z" })
  );
  const MediaIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M26 20V8C26 6.9 25.1 6 24 6H12C10.9 6 10 6.9 10 8V20C10 21.1 10.9 22 12 22H24C25.1 22 26 21.1 26 20ZM15 16L17.03 18.71L20 15L24 20H12L15 16ZM6 10V24C6 25.1 6.9 26 8 26H22V24H8V10H6Z" })
  );
  const OrderedListIcon$1 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M2.66667 22.6667H5.33333V23.3333H4V24.6667H5.33333V25.3333H2.66667V26.6667H6.66667V21.3333H2.66667V22.6667ZM4 10.6667H5.33333V5.33334H2.66667V6.66667H4V10.6667ZM2.66667 14.6667H5.06667L2.66667 17.4667V18.6667H6.66667V17.3333H4.26667L6.66667 14.5333V13.3333H2.66667V14.6667ZM9.33333 6.66667V9.33334H28V6.66667H9.33333ZM9.33333 25.3333H28V22.6667H9.33333V25.3333ZM9.33333 17.3333H28V14.6667H9.33333V17.3333Z" })
  );
  const SettingsIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M24.7021 13.8628L24.0959 12.4533C24.0959 12.4533 25.5063 9.34049 25.3804 9.22033L23.5152 7.43748C23.3853 7.3142 20.2046 8.73502 20.2046 8.73502L18.7364 8.1553C18.7364 8.1553 17.4403 5 17.2622 5H14.629C14.4469 5 13.2457 8.16271 13.2457 8.16271L11.7807 8.74321C11.7807 8.74321 8.53338 7.393 8.40784 7.51277L6.54507 9.29875C6.41594 9.42125 7.89851 12.4724 7.89851 12.4724L7.29273 13.8788C7.29273 13.8788 4 15.1209 4 15.2883V17.8143C4 17.9903 7.3003 19.1415 7.3003 19.1415L7.90608 20.5467C7.90608 20.5467 6.49724 23.6572 6.62079 23.7765L8.48595 25.5641C8.61189 25.6854 11.795 24.265 11.795 24.265L13.264 24.847C13.264 24.847 14.5601 28 14.739 28H17.373C17.5551 28 18.7555 24.8373 18.7555 24.8373L20.2257 24.2552C20.2257 24.2552 23.467 25.607 23.5922 25.4888L25.4581 23.7028C25.5872 23.5788 24.1015 20.5292 24.1015 20.5292L24.7057 19.1228C24.7057 19.1228 28 17.8791 28 17.7094V15.1841C28.0008 15.0105 24.7021 13.8628 24.7021 13.8628ZM19.8479 16.4984C19.8479 18.5306 18.1222 20.1855 16.0012 20.1855C13.8818 20.1855 12.1537 18.5306 12.1537 16.4984C12.1537 14.4679 13.8818 12.8161 16.0012 12.8161C18.123 12.8169 19.8479 14.4679 19.8479 16.4984Z" })
  );
  const TableIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M4 21h15.893c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zm0-2v-5h4v5H4zM14 7v5h-4V7h4zM8 7v5H4V7h4zm2 12v-5h4v5h-4zm6 0v-5h3.894v5H16zm3.893-7H16V7h3.893v5z" })
  );
  const TinaIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z" }),
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z" })
  );
  const TrashIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M16.9 4.2V6.9H25V8.7H7V6.9H15.1V4.2H16.9ZM7.77201 10.5H24.2279L22.4102 24.1332C22.2853 25.0698 21.4406 25.8 20.4977 25.8H11.5022C10.5561 25.8 9.71404 25.0653 9.58977 24.1332L7.77201 10.5ZM22.172 12.3H9.82791L11.3739 23.8953C11.3788 23.9318 11.4569 24 11.5022 24H20.4977C20.5432 24 20.6209 23.9328 20.6259 23.8953L22.172 12.3Z"
      }
    )
  );
  const UnorderedListIcon$1 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M5.33333 14C4.22667 14 3.33333 14.8933 3.33333 16C3.33333 17.1067 4.22667 18 5.33333 18C6.44 18 7.33333 17.1067 7.33333 16C7.33333 14.8933 6.44 14 5.33333 14ZM5.33333 6C4.22667 6 3.33333 6.89333 3.33333 8C3.33333 9.10667 4.22667 10 5.33333 10C6.44 10 7.33333 9.10667 7.33333 8C7.33333 6.89333 6.44 6 5.33333 6ZM5.33333 22C4.22667 22 3.33333 22.9067 3.33333 24C3.33333 25.0933 4.24 26 5.33333 26C6.42667 26 7.33333 25.0933 7.33333 24C7.33333 22.9067 6.44 22 5.33333 22ZM9.33333 25.3333H28V22.6667H9.33333V25.3333ZM9.33333 17.3333H28V14.6667H9.33333V17.3333ZM9.33333 6.66667V9.33333H28V6.66667H9.33333Z" })
  );
  const UndoIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M16.6667 10.6667C13.1333 10.6667 9.93333 11.9867 7.46667 14.1333L2.66667 9.33334V21.3333H14.6667L9.84 16.5067C11.6933 14.96 14.0533 14 16.6667 14C21.3867 14 25.4 17.08 26.8 21.3333L29.96 20.2933C28.1067 14.7067 22.8667 10.6667 16.6667 10.6667Z" })
  );
  const RedoIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M24.5333 14.1333C22.0667 11.9867 18.8667 10.6667 15.3333 10.6667C9.13333 10.6667 3.89333 14.7067 2.05333 20.2933L5.2 21.3333C6.6 17.08 10.6 14 15.3333 14C17.9333 14 20.3067 14.96 22.16 16.5067L17.3333 21.3333H29.3333V9.33334L24.5333 14.1333Z" })
  );
  const ReorderIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M15.3012 6.23952L11.0607 10.4801L10 9.41943L14.2406 5.17886C14.9213 4.49816 16.0233 4.48258 16.7196 5.17886L20.9602 9.41943L19.8995 10.4801L15.6589 6.23952C15.5561 6.13671 15.4039 6.13689 15.3012 6.23952Z"
      }
    ),
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M15.6988 25.8732L19.9393 21.6326L21 22.6933L16.7594 26.9339C16.0787 27.6146 14.9767 27.6301 14.2804 26.9339L10.0398 22.6933L11.1005 21.6326L15.3411 25.8732C15.4439 25.976 15.5961 25.9758 15.6988 25.8732Z"
      }
    ),
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M14.6569 27.1127V17.799L16.1569 17.799V27.1127L14.6569 27.1127Z"
      }
    ),
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M14.6569 14.3137V5L16.1569 5V14.3137L14.6569 14.3137Z"
      }
    )
  );
  const ReorderRowIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M25.7605 15.3012L21.5199 11.0607L22.5806 10L26.8211 14.2406C27.5018 14.9213 27.5174 16.0233 26.8211 16.7196L22.5806 20.9602L21.5199 19.8995L25.7605 15.6589C25.8633 15.5561 25.8631 15.4039 25.7605 15.3012Z"
      }
    ),
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M6.12679 15.6988L10.3674 19.9393L9.3067 21L5.06613 16.7594C4.38543 16.0787 4.36985 14.9767 5.06613 14.2804L9.3067 10.0398L10.3674 11.1005L6.12679 15.3411C6.02398 15.4439 6.02416 15.5961 6.12679 15.6988Z"
      }
    ),
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M4.88727 14.6569L14.201 14.6569L14.201 16.1569L4.88727 16.1569L4.88727 14.6569Z"
      }
    ),
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M17.6863 14.6569L27 14.6569L27 16.1569L17.6863 16.1569L17.6863 14.6569Z"
      }
    )
  );
  const UploadIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M17.3 25.1V19.9H21.2L16 13.4L10.8 19.9H14.7V25.1H17.3Z" }),
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M9.5 25.1H12.1V22.5H9.5C7.3498 22.5 5.6 20.7502 5.6 18.6C5.6 16.7748 7.1587 15.0172 9.0749 14.6805L9.8302 14.5479L10.0798 13.8225C10.9937 11.1562 13.2635 9.49996 16 9.49996C19.5841 9.49996 22.5 12.4159 22.5 16V17.3H23.8C25.2339 17.3 26.4 18.4661 26.4 19.9C26.4 21.3339 25.2339 22.5 23.8 22.5H19.9V25.1H23.8C26.6678 25.1 29 22.7678 29 19.9C28.998 18.7347 28.6056 17.6036 27.8855 16.6874C27.1654 15.7713 26.1591 15.1228 25.0272 14.8456C24.4591 10.371 20.628 6.89996 16 6.89996C12.4172 6.89996 9.305 8.99426 7.8841 12.295C5.0917 13.1296 3 15.766 3 18.6C3 22.1841 5.9159 25.1 9.5 25.1Z" })
  );
  const ResetIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        d: "M12.625 13.3846H19.375C21.2358 13.3846 22.75 14.8342 22.75 16.6154C22.75 18.3966 21.2358 19.8462 19.375 19.8462H16V22H19.375C22.4766 22 25 19.5845 25 16.6154C25 13.6463 22.4766 11.2308 19.375 11.2308H12.625V8L7 12.3077L12.625 16.6154V13.3846Z",
        fill: "inherit"
      }
    )
  );
  const LinkIcon$1 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M5.2 16C5.2 13.72 7.05333 11.8667 9.33333 11.8667H14.6667V9.33334H9.33333C5.65333 9.33334 2.66666 12.32 2.66666 16C2.66666 19.68 5.65333 22.6667 9.33333 22.6667H14.6667V20.1333H9.33333C7.05333 20.1333 5.2 18.28 5.2 16ZM10.6667 17.3333H21.3333V14.6667H10.6667V17.3333ZM22.6667 9.33334H17.3333V11.8667H22.6667C24.9467 11.8667 26.8 13.72 26.8 16C26.8 18.28 24.9467 20.1333 22.6667 20.1333H17.3333V22.6667H22.6667C26.3467 22.6667 29.3333 19.68 29.3333 16C29.3333 12.32 26.3467 9.33334 22.6667 9.33334Z" })
  );
  const LockIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        d: "M25 16.5C25 15.3419 23.9909 14.4 22.75 14.4H21.625V10.25C21.625 7.35515 19.1016 5 16 5C12.8984 5 10.375 7.35515 10.375 10.25V14.4H9.25C8.00912 14.4 7 15.3419 7 16.5V23.9C7 25.0581 8.00912 26 9.25 26H22.75C23.9909 26 25 25.0581 25 23.9V16.5ZM12.625 10.25C12.625 8.5133 14.1392 7.1 16 7.1C17.8608 7.1 19.375 8.5133 19.375 10.25V14.4H12.625V10.25Z",
        fill: "inherit"
      }
    )
  );
  const QuoteIcon$1 = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M8.00001 22.6667H12L14.6667 17.3333V9.33334H6.66667V17.3333H10.6667L8.00001 22.6667ZM18.6667 22.6667H22.6667L25.3333 17.3333V9.33334H17.3333V17.3333H21.3333L18.6667 22.6667Z" })
  );
  const UnderlineIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M16 22.6667C20.4133 22.6667 24 19.08 24 14.6667V4H20.6667V14.6667C20.6667 17.24 18.5733 19.3333 16 19.3333C13.4267 19.3333 11.3333 17.24 11.3333 14.6667V4H8.00001V14.6667C8.00001 19.08 11.5867 22.6667 16 22.6667ZM6.66667 25.3333V28H25.3333V25.3333H6.66667Z" })
  );
  const StrikethroughIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M16.578 26a14.1 14.1 0 01-4.535-.75A12.299 12.299 0 018 22.889l2.628-3.028a13.437 13.437 0 002.83 1.722c.982.426 2.051.64 3.206.64.924 0 1.637-.158 2.137-.473.52-.333.78-.787.78-1.361v-.056c0-.117-.01-.228-.03-.333H24c-.003.952-.186 1.804-.549 2.556a5.478 5.478 0 01-1.53 1.888c-.655.5-1.435.89-2.34 1.167-.905.26-1.906.389-3.003.389zm-3.993-9H29v-3H17.265a71.646 71.646 0 01-1.843-.5c-.558-.167-1-.343-1.328-.528-.327-.185-.558-.389-.693-.61a1.905 1.905 0 01-.174-.834v-.056c0-.481.212-.88.636-1.194.443-.334 1.097-.5 1.964-.5.866 0 1.733.176 2.599.528a14.16 14.16 0 012.657 1.388l2.31-3.222a11.94 11.94 0 00-3.436-1.833C18.724 6.213 17.367 6 15.884 6c-1.04 0-1.992.139-2.859.417-.866.277-1.617.676-2.252 1.194a5.537 5.537 0 00-1.444 1.861c-.347.704-.52 1.5-.52 2.39v.055c0 .804.107 1.498.322 2.083H4v3h8.585z"
      }
    )
  );
  const MarkdownIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M28.0035 7H4.01374C2.91056 7 2 7.988 2 9.185V23.796C2 25.012 2.91056 26 4.01374 26H27.986C29.1067 26 29.9998 25.012 29.9998 23.815V9.185C30.0173 7.988 29.1067 7 28.0035 7ZM17.7597 22.2H14.2576V16.5L11.6309 20.148L9.00432 16.5V22.2H5.50216V10.8H9.00432L11.6309 14.6L14.2576 10.8H17.7597V22.2ZM22.9954 23.15L18.6352 16.5H21.2619V10.8H24.764V16.5H27.3906L22.9954 23.15Z"
      }
    )
  );
  const AlertIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        d: "M16 29.3333C17.4666 29.3333 18.6666 28.1333 18.6666 26.6666H13.3333C13.3333 27.3739 13.6143 28.0522 14.1144 28.5523C14.6145 29.0524 15.2927 29.3333 16 29.3333ZM24 21.3333V14.6666C24 10.5733 21.8133 7.14665 18 6.23998V5.33331C18 4.22665 17.1066 3.33331 16 3.33331C14.8933 3.33331 14 4.22665 14 5.33331V6.23998C10.1733 7.14665 7.99998 10.56 7.99998 14.6666V21.3333L5.33331 24V25.3333H26.6666V24L24 21.3333Z",
        fill: "inherit"
      }
    )
  );
  const InfoIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        d: "M16 2.66669C8.64802 2.66669 2.66669 8.64802 2.66669 16C2.66669 23.352 8.64802 29.3334 16 29.3334C23.352 29.3334 29.3334 23.352 29.3334 16C29.3334 8.64802 23.352 2.66669 16 2.66669ZM17.3334 22.6667H14.6667V14.6667H17.3334V22.6667ZM17.3334 12H14.6667V9.33335H17.3334V12Z",
        fill: "inherit"
      }
    )
  );
  const WarningIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        d: "M31.2176 28.768L16.9664 2.1568C16.8686 1.98698 16.7278 1.84593 16.5581 1.74786C16.3884 1.64978 16.1959 1.59814 16 1.59814C15.804 1.59814 15.6115 1.64978 15.4419 1.74786C15.2722 1.84593 15.1314 1.98698 15.0336 2.1568L0.783977 28.768C0.688907 28.9338 0.639554 29.1219 0.640959 29.3131C0.642365 29.5042 0.694478 29.6916 0.791977 29.856C0.991977 30.1936 1.35518 30.4 1.74878 30.4H30.2512C30.4442 30.4003 30.6339 30.3503 30.8017 30.2549C30.9695 30.1595 31.1095 30.022 31.208 29.856C31.3054 29.6916 31.3576 29.5044 31.3593 29.3133C31.361 29.1222 31.3121 28.9341 31.2176 28.768V28.768ZM17.6 27.2H14.4V24H17.6V27.2ZM17.6 21.6H14.4V11.2H17.6V21.6Z",
        fill: "inherit"
      }
    )
  );
  const ErrorIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "inherit",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "path",
      {
        d: "M22.276 3.05736C22.1524 2.9333 22.0055 2.83491 21.8437 2.76787C21.6819 2.70082 21.5085 2.66643 21.3334 2.66669H10.6667C10.4916 2.66643 10.3181 2.70082 10.1563 2.76787C9.99455 2.83491 9.84763 2.9333 9.72402 3.05736L3.05736 9.72402C2.9333 9.84763 2.83491 9.99455 2.76787 10.1563C2.70082 10.3181 2.66643 10.4916 2.66669 10.6667V21.3334C2.66669 21.688 2.80669 22.0267 3.05736 22.276L9.72402 28.9427C9.84763 29.0667 9.99455 29.1651 10.1563 29.2322C10.3181 29.2992 10.4916 29.3336 10.6667 29.3334H21.3334C21.688 29.3334 22.0267 29.1934 22.276 28.9427L28.9427 22.276C29.0667 22.1524 29.1651 22.0055 29.2322 21.8437C29.2992 21.6819 29.3336 21.5085 29.3334 21.3334V10.6667C29.3336 10.4916 29.2992 10.3181 29.2322 10.1563C29.1651 9.99455 29.0667 9.84763 28.9427 9.72402L22.276 3.05736ZM17.3334 22.6667H14.6667V20H17.3334V22.6667ZM17.3334 17.3334H14.6667V9.33336H17.3334V17.3334Z",
        fill: "inherit"
      }
    )
  );
  const PullRequestIcon = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M22.6328 19.163V11.997C22.6281 10.391 21.613 8 18.8359 8V6L15.0484 9L18.8359 12V10C20.5677 10 20.7306 11.539 20.7391 12V19.163C19.3756 19.597 18.3719 20.92 18.3719 22.5C18.3719 24.43 19.8585 26 21.686 26C23.5134 26 25 24.43 25 22.5C25 20.92 23.9963 19.597 22.6328 19.163ZM21.686 24C20.9029 24 20.2656 23.327 20.2656 22.5C20.2656 21.673 20.9029 21 21.686 21C22.469 21 23.1063 21.673 23.1063 22.5C23.1063 23.327 22.469 24 21.686 24ZM13.6281 9.5C13.6281 7.57 12.1415 6 10.314 6C8.48659 6 7 7.57 7 9.5C7 11.08 8.00368 12.403 9.36718 12.837V19.163C8.00368 19.597 7 20.92 7 22.5C7 24.43 8.48659 26 10.314 26C12.1415 26 13.6281 24.43 13.6281 22.5C13.6281 20.92 12.6244 19.597 11.2609 19.163V12.837C12.6244 12.403 13.6281 11.08 13.6281 9.5ZM8.89374 9.5C8.89374 8.673 9.53098 8 10.314 8C11.0971 8 11.7344 8.673 11.7344 9.5C11.7344 10.327 11.0971 11 10.314 11C9.53098 11 8.89374 10.327 8.89374 9.5ZM11.7344 22.5C11.7344 23.327 11.0971 24 10.314 24C9.53098 24 8.89374 23.327 8.89374 22.5C8.89374 21.673 9.53098 21 10.314 21C11.0971 21 11.7344 21.673 11.7344 22.5Z" })
  );
  const Folder = ({ ...props }) => {
    return /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "2 2 20 20", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M20,5h-8.586L9.707,3.293C9.52,3.105,9.265,3,9,3H4C2.897,3,2,3.897,2,5v14c0,1.103,0.897,2,2,2h16c1.103,0,2-0.897,2-2V7 C22,5.897,21.103,5,20,5z M4,19V7h7h1h8l0.002,12H4z" }));
  };
  const File = ({ ...props }) => {
    return /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "2 2 20 20", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M19.903,8.586c-0.049-0.106-0.11-0.207-0.196-0.293l-6-6c-0.086-0.086-0.187-0.147-0.293-0.196 c-0.03-0.014-0.062-0.022-0.094-0.033c-0.084-0.028-0.17-0.046-0.259-0.051C13.04,2.011,13.021,2,13,2H6C4.897,2,4,2.897,4,4v16 c0,1.103,0.897,2,2,2h12c1.103,0,2-0.897,2-2V9c0-0.021-0.011-0.04-0.013-0.062c-0.005-0.089-0.022-0.175-0.051-0.259 C19.926,8.647,19.917,8.616,19.903,8.586z M16.586,8H14V5.414L16.586,8z M6,20V4h6v5c0,0.553,0.447,1,1,1h5l0.002,10H6z" }), /* @__PURE__ */ React.createElement("path", { d: "M8 12H16V14H8zM8 16H16V18H8zM8 8H10V10H8z" }));
  };
  const Circle = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "currentColor",
      className: "bi bi-circle",
      viewBox: "0 0 16 16",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" })
  );
  const CircleCheck = ({ ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "currentColor",
      className: "bi bi-check-circle-fill",
      viewBox: "0 0 16 16",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement("path", { d: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" })
  );
  const ModalHeader = ({ children, close: close2 }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "h-14 flex items-center justify-between px-5 border-b border-gray-200 m-0" }, /* @__PURE__ */ React__namespace.createElement(ModalTitle, null, children), close2 && /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        onClick: close2,
        className: "flex items-center fill-gray-400 cursor-pointer transition-colors duration-100 ease-out hover:fill-gray-700"
      },
      /* @__PURE__ */ React__namespace.createElement(CloseIcon, { className: "w-6 h-auto" })
    ));
  };
  const ModalTitle = ({ children }) => {
    return /* @__PURE__ */ React__namespace.createElement("h2", { className: "text-gray-600 font-sans font-medium text-base leading-none m-0 block truncate flex items-center" }, children);
  };
  const FullscreenModal = ({ className = "", style = {}, ...props }) => /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `flex flex-col z-0 overflow-visible bg-white rounded-none absolute top-0 left-0 w-full max-w-[1500px] h-full ${className} md:w-[calc(100%-170px)]`,
      style: {
        animation: "popup-right 150ms ease-out 1",
        ...style
      },
      ...props
    }
  );
  const ModalFullscreen = FullscreenModal;
  const PopupModal = ({ className = "", style = {}, ...props }) => /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `block z-0 overflow-visible bg-gray-50 rounded-[5px] my-10 mx-auto w-[460px] max-w-[90%] ${className}`,
      style: {
        animation: "popup-down 150ms ease-out 1",
        ...style
      },
      ...props
    }
  );
  const ModalPopup = PopupModal;
  const ERROR_MISSING_CMS = `useCMS could not find an instance of CMS`;
  const CMSContext = React__namespace.createContext(null);
  function useCMS$1() {
    const { cms, dispatch, state } = React__namespace.useContext(CMSContext);
    if (!cms) {
      throw new Error(ERROR_MISSING_CMS);
    }
    const [, setEnabled] = React__namespace.useState(cms.enabled);
    cms.dispatch = dispatch;
    cms.state = state;
    React__namespace.useEffect(() => {
      return cms.events.subscribe("cms", () => {
        setEnabled(cms.enabled);
      });
    }, [cms]);
    return cms;
  }
  function useCMSEvent(event, callback, deps) {
    const cms = useCMS$1();
    React__namespace.useEffect(function() {
      return cms.events.subscribe(event, callback);
    }, deps);
  }
  const useEventSubscription = useCMSEvent;
  function useEvent(eventType) {
    const cms = useCMS$1();
    return {
      dispatch: (event) => cms.events.dispatch({
        ...event,
        type: eventType
      }),
      subscribe: (callback) => cms.events.subscribe(eventType, callback)
    };
  }
  function wrapFieldsWithMeta(Field) {
    return (props) => {
      return /* @__PURE__ */ React__namespace.createElement(
        FieldMeta,
        {
          name: props.input.name,
          label: props.field.label,
          description: props.field.description,
          error: props.meta.error,
          index: props.index,
          tinaForm: props.tinaForm
        },
        /* @__PURE__ */ React__namespace.createElement(Field, { ...props })
      );
    };
  }
  function wrapFieldWithNoHeader(Field) {
    return (props) => {
      return /* @__PURE__ */ React__namespace.createElement(
        FieldMeta,
        {
          name: props.input.name,
          label: false,
          description: "",
          error: props.meta.error,
          index: props.index,
          tinaForm: props.tinaForm
        },
        /* @__PURE__ */ React__namespace.createElement(Field, { ...props })
      );
    };
  }
  function wrapFieldWithError(Field) {
    return (props) => {
      return /* @__PURE__ */ React__namespace.createElement(
        FieldMeta,
        {
          name: props.input.name,
          label: false,
          description: props.field.description,
          error: props.meta.error,
          index: props.index,
          tinaForm: props.tinaForm
        },
        /* @__PURE__ */ React__namespace.createElement(Field, { ...props })
      );
    };
  }
  const FieldMeta = ({
    name,
    label,
    description,
    error,
    margin = true,
    children,
    index,
    tinaForm,
    ...props
  }) => {
    const { dispatch: setHoveredField } = useEvent("field:hover");
    const { dispatch: setFocusedField } = useEvent("field:focus");
    return /* @__PURE__ */ React__namespace.createElement(
      FieldWrapper,
      {
        margin,
        onMouseOver: () => setHoveredField({ id: tinaForm.id, fieldName: name }),
        onMouseOut: () => setHoveredField({ id: null, fieldName: null }),
        onClick: () => setFocusedField({ id: tinaForm.id, fieldName: name }),
        style: { zIndex: index ? 1e3 - index : void 0 },
        ...props
      },
      (label !== false || description) && /* @__PURE__ */ React__namespace.createElement(FieldLabel, { name }, label !== false && /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, label || name), description && /* @__PURE__ */ React__namespace.createElement(FieldDescription, null, description)),
      children,
      error && typeof error === "string" && /* @__PURE__ */ React__namespace.createElement(FieldError, null, error)
    );
  };
  const FieldWrapper = ({
    margin,
    children,
    ...props
  }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: `relative ${margin ? `mb-5 last:mb-0` : ``}`, ...props }, children);
  };
  const FieldLabel = ({
    children,
    className,
    name,
    ...props
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "label",
      {
        htmlFor: name,
        className: `block font-sans text-xs font-semibold text-gray-700 whitespace-normal mb-2 ${className}`,
        ...props
      },
      children
    );
  };
  const FieldDescription = ({
    children,
    className,
    ...props
  }) => {
    if (typeof children === "string") {
      return /* @__PURE__ */ React__namespace.createElement(
        "span",
        {
          className: `block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal m-0 ${className}`,
          ...props,
          dangerouslySetInnerHTML: { __html: children }
        }
      );
    }
    return /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: `block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal m-0 ${className}`,
        ...props
      },
      children
    );
  };
  const FieldError = ({
    children,
    className,
    ...props
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: `block font-sans text-xs font-normal text-red-500 pt-3 animate-slide-in whitespace-normal m-0  ${className}`,
        ...props
      },
      children
    );
  };
  const EditorContext = React.createContext({
    fieldName: "",
    rawMode: false,
    setRawMode: () => {
    },
    templates: []
  });
  const useEditorContext = () => {
    return React.useContext(EditorContext);
  };
  const useTemplates = () => {
    return React.useContext(EditorContext);
  };
  const BlockquoteElement = cn$1.withRef(
    ({ children, className, ...props }, ref) => {
      return /* @__PURE__ */ React.createElement(
        plateCommon.PlateElement,
        {
          asChild: true,
          className: cn$1.cn("my-1 border-l-2 pl-6 italic", className),
          ref,
          ...props
        },
        /* @__PURE__ */ React.createElement("blockquote", null, children)
      );
    }
  );
  function classNames$1(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  const uuid = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };
  function ChevronDownIcon(props, svgRef) {
    return /* @__PURE__ */ React__namespace.createElement("svg", Object.assign({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      "aria-hidden": "true",
      ref: svgRef
    }, props), /* @__PURE__ */ React__namespace.createElement("path", {
      fillRule: "evenodd",
      d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",
      clipRule: "evenodd"
    }));
  }
  const ForwardRef = React__namespace.forwardRef(ChevronDownIcon);
  const ChevronDownIcon$1 = ForwardRef;
  const Autocomplete = ({
    value,
    onChange,
    defaultQuery,
    items: items2
  }) => {
    const [query, setQuery] = React.useState(defaultQuery ?? "");
    const filteredItems = React.useMemo(() => {
      try {
        const reFilter = new RegExp(query, "i");
        const _items = items2.filter((item) => reFilter.test(item.label));
        if (_items.length === 0)
          return items2;
        return _items;
      } catch (err) {
        return items2;
      }
    }, [items2, query]);
    return /* @__PURE__ */ React.createElement(
      react.Combobox,
      {
        value,
        onChange,
        as: "div",
        className: "relative inline-block text-left z-20"
      },
      /* @__PURE__ */ React.createElement("div", { className: "mt-1" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md sm:text-sm" }, /* @__PURE__ */ React.createElement(
        react.ComboboxInput,
        {
          className: "w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300",
          displayValue: (item) => (item == null ? void 0 : item.label) ?? "Plain Text",
          onChange: (event) => setQuery(event.target.value),
          onClick: (ev) => ev.stopPropagation()
        }
      ), /* @__PURE__ */ React.createElement(react.ComboboxButton, { className: "absolute inset-y-0 right-0 flex items-center pr-2" }, /* @__PURE__ */ React.createElement(
        ChevronDownIcon$1,
        {
          className: "h-5 w-5 text-gray-400",
          "aria-hidden": "true"
        }
      )))),
      /* @__PURE__ */ React.createElement(
        react.Transition,
        {
          enter: "transition ease-out duration-100",
          enterFrom: "transform opacity-0 scale-95",
          enterTo: "transform opacity-100 scale-100",
          leave: "transition ease-in duration-75",
          leaveFrom: "transform opacity-100 scale-100",
          leaveTo: "transform opacity-0 scale-95"
        },
        /* @__PURE__ */ React.createElement(react.ComboboxOptions, { className: "origin-top-right absolute right-0 mt-1 w-full max-h-[300px] overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" }, filteredItems.map((item) => /* @__PURE__ */ React.createElement(react.ComboboxOption, { key: item.key, value: item }, ({ focus }) => /* @__PURE__ */ React.createElement(
          "button",
          {
            className: classNames$1(
              focus ? "bg-gray-100 text-gray-900" : "text-gray-700",
              "block px-4 py-2 text-xs w-full text-right"
            )
          },
          item.render(item)
        ))))
      )
    );
  };
  MonacoEditor.loader.config({
    paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs" }
  });
  let retryCount = 0;
  const retryFocus = (ref) => {
    if (ref.current) {
      ref.current.focus();
    } else {
      if (retryCount < 30) {
        setTimeout(() => {
          retryCount = retryCount + 1;
          retryFocus(ref);
        }, 100);
      }
    }
  };
  const MINIMUM_HEIGHT = 75;
  const CodeBlock = ({
    attributes,
    editor,
    element,
    language: restrictLanguage,
    onChangeCallback,
    defaultValue,
    ...props
  }) => {
    const [navigateAway, setNavigateAway] = React.useState(null);
    const monaco = MonacoEditor.useMonaco();
    const monacoEditorRef = React.useRef(null);
    const selected = slateReact.useSelected();
    const [height, setHeight] = React.useState(MINIMUM_HEIGHT);
    React.useEffect(() => {
      if (selected && plateCommon.isCollapsed(editor.selection)) {
        retryFocus(monacoEditorRef);
      }
    }, [selected, monacoEditorRef.current]);
    const value = element.value || "";
    if (typeof value !== "string") {
      throw new Error("Element must be of type string for code block");
    }
    const language = restrictLanguage || element.lang;
    const id = React.useMemo(() => uuid(), []);
    const languages = React.useMemo(() => {
      const defaultLangSet = { "": "plain text" };
      if (!monaco)
        return defaultLangSet;
      return monaco.languages.getLanguages().reduce((ac, cv) => {
        if (cv.id === "plaintext")
          return ac;
        return { ...ac, [cv.id]: cv.id };
      }, defaultLangSet);
    }, [monaco]);
    React.useEffect(() => {
      if (monaco) {
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          // disable errors
          noSemanticValidation: true,
          noSyntaxValidation: true
        });
      }
    }, [monaco]);
    const items2 = Object.entries(languages).map(([key, label]) => ({
      key,
      label,
      render: (item) => item.label
    }));
    const currentItem = React.useMemo(() => {
      return items2.find((item) => item.key === language) ?? {
        key: "",
        label: "Plain Text"
      };
    }, [items2, language]);
    React.useEffect(() => {
      if (navigateAway) {
        setNavigateAway(null);
        switch (navigateAway) {
          case "remove":
            {
              plateCommon.focusEditor(editor);
              plateCommon.setNodes(
                editor,
                {
                  type: "p",
                  children: [{ text: "" }],
                  lang: void 0,
                  value: void 0
                },
                {
                  match: (n) => {
                    if (plateCommon.isElement(n) && n.type === element.type) {
                      return true;
                    }
                  }
                }
              );
            }
            break;
          case "insertNext":
            {
              plateCommon.insertNodes(
                editor,
                [
                  {
                    type: plateCommon.ELEMENT_DEFAULT,
                    children: [{ text: "" }],
                    lang: void 0,
                    value: void 0
                  }
                ],
                { select: true }
              );
              plateCommon.focusEditor(editor);
            }
            break;
          case "up":
            {
              const path = plateCommon.findNodePath(editor, element);
              if (!path) {
                return;
              }
              const previousNodePath = plateCommon.getPointBefore(editor, path);
              if (!previousNodePath) {
                plateCommon.focusEditor(editor);
                plateCommon.insertNodes(
                  editor,
                  [
                    {
                      type: plateCommon.ELEMENT_DEFAULT,
                      children: [{ text: "" }],
                      lang: void 0,
                      value: void 0
                    }
                  ],
                  // Insert a new node at the current path, resulting in the code_block
                  // moving down one block
                  { at: path, select: true }
                );
                return;
              }
              plateCommon.focusEditor(editor, previousNodePath);
            }
            break;
          case "down": {
            const path = plateCommon.findNodePath(editor, element);
            if (!path) {
              return;
            }
            const nextNodePath = plateCommon.getPointAfter(editor, path);
            if (!nextNodePath) {
              plateCommon.insertNodes(
                editor,
                [
                  {
                    type: plateCommon.ELEMENT_DEFAULT,
                    children: [{ text: "" }],
                    lang: void 0,
                    value: void 0
                  }
                ],
                { select: true }
              );
              plateCommon.focusEditor(editor);
            } else {
              plateCommon.focusEditor(editor, nextNodePath);
            }
            break;
          }
        }
      }
    }, [navigateAway]);
    function handleEditorDidMount(monacoEditor, monaco2) {
      monacoEditorRef.current = monacoEditor;
      monacoEditor.onDidContentSizeChange(() => {
        setHeight(
          monacoEditor.getContentHeight() > MINIMUM_HEIGHT ? monacoEditor.getContentHeight() : MINIMUM_HEIGHT
        );
        monacoEditor.layout();
      });
      plateCommon.setNodes(editor, { value: defaultValue, lang: language });
      monacoEditor.addCommand(monaco2.KeyMod.Shift | monaco2.KeyCode.Enter, () => {
        if (monacoEditor.hasTextFocus()) {
          setNavigateAway("insertNext");
        }
      });
      monacoEditor.onKeyDown((l) => {
        if (l.code === "ArrowUp") {
          const selection = monacoEditor.getSelection();
          if (selection.endLineNumber === 1 && selection.startLineNumber === 1) {
            setNavigateAway("up");
          }
        }
        if (l.code === "ArrowDown") {
          const selection = monacoEditor.getSelection();
          const totalLines = monacoEditor.getModel().getLineCount();
          if (selection.endLineNumber === totalLines && selection.startLineNumber === totalLines) {
            setNavigateAway("down");
          }
        }
        if (l.code === "Backspace") {
          const selection = monacoEditor.getSelection();
          if (selection.endColumn === 1 && selection.endLineNumber === 1 && selection.positionColumn === 1 && selection.positionLineNumber === 1 && selection.selectionStartColumn === 1 && selection.selectionStartLineNumber === 1 && selection.startColumn === 1 && selection.startLineNumber === 1) {
            setNavigateAway("remove");
          }
        }
      });
    }
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        ...attributes,
        className: "relative mb-2 mt-0.5 rounded-lg shadow-md p-2 border-gray-200 border"
      },
      /* @__PURE__ */ React.createElement("style", null, `.monaco-editor .editor-widget {
          display: none !important;
          visibility: hidden !important;
        }`),
      props.children,
      /* @__PURE__ */ React.createElement("div", { contentEditable: false }, !restrictLanguage && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between pb-2" }, /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement(
        Autocomplete,
        {
          items: items2,
          value: currentItem,
          defaultQuery: "plaintext",
          onChange: (item) => plateCommon.setNodes(editor, { lang: item.key })
        }
      )), /* @__PURE__ */ React.createElement("div", { style: { height: `${height}px` } }, /* @__PURE__ */ React.createElement(
        MonacoEditor,
        {
          path: id,
          onMount: handleEditorDidMount,
          options: {
            scrollBeyondLastLine: false,
            // automaticLayout: true,
            tabSize: 2,
            disableLayerHinting: true,
            accessibilitySupport: "off",
            codeLens: false,
            wordWrap: "on",
            minimap: {
              enabled: false
            },
            fontSize: 14,
            lineHeight: 2,
            formatOnPaste: true,
            lineNumbers: "off",
            formatOnType: true,
            fixedOverflowWidgets: true,
            // Takes too much horizontal space for iframe
            folding: false,
            renderLineHighlight: "none",
            scrollbar: {
              verticalScrollbarSize: 1,
              horizontalScrollbarSize: 1,
              // https://github.com/microsoft/monaco-editor/issues/2007#issuecomment-644425664
              alwaysConsumeMouseWheel: false
            }
          },
          language: String(language),
          value: String(element.value),
          onChange: (value2) => {
            onChangeCallback == null ? void 0 : onChangeCallback(value2);
            plateCommon.setNodes(editor, { value: value2, lang: language });
          }
        }
      )))
    );
  };
  const CodeBlockElement = cn$1.withRef(
    ({ className, ...props }, ref) => {
      const { element } = props;
      const state = plateCodeBlock.useCodeBlockElementState({ element });
      return /* @__PURE__ */ React.createElement(
        plateCommon.PlateElement,
        {
          className: cn$1.cn("relative py-1", state.className, className),
          ref,
          ...props
        },
        /* @__PURE__ */ React.createElement(CodeBlock, { ...props })
      );
    }
  );
  const CodeLeaf = cn$1.withRef(
    ({ children, className, ...props }, ref) => {
      return /* @__PURE__ */ React.createElement(
        plateCommon.PlateLeaf,
        {
          asChild: true,
          className: cn$1.cn(
            "whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm",
            className
          ),
          ref,
          ...props
        },
        /* @__PURE__ */ React.createElement("code", null, children)
      );
    }
  );
  const CodeLineElement = cn$1.withRef((props, ref) => /* @__PURE__ */ React.createElement(plateCommon.PlateElement, { ref, ...props }));
  const CodeSyntaxLeaf = cn$1.withRef(
    ({ children, ...props }, ref) => {
      const { leaf } = props;
      const { tokenProps } = plateCodeBlock.useCodeSyntaxLeaf({ leaf });
      return /* @__PURE__ */ React.createElement(plateCommon.PlateLeaf, { ref, ...props }, /* @__PURE__ */ React.createElement("span", { ...tokenProps }, children));
    }
  );
  const listVariants = classVarianceAuthority.cva("m-0 ps-6", {
    variants: {
      variant: {
        ol: "list-decimal",
        ul: "list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]"
      }
    }
  });
  const ListElementVariants = cn$1.withVariants(plateCommon.PlateElement, listVariants, [
    "variant"
  ]);
  const ListElement = cn$1.withRef(
    ({ children, variant = "ul", ...props }, ref) => {
      const Component = variant;
      return /* @__PURE__ */ React.createElement(ListElementVariants, { asChild: true, ref, variant, ...props }, /* @__PURE__ */ React.createElement(Component, null, children));
    }
  );
  const ELEMENT_MERMAID = "mermaid";
  const createMermaidPlugin = plateCommon.createPluginFactory({
    isElement: true,
    isVoid: true,
    isInline: false,
    key: ELEMENT_MERMAID
  });
  const MermaidElementWithRef = ({ config }) => {
    const mermaidRef = React.useRef(null);
    React.useEffect(() => {
      if (mermaidRef.current) {
        mermaid.initialize({ startOnLoad: true });
        mermaid.init();
      }
    }, [config]);
    return /* @__PURE__ */ React.createElement("div", { contentEditable: false, className: "border-border border-b" }, /* @__PURE__ */ React.createElement("div", { ref: mermaidRef }, /* @__PURE__ */ React.createElement("pre", { className: "mermaid not-tina-prose" }, config)));
  };
  const Bubble = ({ children }) => {
    return /* @__PURE__ */ React.createElement("div", { className: "bg-blue-600 rounded-full p-2 transition-transform duration-200 ease-in-out hover:scale-110" }, children);
  };
  const ErrorMsg = ({ error }) => {
    if (error) {
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          contentEditable: false,
          className: "font-mono bg-red-600 text-white p-2 rounded-md cursor-default"
        },
        error
      );
    }
    return null;
  };
  const DEFAULT_MERMAID_CONFIG = `%% This won't render without implementing a rendering engine (e.g. mermaid on npm)
flowchart TD
    id1(this is an example flow diagram) 
    --> id2(modify me to see changes!)
    id2 
    --> id3(Click the top button to preview the changes)
    --> id4(Learn about mermaid diagrams - mermaid.js.org)`;
  const MermaidElement = cn$1.withRef(
    ({ children, nodeProps, element, ...props }, ref) => {
      const [mermaidConfig, setMermaidConfig] = React.useState(
        element.value || DEFAULT_MERMAID_CONFIG
      );
      const [isEditing, setIsEditing] = React.useState(
        mermaidConfig === DEFAULT_MERMAID_CONFIG || false
      );
      const [mermaidError, setMermaidError] = React.useState(null);
      const node = {
        type: ELEMENT_MERMAID,
        value: mermaidConfig,
        children: [{ type: "text", text: "" }]
      };
      React.useEffect(() => {
        if (mermaid.parse(mermaidConfig)) {
          setMermaidError(null);
        }
      }, [mermaidConfig]);
      mermaid.parseError = (err) => {
        setMermaidError(
          String(err.message) || "An error occurred while parsing the diagram."
        );
      };
      return /* @__PURE__ */ React.createElement(plateCommon.PlateElement, { element, ref, ...props }, /* @__PURE__ */ React.createElement("div", { className: "relative group" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-2 right-2 z-10 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out" }, /* @__PURE__ */ React.createElement(Bubble, null, isEditing ? /* @__PURE__ */ React.createElement(
        lucideReact.Eye,
        {
          className: "w-5 h-5 fill-white cursor-pointer",
          onClick: () => {
            setIsEditing(!isEditing);
          }
        }
      ) : /* @__PURE__ */ React.createElement(
        lucideReact.SquarePen,
        {
          className: "w-5 h-5 fill-white cursor-pointer",
          onClick: () => {
            setIsEditing(!isEditing);
          }
        }
      ))), isEditing ? /* @__PURE__ */ React.createElement(
        CodeBlock,
        {
          children: "",
          language: "yaml",
          ...props,
          element: node,
          defaultValue: mermaidConfig,
          onChangeCallback: (value) => setMermaidConfig(value)
        }
      ) : /* @__PURE__ */ React.createElement(MermaidElementWithRef, { config: mermaidConfig })), children, /* @__PURE__ */ React.createElement(ErrorMsg, { error: mermaidError }));
    }
  );
  const RawMarkdown = () => {
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        stroke: "currentColor",
        fill: "currentColor",
        strokeWidth: 0,
        role: "img",
        className: "h-5 w-5",
        viewBox: "0 0 24 24",
        height: "1em",
        width: "1em",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null),
      /* @__PURE__ */ React.createElement("path", { d: "M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.308a1.73 1.73 0 01-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z" })
    );
  };
  const MermaidIcon = () => /* @__PURE__ */ React.createElement(
    "svg",
    {
      width: "100%",
      height: "100%",
      viewBox: "0 0 491 491",
      version: "1.1",
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2
    },
    /* @__PURE__ */ React.createElement("path", { d: "M490.16,84.61C490.16,37.912 452.248,0 405.55,0L84.61,0C37.912,0 0,37.912 0,84.61L0,405.55C0,452.248 37.912,490.16 84.61,490.16L405.55,490.16C452.248,490.16 490.16,452.248 490.16,405.55L490.16,84.61Z" }),
    /* @__PURE__ */ React.createElement(
      "path",
      {
        d: "M407.48,111.18C335.587,108.103 269.573,152.338 245.08,220C220.587,152.338 154.573,108.103 82.68,111.18C80.285,168.229 107.577,222.632 154.74,254.82C178.908,271.419 193.35,298.951 193.27,328.27L193.27,379.13L296.9,379.13L296.9,328.27C296.816,298.953 311.255,271.42 335.42,254.82C382.596,222.644 409.892,168.233 407.48,111.18Z",
        fill: "white",
        fillRule: "nonzero"
      }
    )
  );
  const borderAll = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      height: "48",
      width: "48",
      focusable: "false",
      role: "img",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement("path", { d: "M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10 13h5a1 1 0 0 0 1-1v-5h-6v6zm-2-6H5v5a1 1 0 0 0 1 1h5v-6zm2-2h6V6a1 1 0 0 0-1-1h-5v6zm-2-6H6a1 1 0 0 0-1 1v5h6V5z" })
  );
  const borderBottom = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      height: "48",
      width: "48",
      focusable: "false",
      role: "img",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement("path", { d: "M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm-2 7a1 1 0 1 1 2 0 1 1 0 0 0 1 1h12a1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm17-8a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3z" })
  );
  const borderLeft = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      height: "48",
      width: "48",
      focusable: "false",
      role: "img",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement("path", { d: "M6 21a1 1 0 1 0 0-2 1 1 0 0 1-1-1V6a1 1 0 0 1 1-1 1 1 0 0 0 0-2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3zm7-16a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm6 6a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm4-17a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zm-1 17a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z" })
  );
  const borderNone = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      height: "48",
      width: "48",
      focusable: "false",
      role: "img",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement("path", { d: "M14 4a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-9 7a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-6 10a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zM7 20a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3z" })
  );
  const borderRight = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      height: "48",
      width: "48",
      focusable: "false",
      role: "img",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement("path", { d: "M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm9 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6 3a1 1 0 0 1 0 2 1 1 0 0 0-1 1 1 1 0 0 1-2 0 3 3 0 0 1 3-3zm1 17a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1V6a1 1 0 0 0-1-1 1 1 0 1 1 0-2 3 3 0 0 1 3 3v12a3 3 0 0 1-3 3z" })
  );
  const borderTop = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      height: "48",
      width: "48",
      focusable: "false",
      role: "img",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement("path", { d: "M3 6a1 1 0 0 0 2 0 1 1 0 0 1 1-1h12a1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3zm2 5a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-8 1a1 1 0 1 0 0-2 1 1 0 0 1-1-1 1 1 0 1 0-2 0 3 3 0 0 0 3 3zm11-1a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z" })
  );
  const iconVariants = classVarianceAuthority.cva("", {
    variants: {
      variant: {
        toolbar: "size-5",
        menuItem: "mr-2 size-5"
      },
      size: {
        sm: "mr-2 size-4",
        md: "mr-2 size-6"
      }
    },
    defaultVariants: {}
  });
  const DoubleColumnOutlined = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      fill: "none",
      height: "16",
      viewBox: "0 0 16 16",
      width: "16",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        clipRule: "evenodd",
        d: "M8.5 3H13V13H8.5V3ZM7.5 2H8.5H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H8.5H7.5H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H7.5ZM7.5 13H3L3 3H7.5V13Z",
        fill: "#595E6F",
        fillRule: "evenodd"
      }
    )
  );
  const ThreeColumnOutlined = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      fill: "none",
      height: "16",
      viewBox: "0 0 16 16",
      width: "16",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        clipRule: "evenodd",
        d: "M9.25 3H6.75V13H9.25V3ZM9.25 2H6.75H5.75H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H5.75H6.75H9.25H10.25H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H10.25H9.25ZM10.25 3V13H13V3H10.25ZM3 13H5.75V3H3L3 13Z",
        fill: "#4C5161",
        fillRule: "evenodd"
      }
    )
  );
  const RightSideDoubleColumnOutlined = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      fill: "none",
      height: "16",
      viewBox: "0 0 16 16",
      width: "16",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        clipRule: "evenodd",
        d: "M11.25 3H13V13H11.25V3ZM10.25 2H11.25H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H11.25H10.25H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H10.25ZM10.25 13H3L3 3H10.25V13Z",
        fill: "#595E6F",
        fillRule: "evenodd"
      }
    )
  );
  const LeftSideDoubleColumnOutlined = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      fill: "none",
      height: "16",
      viewBox: "0 0 16 16",
      width: "16",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        clipRule: "evenodd",
        d: "M5.75 3H13V13H5.75V3ZM4.75 2H5.75H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H5.75H4.75H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H4.75ZM4.75 13H3L3 3H4.75V13Z",
        fill: "#595E6F",
        fillRule: "evenodd"
      }
    )
  );
  const DoubleSideDoubleColumnOutlined = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      fill: "none",
      height: "16",
      viewBox: "0 0 16 16",
      width: "16",
      xmlns: "http://www.w3.org/2000/svg",
      ...props
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        clipRule: "evenodd",
        d: "M10.25 3H5.75V13H10.25V3ZM10.25 2H5.75H4.75H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H4.75H5.75H10.25H11.25H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H11.25H10.25ZM11.25 3V13H13V3H11.25ZM3 13H4.75V3H3L3 13Z",
        fill: "#595E6F",
        fillRule: "evenodd"
      }
    )
  );
  const Overflow = (props) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      className: "h-5 w-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      ...props
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
      }
    )
  );
  const Icons = {
    add: lucideReact.Plus,
    alignCenter: lucideReact.AlignCenter,
    alignJustify: lucideReact.AlignJustify,
    alignLeft: lucideReact.AlignLeft,
    alignRight: lucideReact.AlignRight,
    arrowDown: lucideReact.ChevronDown,
    bg: lucideReact.PaintBucket,
    blockquote: lucideReact.Quote,
    // bold: Bold,
    overflow: Overflow,
    borderAll,
    borderBottom,
    borderLeft,
    borderNone,
    borderRight,
    borderTop,
    check: lucideReact.Check,
    chevronRight: lucideReact.ChevronRight,
    chevronsUpDown: lucideReact.ChevronsUpDown,
    clear: lucideReact.X,
    close: lucideReact.X,
    // code: Code2,
    paint: lucideReact.PaintBucket,
    codeblock: lucideReact.FileCode,
    color: lucideReact.Baseline,
    column: lucideReact.RectangleVertical,
    combine: lucideReact.Combine,
    ungroup: lucideReact.Ungroup,
    comment: lucideReact.MessageSquare,
    commentAdd: lucideReact.MessageSquarePlus,
    delete: lucideReact.Trash,
    dragHandle: lucideReact.GripVertical,
    editing: lucideReact.Edit2,
    emoji: lucideReact.Smile,
    externalLink: lucideReact.ExternalLink,
    h1: lucideReact.Heading1,
    h2: lucideReact.Heading2,
    h3: lucideReact.Heading3,
    h4: lucideReact.Heading4,
    h5: lucideReact.Heading5,
    h6: lucideReact.Heading6,
    // image: Image,
    indent: lucideReact.Indent,
    // italic: Italic,
    kbd: lucideReact.Keyboard,
    lineHeight: lucideReact.WrapText,
    // link: Link2,
    minus: lucideReact.Minus,
    mermaid: MermaidIcon,
    more: lucideReact.MoreHorizontal,
    // ol: ListOrdered,
    outdent: lucideReact.Outdent,
    paragraph: lucideReact.Pilcrow,
    refresh: lucideReact.RotateCcw,
    row: lucideReact.RectangleHorizontal,
    search: lucideReact.Search,
    settings: lucideReact.Settings,
    strikethrough: lucideReact.Strikethrough,
    subscript: lucideReact.Subscript,
    superscript: lucideReact.Superscript,
    table: lucideReact.Table,
    text: lucideReact.Text,
    trash: lucideReact.Trash,
    // ul: List,
    underline: lucideReact.Underline,
    unlink: lucideReact.Link2Off,
    viewing: lucideReact.Eye,
    doubleColumn: DoubleColumnOutlined,
    doubleSideDoubleColumn: DoubleSideDoubleColumnOutlined,
    threeColumn: ThreeColumnOutlined,
    leftSideDoubleColumn: LeftSideDoubleColumnOutlined,
    rightSideDoubleColumn: RightSideDoubleColumnOutlined,
    heading: HeadingIcon,
    link: LinkIcon,
    quote: QuoteIcon,
    image: ImageIcon,
    ul: UnorderedListIcon,
    ol: OrderedListIcon,
    code: CodeIcon,
    codeBlock: CodeBlockIcon,
    bold: BoldIcon,
    italic: ItalicIcon,
    raw: RawMarkdown,
    // www
    gitHub: (props) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 438.549 438.549", ...props }, /* @__PURE__ */ React.createElement(
      "path",
      {
        fill: "currentColor",
        d: "M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      }
    )),
    logo: (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", ...props }, /* @__PURE__ */ React.createElement(
      "path",
      {
        fill: "currentColor",
        d: "M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"
      }
    )),
    moon: lucideReact.Moon,
    sun: lucideReact.SunMedium,
    twitter: lucideReact.Twitter
  };
  function UnorderedListIcon(props) {
    const title = props.title || "format list bulleted";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "h-5 w-5",
        height: "24",
        width: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M7 5h14v2H7V5z", fill: "currentColor" }), /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M4 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
          fill: "currentColor"
        }
      ), /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M7 11h14v2H7v-2zm0 6h14v2H7v-2zm-3 2.5c.82 0 1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5z",
          fill: "currentColor"
        }
      ), /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M4 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
          fill: "currentColor"
        }
      ))
    );
  }
  function HeadingIcon(props) {
    const title = props.title || "format size";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        height: "24",
        width: "24",
        className: "h-5 w-5",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z",
          fill: "currentColor"
        }
      ))
    );
  }
  function OrderedListIcon(props) {
    const title = props.title || "format list numbered";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "h-5 w-5",
        height: "24",
        width: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z",
          fill: "currentColor"
        }
      ))
    );
  }
  function QuoteIcon(props) {
    const title = props.title || "format quote";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        height: "24",
        className: "h-5 w-5",
        width: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z",
          fill: "currentColor"
        }
      ))
    );
  }
  function LinkIcon(props) {
    const title = props.title || "insert link";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        height: "24",
        className: "h-5 w-5",
        width: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
          fill: "currentColor"
        }
      ))
    );
  }
  function CodeIcon(props) {
    const title = props.title || "code";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "h-5 w-5",
        height: "24",
        width: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
          fill: "currentColor"
        }
      ))
    );
  }
  function CodeBlockIcon(props) {
    const title = props.title || "code-block";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "h-5 w-5",
        stroke: "currentColor",
        fill: "currentColor",
        strokeWidth: 0,
        viewBox: "0 0 16 16",
        height: "1em",
        width: "1em",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("path", { d: "M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" }),
      /* @__PURE__ */ React.createElement("path", { d: "M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z" })
    );
  }
  function ImageIcon(props) {
    const title = props.title || "image";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "h-5 w-5",
        height: "24",
        width: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z",
          fill: "currentColor"
        }
      ))
    );
  }
  function BoldIcon(props) {
    const title = props.title || "format bold";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "h-5 w-5",
        height: "24",
        width: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",
          fill: "currentColor"
        }
      ))
    );
  }
  function ItalicIcon(props) {
    const title = props.title || "format italic";
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "h-5 w-5",
        height: "24",
        width: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      },
      /* @__PURE__ */ React.createElement("title", null, title),
      /* @__PURE__ */ React.createElement("g", { fill: "none" }, /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z",
          fill: "currentColor"
        }
      ))
    );
  }
  function PlusIcon({ className = "" }) {
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: `h-4 w-4 ${className}`,
        viewBox: "0 0 20 20",
        fill: "currentColor"
      },
      /* @__PURE__ */ React.createElement(
        "path",
        {
          fillRule: "evenodd",
          d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",
          clipRule: "evenodd"
        }
      )
    );
  }
  const InlineComboboxContext = React.createContext(
    null
  );
  const defaultFilter = ({ keywords = [], value }, search) => [value, ...keywords].some((keyword) => plateCombobox.filterWords(keyword, search));
  const InlineCombobox = ({
    children,
    element,
    filter = defaultFilter,
    hideWhenNoValue = false,
    setValue: setValueProp,
    showTrigger = true,
    trigger,
    value: valueProp
  }) => {
    const editor = plateCommon.useEditorRef();
    const inputRef = React.useRef(null);
    const cursorState = plateCombobox.useHTMLInputCursorState(inputRef);
    const [valueState, setValueState] = React.useState("");
    const hasValueProp = valueProp !== void 0;
    const value = hasValueProp ? valueProp : valueState;
    const setValue = React.useCallback(
      (newValue) => {
        setValueProp == null ? void 0 : setValueProp(newValue);
        if (!hasValueProp) {
          setValueState(newValue);
        }
      },
      [setValueProp, hasValueProp]
    );
    const [insertPoint, setInsertPoint] = React.useState(null);
    React.useEffect(() => {
      const path = plateCommon.findNodePath(editor, element);
      if (!path)
        return;
      const point = plateCommon.getPointBefore(editor, path);
      if (!point)
        return;
      const pointRef = plateCommon.createPointRef(editor, point);
      setInsertPoint(pointRef);
      return () => {
        pointRef.unref();
      };
    }, [editor, element]);
    const { props: inputProps, removeInput } = plateCombobox.useComboboxInput({
      cancelInputOnBlur: false,
      cursorState,
      onCancelInput: (cause) => {
        if (cause !== "backspace") {
          plateCommon.insertText(editor, trigger + value, {
            at: (insertPoint == null ? void 0 : insertPoint.current) ?? void 0
          });
        }
        if (cause === "arrowLeft" || cause === "arrowRight") {
          plateCommon.moveSelection(editor, {
            distance: 1,
            reverse: cause === "arrowLeft"
          });
        }
      },
      ref: inputRef
    });
    const [hasEmpty, setHasEmpty] = React.useState(false);
    const contextValue = React.useMemo(
      () => ({
        filter,
        inputProps,
        inputRef,
        removeInput,
        setHasEmpty,
        showTrigger,
        trigger
      }),
      [
        trigger,
        showTrigger,
        filter,
        inputRef,
        inputProps,
        removeInput,
        setHasEmpty
      ]
    );
    const store = react$1.useComboboxStore({
      setValue: (newValue) => React.startTransition(() => setValue(newValue))
    });
    const items2 = store.useState("items");
    React.useEffect(() => {
      if (!store.getState().activeId) {
        store.setActiveId(store.first());
      }
    }, [items2, store]);
    return /* @__PURE__ */ React.createElement("span", { contentEditable: false }, /* @__PURE__ */ React.createElement(
      react$1.ComboboxProvider,
      {
        open: (items2.length > 0 || hasEmpty) && (!hideWhenNoValue || value.length > 0),
        store
      },
      /* @__PURE__ */ React.createElement(InlineComboboxContext.Provider, { value: contextValue }, children)
    ));
  };
  const InlineComboboxInput = React.forwardRef(({ className, ...props }, propRef) => {
    const {
      inputProps,
      inputRef: contextRef,
      showTrigger,
      trigger
    } = React.useContext(InlineComboboxContext);
    const store = react$1.useComboboxContext();
    const value = store.useState("value");
    const ref = plateCommon.useComposedRef(propRef, contextRef);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, showTrigger && trigger, /* @__PURE__ */ React.createElement("span", { className: "relative min-h-[1lh]" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        "aria-hidden": "true",
        className: "invisible overflow-hidden text-nowrap"
      },
      value || "​"
    ), /* @__PURE__ */ React.createElement(
      react$1.Combobox,
      {
        autoSelect: true,
        className: cn$1.cn(
          "absolute left-0 top-0 size-full bg-transparent outline-none",
          className
        ),
        ref,
        value,
        ...inputProps,
        ...props
      }
    )));
  });
  InlineComboboxInput.displayName = "InlineComboboxInput";
  const InlineComboboxContent = ({
    className,
    ...props
  }) => {
    return /* @__PURE__ */ React.createElement(react$1.Portal, null, /* @__PURE__ */ React.createElement(
      react$1.ComboboxPopover,
      {
        className: cn$1.cn(
          "z-[9999999] max-h-[288px] w-[300px] overflow-y-auto rounded-md bg-white shadow-md",
          className
        ),
        ...props
      }
    ));
  };
  const comboboxItemVariants = classVarianceAuthority.cva(
    "relative flex h-9 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
    {
      defaultVariants: {
        interactive: true
      },
      variants: {
        interactive: {
          false: "",
          true: "cursor-pointer transition-colors hover:bg-blue-500 hover:text-black data-[active-item=true]:bg-orange-400 data-[active-item=true]:text-black"
        }
      }
    }
  );
  const InlineComboboxItem = ({
    className,
    keywords,
    onClick,
    ...props
  }) => {
    const { value } = props;
    const { filter, removeInput } = React.useContext(InlineComboboxContext);
    const store = react$1.useComboboxContext();
    const search = filter && store.useState("value");
    const visible = React.useMemo(
      () => !filter || filter({ keywords, value }, search),
      [filter, value, keywords, search]
    );
    if (!visible)
      return null;
    return /* @__PURE__ */ React.createElement(
      react$1.ComboboxItem,
      {
        className: cn$1.cn(comboboxItemVariants(), className),
        onClick: (event) => {
          removeInput(true);
          onClick == null ? void 0 : onClick(event);
        },
        ...props
      }
    );
  };
  const InlineComboboxEmpty = ({
    children,
    className
  }) => {
    const { setHasEmpty } = React.useContext(InlineComboboxContext);
    const store = react$1.useComboboxContext();
    const items2 = store.useState("items");
    React.useEffect(() => {
      setHasEmpty(true);
      return () => {
        setHasEmpty(false);
      };
    }, [setHasEmpty]);
    if (items2.length > 0)
      return null;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: cn$1.cn(comboboxItemVariants({ interactive: false }), className)
      },
      children
    );
  };
  const rules = [
    {
      icon: Icons.h1,
      onSelect: (editor) => {
        plateCommon.toggleNodeType(editor, { activeType: plateHeading.ELEMENT_H1 });
      },
      value: "Heading 1"
    },
    {
      icon: Icons.h2,
      onSelect: (editor) => {
        plateCommon.toggleNodeType(editor, { activeType: plateHeading.ELEMENT_H2 });
      },
      value: "Heading 2"
    },
    {
      icon: Icons.h3,
      onSelect: (editor) => {
        plateCommon.toggleNodeType(editor, { activeType: plateHeading.ELEMENT_H3 });
      },
      value: "Heading 3"
    },
    {
      icon: Icons.ul,
      keywords: ["ul", "unordered list"],
      onSelect: (editor) => {
        plate.toggleList(editor, { type: plate.ELEMENT_UL });
      },
      value: "Bulleted list"
    },
    {
      icon: Icons.ol,
      keywords: ["ol", "ordered list"],
      onSelect: (editor) => {
        plate.toggleList(editor, { type: plate.ELEMENT_OL });
      },
      value: "Numbered list"
    }
  ];
  const SlashInputElement = cn$1.withRef(
    ({ className, ...props }, ref) => {
      const { children, editor, element } = props;
      return /* @__PURE__ */ React.createElement(
        plateCommon.PlateElement,
        {
          as: "span",
          "data-slate-value": element.value,
          ref,
          ...props
        },
        /* @__PURE__ */ React.createElement(InlineCombobox, { element, trigger: "/" }, /* @__PURE__ */ React.createElement(InlineComboboxInput, null), /* @__PURE__ */ React.createElement(InlineComboboxContent, null, /* @__PURE__ */ React.createElement(InlineComboboxEmpty, null, "No matching commands found"), rules.map(({ icon: Icon, keywords, onSelect, value }) => /* @__PURE__ */ React.createElement(
          InlineComboboxItem,
          {
            key: value,
            keywords,
            onClick: () => onSelect(editor),
            value
          },
          /* @__PURE__ */ React.createElement(Icon, { "aria-hidden": true, className: "mr-2 size-4" }),
          value
        )))),
        children
      );
    }
  );
  const TableCellElement = cn$1.withRef(({ children, className, hideBorder, isHeader, style, ...props }, ref) => {
    var _a, _b, _c, _d;
    const { element } = props;
    const {
      borders,
      colIndex,
      colSpan,
      hovered,
      hoveredLeft,
      isSelectingCell,
      readOnly,
      rowIndex,
      rowSize,
      selected
    } = plateTable.useTableCellElementState();
    const { props: cellProps } = plateTable.useTableCellElement({ element: props.element });
    const resizableState = plateTable.useTableCellElementResizableState({
      colIndex,
      colSpan,
      rowIndex
    });
    const { bottomProps, hiddenLeft, leftProps, rightProps } = plateTable.useTableCellElementResizable(resizableState);
    const Cell = isHeader ? "th" : "td";
    return /* @__PURE__ */ React.createElement(
      plateCommon.PlateElement,
      {
        asChild: true,
        className: cn$1.cn(
          "relative h-full overflow-visible border-none bg-background p-0",
          hideBorder && "before:border-none",
          element.background ? "bg-[--cellBackground]" : "bg-background",
          !hideBorder && cn$1.cn(
            isHeader && "text-left [&_>_*]:m-0",
            "before:size-full",
            selected && "before:z-10 before:bg-muted",
            "before:absolute before:box-border before:select-none before:content-['']",
            borders && cn$1.cn(
              ((_a = borders.bottom) == null ? void 0 : _a.size) && `before:border-b before:border-b-border`,
              ((_b = borders.right) == null ? void 0 : _b.size) && `before:border-r before:border-r-border`,
              ((_c = borders.left) == null ? void 0 : _c.size) && `before:border-l before:border-l-border`,
              ((_d = borders.top) == null ? void 0 : _d.size) && `before:border-t before:border-t-border`
            )
          ),
          className
        ),
        ref,
        ...cellProps,
        ...props,
        style: {
          "--cellBackground": element.background,
          ...style
        }
      },
      /* @__PURE__ */ React.createElement(Cell, null, /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "relative z-20 box-border h-full px-3 py-2",
          style: {
            minHeight: rowSize
          }
        },
        children
      ), !isSelectingCell && /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "group absolute top-0 size-full select-none",
          contentEditable: false,
          suppressContentEditableWarning: true
        },
        !readOnly && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
          plateResizable.ResizeHandle,
          {
            ...rightProps,
            className: "-top-3 right-[-5px] w-[10px]"
          }
        ), /* @__PURE__ */ React.createElement(
          plateResizable.ResizeHandle,
          {
            ...bottomProps,
            className: "bottom-[-5px] h-[10px]"
          }
        ), !hiddenLeft && /* @__PURE__ */ React.createElement(
          plateResizable.ResizeHandle,
          {
            ...leftProps,
            className: "-top-3 left-[-5px] w-[10px]"
          }
        ), hovered && /* @__PURE__ */ React.createElement(
          "div",
          {
            className: cn$1.cn(
              "absolute -top-3 z-30 h-[calc(100%_+_12px)] w-1 bg-ring",
              "right-[-1.5px]"
            )
          }
        ), hoveredLeft && /* @__PURE__ */ React.createElement(
          "div",
          {
            className: cn$1.cn(
              "absolute -top-3 z-30 h-[calc(100%_+_12px)] w-1 bg-ring",
              "left-[-1.5px]"
            )
          }
        ))
      ))
    );
  });
  TableCellElement.displayName = "TableCellElement";
  const TableCellHeaderElement = cn$1.withProps(TableCellElement, {
    isHeader: true
  });
  const buttonVariants$1 = classVarianceAuthority.cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      defaultVariants: {
        size: "default",
        variant: "default"
      },
      variants: {
        isMenu: {
          true: "h-auto w-full cursor-pointer justify-start"
        },
        size: {
          default: "h-10 px-4 py-2",
          icon: "size-10",
          lg: "h-11 rounded-md px-8",
          none: "",
          sm: "h-9 rounded-md px-3",
          sms: "size-9 rounded-md px-0",
          xs: "h-8 rounded-md px-3"
        },
        variant: {
          default: "bg-primary text-primary-foreground hover:bg-primary/90",
          destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          ghost: "hover:bg-accent hover:text-accent-foreground",
          inlineLink: "text-base text-primary underline underline-offset-4",
          link: "text-primary underline-offset-4 hover:underline",
          outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }
      }
    }
  );
  const Button$2 = cn$1.withRef(({ asChild = false, className, isMenu, size, variant, ...props }, ref) => {
    const Comp = asChild ? reactSlot.Slot : "button";
    return /* @__PURE__ */ React__namespace.createElement(
      Comp,
      {
        className: cn$1.cn(buttonVariants$1({ className, isMenu, size, variant })),
        ref,
        ...props
      }
    );
  });
  const DropdownMenu = DropdownMenuPrimitive__namespace.Root;
  const DropdownMenuTrigger = DropdownMenuPrimitive__namespace.Trigger;
  const DropdownMenuPortal = DropdownMenuPrimitive__namespace.Portal;
  const DropdownMenuSub = DropdownMenuPrimitive__namespace.Sub;
  const DropdownMenuRadioGroup = DropdownMenuPrimitive__namespace.RadioGroup;
  const DropdownMenuSubTrigger = cn$1.withRef(({ children, className, inset, ...props }, ref) => /* @__PURE__ */ React.createElement(
    DropdownMenuPrimitive__namespace.SubTrigger,
    {
      className: cn$1.cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      ),
      ref,
      ...props
    },
    children,
    /* @__PURE__ */ React.createElement(Icons.chevronRight, { className: "ml-auto size-4" })
  ));
  const DropdownMenuSubContent = cn$1.withCn(
    DropdownMenuPrimitive__namespace.SubContent,
    "z-[99999] min-w-32 overflow-hidden rounded-md border bg-white p-1 text-black shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
  );
  const DropdownMenuContentVariants = cn$1.withProps(DropdownMenuPrimitive__namespace.Content, {
    className: cn$1.cn(
      "z-[99999] min-w-32 overflow-hidden rounded-md border bg-white p-1 text-black shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
    ),
    sideOffset: 4
  });
  const DropdownMenuContent = cn$1.withRef(({ ...props }, ref) => /* @__PURE__ */ React.createElement(DropdownMenuPrimitive__namespace.Portal, null, /* @__PURE__ */ React.createElement(DropdownMenuContentVariants, { ref, ...props })));
  const menuItemVariants = classVarianceAuthority.cva(
    cn$1.cn(
      "relative flex h-9 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
      "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    ),
    {
      variants: {
        inset: {
          true: "pl-8"
        }
      }
    }
  );
  const DropdownMenuItem = cn$1.withVariants(
    DropdownMenuPrimitive__namespace.Item,
    menuItemVariants,
    ["inset"]
  );
  const DropdownMenuCheckboxItem = cn$1.withRef(({ children, className, ...props }, ref) => /* @__PURE__ */ React.createElement(
    DropdownMenuPrimitive__namespace.CheckboxItem,
    {
      className: cn$1.cn(
        "relative flex select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "cursor-pointer",
        className
      ),
      ref,
      ...props
    },
    /* @__PURE__ */ React.createElement("span", { className: "absolute left-2 flex size-3.5 items-center justify-center" }, /* @__PURE__ */ React.createElement(DropdownMenuPrimitive__namespace.ItemIndicator, null, /* @__PURE__ */ React.createElement(Icons.check, { className: "size-4" }))),
    children
  ));
  const DropdownMenuRadioItem = cn$1.withRef(({ children, className, hideIcon, ...props }, ref) => /* @__PURE__ */ React.createElement(
    DropdownMenuPrimitive__namespace.RadioItem,
    {
      className: cn$1.cn(
        "relative flex select-none items-center rounded-sm pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "h-9 cursor-pointer px-2 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
        className
      ),
      ref,
      ...props
    },
    !hideIcon && /* @__PURE__ */ React.createElement("span", { className: "absolute right-2 flex size-3.5 items-center justify-center" }, /* @__PURE__ */ React.createElement(DropdownMenuPrimitive__namespace.ItemIndicator, null, /* @__PURE__ */ React.createElement(Icons.check, { className: "size-4" }))),
    children
  ));
  const dropdownMenuLabelVariants = classVarianceAuthority.cva(
    cn$1.cn("select-none px-2 py-1.5 text-sm font-semibold"),
    {
      variants: {
        inset: {
          true: "pl-8"
        }
      }
    }
  );
  const DropdownMenuLabel = cn$1.withVariants(
    DropdownMenuPrimitive__namespace.Label,
    dropdownMenuLabelVariants,
    ["inset"]
  );
  const DropdownMenuSeparator = cn$1.withCn(
    DropdownMenuPrimitive__namespace.Separator,
    "-mx-1 my-1 h-px bg-muted"
  );
  cn$1.withCn(
    cn$1.createPrimitiveElement("span"),
    "ml-auto text-xs tracking-widest opacity-60"
  );
  const useOpenState = () => {
    const [open2, setOpen] = React.useState(false);
    const onOpenChange = React.useCallback(
      (_value = !open2) => {
        setOpen(_value);
      },
      [open2]
    );
    return {
      onOpenChange,
      open: open2
    };
  };
  const Popover$2 = PopoverPrimitive__namespace.Root;
  const popoverVariants = classVarianceAuthority.cva(
    "w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 print:hidden"
  );
  const PopoverContent$1 = cn$1.withRef(
    ({ align = "center", className, sideOffset = 4, style, ...props }, ref) => /* @__PURE__ */ React__namespace.createElement(PopoverPrimitive__namespace.Portal, null, /* @__PURE__ */ React__namespace.createElement(
      PopoverPrimitive__namespace.Content,
      {
        align,
        className: cn$1.cn(popoverVariants(), className),
        ref,
        sideOffset,
        style: { zIndex: 1e3, ...style },
        ...props
      }
    ))
  );
  const separatorVariants = classVarianceAuthority.cva("shrink-0 bg-border", {
    defaultVariants: {
      orientation: "horizontal"
    },
    variants: {
      orientation: {
        horizontal: "h-px w-full",
        vertical: "h-full w-px"
      }
    }
  });
  const Separator = cn$1.withVariants(
    cn$1.withProps(SeparatorPrimitive__namespace.Root, {
      decorative: true,
      orientation: "horizontal"
    }),
    separatorVariants
  );
  const TableBordersDropdownMenuContent = cn$1.withRef((props, ref) => {
    const {
      getOnSelectTableBorder,
      hasBottomBorder,
      hasLeftBorder,
      hasNoBorders,
      hasOuterBorders,
      hasRightBorder,
      hasTopBorder
    } = plateTable.useTableBordersDropdownMenuContentState();
    return /* @__PURE__ */ React.createElement(
      DropdownMenuContent,
      {
        align: "start",
        className: cn$1.cn("min-w-[220px]"),
        ref,
        side: "right",
        sideOffset: 0,
        ...props
      },
      /* @__PURE__ */ React.createElement(
        DropdownMenuCheckboxItem,
        {
          checked: hasBottomBorder,
          onCheckedChange: getOnSelectTableBorder("bottom")
        },
        /* @__PURE__ */ React.createElement(Icons.borderBottom, { className: iconVariants({ size: "sm" }) }),
        /* @__PURE__ */ React.createElement("div", null, "Bottom Border")
      ),
      /* @__PURE__ */ React.createElement(
        DropdownMenuCheckboxItem,
        {
          checked: hasTopBorder,
          onCheckedChange: getOnSelectTableBorder("top")
        },
        /* @__PURE__ */ React.createElement(Icons.borderTop, { className: iconVariants({ size: "sm" }) }),
        /* @__PURE__ */ React.createElement("div", null, "Top Border")
      ),
      /* @__PURE__ */ React.createElement(
        DropdownMenuCheckboxItem,
        {
          checked: hasLeftBorder,
          onCheckedChange: getOnSelectTableBorder("left")
        },
        /* @__PURE__ */ React.createElement(Icons.borderLeft, { className: iconVariants({ size: "sm" }) }),
        /* @__PURE__ */ React.createElement("div", null, "Left Border")
      ),
      /* @__PURE__ */ React.createElement(
        DropdownMenuCheckboxItem,
        {
          checked: hasRightBorder,
          onCheckedChange: getOnSelectTableBorder("right")
        },
        /* @__PURE__ */ React.createElement(Icons.borderRight, { className: iconVariants({ size: "sm" }) }),
        /* @__PURE__ */ React.createElement("div", null, "Right Border")
      ),
      /* @__PURE__ */ React.createElement(Separator, null),
      /* @__PURE__ */ React.createElement(
        DropdownMenuCheckboxItem,
        {
          checked: hasNoBorders,
          onCheckedChange: getOnSelectTableBorder("none")
        },
        /* @__PURE__ */ React.createElement(Icons.borderNone, { className: iconVariants({ size: "sm" }) }),
        /* @__PURE__ */ React.createElement("div", null, "No Border")
      ),
      /* @__PURE__ */ React.createElement(
        DropdownMenuCheckboxItem,
        {
          checked: hasOuterBorders,
          onCheckedChange: getOnSelectTableBorder("outer")
        },
        /* @__PURE__ */ React.createElement(Icons.borderAll, { className: iconVariants({ size: "sm" }) }),
        /* @__PURE__ */ React.createElement("div", null, "Outside Borders")
      )
    );
  });
  const TableFloatingToolbar = cn$1.withRef(
    ({ children, ...props }, ref) => {
      const element = plateCommon.useElement();
      const { props: buttonProps } = plateCommon.useRemoveNodeButton({ element });
      const selectionCollapsed = plateCommon.useEditorSelector(
        (editor2) => !plateCommon.isSelectionExpanded(editor2),
        []
      );
      const readOnly = slateReact.useReadOnly();
      const selected = slateReact.useSelected();
      const editor = plateCommon.useEditorRef();
      const collapsed = !readOnly && selected && selectionCollapsed;
      const open2 = !readOnly && selected;
      const { canMerge, canUnmerge } = plateTable.useTableMergeState();
      const mergeContent = canMerge && /* @__PURE__ */ React.createElement(
        Button$2,
        {
          contentEditable: false,
          isMenu: true,
          onClick: () => plateTable.mergeTableCells(editor),
          variant: "ghost"
        },
        /* @__PURE__ */ React.createElement(Icons.combine, { className: "mr-2 size-4" }),
        "Merge"
      );
      const unmergeButton = canUnmerge && /* @__PURE__ */ React.createElement(
        Button$2,
        {
          contentEditable: false,
          isMenu: true,
          onClick: () => plateTable.unmergeTableCells(editor),
          variant: "ghost"
        },
        /* @__PURE__ */ React.createElement(Icons.ungroup, { className: "mr-2 size-4" }),
        "Unmerge"
      );
      const bordersContent = collapsed && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DropdownMenu, { modal: false }, /* @__PURE__ */ React.createElement(DropdownMenuTrigger, { asChild: true }, /* @__PURE__ */ React.createElement(Button$2, { isMenu: true, variant: "ghost" }, /* @__PURE__ */ React.createElement(Icons.borderAll, { className: "mr-2 size-4" }), "Borders")), /* @__PURE__ */ React.createElement(DropdownMenuPortal, null, /* @__PURE__ */ React.createElement(TableBordersDropdownMenuContent, null))), /* @__PURE__ */ React.createElement(Button$2, { contentEditable: false, isMenu: true, variant: "ghost", ...buttonProps }, /* @__PURE__ */ React.createElement(Icons.delete, { className: "mr-2 size-4" }), "Delete"));
      return /* @__PURE__ */ React.createElement(Popover$2, { modal: false, open: open2 }, /* @__PURE__ */ React.createElement(PopoverPrimitive.PopoverAnchor, { asChild: true }, children), (canMerge || canUnmerge || collapsed) && /* @__PURE__ */ React.createElement(
        PopoverContent$1,
        {
          className: cn$1.cn(
            popoverVariants(),
            "flex w-[220px] flex-col gap-1 p-1"
          ),
          onOpenAutoFocus: (e) => e.preventDefault(),
          ref,
          ...props
        },
        unmergeButton,
        mergeContent,
        bordersContent
      ));
    }
  );
  const TableElement = plateCommon.withHOC(
    plateTable.TableProvider,
    cn$1.withRef(({ children, className, ...props }, ref) => {
      const { colSizes, isSelectingCell, marginLeft, minColumnWidth } = plateTable.useTableElementState();
      const { colGroupProps, props: tableProps } = plateTable.useTableElement();
      return /* @__PURE__ */ React.createElement(TableFloatingToolbar, null, /* @__PURE__ */ React.createElement("div", { style: { paddingLeft: marginLeft } }, /* @__PURE__ */ React.createElement(
        plateCommon.PlateElement,
        {
          asChild: true,
          className: cn$1.cn(
            "my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse",
            isSelectingCell && "[&_*::selection]:bg-none",
            className
          ),
          ref,
          ...tableProps,
          ...props
        },
        /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("colgroup", { ...colGroupProps }, colSizes.map((width, index) => /* @__PURE__ */ React.createElement(
          "col",
          {
            key: index,
            style: {
              minWidth: minColumnWidth,
              width: width || void 0
            }
          }
        ))), /* @__PURE__ */ React.createElement("tbody", { className: "min-w-full" }, children))
      )));
    })
  );
  const TableRowElement = cn$1.withRef(({ children, hideBorder, ...props }, ref) => {
    return /* @__PURE__ */ React.createElement(
      plateCommon.PlateElement,
      {
        asChild: true,
        className: cn$1.cn("h-full", hideBorder && "border-none"),
        ref,
        ...props
      },
      /* @__PURE__ */ React.createElement("tr", null, children)
    );
  });
  const blockClasses = "mt-0.5";
  const headerClasses = "font-normal";
  const Components = () => {
    return {
      [plateSlashCommand.ELEMENT_SLASH_INPUT]: SlashInputElement,
      [plate.ELEMENT_H1]: ({ attributes, editor, element, className, ...props }) => /* @__PURE__ */ React.createElement(
        "h1",
        {
          className: classNames$1(
            headerClasses,
            blockClasses,
            className,
            "text-4xl font-medium mb-4 last:mb-0 mt-6 first:mt-0"
          ),
          ...attributes,
          ...props
        }
      ),
      [plate.ELEMENT_H2]: ({ attributes, editor, element, className, ...props }) => /* @__PURE__ */ React.createElement(
        "h2",
        {
          className: classNames$1(
            headerClasses,
            blockClasses,
            className,
            "text-3xl font-medium mb-4 last:mb-0 mt-6 first:mt-0"
          ),
          ...attributes,
          ...props
        }
      ),
      [plate.ELEMENT_H3]: ({ attributes, editor, element, className, ...props }) => /* @__PURE__ */ React.createElement(
        "h3",
        {
          className: classNames$1(
            headerClasses,
            blockClasses,
            className,
            "text-2xl font-semibold mb-4 last:mb-0 mt-6 first:mt-0"
          ),
          ...attributes,
          ...props
        }
      ),
      [plate.ELEMENT_H4]: ({ attributes, editor, element, className, ...props }) => /* @__PURE__ */ React.createElement(
        "h4",
        {
          className: classNames$1(
            headerClasses,
            blockClasses,
            className,
            "text-xl font-bold mb-4 last:mb-0 mt-6 first:mt-0"
          ),
          ...attributes,
          ...props
        }
      ),
      /** Tailwind prose doesn't style h5 and h6 elements */
      [plate.ELEMENT_H5]: ({ attributes, editor, element, className, ...props }) => /* @__PURE__ */ React.createElement(
        "h5",
        {
          className: classNames$1(
            headerClasses,
            blockClasses,
            className,
            "text-lg font-bold mb-4 last:mb-0 mt-6 first:mt-0"
          ),
          ...attributes,
          ...props
        }
      ),
      [plate.ELEMENT_H6]: ({ attributes, editor, element, className, ...props }) => /* @__PURE__ */ React.createElement(
        "h6",
        {
          className: classNames$1(
            headerClasses,
            blockClasses,
            className,
            "text-base font-bold mb-4 last:mb-0 mt-6 first:mt-0"
          ),
          ...attributes,
          ...props
        }
      ),
      [plate.ELEMENT_PARAGRAPH]: ({
        attributes,
        className,
        editor,
        element,
        ...props
      }) => (
        // Descendants in the rich-text editor can be `<div>` elements, so we get a console error for divs in paragraphs
        /* @__PURE__ */ React.createElement(
          "div",
          {
            className: classNames$1(
              blockClasses,
              className,
              "text-base font-normal mb-4 last:mb-0"
            ),
            ...attributes,
            ...props
          }
        )
      ),
      [ELEMENT_MERMAID]: MermaidElement,
      [plate.ELEMENT_BLOCKQUOTE]: BlockquoteElement,
      [plate.ELEMENT_CODE_BLOCK]: CodeBlockElement,
      [plate.ELEMENT_CODE_LINE]: CodeLineElement,
      [plate.ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
      html: ({ attributes, editor, element, children, className }) => {
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            ...attributes,
            className: classNames$1(
              "font-mono text-sm bg-green-100 cursor-not-allowed mb-4",
              className
            )
          },
          children,
          element.value
        );
      },
      html_inline: ({ attributes, editor, element, children, className }) => {
        return /* @__PURE__ */ React.createElement(
          "span",
          {
            ...attributes,
            className: classNames$1(
              "font-mono bg-green-100 cursor-not-allowed",
              className
            )
          },
          children,
          element.value
        );
      },
      [plate.ELEMENT_UL]: cn$1.withProps(ListElement, { variant: "ul" }),
      [plate.ELEMENT_OL]: cn$1.withProps(ListElement, { variant: "ol" }),
      [plate.ELEMENT_LI]: cn$1.withProps(plateCommon.PlateElement, { as: "li" }),
      [plate.ELEMENT_LINK]: ({
        attributes,
        editor,
        element,
        nodeProps,
        className,
        ...props
      }) => /* @__PURE__ */ React.createElement(
        "a",
        {
          className: classNames$1(
            className,
            "text-blue-500 hover:text-blue-600 transition-color ease-out duration-150 underline"
          ),
          ...attributes,
          ...props
        }
      ),
      [plate.MARK_CODE]: CodeLeaf,
      [plate.MARK_UNDERLINE]: cn$1.withProps(plateCommon.PlateLeaf, { as: "u" }),
      [plate.MARK_STRIKETHROUGH]: ({ editor, leaf, text, ...props }) => /* @__PURE__ */ React.createElement("s", { ...props.attributes, ...props }),
      [plate.MARK_ITALIC]: cn$1.withProps(plateCommon.PlateLeaf, { as: "em" }),
      [plate.MARK_BOLD]: ({ editor, leaf, text, ...props }) => /* @__PURE__ */ React.createElement("strong", { ...props.attributes, ...props }),
      [plate.ELEMENT_HR]: ({
        attributes,
        className,
        editor,
        element,
        children,
        ...props
      }) => {
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            className: classNames$1(
              className,
              "cursor-pointer relative border bg-gray-200 my-4 first:mt-0 last:mb-0"
            ),
            ...attributes,
            ...props
          },
          children
        );
      },
      [plate.ELEMENT_TABLE]: TableElement,
      [plate.ELEMENT_TR]: TableRowElement,
      [plate.ELEMENT_TD]: TableCellElement,
      [plate.ELEMENT_TH]: TableCellHeaderElement
    };
  };
  const createCodeBlockPlugin = plateCommon.createPluginFactory({
    key: "code_block",
    isElement: true,
    isVoid: true,
    isInline: false
  });
  const createHTMLBlockPlugin = plateCommon.createPluginFactory({
    key: "html",
    isElement: true,
    isVoid: true,
    isInline: false
  });
  const createHTMLInlinePlugin = plateCommon.createPluginFactory({
    key: "html_inline",
    isElement: true,
    isVoid: true,
    isInline: true
  });
  class Form {
    constructor({
      id,
      label,
      fields,
      actions,
      buttons,
      global,
      reset,
      loadInitialValues,
      onChange,
      queries,
      ...options
    }) {
      this.global = null;
      this.loading = false;
      this.subscribe = (cb, options2) => {
        return this.finalForm.subscribe(cb, options2);
      };
      this.handleSubmit = async (values, form, cb) => {
        var _a;
        try {
          const valOverride = await ((_a = this.beforeSubmit) == null ? void 0 : _a.call(this, values));
          if (valOverride) {
            for (const [key, value] of Object.entries(valOverride)) {
              form.change(key, value);
            }
          }
          const response = await this.onSubmit(valOverride || values, form, cb);
          form.initialize(values);
          return response;
        } catch (error) {
          return { [finalForm.FORM_ERROR]: error };
        }
      };
      this.submit = () => {
        return this.finalForm.submit();
      };
      const initialValues = options.initialValues || {};
      this.__type = options.__type || "form";
      this.id = id;
      this.label = label;
      this.global = global;
      this.fields = fields || [];
      this.onSubmit = options.onSubmit;
      this.queries = queries || [];
      this.crudType = options.crudType || "update";
      this.relativePath = options.relativePath || id;
      this.finalForm = finalForm.createForm({
        ...options,
        initialValues,
        onSubmit: this.handleSubmit,
        mutators: {
          ...arrayMutators,
          setFieldData,
          ...options.mutators
        }
      });
      this._reset = reset;
      this.actions = actions || [];
      this.buttons = buttons || {
        save: "Save",
        reset: "Reset"
      };
      this.updateFields(this.fields);
      if (loadInitialValues) {
        this.loading = true;
        loadInitialValues().then((initialValues2) => {
          this.updateInitialValues(initialValues2);
        }).finally(() => {
          this.loading = false;
        });
      }
      if (onChange) {
        let firstUpdate = true;
        this.subscribe(
          (formState) => {
            if (firstUpdate) {
              firstUpdate = false;
            } else {
              onChange(formState);
            }
          },
          { values: true, ...(options == null ? void 0 : options.extraSubscribeValues) || {} }
        );
      }
    }
    /**
     * A unique identifier for Forms.
     *
     * @deprecated use id instead
     */
    get name() {
      return void 0;
    }
    /**
     * Returns the current values of the form.
     *
     * if the form is still loading it returns `undefined`.
     */
    get values() {
      if (this.loading) {
        return void 0;
      }
      return this.finalForm.getState().values || this.initialValues;
    }
    /**
     * The values the form was initialized with.
     */
    get initialValues() {
      return this.finalForm.getState().initialValues;
    }
    get pristine() {
      return this.finalForm.getState().pristine;
    }
    get dirty() {
      return this.finalForm.getState().dirty;
    }
    get submitting() {
      return this.finalForm.getState().submitting;
    }
    get valid() {
      return this.finalForm.getState().valid;
    }
    /**
     * Resets the values back to the initial values the form was initialized with.
     * Or empties all the values if the form was not initialized.
     */
    async reset() {
      if (this._reset) {
        await this._reset();
      }
      this.finalForm.reset();
    }
    /**
     * @deprecated Unnecessary indirection
     */
    updateFields(fields) {
      this.fields = fields;
    }
    /**
     * Changes the value of the given field.
     *
     * @param name
     * @param value
     */
    change(name, value) {
      return this.finalForm.change(name, value);
    }
    get mutators() {
      return this.finalForm.mutators;
    }
    addQuery(queryId) {
      this.queries = [...this.queries.filter((id) => id !== queryId), queryId];
    }
    removeQuery(queryId) {
      this.queries = this.queries.filter((id) => id !== queryId);
    }
    /**
     * Updates multiple fields in the form.
     *
     * The updates are batched so that it only triggers one `onChange` event.
     *
     * In order to prevent disruptions to the user's editing experience this
     * function will _not_ update the value of any field that is currently
     * being edited.
     *
     * @param values
     */
    updateValues(values) {
      this.finalForm.batch(() => {
        const activePath = this.finalForm.getState().active;
        if (!activePath) {
          updateEverything(this.finalForm, values);
        } else {
          updateSelectively(this.finalForm, values);
        }
      });
    }
    /**
     * Replaces the initialValues of the form without deleting the current values.
     *
     * This function is helpful when the initialValues are loaded asynchronously.
     *
     * @param initialValues
     */
    updateInitialValues(initialValues) {
      this.finalForm.batch(() => {
        const values = this.values || {};
        this.finalForm.initialize(initialValues);
        const activePath = this.finalForm.getState().active;
        if (!activePath) {
          updateEverything(this.finalForm, values);
        } else {
          updateSelectively(this.finalForm, values);
        }
      });
    }
    /**
     * Based on field's name this function will
     * return an array of fields for the give form along
     * with the path that it was found at top nearest
     * object-like group
     *
     * So if you have a field named blocks.3.title
     * It will return the fields from the 3rd "block"
     * along with the path it was found at
     * fields: [{type: 'string', name: 'title'}, ... other fields]
     * activePath: ['blocks', '3']
     */
    getActiveField(fieldName) {
      if (!fieldName) {
        return this;
      }
      const result = this.getFieldGroup({
        formOrObjectField: this,
        values: this.finalForm.getState().values,
        namePathIndex: 0,
        namePath: fieldName.split(".")
      });
      return result;
    }
    getFieldGroup({
      formOrObjectField,
      values = {},
      namePathIndex,
      namePath
    }) {
      const name = namePath[namePathIndex];
      const field = formOrObjectField.fields.find((field2) => field2.name === name);
      const value = values[name];
      const isLastItem = namePathIndex === namePath.length - 1;
      if (!field) {
        return {
          ...formOrObjectField,
          fields: formOrObjectField.fields.map((field2) => {
            return {
              ...field2,
              name: [...namePath, field2.name].join(".")
            };
          })
        };
      } else {
        if (field.type === "object") {
          if (field.templates) {
            if (field.list) {
              if (isLastItem) {
                return formOrObjectField;
              } else {
                const namePathIndexForListItem = namePathIndex + 1;
                const index = namePath[namePathIndexForListItem];
                const listItemValue = value[index];
                const template = field.templates[listItemValue._template];
                const templateName = [
                  ...namePath.slice(0, namePathIndexForListItem),
                  index
                ].join(".");
                const isLastItem2 = namePathIndexForListItem === namePath.length - 1;
                if (!isLastItem2) {
                  return this.getFieldGroup({
                    formOrObjectField: template,
                    values: listItemValue,
                    namePath,
                    namePathIndex: namePathIndex + 2
                  });
                }
                if (!template) {
                  console.error({ field, value });
                  throw new Error(
                    `Expected template value for field ${field.name}`
                  );
                }
                return {
                  ...template,
                  name: templateName,
                  fields: template.fields.map((field2) => {
                    return {
                      ...field2,
                      name: [templateName, field2.name].join(".")
                    };
                  })
                };
              }
            }
          } else {
            if (field.list) {
              const namePathIndexForListItem = namePathIndex + 1;
              const index = namePath[namePathIndexForListItem];
              const listItemValue = value[index];
              const fieldName = [
                ...namePath.slice(0, namePathIndexForListItem),
                index
              ].join(".");
              const isLastItem2 = namePathIndexForListItem === namePath.length - 1;
              if (!isLastItem2) {
                if (field.fields) {
                  return this.getFieldGroup({
                    formOrObjectField: field,
                    values: listItemValue,
                    namePath,
                    namePathIndex: namePathIndex + 2
                  });
                }
              }
              return {
                ...field,
                name: fieldName,
                fields: field.fields.map((field2) => {
                  return {
                    ...field2,
                    name: [fieldName, field2.name].join(".")
                  };
                })
              };
            } else {
              const fieldName = [...namePath.slice(0, namePathIndex + 1)].join(
                "."
              );
              const isLastItem2 = namePathIndex === namePath.length - 1;
              if (!isLastItem2) {
                return this.getFieldGroup({
                  formOrObjectField: field,
                  values: value,
                  namePath,
                  namePathIndex: namePathIndex + 1
                });
              }
              return {
                ...field,
                name: fieldName,
                fields: field.fields.map((field2) => {
                  return {
                    ...field2,
                    name: [fieldName, field2.name].join(".")
                  };
                })
              };
            }
          }
        } else if (field.type === "rich-text") {
          if (isLastItem) {
            return {
              ...formOrObjectField,
              fields: formOrObjectField.fields.map((field2) => {
                return {
                  ...field2,
                  name: [...namePath.slice(0, namePathIndex), field2.name].join(
                    "."
                  )
                };
              })
            };
          } else {
            const childrenIndex = namePath.findIndex(
              (value2) => value2 === "children"
            );
            const propsIndex = namePath.slice(childrenIndex).findIndex((value2) => value2 === "props") + childrenIndex;
            const itemName = namePath.slice(childrenIndex, propsIndex).join(".");
            const item = finalForm.getIn(value, itemName);
            const props = item.props;
            const templateString = item.name;
            const currentPathIndex = namePathIndex + Math.max(propsIndex, 3);
            const isLastItem2 = currentPathIndex + 1 === namePath.length;
            const template = field.templates.find(
              (t) => t.name === templateString
            );
            const templateName = namePath.slice(0, currentPathIndex + 2).join(".");
            if ((item == null ? void 0 : item.type) === "img") {
              const imageName = namePath.slice(0, currentPathIndex + 2).join(".");
              return {
                ...formOrObjectField,
                // name: [formOrObjectField.name, 'img'].join('.'),
                name: [imageName].join("."),
                fields: [
                  {
                    type: "image",
                    // label: 'URL',
                    name: [templateName, "url"].join("."),
                    component: "image"
                  },
                  {
                    type: "string",
                    label: "Alt",
                    name: [templateName.replace(/\.props$/, ""), "alt"].join("."),
                    component: "text"
                  },
                  {
                    type: "string",
                    label: "Caption",
                    name: [templateName.replace(/\.props$/, ""), "caption"].join(
                      "."
                    ),
                    component: "text"
                  }
                ]
              };
            }
            if (!isLastItem2) {
              if (currentPathIndex === namePath.length || propsIndex === 0) {
                return {
                  ...formOrObjectField,
                  name: namePath.slice(0, namePathIndex).join("."),
                  fields: formOrObjectField.fields.map((field2) => {
                    return {
                      ...field2,
                      name: [
                        ...namePath.slice(0, namePathIndex),
                        field2.name
                      ].join(".")
                    };
                  })
                };
              }
              return this.getFieldGroup({
                formOrObjectField: template,
                values: props,
                namePath,
                namePathIndex: namePathIndex + Math.max(4, childrenIndex + propsIndex)
              });
            }
            if (!template) {
              throw new Error(`Expected template value for field ${item.name}`);
            }
            return {
              ...template,
              name: templateName,
              fields: template.fields.map((field2) => {
                return {
                  ...field2,
                  name: [templateName, field2.name].join(".")
                };
              })
            };
          }
        } else {
          const fieldName = [...namePath.slice(0, namePathIndex)].join(".");
          if (!fieldName) {
            return formOrObjectField;
          }
          return {
            ...formOrObjectField,
            name: fieldName,
            fields: formOrObjectField.fields.map((field2) => {
              return {
                ...field2,
                name: [fieldName, field2.name].join(".")
              };
            })
          };
        }
      }
    }
  }
  function updateEverything(form, values) {
    Object.entries(values).forEach(([path, value]) => {
      form.change(path, value);
    });
  }
  function updateSelectively(form, values, prefix) {
    const activePath = form.getState().active;
    Object.entries(values).forEach(([name, value]) => {
      const path = prefix ? `${prefix}.${name}` : name;
      if (typeof value === "object") {
        if (typeof activePath === "string" && activePath.startsWith(path)) {
          updateSelectively(form, value, path);
        } else {
          form.change(path, value);
        }
      } else if (path !== activePath) {
        form.change(path, value);
      }
    });
  }
  function usePlugins(plugins2) {
    const cms = useCMS$1();
    let pluginArray;
    if (Array.isArray(plugins2)) {
      pluginArray = plugins2;
    } else {
      pluginArray = [plugins2];
    }
    React__namespace.useEffect(() => {
      pluginArray.forEach((plugin) => {
        if (plugin) {
          cms.plugins.add(plugin);
        }
      });
      return () => {
        pluginArray.forEach((plugin) => {
          if (plugin) {
            cms.plugins.remove(plugin);
          }
        });
      };
    }, [cms.plugins, ...pluginArray]);
  }
  function useSubscribable(subscribable, cb) {
    const [, s] = React__namespace.useState(0);
    React__namespace.useEffect(() => {
      return subscribable.subscribe(() => {
        s((x) => x + 1);
        if (cb)
          cb();
      });
    });
  }
  function FieldsBuilder({
    form,
    fields,
    activeFieldName,
    padding = false
  }) {
    const cms = useCMS$1();
    const [fieldPlugins, setFieldPlugins] = React__namespace.useState([]);
    const updateFieldPlugins = React__namespace.useCallback(() => {
      const fieldPlugins2 = cms.plugins.getType("field").all();
      setFieldPlugins(fieldPlugins2);
    }, [setFieldPlugins]);
    React__namespace.useEffect(() => updateFieldPlugins(), []);
    useEventSubscription("plugin:add:field", () => updateFieldPlugins(), []);
    return /* @__PURE__ */ React__namespace.createElement(FieldsGroup, { padding }, fields.map((field, index) => {
      return /* @__PURE__ */ React__namespace.createElement(
        InnerField,
        {
          key: field.name,
          field,
          activeFieldName,
          form,
          fieldPlugins,
          index
        }
      );
    }));
  }
  const InnerField = ({ field, form, fieldPlugins, index, activeFieldName }) => {
    React__namespace.useEffect(() => {
      form.mutators.setFieldData(field.name, {
        tinaField: field
      });
    }, [form, field]);
    if (field.component === null)
      return null;
    const plugin = fieldPlugins.find(
      (plugin2) => plugin2.name === field.component
    );
    let type;
    if (plugin && plugin.type) {
      type = plugin.type;
    }
    const parse2 = getProp("parse", field, plugin);
    const validate = getProp("validate", field, plugin);
    let format2 = field.format;
    if (!format2 && plugin && plugin.format) {
      format2 = plugin.format;
    }
    let isActiveField = field.name === activeFieldName;
    if (field.list && field.type === "string") {
      if (activeFieldName) {
        const activeFieldNameArray = activeFieldName.split(".");
        const activeFieldNameWithoutIndex = activeFieldNameArray.slice(0, activeFieldNameArray.length - 1).join(".");
        if (field.name === activeFieldNameWithoutIndex) {
          isActiveField = true;
        }
      }
    }
    return /* @__PURE__ */ React__namespace.createElement(
      reactFinalForm.Field,
      {
        name: field.name,
        key: field.name,
        isEqual: (a, b) => isEqual(field, a, b),
        type,
        parse: parse2 ? (value, name) => parse2(value, name, field) : void 0,
        format: format2 ? (value, name) => format2(value, name, field) : void 0,
        validate: (value, values, meta) => {
          if (validate) {
            return validate(value, values, meta, field);
          }
        }
      },
      (fieldProps) => {
        if (typeof field.component !== "string" && field.component !== null) {
          return /* @__PURE__ */ React__namespace.createElement(
            field.component,
            {
              ...fieldProps,
              form: form.finalForm,
              tinaForm: form,
              field: { ...field, experimental_focusIntent: isActiveField }
            }
          );
        }
        if (plugin) {
          return /* @__PURE__ */ React__namespace.createElement(
            plugin.Component,
            {
              ...fieldProps,
              experimental_focusIntent: isActiveField,
              form: form.finalForm,
              tinaForm: form,
              field: { ...field, experimental_focusIntent: isActiveField },
              index
            }
          );
        }
        return /* @__PURE__ */ React__namespace.createElement("p", null, "Unrecognized field type");
      }
    );
  };
  const FieldsGroup = ({
    padding,
    children
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: `relative block w-full h-full whitespace-nowrap overflow-x-visible ${padding ? `pb-5` : ``}`
      },
      children
    );
  };
  function getProp(name, field, plugin) {
    let prop = field[name];
    if (!prop && plugin && plugin[name]) {
      prop = plugin[name];
    }
    return prop;
  }
  const isEqual = (field, a, b) => {
    const replacer = (key, value) => {
      if (key === "id") {
        return void 0;
      }
      return value;
    };
    if (field.type === "rich-text") {
      return JSON.stringify(a, replacer) === JSON.stringify(b, replacer);
    }
    return a === b;
  };
  const FF = reactFinalForm.Form;
  const FormLegacy = ({ form, children }) => {
    const [i, setI] = React__namespace.useState(0);
    React__namespace.useEffect(() => {
      setI((i2) => i2 + 1);
    }, [form]);
    return /* @__PURE__ */ React__namespace.createElement(FF, { form: form.finalForm, key: `${i}: ${form.id}` }, children);
  };
  const EditingContext = React__namespace.createContext(false);
  function TinaForm({ form, children }) {
    const [isEditing, setIsEditing] = React.useState(false);
    if (!form) {
      return /* @__PURE__ */ React__namespace.createElement(EditingContext.Provider, { value: isEditing }, children({ isEditing, setIsEditing }));
    }
    return /* @__PURE__ */ React__namespace.createElement(EditingContext.Provider, { value: isEditing }, /* @__PURE__ */ React__namespace.createElement(FormLegacy, { form }, () => {
      return children({ isEditing, setIsEditing });
    }));
  }
  function TinaField({
    Component,
    children,
    ...fieldProps
  }) {
    const isEditing = React.useContext(EditingContext);
    if (!isEditing)
      return children || null;
    return /* @__PURE__ */ React__namespace.createElement(reactFinalForm.Field, { ...fieldProps }, ({ input, meta }) => {
      return /* @__PURE__ */ React__namespace.createElement(Component, { input, meta, ...fieldProps });
    });
  }
  TinaField.propTypes = {
    name: PropTypes.string,
    type: PropTypes.string,
    Component: PropTypes.any.isRequired,
    children: PropTypes.any
  };
  const Button$1 = ({
    variant = "secondary",
    as: Tag2 = "button",
    size = "medium",
    busy,
    disabled,
    rounded = "full",
    children,
    className = "",
    ...props
  }) => {
    const baseClasses = "icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out ";
    const variantClasses = {
      primary: `shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 border-0`,
      secondary: `shadow text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-white border border-gray-100`,
      white: `shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-100`,
      ghost: `text-gray-500 hover:text-blue-500 hover:shadow border border-transparent border-0 hover:border hover:border-gray-200 bg-transparent`,
      danger: `shadow text-white bg-red-500 hover:bg-red-600 focus:ring-red-500`
    };
    const state = busy ? `busy` : disabled ? `disabled` : `default`;
    const stateClasses = {
      disabled: `pointer-events-none	opacity-30 cursor-not-allowed`,
      busy: `pointer-events-none opacity-70 cursor-wait`,
      default: ``
    };
    const roundedClasses = {
      full: `rounded-full`,
      left: `rounded-l-full`,
      right: `rounded-r-full`,
      custom: ""
    };
    const sizeClasses = {
      small: `text-xs h-8 px-3`,
      medium: `text-sm h-10 px-8`,
      custom: ``
    };
    return /* @__PURE__ */ React__namespace.createElement(
      Tag2,
      {
        className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses[state]} ${roundedClasses[rounded]} ${className}`,
        ...props
      },
      children
    );
  };
  const IconButton = ({
    variant = "secondary",
    size = "medium",
    busy,
    disabled,
    children,
    className,
    ...props
  }) => {
    const baseClasses = "icon-parent inline-flex items-center border border-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out rounded-full ";
    const variantClasses = {
      primary: `shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500`,
      secondary: `shadow text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-white border border-gray-200`,
      white: `shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-200`,
      ghost: `text-gray-500 hover:text-blue-500 hover:shadow border border-transparent hover:border-gray-200 bg-transparent`
    };
    const state = busy ? `busy` : disabled ? `disabled` : `default`;
    const stateClasses = {
      disabled: `pointer-events-none	opacity-30 cursor-not-allowed`,
      busy: `pointer-events-none opacity-70 cursor-wait`,
      default: ``
    };
    const sizeClasses = {
      small: `h-7 w-7`,
      medium: `h-9 w-9`,
      custom: ``
    };
    return /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses[state]} ${className}`,
        ...props
      },
      children
    );
  };
  function FontLoader() {
    const [fontLoaded, setFontLoaded] = React__namespace.useState(false);
    const WebFontConfig = {
      google: {
        families: ["Inter:400,600"]
      },
      loading: () => {
        setFontLoaded(true);
      }
    };
    React__namespace.useEffect(() => {
      if (!fontLoaded) {
        import("webfontloader").then((WebFont) => {
          return WebFont.load(WebFontConfig);
        });
      }
    }, []);
    return null;
  }
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  const OverflowMenu$1 = ({ toolbarItems: toolbarItems2, className = "w-full" }) => {
    return /* @__PURE__ */ React.createElement(PopoverPrimitive__namespace.Root, null, /* @__PURE__ */ React.createElement(
      PopoverPrimitive__namespace.Trigger,
      {
        className: `cursor-pointer relative justify-center inline-flex items-center p-3 text-sm font-medium focus:outline-1 focus:outline-blue-200 pointer-events-auto ${open ? `text-blue-400` : `text-gray-300 hover:text-blue-500`} ${className}}`
      },
      /* @__PURE__ */ React.createElement(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-5 w-5",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor"
        },
        /* @__PURE__ */ React.createElement(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          }
        )
      )
    ), /* @__PURE__ */ React.createElement(PopoverPrimitive__namespace.Portal, null, /* @__PURE__ */ React.createElement(PopoverPrimitive__namespace.Content, { style: { zIndex: 2e4 }, align: "end" }, /* @__PURE__ */ React.createElement("div", { className: "mt-0 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1" }, toolbarItems2.map((toolbarItem) => {
      return /* @__PURE__ */ React.createElement(
        "span",
        {
          "data-test": `${toolbarItem.name}OverflowButton`,
          key: toolbarItem.name,
          onMouseDown: (event) => {
            event.preventDefault();
            toolbarItem.onMouseDown(event);
          },
          className: classNames(
            toolbarItem.active ? "bg-gray-50 text-blue-500" : "bg-white text-gray-600",
            "hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center whitespace-nowrap"
          )
        },
        /* @__PURE__ */ React.createElement("div", { className: "mr-2 opacity-80" }, toolbarItem.Icon),
        " ",
        toolbarItem.label
      );
    })))));
  };
  var DefaultContext = {
    color: void 0,
    size: void 0,
    className: void 0,
    style: void 0,
    attr: void 0
  };
  var IconContext = React.createContext && /* @__PURE__ */ React.createContext(DefaultContext);
  var _excluded = ["attr", "size", "title"];
  function _objectWithoutProperties(source, excluded) {
    if (source == null)
      return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0)
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key))
          continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null)
      return {};
    var target = {};
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (excluded.indexOf(key) >= 0)
          continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t)
      return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i)
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function Tree2Element(tree) {
    return tree && tree.map((node, i) => /* @__PURE__ */ React.createElement(node.tag, _objectSpread({
      key: i
    }, node.attr), Tree2Element(node.child)));
  }
  function GenIcon(data) {
    return (props) => /* @__PURE__ */ React.createElement(IconBase, _extends({
      attr: _objectSpread({}, data.attr)
    }, props), Tree2Element(data.child));
  }
  function IconBase(props) {
    var elem = (conf) => {
      var {
        attr,
        size,
        title
      } = props, svgProps = _objectWithoutProperties(props, _excluded);
      var computedSize = size || conf.size || "1em";
      var className;
      if (conf.className)
        className = conf.className;
      if (props.className)
        className = (className ? className + " " : "") + props.className;
      return /* @__PURE__ */ React.createElement("svg", _extends({
        stroke: "currentColor",
        fill: "currentColor",
        strokeWidth: "0"
      }, conf.attr, attr, svgProps, {
        className,
        style: _objectSpread(_objectSpread({
          color: props.color || conf.color
        }, conf.style), props.style),
        height: computedSize,
        width: computedSize,
        xmlns: "http://www.w3.org/2000/svg"
      }), title && /* @__PURE__ */ React.createElement("title", null, title), props.children);
    };
    return IconContext !== void 0 ? /* @__PURE__ */ React.createElement(IconContext.Consumer, null, (conf) => elem(conf)) : elem(DefaultContext);
  }
  function BiArrowBack(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M21 11H6.414l5.293-5.293-1.414-1.414L2.586 12l7.707 7.707 1.414-1.414L6.414 13H21z" }, "child": [] }] })(props);
  }
  function BiArrowToBottom(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M6 18h12v2H6zm5-14v8.586L6.707 8.293 5.293 9.707 12 16.414l6.707-6.707-1.414-1.414L13 12.586V4z" }, "child": [] }] })(props);
  }
  function BiCheckCircle(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" }, "child": [] }, { "tag": "path", "attr": { "d": "M9.999 13.587 7.7 11.292l-1.412 1.416 3.713 3.705 6.706-6.706-1.414-1.414z" }, "child": [] }] })(props);
  }
  function BiCheck(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z" }, "child": [] }] })(props);
  }
  function BiChevronDown(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z" }, "child": [] }] })(props);
  }
  function BiCloudUpload(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M13 19v-4h3l-4-5-4 5h3v4z" }, "child": [] }, { "tag": "path", "attr": { "d": "M7 19h2v-2H7c-1.654 0-3-1.346-3-3 0-1.404 1.199-2.756 2.673-3.015l.581-.102.192-.558C8.149 8.274 9.895 7 12 7c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-3v2h3c2.206 0 4-1.794 4-4a4.01 4.01 0 0 0-3.056-3.888C18.507 7.67 15.56 5 12 5 9.244 5 6.85 6.611 5.757 9.15 3.609 9.792 2 11.82 2 14c0 2.757 2.243 5 5 5z" }, "child": [] }] })(props);
  }
  function BiCopyAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z" }, "child": [] }, { "tag": "path", "attr": { "d": "M6 12h6v2H6zm0 4h6v2H6z" }, "child": [] }] })(props);
  }
  function BiCopy(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z" }, "child": [] }] })(props);
  }
  function BiDotsVertical(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M10 10h4v4h-4zm0-6h4v4h-4zm0 12h4v4h-4z" }, "child": [] }] })(props);
  }
  function BiEdit(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z" }, "child": [] }, { "tag": "path", "attr": { "d": "M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z" }, "child": [] }] })(props);
  }
  function BiError(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M11.001 10h2v5h-2zM11 16h2v2h-2z" }, "child": [] }, { "tag": "path", "attr": { "d": "M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19 12 5.137 19.344 19H4.661z" }, "child": [] }] })(props);
  }
  function BiExit(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M19.002 3h-14c-1.103 0-2 .897-2 2v4h2V5h14v14h-14v-4h-2v4c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.898-2-2-2z" }, "child": [] }, { "tag": "path", "attr": { "d": "m11 16 5-4-5-4v3.001H3v2h8z" }, "child": [] }] })(props);
  }
  function BiExpandAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M5 12H3v9h9v-2H5zm7-7h7v7h2V3h-9z" }, "child": [] }] })(props);
  }
  function BiFileBlank(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M19.937 8.68c-.011-.032-.02-.063-.033-.094a.997.997 0 0 0-.196-.293l-6-6a.997.997 0 0 0-.293-.196c-.03-.014-.062-.022-.094-.033a.991.991 0 0 0-.259-.051C13.04 2.011 13.021 2 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-.021-.011-.04-.013-.062a.99.99 0 0 0-.05-.258zM16.586 8H14V5.414L16.586 8zM6 20V4h6v5a1 1 0 0 0 1 1h5l.002 10H6z" }, "child": [] }] })(props);
  }
  function BiFile(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M19.903 8.586a.997.997 0 0 0-.196-.293l-6-6a.997.997 0 0 0-.293-.196c-.03-.014-.062-.022-.094-.033a.991.991 0 0 0-.259-.051C13.04 2.011 13.021 2 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-.021-.011-.04-.013-.062a.952.952 0 0 0-.051-.259c-.01-.032-.019-.063-.033-.093zM16.586 8H14V5.414L16.586 8zM6 20V4h6v5a1 1 0 0 0 1 1h5l.002 10H6z" }, "child": [] }, { "tag": "path", "attr": { "d": "M8 12h8v2H8zm0 4h8v2H8zm0-8h2v2H8z" }, "child": [] }] })(props);
  }
  function BiFolder(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M20 5h-8.586L9.707 3.293A.997.997 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM4 19V7h16l.002 12H4z" }, "child": [] }] })(props);
  }
  function BiGitBranch(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M17.5 4C15.57 4 14 5.57 14 7.5c0 1.554 1.025 2.859 2.43 3.315-.146.932-.547 1.7-1.23 2.323-1.946 1.773-5.527 1.935-7.2 1.907V8.837c1.44-.434 2.5-1.757 2.5-3.337C10.5 3.57 8.93 2 7 2S3.5 3.57 3.5 5.5c0 1.58 1.06 2.903 2.5 3.337v6.326c-1.44.434-2.5 1.757-2.5 3.337C3.5 20.43 5.07 22 7 22s3.5-1.57 3.5-3.5c0-.551-.14-1.065-.367-1.529 2.06-.186 4.657-.757 6.409-2.35 1.097-.997 1.731-2.264 1.904-3.768C19.915 10.438 21 9.1 21 7.5 21 5.57 19.43 4 17.5 4zm-12 1.5C5.5 4.673 6.173 4 7 4s1.5.673 1.5 1.5S7.827 7 7 7s-1.5-.673-1.5-1.5zM7 20c-.827 0-1.5-.673-1.5-1.5a1.5 1.5 0 0 1 1.482-1.498l.13.01A1.495 1.495 0 0 1 7 20zM17.5 9c-.827 0-1.5-.673-1.5-1.5S16.673 6 17.5 6s1.5.673 1.5 1.5S18.327 9 17.5 9z" }, "child": [] }] })(props);
  }
  function BiGitRepoForked(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M5.559 8.855c.166 1.183.789 3.207 3.087 4.079C11 13.829 11 14.534 11 15v.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V15c0-.466 0-1.171 2.354-2.065 2.298-.872 2.921-2.896 3.087-4.079C19.912 8.441 21 7.102 21 5.5 21 3.57 19.43 2 17.5 2S14 3.57 14 5.5c0 1.552 1.022 2.855 2.424 3.313-.146.735-.565 1.791-1.778 2.252-1.192.452-2.053.953-2.646 1.536-.593-.583-1.453-1.084-2.646-1.536-1.213-.461-1.633-1.517-1.778-2.252C8.978 8.355 10 7.052 10 5.5 10 3.57 8.43 2 6.5 2S3 3.57 3 5.5c0 1.602 1.088 2.941 2.559 3.355zM17.5 4c.827 0 1.5.673 1.5 1.5S18.327 7 17.5 7 16 6.327 16 5.5 16.673 4 17.5 4zm-4 14.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5zM6.5 4C7.327 4 8 4.673 8 5.5S7.327 7 6.5 7 5 6.327 5 5.5 5.673 4 6.5 4z" }, "child": [] }] })(props);
  }
  function BiGridAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm5 2h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm1-6h4v4h-4V5zM3 20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6zm2-5h4v4H5v-4zm8 5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6zm2-5h4v4h-4v-4z" }, "child": [] }] })(props);
  }
  function BiHomeAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M5 22h14a2 2 0 0 0 2-2v-9a1 1 0 0 0-.29-.71l-8-8a1 1 0 0 0-1.41 0l-8 8A1 1 0 0 0 3 11v9a2 2 0 0 0 2 2zm5-2v-5h4v5zm-5-8.59 7-7 7 7V20h-3v-5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v5H5z" }, "child": [] }] })(props);
  }
  function BiInfoCircle(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" }, "child": [] }, { "tag": "path", "attr": { "d": "M11 11h2v6h-2zm0-4h2v2h-2z" }, "child": [] }] })(props);
  }
  function BiLeftArrowAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M12.707 17.293 8.414 13H18v-2H8.414l4.293-4.293-1.414-1.414L4.586 12l6.707 6.707z" }, "child": [] }] })(props);
  }
  function BiLinkExternal(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "m13 3 3.293 3.293-7 7 1.414 1.414 7-7L21 11V3z" }, "child": [] }, { "tag": "path", "attr": { "d": "M19 19H5V5h7l-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5l-2-2v7z" }, "child": [] }] })(props);
  }
  function BiListUl(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zm16-8V6H8.023v2H18.8zM8 11h12v2H8zm0 5h12v2H8z" }, "child": [] }] })(props);
  }
  function BiLoaderAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z" }, "child": [] }] })(props);
  }
  function BiLockAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm6 10 .002 8H6v-8h12zm-9-2V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z" }, "child": [] }] })(props);
  }
  function BiLock(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M12 2C9.243 2 7 4.243 7 7v2H6c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v2H9V7zm9.002 13H13v-2.278c.595-.347 1-.985 1-1.722 0-1.103-.897-2-2-2s-2 .897-2 2c0 .736.405 1.375 1 1.722V20H6v-9h12l.002 9z" }, "child": [] }] })(props);
  }
  function BiMenu(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" }, "child": [] }] })(props);
  }
  function BiMovie(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm.001 6c-.001 0-.001 0 0 0h-.466l-2.667-4H20l.001 4zM9.535 9 6.868 5h2.597l2.667 4H9.535zm5 0-2.667-4h2.597l2.667 4h-2.597zM4 5h.465l2.667 4H4V5zm0 14v-8h16l.002 8H4z" }, "child": [] }] })(props);
  }
  function BiPencil(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M4 21a1 1 0 0 0 .24 0l4-1a1 1 0 0 0 .47-.26L21 7.41a2 2 0 0 0 0-2.82L19.42 3a2 2 0 0 0-2.83 0L4.3 15.29a1.06 1.06 0 0 0-.27.47l-1 4A1 1 0 0 0 3.76 21 1 1 0 0 0 4 21zM18 4.41 19.59 6 18 7.59 16.42 6zM5.91 16.51 15 7.41 16.59 9l-9.1 9.1-2.11.52z" }, "child": [] }] })(props);
  }
  function BiPlus(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" }, "child": [] }] })(props);
  }
  function BiRefresh(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z" }, "child": [] }] })(props);
  }
  function BiRename(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M20.005 5.995h-1v2h1v8h-1v2h1c1.103 0 2-.897 2-2v-8c0-1.102-.898-2-2-2zm-14 4H15v4H6.005z" }, "child": [] }, { "tag": "path", "attr": { "d": "M17.005 17.995V4H20V2h-8v2h3.005v1.995h-11c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h11V20H12v2h8v-2h-2.995v-2.005zm-13-2v-8h11v8h-11z" }, "child": [] }] })(props);
  }
  function BiRightArrowAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z" }, "child": [] }] })(props);
  }
  function BiSearch(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" }, "child": [] }] })(props);
  }
  function BiSync(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "m13 7.101.01.001a4.978 4.978 0 0 1 2.526 1.362 5.005 5.005 0 0 1 1.363 2.528 5.061 5.061 0 0 1-.001 2.016 4.976 4.976 0 0 1-1.363 2.527l1.414 1.414a7.014 7.014 0 0 0 1.908-3.54 6.98 6.98 0 0 0 0-2.819 6.957 6.957 0 0 0-1.907-3.539 6.97 6.97 0 0 0-2.223-1.5 6.921 6.921 0 0 0-1.315-.408c-.137-.028-.275-.043-.412-.063V2L9 6l4 4V7.101zm-7.45 7.623c.174.412.392.812.646 1.19.249.37.537.718.854 1.034a7.036 7.036 0 0 0 2.224 1.501c.425.18.868.317 1.315.408.167.034.338.056.508.078v2.944l4-4-4-4v3.03c-.035-.006-.072-.003-.107-.011a4.978 4.978 0 0 1-2.526-1.362 4.994 4.994 0 0 1 .001-7.071L7.051 7.05a7.01 7.01 0 0 0-1.5 2.224A6.974 6.974 0 0 0 5 12a6.997 6.997 0 0 0 .55 2.724z" }, "child": [] }] })(props);
  }
  function BiTrash(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z" }, "child": [] }, { "tag": "path", "attr": { "d": "M9 10h2v8H9zm4 0h2v8h-2z" }, "child": [] }] })(props);
  }
  function BiX(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z" }, "child": [] }] })(props);
  }
  function BsArrowRightShort(props) {
    return GenIcon({ "tag": "svg", "attr": { "fill": "currentColor", "viewBox": "0 0 16 16" }, "child": [{ "tag": "path", "attr": { "fillRule": "evenodd", "d": "M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8" }, "child": [] }] })(props);
  }
  function BsCheckCircleFill(props) {
    return GenIcon({ "tag": "svg", "attr": { "fill": "currentColor", "viewBox": "0 0 16 16" }, "child": [{ "tag": "path", "attr": { "d": "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" }, "child": [] }] })(props);
  }
  function BsExclamationOctagonFill(props) {
    return GenIcon({ "tag": "svg", "attr": { "fill": "currentColor", "viewBox": "0 0 16 16" }, "child": [{ "tag": "path", "attr": { "d": "M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" }, "child": [] }] })(props);
  }
  const MessageIcon = ({
    type = "success",
    className = ""
  }) => {
    const icons = {
      success: BiCheckCircle,
      warning: BiError,
      error: BiError,
      info: BiInfoCircle
    };
    const Icon = icons[type];
    return /* @__PURE__ */ React.createElement(Icon, { className });
  };
  const Message = ({
    children,
    type = "success",
    size = "medium",
    className = "",
    link,
    linkLabel = "Learn More"
  }) => {
    const containerClasses = {
      success: "bg-gradient-to-r from-green-50 to-green-100 border-green-200",
      warning: "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200",
      error: "bg-gradient-to-r from-red-50 to-red-100 border-red-200",
      info: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-100"
    };
    const textClasses = {
      success: "text-green-700",
      warning: "text-yellow-700",
      error: "text-red-700",
      info: "text-blue-700"
    };
    const iconClasses = {
      success: "text-green-400",
      warning: "text-yellow-400",
      error: "text-red-400",
      info: "text-blue-400"
    };
    const sizeClasses = {
      small: "px-3 py-1.5 text-xs",
      medium: "px-4 py-2.5 text-sm"
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `rounded-lg border shadow-sm ${sizeClasses[size]} ${containerClasses[type]} ${className}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
        MessageIcon,
        {
          type,
          className: `${size === "small" ? "w-5" : "w-6"} h-auto flex-shrink-0 ${iconClasses[type]}`
        }
      ), /* @__PURE__ */ React.createElement("div", { className: `flex-1 ${textClasses[type]}` }, children)), link && /* @__PURE__ */ React.createElement(
        "a",
        {
          href: link,
          target: "_blank",
          className: "flex-shrink-0 flex items-center gap-1 text-blue-600 underline decoration-blue-200 hover:text-blue-500 hover:decoration-blue-500 transition-all ease-out duration-150"
        },
        linkLabel,
        " ",
        /* @__PURE__ */ React.createElement(BsArrowRightShort, { className: "w-4 h-auto" })
      ))
    );
  };
  const LoadingDots = ({
    dotSize = 8,
    color = "white"
  }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", null, /* @__PURE__ */ React__namespace.createElement(SingleDot, { dotSize, color }), /* @__PURE__ */ React__namespace.createElement(SingleDot, { dotSize, color, delay: 0.3 }), /* @__PURE__ */ React__namespace.createElement(SingleDot, { dotSize, color, delay: 0.5 }));
  };
  const SingleDot = ({ delay = 0, color, dotSize }) => /* @__PURE__ */ React__namespace.createElement(
    "span",
    {
      className: "inline-block mr-1",
      style: {
        animation: "loading-dots-scale-up-and-down 2s linear infinite",
        animationDelay: `${delay}s`,
        background: color,
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize
      }
    }
  );
  const FormPortalContext = React__namespace.createContext(() => {
    return null;
  });
  function useFormPortal() {
    return React.useContext(FormPortalContext);
  }
  const FormPortalProvider = ({
    children
  }) => {
    const wrapperRef = React__namespace.useRef(null);
    const zIndexRef = React__namespace.useRef(0);
    const FormPortal = React__namespace.useCallback(
      (props) => {
        if (!wrapperRef.current)
          return null;
        return reactDom.createPortal(
          props.children({ zIndexShift: zIndexRef.current += 1 }),
          wrapperRef.current
        );
      },
      [wrapperRef, zIndexRef]
    );
    return /* @__PURE__ */ React__namespace.createElement(FormPortalContext.Provider, { value: FormPortal }, /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        ref: wrapperRef,
        style: {
          position: "relative",
          width: "100%",
          flex: "1 1 0%",
          overflow: "hidden"
        }
      },
      children
    ));
  };
  const ResetForm = ({
    pristine,
    reset,
    children,
    ...props
  }) => {
    const [open2, setOpen] = React__namespace.useState(false);
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        onClick: () => {
          setOpen((p) => !p);
        },
        disabled: pristine,
        ...props
      },
      children
    ), open2 && /* @__PURE__ */ React__namespace.createElement(ResetModal, { reset, close: () => setOpen(false) }));
  };
  const ResetModal = ({ close: close2, reset }) => {
    return /* @__PURE__ */ React__namespace.createElement(Modal, null, /* @__PURE__ */ React__namespace.createElement(ModalPopup, null, /* @__PURE__ */ React__namespace.createElement(ModalHeader, { close: close2 }, "Reset"), /* @__PURE__ */ React__namespace.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React__namespace.createElement("p", null, "Are you sure you want to reset all changes?")), /* @__PURE__ */ React__namespace.createElement(ModalActions, null, /* @__PURE__ */ React__namespace.createElement(Button$1, { style: { flexGrow: 2 }, onClick: close2 }, "Cancel"), /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        style: { flexGrow: 3 },
        variant: "primary",
        onClick: async () => {
          await reset();
          close2();
        }
      },
      "Reset"
    ))));
  };
  const Dismissible = ({
    onDismiss,
    escape,
    click,
    disabled,
    allowClickPropagation,
    document: document2,
    ...props
  }) => {
    const area = useDismissible({
      onDismiss,
      escape,
      click,
      disabled,
      allowClickPropagation,
      document: document2
    });
    return /* @__PURE__ */ React__namespace.createElement("div", { ref: area, ...props });
  };
  function useDismissible({
    onDismiss,
    escape = false,
    click = false,
    disabled = false,
    allowClickPropagation = false,
    document: customDocument
  }) {
    const area = React.useRef();
    React.useEffect(() => {
      const documents = customDocument ? [document, customDocument] : [document];
      const stopAndPrevent = (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
      };
      const handleDocumentClick = (event) => {
        if (disabled)
          return;
        if (!area.current.contains(event.target)) {
          console.log("did not click main content", event.target, area.current);
          if (!allowClickPropagation) {
            stopAndPrevent(event);
          }
          onDismiss(event);
        }
      };
      const handleEscape = (event) => {
        if (disabled)
          return;
        if (event.keyCode === 27) {
          event.stopPropagation();
          onDismiss(event);
        }
      };
      if (click) {
        documents.forEach(
          (document2) => document2.body.addEventListener("click", handleDocumentClick)
        );
      }
      if (escape) {
        documents.forEach(
          (document2) => document2.addEventListener("keydown", handleEscape)
        );
      }
      return () => {
        documents.forEach((document2) => {
          document2.body.removeEventListener("click", handleDocumentClick);
          document2.removeEventListener("keydown", handleEscape);
        });
      };
    }, [click, customDocument, escape, disabled, onDismiss]);
    return area;
  }
  const FormActionMenu = ({ actions, form }) => {
    const [actionMenuVisibility, setActionMenuVisibility] = React.useState(false);
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(MoreActionsButton, { onClick: () => setActionMenuVisibility((p) => !p) }), /* @__PURE__ */ React__namespace.createElement(ActionsOverlay, { open: actionMenuVisibility }, /* @__PURE__ */ React__namespace.createElement(
      Dismissible,
      {
        click: true,
        escape: true,
        disabled: !actionMenuVisibility,
        onDismiss: () => {
          setActionMenuVisibility((p) => !p);
        }
      },
      actions.map((Action, i) => (
        // TODO: `i` will suppress warnings but this indicates that maybe
        //        Actions should just be componets
        /* @__PURE__ */ React__namespace.createElement(Action, { form, key: i })
      ))
    )));
  };
  const MoreActionsButton = ({ className = "", ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "button",
    {
      className: `h-16 w-10 self-stretch bg-transparent bg-center bg-[length:auto_18px] -mr-4 ml-2 outline-none cursor-pointer transition-opacity duration-100 ease-out flex justify-center items-center hover:bg-gray-50 hover:fill-gray-700 ${className}`,
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(EllipsisVerticalIcon, null)
  );
  const ActionsOverlay = ({ open: open2, className = "", style = {}, ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: `min-w-[192px] rounded-3xl border border-solid border-[#efefef] block absolute bottom-5 right-5 ${open2 ? "opacity-100" : "opacity-0"} transition-all duration-100 ease-out origin-bottom-right shadow-[0_2px_3px_rgba(0,0,0,0.05)] bg-white overflow-hidden z-10 ${className}`,
      style: {
        transform: open2 ? "translate3d(0, -28px, 0) scale3d(1, 1, 1)" : "translate3d(0, 0, 0) scale3d(0.5, 0.5, 1)",
        pointerEvents: open2 ? "all" : "none",
        ...style
      },
      ...props
    }
  );
  const ActionButton = ({ className = "", ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "button",
    {
      className: `relative text-center text-[13px] px-3 h-10 font-normal w-full bg-none cursor-pointer outline-none border-0 transition-all duration-[150ms] ease-out hover:text-blue-500 hover:bg-gray50 [&:not(:last-child)]: border-b-[1px] border-solid border-b-[#edecf3] ${className}`,
      ...props
    }
  );
  function IoMdArrowDropdown(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M128 192l128 128 128-128z" }, "child": [] }] })(props);
  }
  function IoMdArrowDropup(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M128 320l128-128 128 128z" }, "child": [] }] })(props);
  }
  function IoMdClose(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z" }, "child": [] }] })(props);
  }
  function IoMdRefresh(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M256 388c-72.597 0-132-59.405-132-132 0-72.601 59.403-132 132-132 36.3 0 69.299 15.4 92.406 39.601L278 234h154V80l-51.698 51.702C348.406 99.798 304.406 80 256 80c-96.797 0-176 79.203-176 176s78.094 176 176 176c81.045 0 148.287-54.134 169.401-128H378.85c-18.745 49.561-67.138 84-122.85 84z" }, "child": [] }] })(props);
  }
  function MdVpnKey(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M12.65 10A5.99 5.99 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 0 0 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" }, "child": [] }] })(props);
  }
  function MdKeyboardArrowDown(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" }, "child": [] }] })(props);
  }
  function MdArrowForward(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0z" }, "child": [] }, { "tag": "path", "attr": { "d": "m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" }, "child": [] }] })(props);
  }
  function MdSyncProblem(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M3 12c0 2.21.91 4.2 2.36 5.64L3 20h6v-6l-2.24 2.24A6.003 6.003 0 0 1 5 12a5.99 5.99 0 0 1 4-5.65V4.26C5.55 5.15 3 8.27 3 12zm8 5h2v-2h-2v2zM21 4h-6v6l2.24-2.24A6.003 6.003 0 0 1 19 12a5.99 5.99 0 0 1-4 5.65v2.09c3.45-.89 6-4.01 6-7.74 0-2.21-.91-4.2-2.36-5.64L21 4zm-10 9h2V7h-2v6z" }, "child": [] }] })(props);
  }
  function MdOutlineHelpOutline(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" }, "child": [] }] })(props);
  }
  function MdOutlineSettings(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.566.566 0 0 0-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" }, "child": [] }] })(props);
  }
  function MdOutlineClear(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" }, "child": [] }] })(props);
  }
  function MdOutlineSaveAlt(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67 2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" }, "child": [] }] })(props);
  }
  function MdOutlineCloud(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11A2.98 2.98 0 0 1 22 15c0 1.65-1.35 3-3 3H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95A5.469 5.469 0 0 1 12 6m0-2C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96A7.49 7.49 0 0 0 12 4z" }, "child": [] }] })(props);
  }
  function MdOutlinePhotoLibrary(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M20 4v12H8V4h12m0-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 9.67 1.69 2.26 2.48-3.1L19 15H9zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" }, "child": [] }] })(props);
  }
  function MdOutlineArrowBackIos(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z", "opacity": ".87" }, "child": [] }, { "tag": "path", "attr": { "d": "M17.51 3.87 15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z" }, "child": [] }] })(props);
  }
  function MdOutlinePerson(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "d": "M0 0h24v24H0V0z" }, "child": [] }, { "tag": "path", "attr": { "d": "M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" }, "child": [] }] })(props);
  }
  const textFieldClasses = "shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md";
  const disabledClasses$1 = "opacity-50 pointer-events-none cursor-not-allowed";
  const BaseTextField = React__namespace.forwardRef(({ className, disabled, ...rest }, ref) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "input",
      {
        ref,
        type: "text",
        className: `${textFieldClasses} ${disabled ? disabledClasses$1 : ""} ${className}`,
        ...rest
      }
    );
  });
  const TextArea = React__namespace.forwardRef(({ ...props }, ref) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "textarea",
      {
        ...props,
        className: "shadow-inner text-base px-3 py-2 text-gray-600 resize-y focus:shadow-outline focus:border-blue-500 block w-full border border-gray-200 focus:text-gray-900 rounded-md",
        ref,
        style: { minHeight: "160px" }
      }
    );
  });
  const { get: getColor, to: toColor } = pkg__namespace;
  var ColorFormat = /* @__PURE__ */ ((ColorFormat2) => {
    ColorFormat2["Hex"] = "hex";
    ColorFormat2["RGB"] = "rgb";
    return ColorFormat2;
  })(ColorFormat || {});
  const rgbToHex = function(color) {
    return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
  };
  function ParseColorStr(color) {
    if (!color) {
      return null;
    }
    const colorDescriptor = getColor(color);
    if (!colorDescriptor)
      return null;
    const colorVals = colorDescriptor.value;
    return { r: colorVals[0], g: colorVals[1], b: colorVals[2], a: colorVals[3] };
  }
  const ColorFormatter = {
    [
      "rgb"
      /* RGB */
    ]: {
      getLabel(color) {
        return `R${color.r} G${color.g} B${color.b}`;
      },
      getValue(color) {
        const colorVals = [color.r, color.g, color.b, color.a];
        return toColor.rgb(colorVals);
      },
      parse: ParseColorStr
    },
    [
      "hex"
      /* Hex */
    ]: {
      getLabel(color) {
        return rgbToHex(color);
      },
      getValue(color) {
        const colorVals = [color.r, color.g, color.b, color.a];
        return toColor.hex(colorVals);
      },
      parse: ParseColorStr
    }
  };
  const { SketchPicker, BlockPicker } = pkg__namespace$1;
  const GetTextColorForBackground = function(backgroundColor) {
    return !backgroundColor || backgroundColor.r * 0.299 + backgroundColor.g * 0.587 + backgroundColor.b * 0.114 > 186 ? "#000000" : "#ffffff";
  };
  const Swatch = ({
    colorRGBA,
    colorFormat,
    unselectable,
    ...props
  }) => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: "bg-gray-100 rounded-3xl shadow-[0_2px_3px_rgba(0,0,0,0.12)] cursor-pointer w-full m-0",
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: "swatch-inner flex items-center justify-center text-[13px] font-bold w-full h-10 rounded-3xl hover:opacity-[.6]",
        style: {
          background: colorRGBA ? `rgba(${colorRGBA.r}, ${colorRGBA.g}, ${colorRGBA.b}, ${colorRGBA.a})` : `#fff`,
          color: GetTextColorForBackground(colorRGBA),
          transition: "all var(--tina-timing-short) ease-out"
        }
      },
      !colorRGBA ? "Click to add color" : ColorFormatter[colorFormat].getLabel(colorRGBA)
    )
  );
  const Popover$1 = ({
    triggerBoundingBox,
    openTop,
    className = "",
    style = {},
    ...props
  }) => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: `fixed z-50 before:content-[""] before:absolute before:left-1/2 before:-translate-x-1/2 before:w-[18px] before:h-[14px] before:bg-gray-200 before:z-10 after:content-[""] after:absolute after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[13px] after:bg-white after:z-20 ${openTop ? "before:bottom-0 before:mt-[1px] before:translate-y-full color-picker-on-top-clip-path after:bottom-0 after:mb-0.5 after:translate-y-full" : "before:top-0 before:mb-[1px] before:-translate-y-full color-picker-clip-path after:top-0 after:mt-0.5 after:-translate-y-full"} ${className}`,
      style: {
        top: triggerBoundingBox ? openTop ? triggerBoundingBox.top : triggerBoundingBox.bottom : 0,
        left: triggerBoundingBox ? triggerBoundingBox.left + triggerBoundingBox.width / 2 : 0,
        transform: openTop ? "translate3d(-50%, calc(-100% - 8px), 0) scale3d(1, 1, 1)" : "translate3d(-50%, 8px, 0) scale3d(1, 1, 1)",
        animation: `${openTop ? "color-popup-open-top-keyframes" : "color-popup-keyframes"} 85ms ease-out both 1`,
        transformOrigin: `50% ${openTop ? "100%" : "0"}`,
        ...style
      },
      ...props
    }
  );
  const nullColor = "transparent";
  const presetColors = [
    "#D0021B",
    "#F5A623",
    "#F8E71C",
    "#8B572A",
    "#7ED321",
    "#417505",
    "#BD10E0",
    "#9013FE",
    "#4A90E2",
    "#50E3C2",
    "#B8E986",
    "#000000",
    "#4A4A4A",
    "#9B9B9B",
    "#FFFFFF"
  ];
  const SketchWidget = (props) => /* @__PURE__ */ React__namespace.createElement(
    SketchPicker,
    {
      presetColors: props.presetColors,
      color: props.color,
      onChange: props.onChange,
      disableAlpha: props.disableAlpha,
      width: props.width
    }
  );
  const BlockWidget = (props) => /* @__PURE__ */ React__namespace.createElement(
    BlockPicker,
    {
      colors: props.presetColors,
      color: props.color,
      onChange: props.onChange,
      width: props.width
    }
  );
  const WIDGETS = { sketch: SketchWidget, block: BlockWidget };
  const ColorPicker = ({
    colorFormat,
    userColors = presetColors,
    widget = "sketch",
    input
  }) => {
    const FormPortal = useFormPortal();
    const triggerRef = React__namespace.useRef(null);
    const [triggerBoundingBox, setTriggerBoundingBox] = React.useState(null);
    const [openTop, setOpenTop] = React.useState(false);
    const updateTriggerBoundingBox = () => {
      if (triggerRef.current) {
        setTriggerBoundingBox(triggerRef.current.getBoundingClientRect());
      }
    };
    React__namespace.useEffect(() => {
      if (triggerBoundingBox) {
        const triggerOffsetTop = triggerBoundingBox.top + triggerBoundingBox.height / 2;
        const windowHeight = window.innerHeight;
        if (triggerOffsetTop > windowHeight / 2) {
          setOpenTop(true);
        } else {
          setOpenTop(false);
        }
      }
    }, [triggerBoundingBox]);
    React__namespace.useEffect(() => {
      const delay = 100;
      let timeout = false;
      setTimeout(() => {
        updateTriggerBoundingBox();
      }, delay);
      const handleResize = () => {
        clearTimeout(timeout);
        timeout = setTimeout(updateTriggerBoundingBox, delay);
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [triggerRef.current]);
    const Widget = WIDGETS[widget];
    if (!Widget)
      throw new Error("You must specify a widget type.");
    const [displayColorPicker, setDisplayColorPicker] = React.useState(false);
    const getColorFormat = (colorFormat || ColorFormat.Hex).toLowerCase();
    const getColorRGBA = input.value ? ColorFormatter[getColorFormat].parse(input.value) : null;
    const handleChange = (pickerColor) => {
      const color = pickerColor.hex === nullColor ? null : { ...pickerColor.rgb, a: 1 };
      input.onChange(
        color ? ColorFormatter[getColorFormat].getValue(color) : null
      );
    };
    const toggleColorPicker = (event) => {
      event.stopPropagation();
      const display = !displayColorPicker;
      setDisplayColorPicker(display);
      if (display) {
        updateTriggerBoundingBox();
      }
    };
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "relative", ref: triggerRef }, /* @__PURE__ */ React__namespace.createElement(
      Swatch,
      {
        onClick: toggleColorPicker,
        colorRGBA: getColorRGBA,
        colorFormat: getColorFormat
      }
    ), displayColorPicker && /* @__PURE__ */ React__namespace.createElement(FormPortal, null, ({ zIndexShift }) => /* @__PURE__ */ React__namespace.createElement(
      Popover$1,
      {
        openTop,
        triggerBoundingBox,
        style: { zIndex: 5e3 + zIndexShift }
      },
      /* @__PURE__ */ React__namespace.createElement(
        Dismissible,
        {
          click: true,
          escape: true,
          disabled: !displayColorPicker,
          onDismiss: toggleColorPicker
        },
        /* @__PURE__ */ React__namespace.createElement(
          Widget,
          {
            presetColors: [...userColors, nullColor],
            color: getColorRGBA || { r: 0, g: 0, b: 0, a: 0 },
            onChange: handleChange,
            disableAlpha: true,
            width: "240px"
          }
        )
      )
    )));
  };
  const Toggle = ({
    input,
    field,
    name,
    disabled = false
  }) => {
    const checked = !!(input.value || input.checked);
    let labels = null;
    if (field.toggleLabels) {
      const fieldLabels = typeof field.toggleLabels === "object" && "true" in field.toggleLabels && "false" in field.toggleLabels && field.toggleLabels;
      labels = {
        true: fieldLabels ? fieldLabels["true"] : "Yes",
        false: fieldLabels ? fieldLabels["false"] : "No"
      };
    }
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex gap-2 items-center" }, labels && /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: `text-sm ${!checked ? "text-blue-500 font-bold" : "text-gray-300"}`
      },
      labels.false
    ), /* @__PURE__ */ React__namespace.createElement("div", { className: "relative w-12 h-7" }, /* @__PURE__ */ React__namespace.createElement(ToggleInput, { id: name, type: "checkbox", ...input }), /* @__PURE__ */ React__namespace.createElement(
      "label",
      {
        className: "bg-none p-0 outline-none w-12 h-7",
        style: {
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? "none" : "inherit"
        },
        htmlFor: name,
        role: "switch"
      },
      /* @__PURE__ */ React__namespace.createElement("div", { className: "relative w-[48px] h-7 rounded-3xl bg-white shadow-inner border border-gray-200 pointer-events-none -ml-0.5" }, /* @__PURE__ */ React__namespace.createElement(
        "span",
        {
          className: `absolute rounded-3xl left-0.5 top-1/2 w-[22px] h-[22px] shadow border transition-all ease-out duration-150 ${checked ? "bg-blue-500 border-blue-600" : "bg-gray-250 border-gray-300"}`,
          style: {
            transform: `translate3d(${checked ? "20px" : "0"}, -50%, 0)`
          }
        }
      ))
    )), labels && /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: `text-sm ${checked ? "text-blue-500 font-bold" : "text-gray-300"}`
      },
      labels.true
    ));
  };
  const ToggleInput = ({ disabled, ...props }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "input",
      {
        className: `absolute left-0 top-0 w-12 h-8 opacity-0 m-0 ${disabled ? `cursor-not-allowed pointer-events-none` : `cursor-pointer z-20`}`,
        ...props
      }
    );
  };
  const selectFieldClasses = "shadow appearance-none bg-white block pl-3 pr-8 py-2 truncate w-full text-base cursor-pointer border border-gray-200 focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
  const Select = ({
    input,
    field,
    options,
    className = ""
  }) => {
    const selectOptions = options || field.options;
    const ref = React__namespace.useRef(null);
    React__namespace.useEffect(() => {
      if (ref.current && (field == null ? void 0 : field.experimental_focusIntent)) {
        ref.current.focus();
      }
    }, [field == null ? void 0 : field.experimental_focusIntent, ref]);
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "relative group w-full md:w-auto" }, /* @__PURE__ */ React__namespace.createElement(
      "select",
      {
        id: input.name,
        ref,
        value: input.value,
        onChange: input.onChange,
        className: `${selectFieldClasses} ${input.value ? "text-gray-700" : "text-gray-300"} } ${className}`,
        ...input
      },
      selectOptions ? selectOptions.map(toProps$1).map(toComponent) : /* @__PURE__ */ React__namespace.createElement("option", null, input.value)
    ), /* @__PURE__ */ React__namespace.createElement(MdKeyboardArrowDown, { className: "absolute top-1/2 right-2 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out pointer-events-none" }));
  };
  function toProps$1(option) {
    if (typeof option === "object")
      return option;
    return { value: option, label: option };
  }
  function toComponent(option) {
    return /* @__PURE__ */ React__namespace.createElement("option", { key: option.value, value: option.value }, option.label);
  }
  const RadioGroup = ({
    input,
    field,
    options
  }) => {
    const radioOptions = options || field.options;
    const radioRefs = {};
    const toProps2 = (option) => {
      if (typeof option === "object")
        return option;
      return { value: option, label: option };
    };
    const toComponent2 = (option) => {
      const optionId = `field-${field.name}-option-${option.value}`;
      const checked = option.value === input.value;
      return /* @__PURE__ */ React__namespace.createElement(
        "div",
        {
          key: option.value,
          ref: (ref) => {
            radioRefs[`radio_${option.value}`] = ref;
          }
        },
        /* @__PURE__ */ React__namespace.createElement(
          "input",
          {
            className: "absolute w-0 h-0 opacity-0 cursor-pointer",
            type: "radio",
            id: optionId,
            name: input.name,
            value: option.value,
            onChange: (event) => {
              input.onChange(event.target.value);
            },
            checked
          }
        ),
        /* @__PURE__ */ React__namespace.createElement(RadioOption, { htmlFor: optionId, checked }, option.label)
      );
    };
    return /* @__PURE__ */ React__namespace.createElement(RadioOptions, { id: input.name, direction: field.direction }, radioOptions ? radioOptions.map(toProps2).map(toComponent2) : input.value);
  };
  const RadioOptions = ({ direction, children, ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: `flex w-full ${direction === "horizontal" ? "flex-wrap gap-y-1 gap-x-3" : "flex-col gap-1"}`,
      ...props
    },
    children
  );
  const RadioOption = ({ checked, htmlFor, children, ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "label",
    {
      className: "cursor-pointer flex group items-center gap-2",
      htmlFor,
      ...props
    },
    /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: `relative h-[19px] w-[19px] rounded-full border text-indigo-600 focus:ring-indigo-500 transition ease-out duration-150 ${checked ? "border-blue-500 bg-blue-500 shadow-sm group-hover:bg-blue-400 group-hover:border-blue-400" : "border-gray-200 bg-white shadow-inner group-hover:bg-gray-100"}`
      },
      /* @__PURE__ */ React__namespace.createElement(
        BiCheck,
        {
          className: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[17px] h-[17px] transition ease-out duration-150 ${checked ? "opacity-100 text-white group-hover:opacity-80" : "text-blue-500 opacity-0 grou-hover:opacity-30"}`
        }
      )
    ),
    /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: `relative transition ease-out duration-150 ${checked ? "text-gray-800 opacity-100" : "text-gray-700 opacity-70 group-hover:opacity-100"}`
      },
      children
    )
  );
  const CheckboxGroup = ({
    input,
    field,
    options,
    disabled = false
  }) => {
    const checkboxOptions = options || field.options;
    const toProps2 = (option) => {
      if (typeof option === "object")
        return option;
      return { value: option, label: option };
    };
    const toComponent2 = (option) => {
      const optionId = `field-${field.name}-option-${option.value}`;
      const checked = input.value ? input.value.includes(option.value) : false;
      return /* @__PURE__ */ React__namespace.createElement("div", { key: option.value }, /* @__PURE__ */ React__namespace.createElement(
        "input",
        {
          className: "absolute w-0 h-0 opacity-0 cursor-pointer",
          type: "checkbox",
          name: input.name,
          id: optionId,
          value: option.value,
          checked,
          disabled,
          onChange: (event) => {
            if (event.target.checked === true) {
              input.onChange([...input.value, event.target.value]);
            } else {
              input.onChange([
                ...input.value.filter((v) => v !== event.target.value)
              ]);
            }
          }
        }
      ), /* @__PURE__ */ React__namespace.createElement(
        "label",
        {
          className: "cursor-pointer flex group items-center gap-2",
          htmlFor: optionId
        },
        /* @__PURE__ */ React__namespace.createElement(
          "span",
          {
            className: `relative h-[18px] w-[18px] rounded border text-indigo-600 focus:ring-indigo-500 transition ease-out duration-150 ${checked ? "border-blue-500 bg-blue-500 shadow-sm group-hover:bg-blue-400 group-hover:border-blue-400" : "border-gray-200 bg-white shadow-inner group-hover:bg-gray-100"}`
          },
          /* @__PURE__ */ React__namespace.createElement(
            BiCheck,
            {
              className: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[17px] h-[17px] transition ease-out duration-150 ${checked ? "opacity-100 text-white group-hover:opacity-80" : "text-blue-500 opacity-0 grou-hover:opacity-30"}`
            }
          )
        ),
        /* @__PURE__ */ React__namespace.createElement(
          "span",
          {
            className: `relative transition ease-out duration-150 ${checked ? "text-gray-800 opacity-100" : "text-gray-700 opacity-70 group-hover:opacity-100"}`
          },
          option.label
        )
      ));
    };
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: `flex w-full ${field.direction === "horizontal" ? "flex-wrap gap-y-1 gap-x-3" : "flex-col gap-1"}`,
        id: input.name
      },
      checkboxOptions == null ? void 0 : checkboxOptions.map(toProps2).map(toComponent2)
    );
  };
  const Input = ({ ...props }) => {
    return /* @__PURE__ */ React.createElement("input", { className: textFieldClasses, ...props });
  };
  const NumberInput = ({
    onChange,
    value,
    step
  }) => /* @__PURE__ */ React__namespace.createElement(
    Input,
    {
      type: "number",
      step,
      value,
      onChange: (event) => {
        const inputValue = event.target.value;
        const newValue = inputValue === "" ? void 0 : inputValue;
        if (onChange) {
          const syntheticEvent = {
            ...event,
            target: {
              ...event.target,
              value: newValue
            }
          };
          onChange(syntheticEvent);
        }
      }
    }
  );
  function useCMS() {
    return useCMS$1();
  }
  const supportedFileTypes = [
    "text/*",
    "application/pdf",
    "application/octet-stream",
    "application/json",
    "application/ld+json",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/postscript",
    "model/fbx",
    "model/gltf+json",
    "model/ply",
    "model/u3d+mesh",
    "model/vnd.usdz+zip",
    "application/x-indesign",
    "application/vnd.apple.mpegurl",
    "application/dash+xml",
    "application/mxf",
    "image/*",
    "video/*"
  ];
  const DEFAULT_MEDIA_UPLOAD_TYPES = supportedFileTypes.join(",");
  const dropzoneAcceptFromString = (str) => {
    return Object.assign(
      {},
      ...(str || DEFAULT_MEDIA_UPLOAD_TYPES).split(",").map((x) => ({ [x]: [] }))
    );
  };
  const isImage = (filename) => {
    return /\.(gif|jpg|jpeg|tiff|png|svg|webp|avif)(\?.*)?$/i.test(filename);
  };
  const isVideo = (filename) => {
    return /\.(mp4|webm|ogg|m4v|mov|avi|flv|mkv)(\?.*)?$/i.test(filename);
  };
  const absoluteImgURL = (str) => {
    if (str.startsWith("http"))
      return str;
    return `${window.location.origin}${str}`;
  };
  const { useDropzone: useDropzone$1 } = dropzone__namespace;
  const StyledImage = ({ src }) => {
    const isSvg = /\.svg$/.test(src);
    return /* @__PURE__ */ React__namespace.createElement(
      "img",
      {
        src,
        className: `block max-w-full rounded shadow overflow-hidden max-h-48 lg:max-h-64 h-auto object-contain transition-opacity duration-100 ease-out m-0 bg-gray-200 bg-auto bg-center bg-no-repeat ${isSvg ? "min-w-[12rem]" : ""}`
      }
    );
  };
  const StyledFile = ({ src }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "max-w-full w-full flex-1 flex justify-start items-center gap-3" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "w-12 h-12 bg-white shadow border border-gray-100 rounded flex justify-center flex-none" }, /* @__PURE__ */ React__namespace.createElement(BiFileBlank, { className: "w-3/5 h-full fill-gray-300" })), /* @__PURE__ */ React__namespace.createElement("span", { className: "text-base text-left flex-1 text-gray-500 w-full break-words truncate" }, src));
  };
  const ImageUpload = React__namespace.forwardRef(({ onDrop, onClear, onClick, value, src, loading }, ref) => {
    const cms = useCMS();
    const { getRootProps, getInputProps } = useDropzone$1({
      accept: dropzoneAcceptFromString(
        cms.media.accept || DEFAULT_MEDIA_UPLOAD_TYPES
      ),
      onDrop,
      noClick: !!onClick
    });
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full max-w-full", ...getRootProps() }, /* @__PURE__ */ React__namespace.createElement("input", { ...getInputProps() }), value ? loading ? /* @__PURE__ */ React__namespace.createElement(ImageLoadingIndicator, null) : /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: `relative w-full max-w-full flex justify-start ${isImage(src) ? `items-start gap-3` : `items-center gap-2`}`
      },
      /* @__PURE__ */ React__namespace.createElement(
        "button",
        {
          className: "flex-shrink min-w-0 focus-within:shadow-outline focus-within:border-blue-500 rounded outline-none overflow-visible cursor-pointer border-none hover:opacity-60 transition ease-out duration-100",
          onClick,
          ref
        },
        isImage(src) ? /* @__PURE__ */ React__namespace.createElement(StyledImage, { src }) : /* @__PURE__ */ React__namespace.createElement(StyledFile, { src })
      ),
      onClear && /* @__PURE__ */ React__namespace.createElement(
        DeleteImageButton,
        {
          onClick: (e) => {
            e.stopPropagation();
            onClear();
          }
        }
      )
    ) : /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: "outline-none relative hover:opacity-60 w-full",
        onClick
      },
      loading ? /* @__PURE__ */ React__namespace.createElement(ImageLoadingIndicator, null) : /* @__PURE__ */ React__namespace.createElement("div", { className: "text-center rounded-[5px] bg-gray-100 text-gray-300 leading-[1.35] py-3 text-[15px] font-normal transition-all ease-out duration-100 hover:opacity-60" }, "Drag 'n' drop a file here,", /* @__PURE__ */ React__namespace.createElement("br", null), "or click to select a file")
    ));
  });
  const DeleteImageButton = ({
    onClick
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(IconButton, { variant: "white", className: "flex-none", onClick }, /* @__PURE__ */ React__namespace.createElement(TrashIcon, { className: "w-7 h-auto" }));
  };
  const ImageLoadingIndicator = () => /* @__PURE__ */ React__namespace.createElement("div", { className: "p-4 w-full min-h-[96px] flex flex-col justify-center items-center" }, /* @__PURE__ */ React__namespace.createElement(LoadingDots, null));
  function cn(...inputs) {
    return tailwindMerge.twMerge(clsx.clsx(inputs));
  }
  const buttonVariants = classVarianceAuthority.cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      variants: {
        variant: {
          outline: "border border-gray-200 bg-white hover:bg-white hover:text-accent-foreground"
        },
        size: {
          default: "h-10 px-4 py-2",
          sm: "h-9 rounded-md px-3",
          lg: "h-11 rounded-md px-8",
          icon: "h-10 w-10"
        }
      },
      defaultVariants: {
        variant: "outline",
        size: "default"
      }
    }
  );
  const Button = React__namespace.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
      const Comp = asChild ? reactSlot.Slot : "button";
      return /* @__PURE__ */ React__namespace.createElement(
        Comp,
        {
          className: cn(buttonVariants({ variant, size, className })),
          ref,
          ...props
        }
      );
    }
  );
  Button.displayName = "Button";
  const Command = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React__namespace.createElement(
    cmdk.Command,
    {
      ref,
      className: cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-popover-foreground",
        className
      ),
      ...props
    }
  ));
  Command.displayName = cmdk.Command.displayName;
  const CommandInput = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React__namespace.createElement("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "" }, /* @__PURE__ */ React__namespace.createElement(lucideReact.Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ React__namespace.createElement(
    cmdk.Command.Input,
    {
      ref,
      className: cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )));
  CommandInput.displayName = cmdk.Command.Input.displayName;
  const CommandList = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React__namespace.createElement(
    cmdk.Command.List,
    {
      ref,
      className: cn("overflow-x-hidden", className),
      ...props
    }
  ));
  CommandList.displayName = cmdk.Command.List.displayName;
  const CommandEmpty = React__namespace.forwardRef((props, ref) => /* @__PURE__ */ React__namespace.createElement(
    cmdk.Command.Empty,
    {
      ref,
      className: "py-6 text-center text-sm",
      ...props
    }
  ));
  CommandEmpty.displayName = cmdk.Command.Empty.displayName;
  const CommandGroup = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React__namespace.createElement(
    cmdk.Command.Group,
    {
      ref,
      className: cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className
      ),
      ...props
    }
  ));
  CommandGroup.displayName = cmdk.Command.Group.displayName;
  const CommandItem = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React__namespace.createElement(
    cmdk.Command.Item,
    {
      ref,
      className: cn(
        "hover:bg-slate-100	relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
        className
      ),
      ...props
    }
  ));
  CommandItem.displayName = cmdk.Command.Item.displayName;
  const OptionComponent = ({
    id,
    value,
    field,
    _values,
    node,
    onSelect
  }) => {
    return /* @__PURE__ */ React.createElement(
      CommandItem,
      {
        key: `${id}-option`,
        value: id,
        onSelect: (currentValue) => {
          onSelect(currentValue === value ? "" : currentValue);
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex flex-col w-full" }, (field == null ? void 0 : field.optionComponent) && _values ? field.optionComponent(_values, node._internalSys) : /* @__PURE__ */ React.createElement("span", { className: "text-x" }, id))
    );
  };
  const Popover = PopoverPrimitive__namespace.Root;
  const PopoverTrigger = PopoverPrimitive__namespace.Trigger;
  const PopoverContent = React__namespace.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ React__namespace.createElement(PopoverPrimitive__namespace.Portal, null, /* @__PURE__ */ React__namespace.createElement(
    PopoverPrimitive__namespace.Content,
    {
      ref,
      style: { zIndex: 9999 },
      align,
      sideOffset,
      side: "bottom",
      className: cn(
        "rounded-md border bg-white p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "max-h-[30vh] max-w-[30vw] overflow-y-auto",
        className
      ),
      ...props
    }
  )));
  PopoverContent.displayName = PopoverPrimitive__namespace.Content.displayName;
  const filterQueryBuilder = (fieldFilterConfig, collection) => {
    return {
      [collection]: Object.entries(fieldFilterConfig).reduce(
        (acc, [key, value]) => {
          acc[key] = { in: value };
          return acc;
        },
        {}
      )
    };
  };
  const useGetOptionSets = (cms, collections, collectionFilter) => {
    const [optionSets, setOptionSets] = React__namespace.useState([]);
    const [loading, setLoading] = React__namespace.useState(true);
    React__namespace.useEffect(() => {
      const fetchOptionSets = async () => {
        const filters = typeof collectionFilter === "function" ? collectionFilter() : collectionFilter;
        const optionSets2 = await Promise.all(
          collections.map(async (collection) => {
            try {
              const filter = (filters == null ? void 0 : filters[collection]) ? filterQueryBuilder(filters[collection], collection) : {};
              const response = await cms.api.tina.request(
                `#graphql
            query ($collection: String!, $filter: DocumentFilter) {
              collection(collection: $collection) {
                documents(first: -1, filter: $filter) {
                  edges {
                    node {
                      ...on Node {
                        id,
                      }
                      ...on Document {
                        _values
                        _internalSys: _sys {
                          filename
                          path
                        }
                      }
                    }
                  }
                }
              }
            }
            `,
                {
                  variables: {
                    collection,
                    filter
                  }
                }
              );
              return {
                collection,
                edges: response.collection.documents.edges
              };
            } catch (e) {
              console.error(
                "Exception thrown while building and running GraphQL query: ",
                e
              );
              return {
                collection,
                edges: []
              };
            }
          })
        );
        setOptionSets(optionSets2);
        setLoading(false);
      };
      if (cms && collections.length > 0) {
        fetchOptionSets();
      } else {
        setOptionSets([]);
      }
    }, [cms, collections]);
    return { optionSets, loading };
  };
  const getFilename = (optionSets, value) => {
    const nodes = optionSets.flatMap(
      (optionSet) => optionSet.edges.map((edge) => edge.node)
    );
    const node = nodes.find((node2) => node2.id === value);
    return node ? node._internalSys.filename : null;
  };
  const Combobox = ({ cms, input, field }) => {
    const [open2, setOpen] = React__namespace.useState(false);
    const [value, setValue] = React__namespace.useState(input.value);
    const [displayText, setDisplayText] = React__namespace.useState(null);
    const { optionSets, loading } = useGetOptionSets(
      cms,
      field.collections,
      field.collectionFilter
    );
    const [filteredOptionsList, setFilteredOptionsList] = React__namespace.useState(optionSets);
    React__namespace.useEffect(() => {
      setDisplayText(getFilename(optionSets, value));
      input.onChange(value);
    }, [value, input, optionSets]);
    React__namespace.useEffect(() => {
      if (field.experimental___filter && optionSets.length > 0) {
        setFilteredOptionsList(
          field.experimental___filter(optionSets, void 0)
        );
      } else {
        setFilteredOptionsList(optionSets);
      }
    }, [optionSets, field.experimental___filter]);
    if (loading === true) {
      return /* @__PURE__ */ React__namespace.createElement(LoadingDots, { color: "var(--tina-color-primary)" });
    }
    return /* @__PURE__ */ React__namespace.createElement(Popover, { open: open2, onOpenChange: setOpen }, /* @__PURE__ */ React__namespace.createElement(PopoverTrigger, { asChild: true }, /* @__PURE__ */ React__namespace.createElement(
      Button,
      {
        variant: "outline",
        role: "combobox",
        "aria-expanded": open2,
        className: "w-full justify-between"
      },
      /* @__PURE__ */ React__namespace.createElement("p", { className: "truncate" }, displayText ?? "Choose an option..."),
      open2 ? /* @__PURE__ */ React__namespace.createElement(IoMdArrowDropup, { size: 20 }) : /* @__PURE__ */ React__namespace.createElement(IoMdArrowDropdown, { size: 20 })
    )), /* @__PURE__ */ React__namespace.createElement(PopoverContent, { className: "p-0 relative min-w-[var(--radix-popover-trigger-width)]" }, /* @__PURE__ */ React__namespace.createElement(
      Command,
      {
        shouldFilter: !field.experimental___filter,
        filter: (value2, search) => {
          if (value2.toLowerCase().includes(search.toLowerCase()))
            return 1;
          return 0;
        }
      },
      /* @__PURE__ */ React__namespace.createElement(
        CommandInput,
        {
          placeholder: "Search reference...",
          onValueChange: (search) => {
            if (field.experimental___filter) {
              setFilteredOptionsList(
                field.experimental___filter(optionSets, search)
              );
            }
          }
        }
      ),
      /* @__PURE__ */ React__namespace.createElement(CommandEmpty, null, "No reference found"),
      /* @__PURE__ */ React__namespace.createElement(CommandList, null, filteredOptionsList.length > 0 && (filteredOptionsList == null ? void 0 : filteredOptionsList.map(({ collection, edges }) => /* @__PURE__ */ React__namespace.createElement(CommandGroup, { key: `${collection}-group`, heading: collection }, /* @__PURE__ */ React__namespace.createElement(CommandList, null, edges == null ? void 0 : edges.map(({ node }) => {
        const { id, _values } = node;
        return /* @__PURE__ */ React__namespace.createElement(
          OptionComponent,
          {
            id,
            key: id,
            value,
            field,
            _values,
            node,
            onSelect: (currentValue) => {
              setValue(currentValue);
              setOpen(false);
            }
          }
        );
      }))))))
    )));
  };
  const useGetNode = (cms, id) => {
    const [document2, setDocument] = React__namespace.useState(
      void 0
    );
    React__namespace.useEffect(() => {
      const fetchNode = async () => {
        const response = await cms.api.tina.request(
          `#graphql
        query($id: String!) {
          node(id:$id) {
            ... on Document {
              _sys {
                collection {
                  name
                }
                breadcrumbs
              }
            }
          }
        }`,
          { variables: { id } }
        );
        setDocument(response.node);
      };
      if (cms && id) {
        fetchNode();
      } else {
        setDocument(void 0);
      }
    }, [cms, id]);
    return document2;
  };
  const GetReference = ({ cms, id, children }) => {
    const document2 = useGetNode(cms, id);
    if (!document2) {
      return null;
    }
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, children(document2));
  };
  const ReferenceLink = ({ cms, input }) => {
    const hasTinaAdmin = cms.flags.get("tina-admin") === false ? false : true;
    const tinaPreview = cms.flags.get("tina-preview") || false;
    if (!hasTinaAdmin) {
      return null;
    }
    return /* @__PURE__ */ React__namespace.createElement(GetReference, { cms, id: input.value }, (document2) => cms.state.editingMode === "visual" ? /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          cms.dispatch({
            type: "forms:set-active-form-id",
            value: input.value
          });
        },
        className: "text-gray-700 hover:text-blue-500 flex items-center uppercase text-sm mt-2 mb-2 leading-none"
      },
      /* @__PURE__ */ React__namespace.createElement(BiEdit, { className: "h-5 w-auto opacity-80 mr-2" }),
      "Edit"
    ) : /* @__PURE__ */ React__namespace.createElement(
      "a",
      {
        href: `${tinaPreview ? `/${tinaPreview}/index.html#` : "/admin#"}/collections/${document2._sys.collection.name}/${document2._sys.breadcrumbs.join("/")}`,
        className: "text-gray-700 hover:text-blue-500 inline-flex items-center uppercase text-sm mt-2 mb-2 leading-none"
      },
      /* @__PURE__ */ React__namespace.createElement(BiEdit, { className: "h-5 w-auto opacity-80 mr-2" }),
      "Edit in CMS"
    ));
  };
  const Reference = ({ input, field }) => {
    const cms = useCMS();
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("div", { className: "relative group" }, /* @__PURE__ */ React__namespace.createElement(Combobox, { cms, input, field })), /* @__PURE__ */ React__namespace.createElement(ReferenceLink, { cms, input }));
  };
  const ButtonToggle = ({
    input,
    field,
    options
  }) => {
    const toggleOptions = options || field.options;
    const direction = field.direction || "horizontal";
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("input", { type: "text", id: input.name, className: "hidden", ...input }), /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: `flex ${direction === "horizontal" ? "divide-x" : "flex-col divide-y"} divide-gray-150 shadow-inner bg-gray-50 border border-gray-200 w-full justify-between rounded-md`
      },
      toggleOptions ? toggleOptions.map((toggleOption) => {
        const option = toProps(toggleOption);
        if (option.icon) {
          return /* @__PURE__ */ React__namespace.createElement(
            ButtonOption,
            {
              key: option.value,
              input,
              value: option.value,
              icon: option.icon
            }
          );
        } else {
          return /* @__PURE__ */ React__namespace.createElement(
            ButtonOption,
            {
              key: option.value,
              input,
              value: option.value,
              label: option.label
            }
          );
        }
      }) : input.value
    ));
  };
  const ButtonOption = ({
    input,
    value,
    label = "",
    icon,
    ...props
  }) => {
    const Icon = icon;
    return /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: `relative whitespace-nowrap flex items-center justify-center flex-1 block font-medium text-base px-3 py-2 text-gray-400 transition-all ease-out duration-150`,
        onClick: () => {
          input.onChange(value);
        },
        ...props
      },
      Icon ? /* @__PURE__ */ React__namespace.createElement(Icon, { className: "w-6 h-auto opacity-70" }) : /* @__PURE__ */ React__namespace.createElement("span", { className: "flex-1 truncate max-w-full w-0" }, label),
      /* @__PURE__ */ React__namespace.createElement(
        "span",
        {
          className: `absolute whitespace-nowrap px-3 py-2 z-20 font-medium text-base flex items-center justify-center -top-0.5 -right-0.5 -bottom-0.5 -left-0.5 truncate bg-white border border-gray-200 origin-center rounded-md shadow text-blue-500 transition-all ease-out duration-150 ${input.value === value ? "opacity-100" : "opacity-0"}`
        },
        Icon ? /* @__PURE__ */ React__namespace.createElement(Icon, { className: "w-6 h-auto opacity-70" }) : /* @__PURE__ */ React__namespace.createElement("span", { className: "flex-1 truncate max-w-full w-0" }, label)
      )
    );
  };
  function toProps(option) {
    if (typeof option === "object")
      return option;
    return { value: option, label: option };
  }
  const passwordFieldClasses = "shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md";
  const disabledClasses = "opacity-50 pointer-events-none cursor-not-allowed";
  const errorClasses = "border-red-500 focus:border-red-500 focus:shadow-outline-red";
  const BasePasswordField = React__namespace.forwardRef(({ className, disabled, error, ...rest }, ref) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "input",
      {
        ref,
        type: "password",
        className: `${passwordFieldClasses} ${disabled ? disabledClasses : ""} ${className} ${error ? errorClasses : ""}`,
        ...rest
      }
    );
  });
  const ListFieldMeta = ({
    name,
    label,
    description,
    error,
    margin = true,
    children,
    actions,
    index,
    tinaForm,
    triggerHoverEvents,
    ...props
  }) => {
    const { dispatch: setHoveredField } = useEvent("field:hover");
    const { dispatch: setFocusedField } = useEvent("field:focus");
    const hoverEvents = {};
    if (triggerHoverEvents) {
      hoverEvents["onMouseOver"] = () => setHoveredField({ id: tinaForm.id, fieldName: name });
      hoverEvents["onMouseOut"] = () => setHoveredField({ id: null, fieldName: null });
    }
    return /* @__PURE__ */ React__namespace.createElement(
      FieldWrapper,
      {
        margin,
        ...hoverEvents,
        onClick: () => setFocusedField({ id: tinaForm.id, fieldName: name }),
        style: { zIndex: index ? 1e3 - index : void 0 },
        ...props
      },
      /* @__PURE__ */ React__namespace.createElement(ListHeader, null, /* @__PURE__ */ React__namespace.createElement(ListMeta, null, label !== false && /* @__PURE__ */ React__namespace.createElement(ListLabel, null, label || name), description && /* @__PURE__ */ React__namespace.createElement(FieldDescription, { className: "whitespace-nowrap text-ellipsis overflow-hidden" }, description)), actions && actions),
      children,
      error && typeof error === "string" && /* @__PURE__ */ React__namespace.createElement(FieldError, null, error)
    );
  };
  const ListHeader = ({ children }) => {
    return /* @__PURE__ */ React__namespace.createElement("span", { className: "relative flex gap-2 w-full justify-between items-center mb-2" }, children);
  };
  const ListMeta = ({ children }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex-1 truncate" }, children);
  };
  const ListLabel = ({ children }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: `m-0 text-xs font-semibold flex-1 text-ellipsis overflow-hidden transition-all ease-out duration-100 text-left`
      },
      children
    );
  };
  const ListPanel = ({ className = "", ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: `max-h-[initial] relative h-auto rounded-md shadow bg-gray-100 ${className}`,
      ...props
    }
  );
  const EmptyList = ({ message = "There are no items" }) => /* @__PURE__ */ React__namespace.createElement("div", { className: "text-center bg-gray-100 text-gray-300 leading-[1.35] py-3 text-[15px] font-normal" }, message);
  const Group$1 = ({ tinaForm, form, field, input, meta, index }) => {
    const addItem = React.useCallback(() => {
      let obj = {};
      if (typeof field.defaultItem === "function") {
        obj = field.defaultItem();
      } else {
        obj = field.defaultItem || {};
      }
      form.mutators.insert(field.name, 0, obj);
    }, [form, field]);
    const items2 = input.value || [];
    const itemProps = React.useCallback(
      (item) => {
        if (!field.itemProps)
          return {};
        return field.itemProps(item);
      },
      [field.itemProps]
    );
    const isMax = items2.length >= (field.max || Number.POSITIVE_INFINITY);
    const isMin = items2.length <= (field.min || 0);
    const fixedLength = field.min === field.max;
    return /* @__PURE__ */ React.createElement(
      ListFieldMeta,
      {
        name: input.name,
        label: field.label,
        description: field.description,
        error: meta.error,
        index,
        triggerHoverEvents: false,
        tinaForm,
        actions: (!fixedLength || fixedLength && !isMax) && /* @__PURE__ */ React.createElement(
          IconButton,
          {
            onClick: addItem,
            disabled: isMax,
            variant: "primary",
            size: "small"
          },
          /* @__PURE__ */ React.createElement(AddIcon, { className: "w-5/6 h-auto" })
        )
      },
      /* @__PURE__ */ React.createElement(ListPanel, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(reactBeautifulDnd.Droppable, { droppableId: field.name, type: field.name }, (provider) => /* @__PURE__ */ React.createElement("div", { ref: provider.innerRef }, items2.length === 0 && /* @__PURE__ */ React.createElement(EmptyList, null), items2.map((item, index2) => /* @__PURE__ */ React.createElement(
        Item$2,
        {
          key: index2,
          tinaForm,
          field,
          item,
          index: index2,
          isMin,
          fixedLength,
          ...itemProps(item)
        }
      )), provider.placeholder))))
    );
  };
  const Item$2 = ({
    tinaForm,
    field,
    index,
    item,
    label,
    isMin,
    fixedLength,
    ...p
  }) => {
    const cms = useCMS$1();
    const removeItem = React.useCallback(() => {
      tinaForm.mutators.remove(field.name, index);
    }, [tinaForm, field, index]);
    const title = label || `${field.label || field.name} Item`;
    const { dispatch: setHoveredField } = useEvent("field:hover");
    const { dispatch: setFocusedField } = useEvent("field:focus");
    return /* @__PURE__ */ React.createElement(reactBeautifulDnd.Draggable, { draggableId: `${field.name}.${index}`, index }, (provider, snapshot) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      ItemHeader,
      {
        provider,
        isDragging: snapshot.isDragging,
        ...p
      },
      /* @__PURE__ */ React.createElement(DragHandle, { isDragging: snapshot.isDragging }),
      /* @__PURE__ */ React.createElement(
        ItemClickTarget,
        {
          onMouseOver: () => setHoveredField({
            id: tinaForm.id,
            fieldName: `${field.name}.${index}`
          }),
          onMouseOut: () => setHoveredField({ id: null, fieldName: null }),
          onClick: () => {
            const state = tinaForm.finalForm.getState();
            if (state.invalid === true) {
              cms.alerts.error(
                "Cannot navigate away from an invalid form."
              );
              return;
            }
            cms.dispatch({
              type: "forms:set-active-field-name",
              value: {
                formId: tinaForm.id,
                fieldName: `${field.name}.${index}`
              }
            });
            setFocusedField({
              id: tinaForm.id,
              fieldName: `${field.name}.${index}`
            });
          }
        },
        /* @__PURE__ */ React.createElement(GroupLabel, null, title),
        /* @__PURE__ */ React.createElement(BiPencil, { className: "h-5 w-auto fill-current text-gray-200 group-hover:text-inherit transition-colors duration-150 ease-out" })
      ),
      (!fixedLength || fixedLength && !isMin) && /* @__PURE__ */ React.createElement(ItemDeleteButton, { disabled: isMin, onClick: removeItem })
    )));
  };
  const ItemClickTarget = ({ children, ...props }) => {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "group text-gray-400 hover:text-blue-600 flex-1 min-w-0 relative flex justify-between items-center p-2",
        ...props
      },
      children
    );
  };
  const GroupLabel = ({
    error,
    children
  }) => {
    return /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `m-0 text-xs font-semibold flex-1 text-ellipsis overflow-hidden transition-all ease-out duration-100 text-left ${error ? "text-red-500" : "text-gray-600 group-hover:text-inherit"}`
      },
      children
    );
  };
  const ItemHeader = ({
    isDragging,
    children,
    provider,
    ...props
  }) => {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: provider.innerRef,
        ...provider.draggableProps,
        ...provider.dragHandleProps,
        ...props,
        className: `relative group cursor-pointer flex justify-between items-stretch bg-white border border-gray-100 -mb-px overflow-visible p-0 text-sm font-normal ${isDragging ? "rounded shadow text-blue-600" : "text-gray-600 first:rounded-t last:rounded-b"} ${props.className ?? ""}`,
        style: {
          ...provider.draggableProps.style ?? {},
          ...provider.dragHandleProps.style ?? {},
          ...props.style ?? {}
        }
      },
      children
    );
  };
  const ItemDeleteButton = ({ onClick, disabled = false }) => {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: `w-8 px-1 py-2.5 flex items-center justify-center text-gray-200 hover:opacity-100 opacity-30 hover:bg-gray-50 ${disabled && "pointer-events-none opacity-30 cursor-not-allowed"}`,
        onClick
      },
      /* @__PURE__ */ React.createElement(TrashIcon, { className: "h-5 w-auto fill-current text-red-500 transition-colors duration-150 ease-out" })
    );
  };
  const DragHandle = ({ isDragging }) => {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `relative w-8 px-1 py-2.5 flex items-center justify-center hover:bg-gray-50 group cursor-[grab] ${isDragging ? `text-blue-500` : `text-gray-200 hover:text-gray-600`}`
      },
      isDragging ? /* @__PURE__ */ React.createElement(ReorderIcon, { className: "fill-current w-7 h-auto" }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DragIcon, { className: "fill-current w-7 h-auto group-hover:opacity-0 transition-opacity duration-150 ease-out" }), /* @__PURE__ */ React.createElement(ReorderIcon, { className: "fill-current w-7 h-auto absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out" }))
    );
  };
  const GroupListField = Group$1;
  const GroupListFieldPlugin = {
    name: "group-list",
    Component: GroupListField
  };
  const BlockSelector = ({
    templates,
    addItem
  }) => {
    const showFilter = React__namespace.useMemo(() => {
      return Object.entries(templates).length > 6;
    }, [templates]);
    const [filter, setFilter] = React__namespace.useState("");
    const filteredBlocks = React__namespace.useMemo(() => {
      return Object.entries(templates).filter(([name, template]) => {
        return template.label ? template.label.toLowerCase().includes(filter.toLowerCase()) || name.toLowerCase().includes(filter.toLowerCase()) : name.toLowerCase().includes(filter.toLowerCase());
      });
    }, [filter]);
    return /* @__PURE__ */ React__namespace.createElement(react.Popover, null, ({ open: open2 }) => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(react.PopoverButton, { as: "span" }, /* @__PURE__ */ React__namespace.createElement(
      IconButton,
      {
        variant: open2 ? "secondary" : "primary",
        size: "small",
        className: `${open2 ? `rotate-45 pointer-events-none` : ``}`
      },
      /* @__PURE__ */ React__namespace.createElement(AddIcon, { className: "w-5/6 h-auto" })
    )), /* @__PURE__ */ React__namespace.createElement("div", { className: "transform translate-y-full absolute -bottom-1 right-0 z-50" }, /* @__PURE__ */ React__namespace.createElement(
      react.Transition,
      {
        enter: "transition duration-150 ease-out",
        enterFrom: "transform opacity-0 -translate-y-2",
        enterTo: "transform opacity-100 translate-y-0",
        leave: "transition duration-75 ease-in",
        leaveFrom: "transform opacity-100 translate-y-0",
        leaveTo: "transform opacity-0 -translate-y-2"
      },
      /* @__PURE__ */ React__namespace.createElement(react.PopoverPanel, { className: "relative overflow-hidden rounded-lg shadow-lg bg-white border border-gray-100" }, ({ close: close2 }) => /* @__PURE__ */ React__namespace.createElement("div", { className: "min-w-[192px] max-h-[24rem] overflow-y-auto flex flex-col w-full h-full" }, showFilter && /* @__PURE__ */ React__namespace.createElement("div", { className: "sticky top-0 bg-gray-50 p-2 border-b border-gray-100 z-10" }, /* @__PURE__ */ React__namespace.createElement(
        "input",
        {
          type: "text",
          className: "bg-white text-xs rounded-sm border border-gray-100 shadow-inner py-1 px-2 w-full block placeholder-gray-200",
          onClick: (event) => {
            event.stopPropagation();
            event.preventDefault();
          },
          value: filter,
          onChange: (event) => {
            setFilter(event.target.value);
          },
          placeholder: "Filter..."
        }
      )), filteredBlocks.length === 0 && /* @__PURE__ */ React__namespace.createElement("span", { className: "relative text-center text-xs px-2 py-3 text-gray-300 bg-gray-50 italic" }, "No matches found"), filteredBlocks.length > 0 && filteredBlocks.map(([name, template]) => /* @__PURE__ */ React__namespace.createElement(
        "button",
        {
          className: "relative text-center text-xs py-2 px-4 border-l-0 border-t-0 border-r-0 border-b border-gray-50 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50",
          key: name,
          onClick: () => {
            addItem(name, template);
            setFilter("");
            close2();
          }
        },
        template.label ? template.label : name
      ))))
    ))));
  };
  const Group = wrapFieldWithNoHeader(
    ({ tinaForm, field }) => {
      const cms = useCMS$1();
      return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(
        Header,
        {
          onClick: () => {
            const state = tinaForm.finalForm.getState();
            if (state.invalid === true) {
              cms.alerts.error("Cannot navigate away from an invalid form.");
              return;
            }
            cms.dispatch({
              type: "forms:set-active-field-name",
              value: { formId: tinaForm.id, fieldName: field.name }
            });
          }
        },
        field.label || field.name,
        field.description && /* @__PURE__ */ React__namespace.createElement(
          "span",
          {
            className: `block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal m-0`,
            dangerouslySetInnerHTML: { __html: field.description }
          }
        )
      ));
    }
  );
  const Header = ({ onClick, children }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "pt-1 mb-5" }, /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        onClick,
        className: "group px-4 py-3 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-blue-500 w-full border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-blue-400 focus:text-blue-500 rounded-md flex justify-between items-center gap-2"
      },
      /* @__PURE__ */ React__namespace.createElement("span", { className: "text-left text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1" }, children),
      " ",
      /* @__PURE__ */ React__namespace.createElement(BiPencil, { className: "h-6 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90" })
    ));
  };
  const PanelHeader$1 = ({ onClick, children }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: `relative z-40 group text-left w-full bg-white hover:bg-gray-50 py-2 border-t border-b shadow-sm
       border-gray-100 px-6 -mt-px`,
        onClick,
        tabIndex: -1
      },
      /* @__PURE__ */ React__namespace.createElement("div", { className: "flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto" }, children, /* @__PURE__ */ React__namespace.createElement(IoMdClose, { className: "h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5" }))
    );
  };
  const PanelBody = ({ id, children }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        style: {
          flex: "1 1 0%",
          width: "100%",
          overflowY: "auto",
          background: "var(--tina-color-grey-1)"
        }
      },
      /* @__PURE__ */ React__namespace.createElement(FormWrapper, { id }, children)
    );
  };
  const GroupPanel = ({
    isExpanded,
    className = "",
    style = {},
    ...props
  }) => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: `absolute w-full top-0 bottom-0 left-0 flex flex-col justify-between overflow-hidden z-10 ${className}`,
      style: {
        pointerEvents: isExpanded ? "all" : "none",
        ...isExpanded ? {
          animationName: "fly-in-left",
          animationDuration: "150ms",
          animationDelay: "0",
          animationIterationCount: 1,
          animationTimingFunction: "ease-out",
          animationFillMode: "backwards"
        } : {
          transition: "transform 150ms ease-out",
          transform: "translate3d(100%, 0, 0)"
        },
        ...style
      },
      ...props
    }
  );
  function GroupField(props) {
    return /* @__PURE__ */ React__namespace.createElement("div", null, "Subfield: ", props.field.label || props.field.name);
  }
  const GroupFieldPlugin = {
    name: "group",
    Component: Group
  };
  const BlockSelectorBig = ({
    templates,
    addItem,
    label
  }) => {
    const FormPortal = useFormPortal();
    const [pickerIsOpen, setPickerIsOpen] = React__namespace.useState(false);
    const showFilter = React__namespace.useMemo(() => {
      return Object.entries(templates).length > 6;
    }, [templates]);
    const [filter, setFilter] = React__namespace.useState("");
    const filteredTemplates = React__namespace.useMemo(() => {
      return Object.entries(templates).filter(([name, template]) => {
        return template.label ? template.label.toLowerCase().includes(filter.toLowerCase()) || name.toLowerCase().includes(filter.toLowerCase()) : name.toLowerCase().includes(filter.toLowerCase());
      });
    }, [filter]);
    const categories = React__namespace.useMemo(() => {
      return [
        //@ts-ignore
        ...new Set(
          Object.entries(templates).filter(([name, template]) => {
            return template.category ? template.category : false;
          }).map(([name, template]) => {
            return template.category;
          })
        )
      ];
    }, [templates]);
    const hasUncategorized = React__namespace.useMemo(() => {
      return Object.entries(templates).filter(([name, template]) => {
        return !template.category;
      }).length > 0;
    }, [templates]);
    const uncategorized = React__namespace.useMemo(() => {
      return filteredTemplates.filter(([name, template]) => {
        return !template.category;
      });
    }, [filteredTemplates]);
    const close2 = (name, template) => {
      if (name && template) {
        addItem(name, template);
      }
      setFilter("");
      setPickerIsOpen(false);
    };
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(
      IconButton,
      {
        variant: pickerIsOpen ? "secondary" : "primary",
        size: "small",
        className: `${pickerIsOpen ? "rotate-45 pointer-events-none" : ""}`,
        onClick: () => setPickerIsOpen(!pickerIsOpen)
      },
      /* @__PURE__ */ React__namespace.createElement(AddIcon, { className: "w-5/6 h-auto" })
    ), /* @__PURE__ */ React__namespace.createElement(FormPortal, null, ({ zIndexShift }) => /* @__PURE__ */ React__namespace.createElement(react.Transition, { show: pickerIsOpen }, /* @__PURE__ */ React__namespace.createElement(
      react.TransitionChild,
      {
        enter: "transform transition-all ease-out duration-200",
        enterFrom: "opacity-0 -translate-x-1/2",
        enterTo: "opacity-100 translate-x-0",
        leave: "transform transition-all ease-in duration-150",
        leaveFrom: "opacity-100 translate-x-0",
        leaveTo: "opacity-0 -translate-x-1/2"
      },
      /* @__PURE__ */ React__namespace.createElement(
        "div",
        {
          className: "absolute left-0 top-0 z-panel h-full w-full transform bg-gray-50",
          style: { zIndex: zIndexShift + 1e3 }
        },
        /* @__PURE__ */ React__namespace.createElement(
          PanelHeader$1,
          {
            onClick: () => {
              setPickerIsOpen(false);
            }
          },
          label,
          " ⁠– Add New"
        ),
        /* @__PURE__ */ React__namespace.createElement("div", { className: "h-full overflow-y-auto max-h-full bg-gray-50 pt-4 px-6 pb-12" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full flex justify-center" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full max-w-form" }, showFilter && /* @__PURE__ */ React__namespace.createElement("div", { className: "block relative group mb-1" }, /* @__PURE__ */ React__namespace.createElement(
          "input",
          {
            type: "text",
            className: "shadow-inner focus:shadow-outline focus:border-blue-400 focus:outline-none block text-sm pl-2.5 pr-8 py-1.5 text-gray-600 w-full bg-white border border-gray-200 focus:text-gray-900 rounded-md placeholder-gray-400 hover:placeholder-gray-600 transition-all ease-out duration-150",
            onClick: (event) => {
              event.stopPropagation();
              event.preventDefault();
            },
            value: filter,
            onChange: (event) => {
              setFilter(event.target.value);
            },
            placeholder: "Search"
          }
        ), filter === "" ? /* @__PURE__ */ React__namespace.createElement(BiSearch, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150" }) : /* @__PURE__ */ React__namespace.createElement(
          "button",
          {
            onClick: () => {
              setFilter("");
            },
            className: "outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"
          },
          /* @__PURE__ */ React__namespace.createElement(MdOutlineClear, { className: "w-5 h-auto text-gray-600" })
        )), uncategorized.length === 0 && categories.length === 0 && /* @__PURE__ */ React__namespace.createElement(EmptyState, null, "No blocks to display."), uncategorized.length > 0 && categories.length === 0 && /* @__PURE__ */ React__namespace.createElement(CardColumns, { className: "pt-3" }, uncategorized.map(([name, template]) => /* @__PURE__ */ React__namespace.createElement(
          BlockCard,
          {
            key: `${template}-${name}`,
            close: close2,
            name,
            template
          }
        ))), categories.map((category, index) => {
          return /* @__PURE__ */ React__namespace.createElement(
            BlockGroup,
            {
              key: index,
              templates: filteredTemplates.filter(
                ([name, template]) => {
                  return template.category && //@ts-ignore
                  template.category === category ? true : false;
                }
              ),
              category,
              isLast: index === categories.length - 1 && !hasUncategorized,
              close: close2
            }
          );
        }), hasUncategorized && uncategorized.length === 0 && /* @__PURE__ */ React__namespace.createElement("div", { className: "relative text-gray-500 block text-left w-full text-base font-bold tracking-wide py-2 truncate pointer-events-none opacity-50" }, "Uncategorized"), uncategorized.length > 0 && categories.length > 0 && /* @__PURE__ */ React__namespace.createElement(
          BlockGroup,
          {
            templates: uncategorized,
            category: "Uncategorized",
            close: close2,
            isLast: true
          }
        ))))
      )
    ))));
  };
  const BlockGroup = ({ category, templates, close: close2, isLast = false }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      react.Disclosure,
      {
        defaultOpen: true,
        as: "div",
        className: `left-0 right-0 relative`
      },
      ({ open: open2 }) => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(
        react.DisclosureButton,
        {
          className: `relative block group text-left w-full text-base font-bold tracking-wide py-2 truncate ${templates.length === 0 ? `pointer-events-none` : ``} ${!isLast && (!open2 || templates.length === 0) && `border-b border-gray-100`}`
        },
        /* @__PURE__ */ React__namespace.createElement(
          "span",
          {
            className: `text-gray-500 group-hover:text-gray-800 transition-all ease-out duration-150 ${templates.length === 0 ? `opacity-50` : ``}`
          },
          category
        ),
        templates.length > 0 && /* @__PURE__ */ React__namespace.createElement(
          MdKeyboardArrowDown,
          {
            className: `absolute top-1/2 right-0 w-6 h-auto -translate-y-1/2 text-gray-300 origin-center group-hover:text-blue-500 transition-all duration-150 ease-out ${open2 ? `` : `-rotate-90 opacity-70 group-hover:opacity-100`}`
          }
        )
      ), /* @__PURE__ */ React__namespace.createElement(
        react.Transition,
        {
          enter: "transition duration-100 ease-out",
          enterFrom: "transform scale-95 opacity-0",
          enterTo: "transform scale-100 opacity-100",
          leave: "transition duration-75 ease-out",
          leaveFrom: "transform scale-100 opacity-100",
          leaveTo: "transform scale-95 opacity-0"
        },
        /* @__PURE__ */ React__namespace.createElement(react.DisclosurePanel, null, templates.length > 0 && /* @__PURE__ */ React__namespace.createElement(CardColumns, null, templates.map(([name, template], index) => /* @__PURE__ */ React__namespace.createElement(
          BlockCard,
          {
            key: index,
            close: close2,
            name,
            template
          }
        ))))
      ))
    );
  };
  const CardColumns = ({ children, className = "" }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: `w-full mb-1 -mt-2 ${className}`,
        style: { columns: "320px", columnGap: "16px" }
      },
      children
    );
  };
  const BlockCard = ({ close: close2, name, template }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: "mb-2 mt-2 group relative text-xs font-bold border border-gray-100 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50 rounded-md bg-white shadow overflow-hidden",
        style: { breakInside: "avoid", transform: "translateZ(0)" },
        key: name,
        onClick: () => {
          close2(name, template);
        }
      },
      template.previewSrc && /* @__PURE__ */ React__namespace.createElement(
        "img",
        {
          src: template.previewSrc,
          className: "w-full h-auto transition-all ease-out duration-150 group-hover:opacity-50"
        }
      ),
      /* @__PURE__ */ React__namespace.createElement(
        "span",
        {
          className: `relative flex justify-between items-center gap-4 w-full px-4 text-left ${template.previewSrc ? `py-2 border-t border-gray-100 ` : `py-3`}`
        },
        template.label ? template.label : name,
        /* @__PURE__ */ React__namespace.createElement(AddIcon, { className: "w-5 h-auto group-hover:text-blue-500 opacity-30 transition-all ease-out duration-150 group-hover:opacity-80" })
      )
    );
  };
  const EmptyState = ({ children }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "block relative text-gray-300 italic py-1" }, children);
  };
  const Blocks = ({
    tinaForm,
    form,
    field,
    input,
    meta,
    index
  }) => {
    const addItem = React__namespace.useCallback(
      (name, template) => {
        let obj = {};
        if (typeof template.defaultItem === "function") {
          obj = template.defaultItem();
        } else {
          obj = template.defaultItem || {};
        }
        obj._template = name;
        form.mutators.push(field.name, obj);
      },
      [field.name, form.mutators]
    );
    const items2 = input.value || [];
    const isMax = items2.length >= (field.max || Infinity);
    const isMin = items2.length <= (field.min || 0);
    const fixedLength = field.min === field.max;
    return /* @__PURE__ */ React__namespace.createElement(
      ListFieldMeta,
      {
        name: input.name,
        label: field.label,
        description: field.description,
        error: meta.error,
        triggerHoverEvents: false,
        index,
        tinaForm,
        actions: (!fixedLength || fixedLength && !isMax) && // @ts-ignore
        (!field.visualSelector ? /* @__PURE__ */ React__namespace.createElement(BlockSelector, { templates: field.templates, addItem }) : /* @__PURE__ */ React__namespace.createElement(
          BlockSelectorBig,
          {
            label: field.label || field.name,
            templates: field.templates,
            addItem
          }
        ))
      },
      /* @__PURE__ */ React__namespace.createElement(ListPanel, null, /* @__PURE__ */ React__namespace.createElement(reactBeautifulDnd.Droppable, { droppableId: field.name, type: field.name }, (provider) => /* @__PURE__ */ React__namespace.createElement("div", { ref: provider.innerRef, className: "edit-page--list-parent" }, items2.length === 0 && /* @__PURE__ */ React__namespace.createElement(EmptyList, null), items2.map((block, index2) => {
        const template = field.templates[block._template];
        if (!template) {
          return /* @__PURE__ */ React__namespace.createElement(
            InvalidBlockListItem,
            {
              key: index2,
              index: index2,
              field,
              tinaForm
            }
          );
        }
        const itemProps = (item) => {
          if (!template.itemProps)
            return {};
          return template.itemProps(item);
        };
        return /* @__PURE__ */ React__namespace.createElement(
          BlockListItem,
          {
            key: index2,
            block,
            template,
            index: index2,
            field,
            tinaForm,
            isMin,
            fixedLength,
            ...itemProps(block)
          }
        );
      }), provider.placeholder)))
    );
  };
  const BlockListItem = ({
    label,
    tinaForm,
    field,
    index,
    template,
    isMin,
    fixedLength
  }) => {
    const cms = useCMS$1();
    const removeItem = React__namespace.useCallback(() => {
      tinaForm.mutators.remove(field.name, index);
    }, [tinaForm, field, index]);
    const { dispatch: setHoveredField } = useEvent("field:hover");
    const { dispatch: setFocusedField } = useEvent("field:focus");
    return /* @__PURE__ */ React__namespace.createElement(reactBeautifulDnd.Draggable, { key: index, draggableId: `${field.name}.${index}`, index }, (provider, snapshot) => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(ItemHeader, { provider, isDragging: snapshot.isDragging }, /* @__PURE__ */ React__namespace.createElement(DragHandle, { isDragging: snapshot.isDragging }), /* @__PURE__ */ React__namespace.createElement(
      ItemClickTarget,
      {
        onClick: () => {
          const state = tinaForm.finalForm.getState();
          if (state.invalid === true) {
            cms.alerts.error(
              "Cannot navigate away from an invalid form."
            );
            return;
          }
          cms.dispatch({
            type: "forms:set-active-field-name",
            value: {
              formId: tinaForm.id,
              fieldName: `${field.name}.${index}`
            }
          });
          setFocusedField({
            id: tinaForm.id,
            fieldName: `${field.name}.${index}`
          });
        },
        onMouseOver: () => setHoveredField({
          id: tinaForm.id,
          fieldName: `${field.name}.${index}`
        }),
        onMouseOut: () => setHoveredField({ id: null, fieldName: null })
      },
      /* @__PURE__ */ React__namespace.createElement(GroupLabel, null, label || template.label),
      /* @__PURE__ */ React__namespace.createElement(BiPencil, { className: "h-5 w-auto fill-current text-gray-200 group-hover:text-inherit transition-colors duration-150 ease-out" })
    ), (!fixedLength || fixedLength && !isMin) && /* @__PURE__ */ React__namespace.createElement(ItemDeleteButton, { disabled: isMin, onClick: removeItem }))));
  };
  const InvalidBlockListItem = ({
    tinaForm,
    field,
    index
  }) => {
    const removeItem = React__namespace.useCallback(() => {
      tinaForm.mutators.remove(field.name, index);
    }, [tinaForm, field, index]);
    return /* @__PURE__ */ React__namespace.createElement(reactBeautifulDnd.Draggable, { key: index, draggableId: `${field.name}.${index}`, index }, (provider, snapshot) => /* @__PURE__ */ React__namespace.createElement(ItemHeader, { provider, isDragging: snapshot.isDragging }, /* @__PURE__ */ React__namespace.createElement(DragHandle, { isDragging: snapshot.isDragging }), /* @__PURE__ */ React__namespace.createElement(ItemClickTarget, null, /* @__PURE__ */ React__namespace.createElement(GroupLabel, { error: true }, "Invalid Block")), /* @__PURE__ */ React__namespace.createElement(ItemDeleteButton, { onClick: removeItem })));
  };
  const BlocksField = Blocks;
  const BlocksFieldPlugin = {
    name: "blocks",
    Component: BlocksField
  };
  const parse$2 = (value) => value || "";
  const ColorField = wrapFieldsWithMeta(
    ({ input, field }) => {
      return /* @__PURE__ */ React__namespace.createElement(
        ColorPicker,
        {
          colorFormat: field.colorFormat,
          userColors: field.colors,
          widget: field.widget,
          input
        }
      );
    }
  );
  const ColorFieldPlugin = {
    name: "color",
    Component: ColorField,
    parse: parse$2,
    validate(value, values, meta, field) {
      if (field.required && !value)
        return "Required";
    }
  };
  const List = ({ tinaForm, form, field, input, meta, index }) => {
    const addItem = React__namespace.useCallback(() => {
      let newItem = "";
      if (typeof field.defaultItem === "function") {
        newItem = field.defaultItem();
      } else if (typeof field.defaultItem !== "undefined") {
        newItem = field.defaultItem;
      }
      form.mutators.insert(field.name, 0, newItem);
    }, [form, field]);
    const items2 = input.value || [];
    const itemProps = React__namespace.useCallback(
      (item) => {
        if (!field.itemProps)
          return {};
        return field.itemProps(item);
      },
      [field.itemProps]
    );
    const isMax = items2.length >= (field.max || Infinity);
    const isMin = items2.length <= (field.min || 0);
    const fixedLength = field.min === field.max;
    return /* @__PURE__ */ React__namespace.createElement(
      ListFieldMeta,
      {
        name: input.name,
        label: field.label,
        description: field.description,
        error: meta.error,
        index,
        tinaForm,
        actions: (!fixedLength || fixedLength && !isMax) && /* @__PURE__ */ React__namespace.createElement(IconButton, { onClick: addItem, variant: "primary", size: "small" }, /* @__PURE__ */ React__namespace.createElement(AddIcon, { className: "w-5/6 h-auto" }))
      },
      /* @__PURE__ */ React__namespace.createElement(ListPanel, null, /* @__PURE__ */ React__namespace.createElement("div", null, /* @__PURE__ */ React__namespace.createElement(reactBeautifulDnd.Droppable, { droppableId: field.name, type: field.name }, (provider) => /* @__PURE__ */ React__namespace.createElement("div", { ref: provider.innerRef }, items2.length === 0 && /* @__PURE__ */ React__namespace.createElement(EmptyList, null), items2.map((item, index2) => /* @__PURE__ */ React__namespace.createElement(
        Item$1,
        {
          key: index2,
          tinaForm,
          field,
          item,
          index: index2,
          isMin,
          fixedLength,
          ...itemProps(item)
        }
      )), provider.placeholder))))
    );
  };
  const Item$1 = ({
    tinaForm,
    field,
    index,
    item,
    label,
    isMin,
    fixedLength,
    ...p
  }) => {
    const removeItem = React__namespace.useCallback(() => {
      tinaForm.mutators.remove(field.name, index);
    }, [tinaForm, field, index]);
    const fields = [
      {
        type: field.type,
        list: field.list,
        parentTypename: field.parentTypename,
        ...field.field,
        label: false,
        name: `${field.name}.${index}`
      }
    ];
    return /* @__PURE__ */ React__namespace.createElement(reactBeautifulDnd.Draggable, { draggableId: `${field.name}.${index}`, index }, (provider, snapshot) => /* @__PURE__ */ React__namespace.createElement(ItemHeader, { provider, isDragging: snapshot.isDragging, ...p }, /* @__PURE__ */ React__namespace.createElement(DragHandle, { isDragging: snapshot.isDragging }), /* @__PURE__ */ React__namespace.createElement(ItemClickTarget, null, /* @__PURE__ */ React__namespace.createElement(FieldsBuilder, { padding: false, form: tinaForm, fields })), (!fixedLength || fixedLength && !isMin) && /* @__PURE__ */ React__namespace.createElement(ItemDeleteButton, { disabled: isMin, onClick: removeItem })));
  };
  const ListField = List;
  const ListFieldPlugin = {
    name: "list",
    Component: ListField,
    validate(value, values, meta, field) {
      if (field.required && !value)
        return "Required";
    }
  };
  const ImageField = wrapFieldsWithMeta(
    (props) => {
      const ref = React__namespace.useRef(null);
      const cms = useCMS$1();
      const { value } = props.input;
      const src = value;
      const [isImgUploading, setIsImgUploading] = React.useState(false);
      let onClear;
      if (props.field.clearable) {
        onClear = () => props.input.onChange("");
      }
      React__namespace.useEffect(() => {
        if (ref.current && props.field.experimental_focusIntent) {
          ref.current.focus();
        }
      }, [props.field.experimental_focusIntent, ref]);
      async function onChange(media) {
        var _a, _b;
        if (media) {
          const parsedValue = (
            // @ts-ignore
            typeof ((_b = (_a = cms == null ? void 0 : cms.media) == null ? void 0 : _a.store) == null ? void 0 : _b.parse) === "function" ? (
              // @ts-ignore
              cms.media.store.parse(media)
            ) : media
          );
          props.input.onChange(parsedValue);
        }
      }
      const uploadDir = props.field.uploadDir || (() => "");
      return /* @__PURE__ */ React__namespace.createElement(
        ImageUpload,
        {
          ref,
          value,
          src,
          loading: isImgUploading,
          onClick: () => {
            const directory = uploadDir(props.form.getState().values);
            cms.media.open({
              allowDelete: true,
              directory,
              onSelect: onChange
            });
          },
          onDrop: async ([file], fileRejections) => {
            setIsImgUploading(true);
            try {
              if (file) {
                const directory = uploadDir(props.form.getState().values);
                const [media] = await cms.media.persist([
                  {
                    directory,
                    file
                  }
                ]);
                if (media) {
                  await onChange(media);
                }
              }
              const errorCodes = {
                "file-invalid-type": "Invalid file type",
                "file-too-large": "File too large",
                "file-too-small": "File too small",
                "too-many-files": "Too many files"
              };
              const printError = (error) => {
                const message = errorCodes[error.code];
                if (message) {
                  return message;
                }
                console.error(error);
                return "Unknown error";
              };
              if (fileRejections.length > 0) {
                const messages = [];
                fileRejections.map((fileRejection) => {
                  messages.push(
                    `${fileRejection.file.name}: ${fileRejection.errors.map((error) => printError(error)).join(", ")}`
                  );
                });
                cms.alerts.error(() => {
                  return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, "Upload Failed. ", /* @__PURE__ */ React__namespace.createElement("br", null), messages.join(". "), ".");
                });
              }
            } catch (error) {
              console.error("Error uploading media asset: ", error);
            } finally {
              setIsImgUploading(false);
            }
          },
          onClear
        }
      );
    }
  );
  const ImageFieldPlugin = {
    name: "image",
    Component: ImageField,
    parse: parse$2,
    validate(value, values, meta, field) {
      if (field.required && !value)
        return "Required";
    }
  };
  const parse$1 = (value) => value && +value;
  const NumberField = wrapFieldsWithMeta(({ input, field }) => {
    return /* @__PURE__ */ React__namespace.createElement(NumberInput, { ...input, step: field.step });
  });
  const NumberFieldPlugin = {
    name: "number",
    Component: NumberField,
    parse: parse$1,
    validate(value, values, meta, field) {
      if (field.required && typeof value !== "number")
        return "Required";
    }
  };
  const SelectField = wrapFieldsWithMeta(Select);
  const SelectFieldPlugin = {
    name: "select",
    type: "select",
    Component: SelectField,
    parse: parse$2,
    validate(value, values, meta, field) {
      if (field.required && !value)
        return "Required";
    }
  };
  const RadioGroupField = wrapFieldsWithMeta(RadioGroup);
  const RadioGroupFieldPlugin = {
    name: "radio-group",
    Component: RadioGroupField,
    validate(value, values, meta, field) {
      if (field.required && !value)
        return "Required";
    }
  };
  const TextareaField = wrapFieldsWithMeta((props) => {
    const ref = React__namespace.useRef(null);
    React__namespace.useEffect(() => {
      if (ref.current && props.field.experimental_focusIntent) {
        const el = ref.current;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, [props.field.experimental_focusIntent, ref]);
    return /* @__PURE__ */ React__namespace.createElement(TextArea, { ref, ...props.input });
  });
  const TextareaFieldPlugin = {
    name: "textarea",
    Component: TextareaField,
    parse: parse$2,
    validate(value, values, meta, field) {
      if (field.required && !value)
        return "Required";
    }
  };
  const TextField = wrapFieldsWithMeta(
    (props) => {
      var _a;
      const ref = React__namespace.useRef(null);
      React__namespace.useEffect(() => {
        if (ref.current && props.field.experimental_focusIntent) {
          ref.current.focus();
        }
      }, [props.field.experimental_focusIntent, ref]);
      return /* @__PURE__ */ React__namespace.createElement(
        BaseTextField,
        {
          ...props.input,
          ref,
          disabled: ((_a = props.field) == null ? void 0 : _a.disabled) ?? false,
          placeholder: props.field.placeholder
        }
      );
    }
  );
  const TextFieldPlugin = {
    name: "text",
    Component: TextField,
    validate(value, allValues, meta, field) {
      var _a;
      if (field.required && !value)
        return "Required";
      if (field.uid) {
        const path = field.name.split(".");
        const fieldName = path[path.length - 1];
        const parent = path.slice(0, path.length - 2);
        const items2 = get(allValues, parent);
        if (((_a = items2 == null ? void 0 : items2.filter((item) => item[fieldName] === value)) == null ? void 0 : _a.length) > 1) {
          return "Item with this unique id already exists";
        }
      }
    },
    parse: parse$2
  };
  const ToggleField = wrapFieldsWithMeta(Toggle);
  const ToggleFieldPlugin = {
    name: "toggle",
    type: "checkbox",
    Component: ToggleField,
    validate(value, values, meta, field) {
      if (field.required && (typeof value === "undefined" || value === null))
        return "Required";
    }
  };
  const TagsField = wrapFieldsWithMeta(({ input, field, form, tinaForm }) => {
    const [value, setValue] = React__namespace.useState("");
    const addTag = React__namespace.useCallback(
      (tag) => {
        var _a, _b;
        if ((_b = (_a = form.getFieldState(field.name)) == null ? void 0 : _a.value) == null ? void 0 : _b.includes(tag)) {
          return;
        }
        if (!tag.length) {
          return;
        }
        form.mutators.insert(field.name, 0, tag);
        setValue("");
      },
      [form, field.name]
    );
    const items2 = input.value || [];
    const ref = React__namespace.useRef(null);
    React__namespace.useEffect(() => {
      if (ref.current && field.experimental_focusIntent) {
        ref.current.focus();
      }
    }, [field.experimental_focusIntent, ref]);
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React__namespace.createElement(
      BaseTextField,
      {
        ref,
        value,
        onChange: (event) => setValue(event.target.value),
        placeholder: field.placeholder ? field.placeholder : "Add a tag",
        onKeyPress: (event) => {
          if (event.key === "," || event.key === "Enter") {
            event.preventDefault();
            addTag(value);
          }
        },
        className: "flex-1"
      }
    ), /* @__PURE__ */ React__namespace.createElement(
      IconButton,
      {
        onClick: () => {
          addTag(value);
        },
        variant: "primary",
        size: "small",
        className: "flex-shrink-0"
      },
      /* @__PURE__ */ React__namespace.createElement(AddIcon, { className: "w-5/6 h-auto" })
    )), /* @__PURE__ */ React__namespace.createElement("span", { className: "flex gap-2 flex-wrap mt-2 mb-0" }, items2.length === 0 && /* @__PURE__ */ React__namespace.createElement("span", { className: "text-gray-300 text-sm italic" }, "No tags"), items2.map((tag, index) => /* @__PURE__ */ React__namespace.createElement(Tag, { key: tag, tinaForm, field, index }, tag))));
  });
  const Tag = ({ tinaForm, field, index, children, ...styleProps }) => {
    const removeItem = React__namespace.useCallback(() => {
      tinaForm.mutators.remove(field.name, index);
    }, [tinaForm, field, index]);
    return /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: "rounded-full shadow bg-white border border-gray-150 flex items-center tracking-[0.01em] leading-none text-gray-700",
        ...styleProps
      },
      /* @__PURE__ */ React__namespace.createElement(
        "span",
        {
          style: { maxHeight: "calc(var(--tina-sidebar-width) - 50px)" },
          className: "text-sm flex-1 pl-3 pr-1 py-1 truncate"
        },
        children
      ),
      /* @__PURE__ */ React__namespace.createElement(
        "button",
        {
          className: "group text-center flex-shrink-0 border-0 bg-transparent pl-1 pr-2 py-1 text-gray-300 hover:text-blue-500 flex items-center justify-center cursor-pointer",
          onClick: removeItem
        },
        /* @__PURE__ */ React__namespace.createElement(BiX, { className: "w-4 h-auto transition ease-out duration-100 group-hover:scale-110 origin-center" })
      )
    );
  };
  const TagsFieldPlugin = {
    name: "tags",
    Component: TagsField,
    parse: parse$2
  };
  function ViewNavigation({
    onClickPrev,
    onClickSwitch,
    onClickNext,
    switchContent,
    switchColSpan,
    switchProps
  }) {
    return /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "rdtPrev", onClick: onClickPrev }, /* @__PURE__ */ React.createElement("span", null, "‹")), /* @__PURE__ */ React.createElement(
      "th",
      {
        className: "rdtSwitch",
        colSpan: switchColSpan,
        onClick: onClickSwitch,
        ...switchProps
      },
      switchContent
    ), /* @__PURE__ */ React.createElement("th", { className: "rdtNext", onClick: onClickNext }, /* @__PURE__ */ React.createElement("span", null, "›")));
  }
  class DaysView extends React.Component {
    constructor() {
      super(...arguments);
      __publicField(this, "_setDate", (e) => {
        this.props.updateDate(e);
      });
    }
    render() {
      return /* @__PURE__ */ React.createElement("div", { className: "rdtDays" }, /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("thead", null, this.renderNavigation(), this.renderDayHeaders()), /* @__PURE__ */ React.createElement("tbody", null, this.renderDays()), this.renderFooter()));
    }
    renderNavigation() {
      const date = this.props.viewDate;
      const locale = date.localeData();
      return /* @__PURE__ */ React.createElement(
        ViewNavigation,
        {
          onClickPrev: () => this.props.navigate(-1, "months"),
          onClickSwitch: () => this.props.showView("months"),
          onClickNext: () => this.props.navigate(1, "months"),
          switchContent: locale.months(date) + " " + date.year(),
          switchColSpan: 5,
          switchProps: { "data-value": this.props.viewDate.month() }
        }
      );
    }
    renderDayHeaders() {
      const locale = this.props.viewDate.localeData();
      const dayItems = getDaysOfWeek(locale).map((day, index) => /* @__PURE__ */ React.createElement("th", { key: day + index, className: "dow" }, day));
      return /* @__PURE__ */ React.createElement("tr", null, dayItems);
    }
    renderDays() {
      const date = this.props.viewDate;
      const startOfMonth = date.clone().startOf("month");
      const endOfMonth = date.clone().endOf("month");
      const rows = [[], [], [], [], [], []];
      const startDate = date.clone().subtract(1, "months");
      startDate.date(startDate.daysInMonth()).startOf("week");
      const endDate = startDate.clone().add(42, "d");
      let i = 0;
      while (startDate.isBefore(endDate)) {
        const row = getRow$2(rows, i++);
        row.push(this.renderDay(startDate, startOfMonth, endOfMonth));
        startDate.add(1, "d");
      }
      return rows.map((r, i2) => /* @__PURE__ */ React.createElement("tr", { key: `${endDate.month()}_${i2}` }, r));
    }
    renderDay(date, startOfMonth, endOfMonth) {
      const selectedDate = this.props.selectedDate;
      const dayProps = {
        key: date.format("M_D"),
        "data-value": date.date(),
        "data-month": date.month(),
        "data-year": date.year()
      };
      let className = "rdtDay";
      if (date.isBefore(startOfMonth)) {
        className += " rdtOld";
      } else if (date.isAfter(endOfMonth)) {
        className += " rdtNew";
      }
      if (selectedDate && date.isSame(selectedDate, "day")) {
        className += " rdtActive";
      }
      if (date.isSame(this.props.moment(), "day")) {
        className += " rdtToday";
      }
      if (this.props.isValidDate(date)) {
        dayProps.onClick = this._setDate;
      } else {
        className += " rdtDisabled";
      }
      dayProps.className = className;
      return this.props.renderDay(
        dayProps,
        date.clone(),
        selectedDate && selectedDate.clone()
      );
    }
    renderFooter() {
      if (!this.props.timeFormat)
        return;
      const date = this.props.viewDate;
      return /* @__PURE__ */ React.createElement("tfoot", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement(
        "td",
        {
          onClick: () => this.props.showView("time"),
          colSpan: 7,
          className: "rdtTimeToggle"
        },
        date.format(this.props.timeFormat)
      )));
    }
  }
  __publicField(DaysView, "defaultProps", {
    isValidDate: () => true,
    renderDay: (props, date) => /* @__PURE__ */ React.createElement("td", { ...props }, date.date())
  });
  function getRow$2(rows, day) {
    return rows[Math.floor(day / 7)];
  }
  function getDaysOfWeek(locale) {
    const first = locale.firstDayOfWeek();
    const dow = [];
    let i = 0;
    locale._weekdaysMin.forEach(function(day) {
      dow[(7 + i++ - first) % 7] = day;
    });
    return dow;
  }
  class MonthsView extends React.Component {
    constructor() {
      super(...arguments);
      __publicField(this, "_updateSelectedMonth", (event) => {
        this.props.updateDate(event);
      });
    }
    render() {
      return /* @__PURE__ */ React.createElement("div", { className: "rdtMonths" }, /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("thead", null, this.renderNavigation())), /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("tbody", null, this.renderMonths())));
    }
    renderNavigation() {
      const year = this.props.viewDate.year();
      return /* @__PURE__ */ React.createElement(
        ViewNavigation,
        {
          onClickPrev: () => this.props.navigate(-1, "years"),
          onClickSwitch: () => this.props.showView("years"),
          onClickNext: () => this.props.navigate(1, "years"),
          switchContent: year,
          switchColSpan: "2"
        }
      );
    }
    renderMonths() {
      const rows = [[], [], []];
      for (let month = 0; month < 12; month++) {
        const row = getRow$1(rows, month);
        row.push(this.renderMonth(month));
      }
      return rows.map((months, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, months));
    }
    renderMonth(month) {
      const selectedDate = this.props.selectedDate;
      let className = "rdtMonth";
      let onClick;
      if (this.isDisabledMonth(month)) {
        className += " rdtDisabled";
      } else {
        onClick = this._updateSelectedMonth;
      }
      if (selectedDate && selectedDate.year() === this.props.viewDate.year() && selectedDate.month() === month) {
        className += " rdtActive";
      }
      const props = { key: month, className, "data-value": month, onClick };
      if (this.props.renderMonth) {
        return this.props.renderMonth(
          props,
          month,
          this.props.viewDate.year(),
          this.props.selectedDate && this.props.selectedDate.clone()
        );
      }
      return /* @__PURE__ */ React.createElement("td", { ...props }, this.getMonthText(month));
    }
    isDisabledMonth(month) {
      const isValidDate = this.props.isValidDate;
      if (!isValidDate) {
        return false;
      }
      const date = this.props.viewDate.clone().set({ month });
      let day = date.endOf("month").date() + 1;
      while (day-- > 1) {
        if (isValidDate(date.date(day))) {
          return false;
        }
      }
      return true;
    }
    getMonthText(month) {
      const localMoment = this.props.viewDate;
      const monthStr = localMoment.localeData().monthsShort(localMoment.month(month));
      return capitalize(monthStr.substring(0, 3));
    }
  }
  function getRow$1(rows, year) {
    if (year < 4) {
      return rows[0];
    }
    if (year < 8) {
      return rows[1];
    }
    return rows[2];
  }
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  class YearsView extends React.Component {
    constructor() {
      super(...arguments);
      __publicField(this, "disabledYearsCache", {});
      __publicField(this, "_updateSelectedYear", (event) => {
        this.props.updateDate(event);
      });
    }
    render() {
      return /* @__PURE__ */ React.createElement("div", { className: "rdtYears" }, /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("thead", null, this.renderNavigation())), /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("tbody", null, this.renderYears())));
    }
    renderNavigation() {
      const viewYear = this.getViewYear();
      return /* @__PURE__ */ React.createElement(
        ViewNavigation,
        {
          onClickPrev: () => this.props.navigate(-10, "years"),
          onClickSwitch: () => this.props.showView("years"),
          onClickNext: () => this.props.navigate(10, "years"),
          switchContent: `${viewYear}-${viewYear + 9}`
        }
      );
    }
    renderYears() {
      const viewYear = this.getViewYear();
      const rows = [[], [], []];
      for (let year = viewYear - 1; year < viewYear + 11; year++) {
        const row = getRow(rows, year - viewYear);
        row.push(this.renderYear(year));
      }
      return rows.map((years, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, years));
    }
    renderYear(year) {
      const selectedYear = this.getSelectedYear();
      let className = "rdtYear";
      let onClick;
      if (this.isDisabledYear(year)) {
        className += " rdtDisabled";
      } else {
        onClick = this._updateSelectedYear;
      }
      if (selectedYear === year) {
        className += " rdtActive";
      }
      const props = { key: year, className, "data-value": year, onClick };
      return this.props.renderYear(
        props,
        year,
        this.props.selectedDate && this.props.selectedDate.clone()
      );
    }
    getViewYear() {
      return parseInt(this.props.viewDate.year() / 10, 10) * 10;
    }
    getSelectedYear() {
      return this.props.selectedDate && this.props.selectedDate.year();
    }
    isDisabledYear(year) {
      const cache = this.disabledYearsCache;
      if (cache[year] !== void 0) {
        return cache[year];
      }
      const isValidDate = this.props.isValidDate;
      if (!isValidDate) {
        return false;
      }
      const date = this.props.viewDate.clone().set({ year });
      let day = date.endOf("year").dayOfYear() + 1;
      while (day-- > 1) {
        if (isValidDate(date.dayOfYear(day))) {
          cache[year] = false;
          return false;
        }
      }
      cache[year] = true;
      return true;
    }
  }
  __publicField(YearsView, "defaultProps", {
    renderYear: (props, year) => /* @__PURE__ */ React.createElement("td", { ...props }, year)
  });
  function getRow(rows, year) {
    if (year < 3) {
      return rows[0];
    }
    if (year < 7) {
      return rows[1];
    }
    return rows[2];
  }
  const timeConstraints = {
    hours: {
      min: 0,
      max: 23,
      step: 1
    },
    minutes: {
      min: 0,
      max: 59,
      step: 1
    },
    seconds: {
      min: 0,
      max: 59,
      step: 1
    },
    milliseconds: {
      min: 0,
      max: 999,
      step: 1
    }
  };
  function createConstraints(overrideTimeConstraints) {
    const constraints = {};
    Object.keys(timeConstraints).forEach((type) => {
      constraints[type] = {
        ...timeConstraints[type],
        ...overrideTimeConstraints[type] || {}
      };
    });
    return constraints;
  }
  class TimeView extends React.Component {
    constructor(props) {
      super(props);
      this.constraints = createConstraints(props.timeConstraints);
      this.state = this.getTimeParts(props.selectedDate || props.viewDate);
    }
    render() {
      const items2 = [];
      const timeParts = this.state;
      this.getCounters().forEach((c, i) => {
        if (i && c !== "ampm") {
          items2.push(
            /* @__PURE__ */ React.createElement("div", { key: `sep${i}`, className: "rdtCounterSeparator" }, ":")
          );
        }
        items2.push(this.renderCounter(c, timeParts[c]));
      });
      return /* @__PURE__ */ React.createElement("div", { className: "rdtTime" }, /* @__PURE__ */ React.createElement("table", null, this.renderHeader(), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "rdtCounters" }, items2))))));
    }
    renderCounter(type, value) {
      if (type === "hours" && this.isAMPM()) {
        value = (value - 1) % 12 + 1;
        if (value === 0) {
          value = 12;
        }
      }
      if (type === "ampm") {
        if (this.props.timeFormat.indexOf(" A") !== -1) {
          value = this.props.viewDate.format("A");
        } else {
          value = this.props.viewDate.format("a");
        }
      }
      return /* @__PURE__ */ React.createElement("div", { key: type, className: "rdtCounter" }, /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "rdtBtn",
          onMouseDown: (e) => this.onStartClicking(e, "increase", type)
        },
        "▲"
      ), /* @__PURE__ */ React.createElement("div", { className: "rdtCount" }, value), /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "rdtBtn",
          onMouseDown: (e) => this.onStartClicking(e, "decrease", type)
        },
        "▼"
      ));
    }
    renderHeader() {
      if (!this.props.dateFormat)
        return;
      const date = this.props.selectedDate || this.props.viewDate;
      return /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement(
        "td",
        {
          className: "rdtSwitch",
          colSpan: "4",
          onClick: () => this.props.showView("days")
        },
        date.format(this.props.dateFormat)
      )));
    }
    onStartClicking(e, action, type) {
      if (e && e.button && e.button !== 0) {
        return;
      }
      if (type === "ampm")
        return this.toggleDayPart();
      const update = {};
      const body = document.body;
      update[type] = this[action](type);
      this.setState(update);
      this.timer = setTimeout(() => {
        this.increaseTimer = setInterval(() => {
          update[type] = this[action](type);
          this.setState(update);
        }, 70);
      }, 500);
      this.mouseUpListener = () => {
        clearTimeout(this.timer);
        clearInterval(this.increaseTimer);
        this.props.setTime(type, parseInt(this.state[type], 10));
        body.removeEventListener("mouseup", this.mouseUpListener);
        body.removeEventListener("touchend", this.mouseUpListener);
      };
      body.addEventListener("mouseup", this.mouseUpListener);
      body.addEventListener("touchend", this.mouseUpListener);
    }
    toggleDayPart() {
      let hours = parseInt(this.state.hours, 10);
      if (hours >= 12) {
        hours -= 12;
      } else {
        hours += 12;
      }
      this.props.setTime("hours", hours);
    }
    increase(type) {
      const tc = this.constraints[type];
      let value = parseInt(this.state[type], 10) + tc.step;
      if (value > tc.max)
        value = tc.min + (value - (tc.max + 1));
      return pad(type, value);
    }
    decrease(type) {
      const tc = this.constraints[type];
      let value = parseInt(this.state[type], 10) - tc.step;
      if (value < tc.min)
        value = tc.max + 1 - (tc.min - value);
      return pad(type, value);
    }
    getCounters() {
      const counters = [];
      const format2 = this.props.timeFormat;
      if (format2.toLowerCase().indexOf("h") !== -1) {
        counters.push("hours");
        if (format2.indexOf("m") !== -1) {
          counters.push("minutes");
          if (format2.indexOf("s") !== -1) {
            counters.push("seconds");
            if (format2.indexOf("S") !== -1) {
              counters.push("milliseconds");
            }
          }
        }
      }
      if (this.isAMPM()) {
        counters.push("ampm");
      }
      return counters;
    }
    isAMPM() {
      return this.props.timeFormat.toLowerCase().indexOf(" a") !== -1;
    }
    getTimeParts(date) {
      const hours = date.hours();
      return {
        hours: pad("hours", hours),
        minutes: pad("minutes", date.minutes()),
        seconds: pad("seconds", date.seconds()),
        milliseconds: pad("milliseconds", date.milliseconds()),
        ampm: hours < 12 ? "am" : "pm"
      };
    }
    componentDidUpdate(prevProps) {
      if (this.props.selectedDate) {
        if (this.props.selectedDate !== prevProps.selectedDate) {
          this.setState(this.getTimeParts(this.props.selectedDate));
        }
      } else if (prevProps.viewDate !== this.props.viewDate) {
        this.setState(this.getTimeParts(this.props.viewDate));
      }
    }
  }
  function pad(type, value) {
    const padValues = {
      hours: 1,
      minutes: 2,
      seconds: 2,
      milliseconds: 3
    };
    let str = value + "";
    while (str.length < padValues[type])
      str = "0" + str;
    return str;
  }
  var useClickAway$1 = {};
  var util = {};
  Object.defineProperty(util, "__esModule", { value: true });
  util.isNavigator = util.isBrowser = util.off = util.on = util.noop = void 0;
  var noop = function() {
  };
  util.noop = noop;
  function on(obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    if (obj && obj.addEventListener) {
      obj.addEventListener.apply(obj, args);
    }
  }
  util.on = on;
  function off(obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    if (obj && obj.removeEventListener) {
      obj.removeEventListener.apply(obj, args);
    }
  }
  util.off = off;
  util.isBrowser = typeof window !== "undefined";
  util.isNavigator = typeof navigator !== "undefined";
  Object.defineProperty(useClickAway$1, "__esModule", { value: true });
  var react_1 = React;
  var util_1 = util;
  var defaultEvents = ["mousedown", "touchstart"];
  var useClickAway = function(ref, onClickAway, events) {
    if (events === void 0) {
      events = defaultEvents;
    }
    var savedCallback = react_1.useRef(onClickAway);
    react_1.useEffect(function() {
      savedCallback.current = onClickAway;
    }, [onClickAway]);
    react_1.useEffect(function() {
      var handler = function(event) {
        var el = ref.current;
        el && !el.contains(event.target) && savedCallback.current(event);
      };
      for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
        var eventName = events_1[_i];
        util_1.on(document, eventName, handler);
      }
      return function() {
        for (var _i2 = 0, events_2 = events; _i2 < events_2.length; _i2++) {
          var eventName2 = events_2[_i2];
          util_1.off(document, eventName2, handler);
        }
      };
    }, [events, ref]);
  };
  var _default = useClickAway$1.default = useClickAway;
  const viewModes = {
    YEARS: "years",
    MONTHS: "months",
    DAYS: "days",
    TIME: "time"
  };
  const TYPES = PropTypes;
  const nofn = function() {
  };
  const datetype = TYPES.oneOfType([
    TYPES.instanceOf(moment),
    TYPES.instanceOf(Date),
    TYPES.string
  ]);
  class Datetime extends React.Component {
    constructor(props) {
      super(props);
      __publicField(this, "_renderCalendar", () => {
        const props = this.props;
        const state = this.state;
        const viewProps = {
          viewDate: state.viewDate.clone(),
          selectedDate: this.getSelectedDate(),
          isValidDate: props.isValidDate,
          updateDate: this._updateDate,
          navigate: this._viewNavigate,
          moment,
          showView: this._showView
        };
        switch (state.currentView) {
          case viewModes.YEARS:
            viewProps.renderYear = props.renderYear;
            return /* @__PURE__ */ React.createElement(YearsView, { ...viewProps });
          case viewModes.MONTHS:
            viewProps.renderMonth = props.renderMonth;
            return /* @__PURE__ */ React.createElement(MonthsView, { ...viewProps });
          case viewModes.DAYS:
            viewProps.renderDay = props.renderDay;
            viewProps.timeFormat = this.getFormat("time");
            return /* @__PURE__ */ React.createElement(DaysView, { ...viewProps });
          default:
            viewProps.dateFormat = this.getFormat("date");
            viewProps.timeFormat = this.getFormat("time");
            viewProps.timeConstraints = props.timeConstraints;
            viewProps.setTime = this._setTime;
            return /* @__PURE__ */ React.createElement(TimeView, { ...viewProps });
        }
      });
      __publicField(this, "_showView", (view, date) => {
        const d = (date || this.state.viewDate).clone();
        const nextView = this.props.onBeforeNavigate(
          view,
          this.state.currentView,
          d
        );
        if (nextView && this.state.currentView !== nextView) {
          this.props.onNavigate(nextView);
          this.setState({ currentView: nextView });
        }
      });
      __publicField(this, "viewToMethod", { days: "date", months: "month", years: "year" });
      __publicField(this, "nextView", { days: "time", months: "days", years: "months" });
      __publicField(this, "_updateDate", (e) => {
        const state = this.state;
        const currentView = state.currentView;
        const updateOnView = this.getUpdateOn(this.getFormat("date"));
        const viewDate = this.state.viewDate.clone();
        viewDate[this.viewToMethod[currentView]](
          parseInt(e.target.getAttribute("data-value"), 10)
        );
        if (currentView === "days") {
          viewDate.month(parseInt(e.target.getAttribute("data-month"), 10));
          viewDate.year(parseInt(e.target.getAttribute("data-year"), 10));
        }
        const update = { viewDate };
        if (currentView === updateOnView) {
          update.selectedDate = viewDate.clone();
          update.inputValue = viewDate.format(this.getFormat("datetime"));
          if (this.props.open === void 0 && this.props.input && this.props.closeOnSelect) {
            this._closeCalendar();
          }
          this.props.onChange(viewDate.clone());
        } else {
          this._showView(this.nextView[currentView], viewDate);
        }
        this.setState(update);
      });
      __publicField(this, "_viewNavigate", (modifier, unit) => {
        const viewDate = this.state.viewDate.clone();
        viewDate.add(modifier, unit);
        if (modifier > 0) {
          this.props.onNavigateForward(modifier, unit);
        } else {
          this.props.onNavigateBack(-modifier, unit);
        }
        this.setState({ viewDate });
      });
      __publicField(this, "_setTime", (type, value) => {
        const date = (this.getSelectedDate() || this.state.viewDate).clone();
        date[type](value);
        if (!this.props.value) {
          this.setState({
            selectedDate: date,
            viewDate: date.clone(),
            inputValue: date.format(this.getFormat("datetime"))
          });
        }
        this.props.onChange(date);
      });
      __publicField(this, "_openCalendar", () => {
        if (this.isOpen())
          return;
        this.setState({ open: true }, this.props.onOpen);
      });
      __publicField(this, "_closeCalendar", () => {
        if (!this.isOpen())
          return;
        this.setState({ open: false }, () => {
          this.props.onClose(this.state.selectedDate || this.state.inputValue);
        });
      });
      __publicField(this, "_handleClickOutside", () => {
        const props = this.props;
        if (props.input && this.state.open && props.open === void 0 && props.closeOnClickOutside) {
          this._closeCalendar();
        }
      });
      __publicField(this, "_onInputFocus", (e) => {
        if (!this.callHandler(this.props.inputProps.onFocus, e))
          return;
        this._openCalendar();
      });
      __publicField(this, "_onInputChange", (e) => {
        if (!this.callHandler(this.props.inputProps.onChange, e))
          return;
        const value = e.target ? e.target.value : e;
        const localMoment = this.localMoment(value, this.getFormat("datetime"));
        const update = { inputValue: value };
        if (localMoment.isValid()) {
          update.selectedDate = localMoment;
          update.viewDate = localMoment.clone().startOf("month");
        } else {
          update.selectedDate = null;
        }
        this.setState(update, () => {
          this.props.onChange(
            localMoment.isValid() ? localMoment : this.state.inputValue
          );
        });
      });
      __publicField(this, "_onInputKeyDown", (e) => {
        if (!this.callHandler(this.props.inputProps.onKeyDown, e))
          return;
        if (e.which === 9 && this.props.closeOnTab) {
          this._closeCalendar();
        }
      });
      __publicField(this, "_onInputClick", (e) => {
        if (!this.callHandler(this.props.inputProps.onClick, e))
          return;
        this._openCalendar();
      });
      this.state = this.getInitialState();
    }
    render() {
      return /* @__PURE__ */ React.createElement(
        ClickableWrapper,
        {
          className: this.getClassName(),
          onClickOut: this._handleClickOutside
        },
        this.renderInput(),
        /* @__PURE__ */ React.createElement("div", { className: "rdtPicker" }, this.renderView())
      );
    }
    renderInput() {
      if (!this.props.input)
        return;
      const finalInputProps = {
        type: "text",
        className: "form-control",
        value: this.getInputValue(),
        ...this.props.inputProps,
        onFocus: this._onInputFocus,
        onChange: this._onInputChange,
        onKeyDown: this._onInputKeyDown,
        onClick: this._onInputClick
      };
      if (this.props.renderInput) {
        return /* @__PURE__ */ React.createElement("div", null, this.props.renderInput(
          finalInputProps,
          this._openCalendar,
          this._closeCalendar
        ));
      }
      return /* @__PURE__ */ React.createElement("input", { ...finalInputProps });
    }
    renderView() {
      return this.props.renderView(this.state.currentView, this._renderCalendar);
    }
    getInitialState() {
      const props = this.props;
      const inputFormat = this.getFormat("datetime");
      const selectedDate = this.parseDate(
        props.value || props.initialValue,
        inputFormat
      );
      this.checkTZ();
      return {
        open: !props.input,
        currentView: props.initialViewMode || this.getInitialView(),
        viewDate: this.getInitialViewDate(selectedDate),
        selectedDate: selectedDate && selectedDate.isValid() ? selectedDate : void 0,
        inputValue: this.getInitialInputValue(selectedDate)
      };
    }
    getInitialViewDate(selectedDate) {
      const propDate = this.props.initialViewDate;
      let viewDate;
      if (propDate) {
        viewDate = this.parseDate(propDate, this.getFormat("datetime"));
        if (viewDate && viewDate.isValid()) {
          return viewDate;
        } else {
          log(
            'The initialViewDated given "' + propDate + '" is not valid. Using current date instead.'
          );
        }
      } else if (selectedDate && selectedDate.isValid()) {
        return selectedDate.clone();
      }
      return this.getInitialDate();
    }
    getInitialDate() {
      const m = this.localMoment();
      m.hour(0).minute(0).second(0).millisecond(0);
      return m;
    }
    getInitialView() {
      const dateFormat = this.getFormat("date");
      return dateFormat ? this.getUpdateOn(dateFormat) : viewModes.TIME;
    }
    parseDate(date, dateFormat) {
      let parsedDate;
      if (date && typeof date === "string")
        parsedDate = this.localMoment(date, dateFormat);
      else if (date)
        parsedDate = this.localMoment(date);
      if (parsedDate && !parsedDate.isValid())
        parsedDate = null;
      return parsedDate;
    }
    getClassName() {
      let cn2 = "rdt";
      const props = this.props;
      const propCn = props.className;
      if (Array.isArray(propCn)) {
        cn2 += " " + propCn.join(" ");
      } else if (propCn) {
        cn2 += " " + propCn;
      }
      if (!props.input) {
        cn2 += " rdtStatic";
      }
      if (this.isOpen()) {
        cn2 += " rdtOpen";
      }
      return cn2;
    }
    isOpen() {
      return !this.props.input || (this.props.open === void 0 ? this.state.open : this.props.open);
    }
    getUpdateOn(dateFormat) {
      if (this.props.updateOnView) {
        return this.props.updateOnView;
      }
      if (dateFormat.match(/[lLD]/)) {
        return viewModes.DAYS;
      }
      if (dateFormat.indexOf("M") !== -1) {
        return viewModes.MONTHS;
      }
      if (dateFormat.indexOf("Y") !== -1) {
        return viewModes.YEARS;
      }
      return viewModes.DAYS;
    }
    getLocaleData() {
      const p = this.props;
      return this.localMoment(
        p.value || p.defaultValue || /* @__PURE__ */ new Date()
      ).localeData();
    }
    getDateFormat() {
      const locale = this.getLocaleData();
      const format2 = this.props.dateFormat;
      if (format2 === true)
        return locale.longDateFormat("L");
      if (format2)
        return format2;
      return "";
    }
    getTimeFormat() {
      const locale = this.getLocaleData();
      const format2 = this.props.timeFormat;
      if (format2 === true) {
        return locale.longDateFormat("LT");
      }
      return format2 || "";
    }
    getFormat(type) {
      if (type === "date") {
        return this.getDateFormat();
      } else if (type === "time") {
        return this.getTimeFormat();
      }
      const dateFormat = this.getDateFormat();
      const timeFormat = this.getTimeFormat();
      return dateFormat && timeFormat ? dateFormat + " " + timeFormat : dateFormat || timeFormat;
    }
    updateTime(op, amount, type, toSelected) {
      const update = {};
      const date = toSelected ? "selectedDate" : "viewDate";
      update[date] = this.state[date].clone()[op](amount, type);
      this.setState(update);
    }
    localMoment(date, format2, props) {
      props = props || this.props;
      let m = null;
      if (props.utc) {
        m = moment.utc(date, format2, props.strictParsing);
      } else if (props.displayTimeZone) {
        m = moment.tz(date, format2, props.displayTimeZone);
      } else {
        m = moment(date, format2, props.strictParsing);
      }
      if (props.locale)
        m.locale(props.locale);
      return m;
    }
    checkTZ() {
      const { displayTimeZone } = this.props;
      if (displayTimeZone && !this.tzWarning && !moment.tz) {
        this.tzWarning = true;
        log(
          'displayTimeZone prop with value "' + displayTimeZone + '" is used but moment.js timezone is not loaded.',
          "error"
        );
      }
    }
    componentDidUpdate(prevProps) {
      if (prevProps === this.props)
        return;
      let needsUpdate = false;
      const thisProps = this.props;
      ["locale", "utc", "displayZone", "dateFormat", "timeFormat"].forEach(
        function(p) {
          prevProps[p] !== thisProps[p] && (needsUpdate = true);
        }
      );
      if (needsUpdate) {
        this.regenerateDates();
      }
      if (thisProps.value && thisProps.value !== prevProps.value) {
        this.setViewDate(thisProps.value);
      }
      this.checkTZ();
    }
    regenerateDates() {
      const props = this.props;
      const viewDate = this.state.viewDate.clone();
      const selectedDate = this.state.selectedDate && this.state.selectedDate.clone();
      if (props.locale) {
        viewDate.locale(props.locale);
        selectedDate && selectedDate.locale(props.locale);
      }
      if (props.utc) {
        viewDate.utc();
        selectedDate && selectedDate.utc();
      } else if (props.displayTimeZone) {
        viewDate.tz(props.displayTimeZone);
        selectedDate && selectedDate.tz(props.displayTimeZone);
      } else {
        viewDate.locale();
        selectedDate && selectedDate.locale();
      }
      const update = { viewDate, selectedDate };
      if (selectedDate && selectedDate.isValid()) {
        update.inputValue = selectedDate.format(this.getFormat("datetime"));
      }
      this.setState(update);
    }
    getSelectedDate() {
      if (this.props.value === void 0)
        return this.state.selectedDate;
      const selectedDate = this.parseDate(
        this.props.value,
        this.getFormat("datetime")
      );
      return selectedDate && selectedDate.isValid() ? selectedDate : false;
    }
    getInitialInputValue(selectedDate) {
      const props = this.props;
      if (props.inputProps.value)
        return props.inputProps.value;
      if (selectedDate && selectedDate.isValid())
        return selectedDate.format(this.getFormat("datetime"));
      if (props.value && typeof props.value === "string")
        return props.value;
      if (props.initialValue && typeof props.initialValue === "string")
        return props.initialValue;
      return "";
    }
    getInputValue() {
      const selectedDate = this.getSelectedDate();
      return selectedDate ? selectedDate.format(this.getFormat("datetime")) : this.state.inputValue;
    }
    /**
     * Set the date that is currently shown in the calendar.
     * This is independent from the selected date and it's the one used to navigate through months or days in the calendar.
     * @param dateType date
     * @public
     */
    setViewDate(date) {
      const logError = function() {
        return log("Invalid date passed to the `setViewDate` method: " + date);
      };
      if (!date)
        return logError();
      let viewDate;
      if (typeof date === "string") {
        viewDate = this.localMoment(date, this.getFormat("datetime"));
      } else {
        viewDate = this.localMoment(date);
      }
      if (!viewDate || !viewDate.isValid())
        return logError();
      this.setState({ viewDate });
    }
    /**
     * Set the view currently shown by the calendar. View modes shipped with react-datetime are 'years', 'months', 'days' and 'time'.
     * @param TYPES.string mode
     */
    navigate(mode) {
      this._showView(mode);
    }
    callHandler(method, e) {
      if (!method)
        return true;
      return method(e) !== false;
    }
  }
  __publicField(Datetime, "propTypes", {
    value: datetype,
    initialValue: datetype,
    initialViewDate: datetype,
    initialViewMode: TYPES.oneOf([
      viewModes.YEARS,
      viewModes.MONTHS,
      viewModes.DAYS,
      viewModes.TIME
    ]),
    onOpen: TYPES.func,
    onClose: TYPES.func,
    onChange: TYPES.func,
    onNavigate: TYPES.func,
    onBeforeNavigate: TYPES.func,
    onNavigateBack: TYPES.func,
    onNavigateForward: TYPES.func,
    updateOnView: TYPES.string,
    locale: TYPES.string,
    utc: TYPES.bool,
    displayTimeZone: TYPES.string,
    input: TYPES.bool,
    dateFormat: TYPES.oneOfType([TYPES.string, TYPES.bool]),
    timeFormat: TYPES.oneOfType([TYPES.string, TYPES.bool]),
    inputProps: TYPES.object,
    timeConstraints: TYPES.object,
    isValidDate: TYPES.func,
    open: TYPES.bool,
    strictParsing: TYPES.bool,
    closeOnSelect: TYPES.bool,
    closeOnTab: TYPES.bool,
    renderView: TYPES.func,
    renderInput: TYPES.func,
    renderDay: TYPES.func,
    renderMonth: TYPES.func,
    renderYear: TYPES.func
  });
  __publicField(Datetime, "defaultProps", {
    onOpen: nofn,
    onClose: nofn,
    onCalendarOpen: nofn,
    onCalendarClose: nofn,
    onChange: nofn,
    onNavigate: nofn,
    onBeforeNavigate: function(next) {
      return next;
    },
    onNavigateBack: nofn,
    onNavigateForward: nofn,
    dateFormat: true,
    timeFormat: true,
    utc: false,
    className: "",
    input: true,
    inputProps: {},
    timeConstraints: {},
    isValidDate: function() {
      return true;
    },
    strictParsing: true,
    closeOnSelect: false,
    closeOnTab: true,
    closeOnClickOutside: true,
    renderView: (_, renderFunc) => renderFunc()
  });
  // Make moment accessible through the Datetime class
  __publicField(Datetime, "moment", moment);
  function log(message, method) {
    const con = typeof window !== "undefined" && window.console;
    if (!con)
      return;
    if (!method) {
      method = "warn";
    }
    con[method]("***react-datetime:" + message);
  }
  function ClickableWrapper({ className, onClickOut, children }) {
    const containerRef = React.useRef(null);
    _default(containerRef, (event) => {
      onClickOut(event);
    });
    return /* @__PURE__ */ React.createElement("div", { className, ref: containerRef }, children);
  }
  const DEFAULT_DATE_DISPLAY_FORMAT = "MMM DD, YYYY";
  const DEFAULT_TIME_DISPLAY_FORMAT = "h:mm A";
  const format$1 = (val, _name, field) => {
    if (!val)
      return val;
    const dateFormat = parseDateFormat(field.dateFormat);
    const timeFormat = parseTimeFormat(field.timeFormat);
    const combinedFormat = typeof timeFormat === "string" ? `${dateFormat} ${timeFormat}` : dateFormat;
    if (typeof val === "string") {
      const date = moment(val);
      return date.isValid() ? date.format(combinedFormat) : val;
    }
    return moment(val).format(combinedFormat);
  };
  const parse = (val) => {
    if (!val)
      return val;
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      return new Date(val).toISOString();
    }
    return val;
  };
  function parseDateFormat(format2) {
    if (typeof format2 === "string") {
      return format2;
    }
    return DEFAULT_DATE_DISPLAY_FORMAT;
  }
  function parseTimeFormat(format2) {
    if (typeof format2 === "string") {
      return format2;
    } else if (format2) {
      return DEFAULT_TIME_DISPLAY_FORMAT;
    }
  }
  const DateField = wrapFieldsWithMeta(
    ({ input, field: { dateFormat, timeFormat, ...rest } }) => {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
        ReactDateTimeWithStyles,
        {
          value: input.value,
          onChange: (value) => {
            const newValue = value === "" ? void 0 : value;
            input.onChange(newValue);
          },
          dateFormat: dateFormat || DEFAULT_DATE_DISPLAY_FORMAT,
          timeFormat: timeFormat || false,
          inputProps: { className: textFieldClasses },
          ...rest
        }
      ));
    }
  );
  const ReactDateTimeWithStyles = (props) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const area = React.useRef(null);
    React.useEffect(() => {
      const handleClick = (event) => {
        if (!area.current)
          return;
        if (!event.target)
          return;
        if (!area.current.contains(event.target)) {
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
      };
      document.addEventListener("mouseup", handleClick, false);
      return () => {
        document.removeEventListener("mouseup", handleClick, false);
      };
    }, [document]);
    React.useEffect(() => {
      if (area.current) {
        setTimeout(() => {
          const plateElement = area.current.querySelector(
            'input[type="text"]'
          );
          if (props.experimental_focusIntent && plateElement) {
            if (plateElement)
              plateElement.focus();
          }
        }, 100);
      }
    }, [props.experimental_focusIntent, area]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "tina-date-field", ref: area }, /* @__PURE__ */ React.createElement(Datetime, { ...props, isOpen })));
  };
  const DateFieldPlugin = {
    __type: "field",
    name: "date",
    Component: DateField,
    format: format$1,
    parse,
    validate(value, values, meta, field) {
      if (field.required && !value)
        return "Required";
    }
  };
  const CheckboxGroupField = wrapFieldsWithMeta(CheckboxGroup);
  const CheckboxGroupFieldPlugin = {
    name: "checkbox-group",
    Component: CheckboxGroupField,
    validate(value, values, meta, field) {
      if (field.required && (typeof value === "undefined" || value === null))
        return "Required";
    }
  };
  const ReferenceField = wrapFieldsWithMeta(Reference);
  const ReferenceFieldPlugin = {
    name: "reference",
    type: "reference",
    Component: ReferenceField,
    parse: parse$2,
    validate(value, values, meta, field) {
      if (field.required && !value)
        return "Required";
    }
  };
  const ButtonToggleField = wrapFieldsWithMeta(ButtonToggle);
  const ButtonToggleFieldPlugin = {
    name: "button-toggle",
    Component: ButtonToggleField
  };
  const HiddenField = () => {
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null);
  };
  const HiddenFieldPlugin = {
    name: "hidden",
    Component: HiddenField,
    parse: parse$2
  };
  const PasswordMask = "********";
  const PasswordFieldComponent = wrapFieldsWithMeta(({ field, form, meta, input, children }) => {
    const ref1 = React__namespace.useRef(null);
    const ref2 = React__namespace.useRef(null);
    const [error, setError] = React__namespace.useState(false);
    const [password, setPassword] = React__namespace.useState();
    const [confirmPassword, setConfirmPassword] = React__namespace.useState();
    const [passwordChangeRequired, setPasswordChangeRequired] = React__namespace.useState(input.value.passwordChangeRequired);
    React__namespace.useEffect(() => {
      if (password) {
        if (password === confirmPassword) {
          setError(false);
          form.change(field.name, { value: password, passwordChangeRequired });
        } else {
          setError(true);
          form.change(field.name, void 0);
        }
      } else {
        setError(false);
        form.change(field.name, { passwordChangeRequired });
      }
    }, [password, confirmPassword, passwordChangeRequired]);
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "flex flex-row space-x-4" }, /* @__PURE__ */ React__namespace.createElement(
      BasePasswordField,
      {
        autoComplete: "off",
        value: password ?? PasswordMask,
        ref: ref1,
        disabled: (field == null ? void 0 : field.disabled) ?? false,
        error,
        placeholder: field.placeholder || "Password",
        onKeyDown: (_) => {
          if (password === void 0) {
            setPassword("");
          }
          if (confirmPassword === void 0) {
            setConfirmPassword("");
          }
        },
        onChange: (event) => {
          setPassword(event.target.value);
        }
      }
    ), /* @__PURE__ */ React__namespace.createElement(
      BasePasswordField,
      {
        autoComplete: "off",
        ref: ref2,
        value: confirmPassword ?? PasswordMask,
        disabled: (field == null ? void 0 : field.disabled) ?? false,
        error,
        placeholder: field.confirmPlaceholder || "Confirm Password",
        onKeyDown: (_) => {
          setPasswordChangeRequired(true);
          if (password === void 0) {
            setPassword("");
          }
          if (confirmPassword === void 0) {
            setConfirmPassword("");
          }
        },
        onChange: (event) => {
          setConfirmPassword(event.target.value);
        }
      }
    ), /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        variant: "secondary",
        disabled: password === void 0 && confirmPassword === void 0,
        onClick: () => {
          setError(false);
          setPassword(void 0);
          setConfirmPassword(void 0);
          setPasswordChangeRequired(void 0);
          form.change(field.name, void 0);
        }
      },
      "Reset"
    )), /* @__PURE__ */ React__namespace.createElement("div", { className: "flex w-full items-center pl-1 pt-3" }, /* @__PURE__ */ React__namespace.createElement(
      Toggle,
      {
        field: { name: "passwordChangeRequired", component: "toggle" },
        input: {
          value: passwordChangeRequired ?? true,
          onChange: () => setPasswordChangeRequired(!passwordChangeRequired)
        },
        name: "passwordChangeRequired"
      }
    ), /* @__PURE__ */ React__namespace.createElement("div", null, /* @__PURE__ */ React__namespace.createElement("label", { className: "block font-sans text-xs font-semibold text-gray-700 whitespace-normal h-full items-center ml-1" }, "Require Password Change on Next Login"))));
  });
  const PasswordFieldPlugin = {
    name: "password",
    Component: PasswordFieldComponent,
    validate(value, values, meta, field) {
      let password = value;
      if (Array.isArray(value)) {
        password = value[0];
      }
      if (field.required && (password == null ? void 0 : password.passwordChangeRequired) === void 0) {
        return "Required";
      }
    },
    parse: parse$2
  };
  function AiFillWarning(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 1024 1024" }, "child": [{ "tag": "path", "attr": { "d": "M955.7 856l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zM480 416c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v184c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V416zm32 352a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z" }, "child": [] }] })(props);
  }
  function FaFile(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 384 512" }, "child": [{ "tag": "path", "attr": { "d": "M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z" }, "child": [] }] })(props);
  }
  function FaFolder(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z" }, "child": [] }] })(props);
  }
  function FaLock(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 448 512" }, "child": [{ "tag": "path", "attr": { "d": "M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z" }, "child": [] }] })(props);
  }
  function FaSpinner(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z" }, "child": [] }] })(props);
  }
  function FaUnlock(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 448 512" }, "child": [{ "tag": "path", "attr": { "d": "M400 256H152V152.9c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v16c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-16C376 68 307.5-.3 223.5 0 139.5.3 72 69.5 72 153.5V256H48c-26.5 0-48 21.5-48 48v160c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z" }, "child": [] }] })(props);
  }
  function GrCircleQuestion(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "fill": "none", "strokeWidth": "2", "d": "M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,15 L12,14 C12,13 12,12.5 13,12 C14,11.5 15,11 15,9.5 C15,8.5 14,7 12,7 C10,7 9,8.26413718 9,10 M12,16 L12,18" }, "child": [] }] })(props);
  }
  const BranchContext = React__namespace.createContext({
    currentBranch: null,
    setCurrentBranch: (branch) => {
      console.warn("BranchContext not initialized");
    }
  });
  const BranchDataProvider = ({
    currentBranch,
    setCurrentBranch,
    children
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      BranchContext.Provider,
      {
        value: {
          currentBranch,
          setCurrentBranch
        }
      },
      children
    );
  };
  const useBranchData = () => {
    const branchData = React__namespace.useContext(BranchContext);
    const { dispatch } = useEvent("branch:change");
    React__namespace.useEffect(() => {
      dispatch({ branchName: branchData.currentBranch });
    }, [branchData.currentBranch]);
    return branchData;
  };
  function formatBranchName$1(str) {
    const pattern = /[^/\w-]+/g;
    const formattedStr = str.replace(pattern, "");
    return formattedStr.toLowerCase();
  }
  const BranchSwitcherLegacy = ({
    listBranches,
    createBranch,
    chooseBranch
  }) => {
    var _a, _b;
    const cms = useCMS$1();
    const isLocalMode = (_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isLocalMode;
    const [listState, setListState] = React__namespace.useState("loading");
    const [branchList, setBranchList] = React__namespace.useState([]);
    const { currentBranch } = useBranchData();
    const initialBranch = React__namespace.useMemo(() => currentBranch, []);
    React__namespace.useEffect(() => {
      return () => {
        if (initialBranch != currentBranch) {
          window.location.reload();
        }
      };
    }, [currentBranch]);
    const handleCreateBranch = React__namespace.useCallback((value) => {
      setListState("loading");
      createBranch({
        branchName: formatBranchName$1(value),
        baseBranch: currentBranch
      }).then(async (createdBranchName) => {
        cms.alerts.success("Branch created.");
        setBranchList((oldBranchList) => {
          return [
            ...oldBranchList,
            {
              indexStatus: { status: "unknown" },
              name: createdBranchName
            }
          ];
        });
        setListState("ready");
      });
    }, []);
    const refreshBranchList = React__namespace.useCallback(async () => {
      setListState("loading");
      await listBranches().then((data) => {
        setBranchList(data);
        setListState("ready");
      }).catch(() => setListState("error"));
    }, []);
    React__namespace.useEffect(() => {
      refreshBranchList();
    }, []);
    React__namespace.useEffect(() => {
      if (listState === "ready") {
        const cancelFuncs = [];
        branchList.filter(
          (x) => {
            var _a2, _b2;
            return ((_a2 = x == null ? void 0 : x.indexStatus) == null ? void 0 : _a2.status) === "inprogress" || ((_b2 = x == null ? void 0 : x.indexStatus) == null ? void 0 : _b2.status) === "unknown";
          }
        ).forEach(async (x) => {
          const [
            // When this promise resolves, we know the index status is no longer 'inprogress' or 'unknown'
            waitForIndexStatusPromise,
            // Calling this function will cancel the polling
            cancelWaitForIndexFunc
          ] = cms.api.tina.waitForIndexStatus({
            ref: x.name
          });
          cancelFuncs.push(cancelWaitForIndexFunc);
          waitForIndexStatusPromise.then((indexStatus) => {
            setBranchList((previousBranchList) => {
              const newBranchList = Array.from(previousBranchList);
              const index = newBranchList.findIndex((y) => y.name === x.name);
              newBranchList[index].indexStatus = indexStatus;
              return newBranchList;
            });
          }).catch((e) => {
            if (e.message === "AsyncPoller: cancelled")
              return;
            console.error(e);
          });
        });
        return () => {
          cancelFuncs.forEach((x) => {
            x();
          });
        };
      }
    }, [listState, branchList.length]);
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full flex justify-center p-5" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full max-w-form" }, isLocalMode ? /* @__PURE__ */ React__namespace.createElement("div", { className: "px-6 py-8 w-full h-full flex flex-col items-center justify-center" }, /* @__PURE__ */ React__namespace.createElement("p", { className: "text-base mb-4 text-center" }, /* @__PURE__ */ React__namespace.createElement(AiFillWarning, { className: "w-7 h-auto inline-block mr-0.5 opacity-70 text-yellow-600" })), /* @__PURE__ */ React__namespace.createElement("p", { className: "text-base mb-6 text-center" }, "Tina's branch switcher isn't available in local mode.", " ", /* @__PURE__ */ React__namespace.createElement(
      "a",
      {
        target: "_blank",
        className: "transition-all duration-150 ease-out text-blue-600 hover:text-blue-400 hover:underline no-underline",
        href: "https://tina.io/docs/tina-cloud/"
      },
      "Learn more about moving to production with TinaCloud."
    )), /* @__PURE__ */ React__namespace.createElement("p", null, /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        href: "https://tina.io/docs/tina-cloud/",
        target: "_blank",
        as: "a"
      },
      "Read Our Docs",
      " ",
      /* @__PURE__ */ React__namespace.createElement(MdArrowForward, { className: "w-5 h-auto ml-1.5 opacity-80" })
    ))) : listState === "loading" ? /* @__PURE__ */ React__namespace.createElement("div", { style: { margin: "32px auto", textAlign: "center" } }, /* @__PURE__ */ React__namespace.createElement(LoadingDots, { color: "var(--tina-color-primary)" })) : /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, listState === "ready" ? /* @__PURE__ */ React__namespace.createElement(
      BranchSelector$1,
      {
        currentBranch,
        branchList,
        onCreateBranch: (newBranch) => {
          handleCreateBranch(newBranch);
        },
        onChange: (branchName) => {
          chooseBranch(branchName);
        }
      }
    ) : /* @__PURE__ */ React__namespace.createElement("div", { className: "px-6 py-8 w-full h-full flex flex-col items-center justify-center" }, /* @__PURE__ */ React__namespace.createElement("p", { className: "text-base mb-4 text-center" }, "An error occurred while retrieving the branch list."), /* @__PURE__ */ React__namespace.createElement(Button$1, { className: "mb-4", onClick: refreshBranchList }, "Try again ", /* @__PURE__ */ React__namespace.createElement(BiRefresh, { className: "w-6 h-full ml-1 opacity-70" }))))));
  };
  const getFilteredBranchList$1 = (branchList, filter, currentBranchName) => {
    const filteredBranchList = branchList.filter(
      (branch) => !filter || branch.name.includes(filter) || branch.name === currentBranchName
    );
    const currentBranchItem = branchList.find(
      (branch) => branch.name === currentBranchName
    );
    return [
      currentBranchItem || {
        name: currentBranchName,
        indexStatus: { status: "failed" }
      },
      ...filteredBranchList.filter((branch) => branch.name !== currentBranchName)
    ];
  };
  const BranchSelector$1 = ({
    branchList,
    currentBranch,
    onCreateBranch,
    onChange
  }) => {
    const [newBranchName, setNewBranchName] = React__namespace.useState("");
    const [filter, setFilter] = React__namespace.useState("");
    const filteredBranchList = getFilteredBranchList$1(
      branchList,
      filter,
      currentBranch
    );
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex flex-col gap-3" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "block relative group" }, /* @__PURE__ */ React__namespace.createElement(
      BaseTextField,
      {
        placeholder: "Search",
        value: filter,
        onChange: (e) => setFilter(e.target.value)
      }
    ), filter === "" ? /* @__PURE__ */ React__namespace.createElement(BiSearch, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150" }) : /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        onClick: () => {
          setFilter("");
        },
        className: "outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"
      },
      /* @__PURE__ */ React__namespace.createElement(MdOutlineClear, { className: "w-5 h-auto text-gray-600" })
    )), filteredBranchList.length === 0 && /* @__PURE__ */ React__namespace.createElement("div", { className: "block relative text-gray-300 italic py-1" }, "No branches to display"), filteredBranchList.length > 0 && /* @__PURE__ */ React__namespace.createElement("div", { className: "min-w-[192px] max-h-[24rem] overflow-y-auto flex flex-col w-full h-full rounded-lg shadow-inner bg-white border border-gray-200" }, filteredBranchList.map((branch) => {
      var _a;
      const isCurrentBranch = branch.name === currentBranch;
      const indexingStatus = (_a = branch == null ? void 0 : branch.indexStatus) == null ? void 0 : _a.status;
      return /* @__PURE__ */ React__namespace.createElement(
        "div",
        {
          className: `relative text-base py-1.5 px-3 flex items-center gap-1.5 border-l-0 border-t-0 border-r-0 border-b border-gray-50 w-full outline-none transition-all ease-out duration-150 ${indexingStatus !== "complete" ? "bg-gray-50 text-gray-400 pointer-events-none" : isCurrentBranch ? "cursor-pointer bg-blue-50 text-blue-800 pointer-events-none hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50" : "cursor-pointer hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50"}`,
          key: branch.name,
          onClick: () => {
            if (indexingStatus === "complete") {
              onChange(branch.name);
            }
          }
        },
        isCurrentBranch && /* @__PURE__ */ React__namespace.createElement(BiGitBranch, { className: "w-5 h-auto text-blue-500/70" }),
        branch.name,
        indexingStatus === "unknown" && /* @__PURE__ */ React__namespace.createElement("span", { className: "flex-1 w-full flex justify-end items-center gap-2 text-blue-500" }, /* @__PURE__ */ React__namespace.createElement("span", { className: "opacity-50 italic" }, `Unknown`), /* @__PURE__ */ React__namespace.createElement(GrCircleQuestion, { className: "w-5 h-auto opacity-70" })),
        indexingStatus === "inprogress" && /* @__PURE__ */ React__namespace.createElement("span", { className: "flex-1 w-full flex justify-end items-center gap-2 text-blue-500" }, /* @__PURE__ */ React__namespace.createElement("span", { className: "opacity-50 italic" }, `Indexing`), /* @__PURE__ */ React__namespace.createElement(FaSpinner, { className: "w-5 h-auto opacity-70 animate-spin" })),
        indexingStatus === "failed" && /* @__PURE__ */ React__namespace.createElement("span", { className: "flex-1 w-full flex justify-end items-center gap-2 text-red-500" }, /* @__PURE__ */ React__namespace.createElement("span", { className: "opacity-50 italic" }, `Indexing failed`), /* @__PURE__ */ React__namespace.createElement(BiError, { className: "w-5 h-auto opacity-70" })),
        indexingStatus === "timeout" && /* @__PURE__ */ React__namespace.createElement("span", { className: "flex-1 w-full flex justify-end items-center gap-2 text-red-500" }, /* @__PURE__ */ React__namespace.createElement("span", { className: "opacity-50 italic" }, `Indexing timed out`), /* @__PURE__ */ React__namespace.createElement(BiError, { className: "w-5 h-auto opacity-70" })),
        isCurrentBranch && /* @__PURE__ */ React__namespace.createElement("span", { className: "opacity-70 italic" }, ` (current)`)
      );
    })), /* @__PURE__ */ React__namespace.createElement(
      CreateBranch,
      {
        ...{ onCreateBranch, currentBranch, newBranchName, setNewBranchName }
      }
    ));
  };
  const CreateBranch = ({ currentBranch, newBranchName, onCreateBranch, setNewBranchName }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "border-t border-gray-150 pt-4 mt-3 flex flex-col gap-3" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "text-sm" }, "Create a new branch from ", /* @__PURE__ */ React__namespace.createElement("b", null, currentBranch), ". Once created you will need to wait for indexing to complete before you can switch branches."), /* @__PURE__ */ React__namespace.createElement("div", { className: "flex justify-between items-center w-full gap-3" }, /* @__PURE__ */ React__namespace.createElement(
      BaseTextField,
      {
        placeholder: "Branch Name",
        value: newBranchName,
        onChange: (e) => setNewBranchName(e.target.value)
      }
    ), /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        className: "flex-0 flex items-center gap-2 whitespace-nowrap",
        size: "medium",
        variant: "white",
        disabled: newBranchName === "",
        onClick: () => onCreateBranch(newBranchName)
      },
      /* @__PURE__ */ React__namespace.createElement(BiPlus, { className: "w-5 h-auto opacity-70" }),
      " Create Branch"
    )));
  };
  function formatBranchName(str) {
    const pattern = /[^/\w-]+/g;
    const formattedStr = str.replace(pattern, "-");
    return formattedStr.toLowerCase();
  }
  const BranchSwitcher = (props) => {
    const cms = useCMS$1();
    const usingEditorialWorkflow = cms.api.tina.usingEditorialWorkflow;
    if (usingEditorialWorkflow) {
      return /* @__PURE__ */ React__namespace.createElement(EditoralBranchSwitcher, { ...props });
    } else {
      return /* @__PURE__ */ React__namespace.createElement(BranchSwitcherLegacy, { ...props });
    }
  };
  const EditoralBranchSwitcher = ({
    listBranches,
    createBranch,
    chooseBranch,
    setModalTitle
  }) => {
    var _a, _b;
    const cms = useCMS$1();
    const isLocalMode = (_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isLocalMode;
    const [viewState, setViewState] = React__namespace.useState("list");
    const [listState, setListState] = React__namespace.useState("loading");
    const [branchList, setBranchList] = React__namespace.useState([]);
    const { currentBranch } = useBranchData();
    const initialBranch = React__namespace.useMemo(() => currentBranch, []);
    React__namespace.useEffect(() => {
      if (initialBranch != currentBranch) {
        window.location.reload();
      }
    }, [currentBranch]);
    React__namespace.useEffect(() => {
      if (!setModalTitle)
        return;
      if (viewState === "create") {
        setModalTitle("Create Branch");
      } else {
        setModalTitle("Branch List");
      }
    }, [viewState, setModalTitle]);
    const handleCreateBranch = React__namespace.useCallback((value) => {
      setListState("loading");
      createBranch({
        branchName: formatBranchName(value),
        baseBranch: currentBranch
      }).then(async (createdBranchName) => {
        cms.alerts.success("Branch created.");
        setBranchList((oldBranchList) => {
          return [
            ...oldBranchList,
            {
              indexStatus: { status: "unknown" },
              name: createdBranchName
            }
          ];
        });
        setListState("ready");
      });
    }, []);
    const refreshBranchList = React__namespace.useCallback(async () => {
      setListState("loading");
      await listBranches().then((data) => {
        setBranchList(data);
        setListState("ready");
      }).catch(() => setListState("error"));
    }, []);
    React__namespace.useEffect(() => {
      refreshBranchList();
    }, []);
    React__namespace.useEffect(() => {
      if (listState === "ready") {
        const cancelFuncs = [];
        branchList.filter(
          (x) => {
            var _a2, _b2;
            return ((_a2 = x == null ? void 0 : x.indexStatus) == null ? void 0 : _a2.status) === "inprogress" || ((_b2 = x == null ? void 0 : x.indexStatus) == null ? void 0 : _b2.status) === "unknown";
          }
        ).forEach(async (x) => {
          const [
            // When this promise resolves, we know the index status is no longer 'inprogress' or 'unknown'
            waitForIndexStatusPromise,
            // Calling this function will cancel the polling
            cancelWaitForIndexFunc
          ] = cms.api.tina.waitForIndexStatus({
            ref: x.name
          });
          cancelFuncs.push(cancelWaitForIndexFunc);
          waitForIndexStatusPromise.then((indexStatus) => {
            setBranchList((previousBranchList) => {
              const newBranchList = Array.from(previousBranchList);
              const index = newBranchList.findIndex((y) => y.name === x.name);
              newBranchList[index].indexStatus = indexStatus;
              return newBranchList;
            });
          }).catch((e) => {
            if (e.message === "AsyncPoller: cancelled")
              return;
            console.error(e);
          });
        });
        return () => {
          cancelFuncs.forEach((x) => {
            x();
          });
        };
      }
    }, [listState, branchList.length]);
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full flex justify-center p-5" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full max-w-form" }, isLocalMode ? /* @__PURE__ */ React__namespace.createElement("div", { className: "px-6 py-8 w-full h-full flex flex-col items-center justify-center" }, /* @__PURE__ */ React__namespace.createElement("p", { className: "text-base mb-4 text-center" }, /* @__PURE__ */ React__namespace.createElement(AiFillWarning, { className: "w-7 h-auto inline-block mr-0.5 opacity-70 text-yellow-600" })), /* @__PURE__ */ React__namespace.createElement("p", { className: "text-base mb-6 text-center" }, "Tina's branch switcher isn't available in local mode.", " ", /* @__PURE__ */ React__namespace.createElement(
      "a",
      {
        target: "_blank",
        className: "transition-all duration-150 ease-out text-blue-600 hover:text-blue-400 hover:underline no-underline",
        href: "https://tina.io/docs/tina-cloud/"
      },
      "Learn more about moving to production with TinaCloud."
    )), /* @__PURE__ */ React__namespace.createElement("p", null, /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        href: "https://tina.io/docs/tina-cloud/",
        target: "_blank",
        as: "a"
      },
      "Read Our Docs",
      " ",
      /* @__PURE__ */ React__namespace.createElement(MdArrowForward, { className: "w-5 h-auto ml-1.5 opacity-80" })
    ))) : viewState === "create" ? /* @__PURE__ */ React__namespace.createElement(
      BranchCreator,
      {
        currentBranch,
        setViewState,
        handleCreateBranch
      }
    ) : listState === "loading" ? /* @__PURE__ */ React__namespace.createElement("div", { style: { margin: "32px auto", textAlign: "center" } }, /* @__PURE__ */ React__namespace.createElement(LoadingDots, { color: "var(--tina-color-primary)" })) : /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, listState === "ready" ? /* @__PURE__ */ React__namespace.createElement(
      BranchSelector,
      {
        currentBranch,
        branchList,
        createBranch: () => {
          setViewState("create");
        },
        onChange: (branchName) => {
          chooseBranch(branchName);
        }
      }
    ) : /* @__PURE__ */ React__namespace.createElement("div", { className: "px-6 py-8 w-full h-full flex flex-col items-center justify-center" }, /* @__PURE__ */ React__namespace.createElement("p", { className: "text-base mb-4 text-center" }, "An error occurred while retrieving the branch list."), /* @__PURE__ */ React__namespace.createElement(Button$1, { className: "mb-4", onClick: refreshBranchList }, "Try again ", /* @__PURE__ */ React__namespace.createElement(BiRefresh, { className: "w-6 h-full ml-1 opacity-70" }))))));
  };
  const getFilteredBranchList = (branchList, search, currentBranchName, filter = "all") => {
    const filteredBranchList = branchList.filter(
      (branch) => !search || branch.name.includes(search) || branch.name === currentBranchName
    ).filter((branch) => {
      if (branch.protected)
        return true;
      if (filter === "all")
        return true;
      if (filter === "content") {
        return branch.name.startsWith("tina/");
      }
    });
    const currentBranchItem = branchList.find(
      (branch) => branch.name === currentBranchName
    );
    return [
      currentBranchItem || {
        name: currentBranchName,
        indexStatus: { status: "failed" }
      },
      ...filteredBranchList.filter((branch) => branch.name !== currentBranchName)
    ];
  };
  const sortBranchListFn = (sortValue) => {
    return (a, b) => {
      if (sortValue === "default") {
        return 0;
      } else if (sortValue === "updated") {
        return b.indexStatus.timestamp - a.indexStatus.timestamp;
      } else if (sortValue === "name") {
        return a.name.localeCompare(b.name);
      }
    };
  };
  const BranchCreator = ({ setViewState, handleCreateBranch, currentBranch }) => {
    const [branchName, setBranchName] = React__namespace.useState("");
    return /* @__PURE__ */ React__namespace.createElement("form", null, /* @__PURE__ */ React__namespace.createElement("div", { className: "" }, /* @__PURE__ */ React__namespace.createElement("p", { className: "text-base text-gray-700 mb-4" }, "Create a new branch from ", /* @__PURE__ */ React__namespace.createElement("strong", null, currentBranch), "."), /* @__PURE__ */ React__namespace.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React__namespace.createElement(FieldLabel, { name: "current-branch-name" }, "Current Branch Name"), /* @__PURE__ */ React__namespace.createElement(
      BaseTextField,
      {
        name: "current-branch-name",
        value: currentBranch,
        disabled: true
      }
    )), /* @__PURE__ */ React__namespace.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React__namespace.createElement(FieldLabel, { name: "branch-name" }, "New Branch Name"), /* @__PURE__ */ React__namespace.createElement(
      PrefixedTextField,
      {
        placeholder: "",
        name: "branch-name",
        value: branchName,
        onChange: (e) => setBranchName(e.target.value)
      }
    ))), /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full flex justify-between gap-4 items-center" }, /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        style: { flexGrow: 1 },
        onClick: () => {
          setViewState("list");
        }
      },
      "Cancel"
    ), /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        variant: "primary",
        type: "submit",
        style: { flexGrow: 2 },
        disabled: branchName === "",
        onClick: () => {
          handleCreateBranch("tina/" + branchName);
        }
      },
      "Create Branch ",
      /* @__PURE__ */ React__namespace.createElement(BiGitBranch, { className: "w-5 h-full ml-1 opacity-70" })
    )));
  };
  const BranchSelector = ({
    branchList,
    currentBranch,
    onChange,
    createBranch
  }) => {
    var _a, _b, _c, _d;
    const [search, setSearch] = React__namespace.useState("");
    const [filter, setFilter] = React__namespace.useState("content");
    const [sortValue, setSortValue] = React__namespace.useState("default");
    const cms = useCMS$1();
    const filteredBranchList = getFilteredBranchList(
      branchList,
      search,
      currentBranch,
      filter
    ).sort(sortBranchListFn(sortValue));
    const previewFunction = (_d = (_c = (_b = (_a = cms.api.tina.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.config) == null ? void 0 : _c.ui) == null ? void 0 : _d.previewUrl;
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex flex-col gap-4" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "flex items-end space-x-4" }, /* @__PURE__ */ React__namespace.createElement("div", null, /* @__PURE__ */ React__namespace.createElement(
      "label",
      {
        htmlFor: "search",
        className: "text-xs mb-1 flex flex-col font-bold"
      },
      "Search"
    ), /* @__PURE__ */ React__namespace.createElement("div", { className: "block relative group h-fit mb-auto" }, /* @__PURE__ */ React__namespace.createElement(
      BaseTextField,
      {
        placeholder: "Search",
        value: search,
        onChange: (e) => setSearch(e.target.value)
      }
    ), search === "" ? /* @__PURE__ */ React__namespace.createElement(BiSearch, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150" }) : /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        onClick: () => {
          setSearch("");
        },
        className: "outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"
      },
      /* @__PURE__ */ React__namespace.createElement(MdOutlineClear, { className: "w-5 h-auto text-gray-600" })
    ))), /* @__PURE__ */ React__namespace.createElement("div", null, /* @__PURE__ */ React__namespace.createElement(
      "label",
      {
        htmlFor: "branch-type",
        className: "text-xs mb-1 flex flex-col font-bold"
      },
      "Branch Type"
    ), /* @__PURE__ */ React__namespace.createElement(
      Select,
      {
        name: "branch-type",
        input: {
          id: "branch-type",
          name: "branch-type",
          value: filter,
          onChange: (e) => setFilter(e.target.value)
        },
        options: [
          {
            label: "Content",
            value: "content"
          },
          {
            label: "All",
            value: "all"
          }
        ]
      }
    ))), filteredBranchList.length === 0 && /* @__PURE__ */ React__namespace.createElement("div", { className: "block relative text-gray-300 italic py-1" }, "No branches to display"), filteredBranchList.length > 0 && /* @__PURE__ */ React__namespace.createElement("div", { className: "min-w-[192px] max-h-[24rem] overflow-y-auto flex flex-col w-full h-full rounded-lg shadow-inner bg-white border border-gray-200" }, filteredBranchList.map((branch) => {
      var _a2, _b2;
      const isCurrentBranch = branch.name === currentBranch;
      const indexingStatus = (_a2 = branch == null ? void 0 : branch.indexStatus) == null ? void 0 : _a2.status;
      return /* @__PURE__ */ React__namespace.createElement(
        "div",
        {
          className: `relative text-base py-1.5 px-3 flex items-center gap-1.5 border-l-0 border-t-0 border-r-0 border-gray-50 w-full outline-none transition-all ease-out duration-150 ${indexingStatus !== "complete" ? "bg-gray-50 text-gray-400" : isCurrentBranch ? "border-blue-500 border-l-5 bg-blue-50 text-blue-800 border-b-0" : "border-b-2"}`,
          key: branch.name
        },
        /* @__PURE__ */ React__namespace.createElement("div", { className: "w-1/2" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "flex-0" }, branch.protected && /* @__PURE__ */ React__namespace.createElement(BiLock, { className: "w-5 h-auto opacity-70 text-blue-500" })), /* @__PURE__ */ React__namespace.createElement("div", { className: "truncate flex-1" }, branch.name)), indexingStatus !== "complete" && /* @__PURE__ */ React__namespace.createElement("div", { className: "w-fit" }, /* @__PURE__ */ React__namespace.createElement(IndexStatus, { indexingStatus: branch.indexStatus.status }))),
        /* @__PURE__ */ React__namespace.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "text-xs font-bold" }, "Last Updated"), /* @__PURE__ */ React__namespace.createElement("span", { className: "text-sm leading-tight" }, dateFns.formatDistanceToNow(
          new Date(branch.indexStatus.timestamp),
          {
            addSuffix: true
          }
        ))),
        /* @__PURE__ */ React__namespace.createElement("div", { className: "flex items-center" }, indexingStatus === "complete" && !isCurrentBranch && /* @__PURE__ */ React__namespace.createElement(
          Button$1,
          {
            variant: "white",
            size: "custom",
            onClick: () => {
              onChange(branch.name);
            },
            className: "mr-auto cursor-pointer text-sm h-9 px-4 flex items-center gap-1"
          },
          /* @__PURE__ */ React__namespace.createElement(BiPencil, { className: "h-4 w-auto text-blue-500 opacity-70 -mt-px" }),
          " ",
          "Select"
        ), (branch.githubPullRequestUrl || typeof previewFunction === "function") && /* @__PURE__ */ React__namespace.createElement("div", { className: "ml-auto" }, /* @__PURE__ */ React__namespace.createElement(
          OverflowMenu$1,
          {
            toolbarItems: [
              branch.githubPullRequestUrl && {
                name: "github-pr",
                label: "View in GitHub",
                Icon: /* @__PURE__ */ React__namespace.createElement(BiLinkExternal, { className: "w-5 h-auto text-blue-500 opacity-70" }),
                onMouseDown: () => {
                  window.open(
                    branch.githubPullRequestUrl,
                    "_blank"
                  );
                }
              },
              typeof previewFunction === "function" && ((_b2 = previewFunction({ branch: branch.name })) == null ? void 0 : _b2.url) && {
                name: "preview",
                label: "Preview",
                onMouseDown: () => {
                  var _a3;
                  const previewUrl = (_a3 = previewFunction({
                    branch: branch.name
                  })) == null ? void 0 : _a3.url;
                  window.open(previewUrl, "_blank");
                }
              }
            ].filter(Boolean)
          }
        )))
      );
    })));
  };
  const IndexStatus = ({ indexingStatus }) => {
    const styles = {
      complete: {
        classes: "",
        content: () => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null)
      },
      unknown: {
        classes: "text-blue-500 border-blue-500",
        content: () => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(GrCircleQuestion, { className: "w-3 h-auto" }), /* @__PURE__ */ React__namespace.createElement("span", { className: "" }, `Unknown`))
      },
      inprogress: {
        classes: "text-blue-500 border-blue-500",
        content: () => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(FaSpinner, { className: "w-3 h-auto animate-spin" }), /* @__PURE__ */ React__namespace.createElement("span", { className: "" }, `Indexing`))
      },
      failed: {
        classes: "text-red-500 border-red-500",
        content: () => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(BiError, { className: "w-3 h-auto" }), /* @__PURE__ */ React__namespace.createElement("span", { className: "" }, `Indexing failed`))
      },
      timeout: {
        classes: "text-red-500 border-red-500",
        content: () => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(BiError, { className: "w-3 h-auto" }), /* @__PURE__ */ React__namespace.createElement("span", { className: "" }, `Indexing timed out`))
      }
    };
    return /* @__PURE__ */ React__namespace.createElement(
      "span",
      {
        className: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border space-x-1 ${styles[indexingStatus].classes}`
      },
      styles[indexingStatus].content()
    );
  };
  class BranchSwitcherPlugin {
    constructor(options) {
      this.__type = "screen";
      this.Icon = BiGitRepoForked;
      this.name = "Select Branch";
      this.layout = "popup";
      this.Component = () => {
        return /* @__PURE__ */ React__namespace.createElement(
          BranchSwitcher,
          {
            listBranches: this.listBranches,
            createBranch: this.createBranch,
            chooseBranch: this.chooseBranch
          }
        );
      };
      this.listBranches = options.listBranches;
      this.createBranch = options.createBranch;
      this.chooseBranch = options.chooseBranch;
    }
  }
  class GlobalFormPlugin {
    constructor(form, icon, layout) {
      this.form = form;
      this.__type = "screen";
      this.name = form.label;
      this.Icon = icon || MdOutlineSettings;
      this.layout = layout || "popup";
      this.Component = () => {
        const cms = useCMS();
        const cmsForm = cms.state.forms.find(
          ({ tinaForm }) => tinaForm.id === form.id
        );
        return /* @__PURE__ */ React__namespace.createElement(FormBuilder, { form: cmsForm });
      };
    }
  }
  let Alerts$1 = class Alerts {
    constructor(events, map = {}) {
      this.events = events;
      this.map = map;
      this.alerts = /* @__PURE__ */ new Map();
      this.mapEventToAlert = (event) => {
        const toAlert = this.map[event.type];
        if (toAlert) {
          let getArgs;
          if (typeof toAlert === "function") {
            getArgs = toAlert;
          } else {
            getArgs = () => toAlert;
          }
          const { level, message, timeout } = getArgs(event);
          this.add(level, message, timeout);
        }
      };
      this.events.subscribe("*", this.mapEventToAlert);
    }
    setMap(eventsToAlerts) {
      this.map = {
        ...this.map,
        ...eventsToAlerts
      };
    }
    add(level, message, timeout = 4e3) {
      const alert = {
        level,
        message,
        timeout,
        id: `${message}|${Date.now()}`
      };
      this.alerts.set(alert.id, alert);
      this.events.dispatch({ type: "alerts:add", alert });
      let timeoutId = null;
      const dismiss = () => {
        clearTimeout(timeoutId);
        this.dismiss(alert);
      };
      timeoutId = level !== "error" ? setTimeout(dismiss, alert.timeout) : null;
      return dismiss;
    }
    dismiss(alert) {
      this.alerts.delete(alert.id);
      this.events.dispatch({ type: "alerts:remove", alert });
    }
    subscribe(cb) {
      const unsub = this.events.subscribe("alerts", cb);
      return () => unsub();
    }
    get all() {
      return Array.from(this.alerts.values());
    }
    info(message, timeout) {
      return this.add("info", message, timeout);
    }
    success(message, timeout) {
      return this.add("success", message, timeout);
    }
    warn(message, timeout) {
      return this.add("warn", message, timeout);
    }
    error(message, timeout) {
      return this.add("error", message, timeout);
    }
  };
  class PluginTypeManager {
    constructor(events) {
      this.events = events;
      this.plugins = {};
    }
    /**
     * Gets the [[PluginType|collection of plugins]] for the given type.
     *
     * #### Example: Basic Usage
     *
     * ```ts
     * const colorPlugins = cms.plugins.get("color")
     * ```
     *
     * #### Example: Advanced Types
     *
     * A type param can be added to specify the kind of Plugin
     * that is being listed.
     *
     * ```ts
     * const colorPlugins = cms.plugins.get<ColorPlugin>("color")
     * ```
     *
     * @param type The type of plugins to be retrieved
     * @typeparam P A subclass of Plugin. Optional.
     */
    getType(type) {
      return this.plugins[type] = this.plugins[type] || new PluginType(type, this.events);
    }
    /**
     * An alias to [[get]]
     *
     * ### !DEPRECATED!
     *
     * This name is unnecessarily verbose and weird.
     */
    findOrCreateMap(type) {
      return this.getType(type);
    }
    /**
     * Adds a Plugin to the CMS.
     *
     * #### Example: Basic Usage
     *
     * ```js
     * cms.plugins.add({ __type: "color", name: "red" })
     * ```
     *
     * #### Example: Advanced Types
     *
     * ```ts
     * interface ColorPlugin extends Plugin {
     *   __type: "color"
     *   hex: string
     *   rgb: string
     * }
     *
     * cms.plugins.add<ColorPlugin>({
     *   __type: "color",
     *   name: "red",
     *   hex: "#FF0000",
     *   rgb: "RGBA(255, 0, 0, 1)"
     * })
     * ```
     *
     * @typeparam P A subclass of Plugin. Optional.
     * @param plugin
     * @todo Consider returning the plugin which was just added.
     */
    add(plugin) {
      this.findOrCreateMap(plugin.__type).add(plugin);
    }
    /**
     * Removes the given plugin from the CMS.
     *
     * #### Example
     *
     * In this example a plugin is added to the CMS and removed
     * 5 seconds later.
     *
     * ```ts
     * const redPlugin = {
     *   __type: "color",
     *   name: "red",
     *   hex: "#FF0000",
     *   rgb: "RGBA(255, 0, 0, 1)"
     * }
     *
     * cms.plugins.add(redPlugin)
     *
     * setTimeout(() => {
     *   cms.plugins.remove(redPlugin)
     * }, 5000)
     * ```
     *
     * @typeparam P A subclass of Plugin. Optional.
     * @param plugin The plugin to be removed from the CMS.
     */
    remove(plugin) {
      this.findOrCreateMap(plugin.__type).remove(plugin);
    }
    /**
     * Returns a list of all the plugins of the given type.
     *
     * #### Example: Basic Usage
     *
     * ```ts
     * cms.plugins.all("color").forEach(color => {
     *   console.log(color.name)
     * })
     * ```
     *
     * #### Example: Advanced Types
     *
     * A generic can be added to specify the type of plugins
     * that are being retrieved.
     *
     * ```ts
     * cms.plugins.all<ColorPlugin>("color").forEach(color => {
     *   console.log(color.name, color.hex)
     * })
     * ```
     *
     * @typeparam P A subclass of Plugin. Optional.
     * @param type The name of the plugin
     * @returns An array of all plugins of the given type.
     */
    all(type) {
      return this.findOrCreateMap(type).all();
    }
  }
  class PluginType {
    /**
     *
     * @param __type The `__type` of plugin being managed.
     */
    constructor(__type, events) {
      this.__type = __type;
      this.events = events;
      this.__plugins = {};
    }
    /**
     * Adds a new plugin to the collection.
     *
     * ### Example
     *
     * ```ts
     * interface ColorPlugin extends Plugin {
     *   hex: string
     * }
     *
     * const colorPlugins = new PluginType<ColorPlugin>("color")
     *
     * colorPlugins.add({ name: "red", hex: "#f00" })
     * ```
     *
     * @param plugin A new plugin. The `__type` is optional and will be added if it's missing.
     */
    add(plugin) {
      const p = plugin;
      if (!p.__type) {
        p.__type = this.__type;
      }
      this.__plugins[p.name] = p;
      this.events.dispatch({ type: `plugin:add:${this.__type}` });
    }
    all() {
      return Object.keys(this.__plugins).map((name) => this.__plugins[name]);
    }
    /**
     *
     * Looks up a plugin by it's `name`.
     *
     * ### Example
     *
     * ```ts
     * const colorPlugins = new PluginType<ColorPlugin>("color")
     *
     * colorPlugins.add({ name: "red", hex: "#f00" })
     *
     * colorPlugins.find("red")  // { __type: "color", name: "red", hex: "#f00" }
     * colorPlugin.find("large") // undefined
     * ```
     *
     * @param name The `name` of the plugin to be retrieved.
     */
    find(name) {
      return this.__plugins[name];
    }
    /**
     * Pass this function a plugin or the `name` of a plugin to have
     * it be removed from the CMS.
     *
     * @param pluginOrName The `name` of a plugin, or the plugin itself.
     * @returns The plugin that was removed, or `undefined` if it was not found.
     */
    remove(pluginOrName) {
      const name = typeof pluginOrName === "string" ? pluginOrName : pluginOrName.name;
      const plugin = this.__plugins[name];
      delete this.__plugins[name];
      this.events.dispatch({ type: `plugin:remove:${this.__type}` });
      return plugin;
    }
    subscribe(cb) {
      return this.events.subscribe(`plugin:*:${this.__type}`, cb);
    }
  }
  class EventBus {
    constructor() {
      this.listeners = /* @__PURE__ */ new Set();
    }
    subscribe(event, callback) {
      let events;
      if (typeof event === "string") {
        events = [event];
      } else {
        events = event;
      }
      const newListeners = events.map(
        (event2) => new Listener(event2, callback)
      );
      newListeners.forEach((newListener) => this.listeners.add(newListener));
      return () => {
        newListeners.forEach((listener) => this.listeners.delete(listener));
      };
    }
    dispatch(event) {
      if (!this.listeners)
        return;
      const listenerSnapshot = Array.from(this.listeners.values());
      listenerSnapshot.forEach((listener) => listener.handleEvent(event));
    }
  }
  class Listener {
    constructor(eventPattern, callback) {
      this.eventPattern = eventPattern;
      this.callback = callback;
    }
    handleEvent(event) {
      if (this.watchesEvent(event)) {
        this.callback(event);
        return true;
      }
      return false;
    }
    watchesEvent(currentEvent) {
      if (this.eventPattern === "*")
        return true;
      const eventParts = currentEvent.type.split(":");
      const patternParts = this.eventPattern.split(":");
      let index = 0;
      let ignoresEvent = false;
      while (!ignoresEvent && index < patternParts.length) {
        const wildcard = patternParts[index] === "*";
        const matchingParts = patternParts[index] === eventParts[index];
        ignoresEvent = !(wildcard || matchingParts);
        index++;
      }
      return !ignoresEvent;
    }
  }
  const s3ErrorRegex = /<Error>.*<Code>(.+)<\/Code>.*<Message>(.+)<\/Message>.*/;
  class DummyMediaStore {
    constructor() {
      this.accept = "*";
    }
    async persist(files) {
      return files.map(({ directory, file }) => ({
        id: file.name,
        type: "file",
        directory,
        filename: file.name
      }));
    }
    async list() {
      const items2 = [];
      return {
        items: items2,
        nextOffset: 0
      };
    }
    async delete() {
    }
  }
  class TinaMediaStore {
    constructor(cms, staticMedia) {
      this.fetchFunction = (input, init) => {
        return fetch(input, init);
      };
      this.accept = DEFAULT_MEDIA_UPLOAD_TYPES;
      this.maxSize = 100 * 1024 * 1024;
      this.parse = (img) => {
        return img.src;
      };
      this.cms = cms;
      if (staticMedia && Object.keys(staticMedia).length > 0) {
        this.isStatic = true;
        this.staticMedia = staticMedia;
      }
    }
    setup() {
      var _a, _b, _c, _d;
      if (!this.api) {
        this.api = (_b = (_a = this.cms) == null ? void 0 : _a.api) == null ? void 0 : _b.tina;
        this.isLocal = !!this.api.isLocalMode;
        if (!this.isStatic) {
          const contentApiUrl = new URL(this.api.contentApiUrl);
          this.url = `${contentApiUrl.origin}/media`;
          if (!this.isLocal) {
            if ((_d = (_c = this.api.options) == null ? void 0 : _c.tinaioConfig) == null ? void 0 : _d.assetsApiUrlOverride) {
              const url = new URL(this.api.assetsApiUrl);
              this.url = `${url.origin}/v1/${this.api.clientId}`;
            } else {
              this.url = `${contentApiUrl.origin.replace(
                "content",
                "assets"
              )}/v1/${this.api.clientId}`;
            }
          }
        }
      }
    }
    async isAuthenticated() {
      this.setup();
      return await this.api.authProvider.isAuthenticated();
    }
    async persist_cloud(media) {
      const newFiles = [];
      if (await this.isAuthenticated()) {
        for (const item of media) {
          let directory = item.directory;
          if (directory == null ? void 0 : directory.endsWith("/")) {
            directory = directory.substr(0, directory.length - 1);
          }
          const path = `${directory && directory !== "/" ? `${directory}/${item.file.name}` : item.file.name}`;
          const res = await this.api.authProvider.fetchWithToken(
            `${this.url}/upload_url/${path}`,
            { method: "GET" }
          );
          if (res.status === 412) {
            const { message = "Unexpected error generating upload url" } = await res.json();
            throw new Error(message);
          }
          const { signedUrl, requestId } = await res.json();
          if (!signedUrl) {
            throw new Error("Unexpected error generating upload url");
          }
          const uploadRes = await this.fetchFunction(signedUrl, {
            method: "PUT",
            body: item.file,
            headers: {
              "Content-Type": item.file.type || "application/octet-stream",
              "Content-Length": String(item.file.size)
            }
          });
          if (!uploadRes.ok) {
            const xmlRes = await uploadRes.text();
            const matches = s3ErrorRegex.exec(xmlRes);
            console.error(xmlRes);
            if (!matches) {
              throw new Error("Unexpected error uploading media asset");
            } else {
              throw new Error(`Upload error: '${matches[2]}'`);
            }
          }
          const updateStartTime = Date.now();
          while (true) {
            await new Promise((resolve) => setTimeout(resolve, 1e3));
            const { error, message } = await this.api.getRequestStatus(requestId);
            if (error !== void 0) {
              if (error) {
                throw new Error(message);
              } else {
                break;
              }
            }
            if (Date.now() - updateStartTime > 3e4) {
              throw new Error("Time out waiting for upload to complete");
            }
          }
          const src = `https://assets.tina.io/${this.api.clientId}/${path}`;
          newFiles.push({
            directory: item.directory,
            filename: item.file.name,
            id: item.file.name,
            type: "file",
            thumbnails: {
              "75x75": src,
              "400x400": src,
              "1000x1000": src
            },
            src
          });
        }
      }
      return newFiles;
    }
    async persist_local(media) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      const newFiles = [];
      const hasTinaMedia = Object.keys(
        ((_c = (_b = (_a = this.cms.api.tina.schema.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.media) == null ? void 0 : _c.tina) || {}
      ).includes("mediaRoot") && Object.keys(
        ((_f = (_e = (_d = this.cms.api.tina.schema.schema) == null ? void 0 : _d.config) == null ? void 0 : _e.media) == null ? void 0 : _f.tina) || {}
      ).includes("publicFolder");
      let folder = hasTinaMedia ? (_i = (_h = (_g = this.cms.api.tina.schema.schema) == null ? void 0 : _g.config) == null ? void 0 : _h.media) == null ? void 0 : _i.tina.mediaRoot : "/";
      if (!folder.startsWith("/")) {
        folder = "/" + folder;
      }
      if (!folder.endsWith("/")) {
        folder = folder + "/";
      }
      for (const item of media) {
        const { file, directory } = item;
        let strippedDirectory = directory;
        if (strippedDirectory.startsWith("/")) {
          strippedDirectory = strippedDirectory.substr(1) || "";
        }
        if (strippedDirectory.endsWith("/")) {
          strippedDirectory = strippedDirectory.substr(0, strippedDirectory.length - 1) || "";
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("directory", directory);
        formData.append("filename", file.name);
        let uploadPath = `${strippedDirectory ? `${strippedDirectory}/${file.name}` : file.name}`;
        if (uploadPath.startsWith("/")) {
          uploadPath = uploadPath.substr(1);
        }
        const filePath = `${strippedDirectory ? `${folder}${strippedDirectory}/${file.name}` : folder + file.name}`;
        const res = await this.fetchFunction(`${this.url}/upload/${uploadPath}`, {
          method: "POST",
          body: formData
        });
        if (res.status != 200) {
          const responseData = await res.json();
          throw new Error(responseData.message);
        }
        const fileRes = await res.json();
        if (fileRes == null ? void 0 : fileRes.success) {
          const parsedRes = {
            type: "file",
            id: file.name,
            filename: file.name,
            directory,
            src: filePath,
            thumbnails: {
              "75x75": filePath,
              "400x400": filePath,
              "1000x1000": filePath
            }
          };
          newFiles.push(parsedRes);
        } else {
          throw new Error("Unexpected error uploading media");
        }
      }
      return newFiles;
    }
    async persist(media) {
      this.setup();
      if (this.isLocal) {
        return this.persist_local(media);
      } else {
        return this.persist_cloud(media);
      }
    }
    genThumbnail(src, dimensions) {
      return !this.isLocal ? `${src}?fit=crop&max-w=${dimensions.w}&max-h=${dimensions.h}` : src;
    }
    async list(options) {
      this.setup();
      if (this.staticMedia) {
        const offset = options.offset || 0;
        const media = this.staticMedia[String(offset)];
        let hasMore = false;
        if (this.staticMedia[String(Number(offset) + 20)]) {
          hasMore = true;
        }
        if (options.directory) {
          let depth = 0;
          const pathToDirectory = options.directory.split("/");
          let currentFolder = media;
          let hasMore2 = false;
          while (depth < pathToDirectory.length) {
            const nextFolder = currentFolder.find(
              (item) => item.type === "dir" && item.filename === pathToDirectory[depth]
            );
            if (nextFolder) {
              const offset2 = options.offset || 0;
              currentFolder = nextFolder.children[String(offset2)];
              if (nextFolder.children[String(Number(offset2) + 20)]) {
                hasMore2 = true;
              }
            }
            depth++;
          }
          return {
            items: currentFolder,
            nextOffset: hasMore2 ? Number(offset) + 20 : null
          };
        }
        return { items: media, nextOffset: hasMore ? Number(offset) + 20 : null };
      }
      let res;
      if (!this.isLocal) {
        if (await this.isAuthenticated()) {
          res = await this.api.authProvider.fetchWithToken(
            `${this.url}/list/${options.directory || ""}?limit=${options.limit || 20}${options.offset ? `&cursor=${options.offset}` : ""}`
          );
          if (res.status == 401) {
            throw E_UNAUTHORIZED;
          }
          if (res.status == 404) {
            throw E_BAD_ROUTE;
          }
        } else {
          throw new Error("Not authenticated");
        }
      } else {
        res = await this.fetchFunction(
          `${this.url}/list/${options.directory || ""}?limit=${options.limit || 20}${options.offset ? `&cursor=${options.offset}` : ""}`
        );
        if (res.status == 404) {
          throw E_BAD_ROUTE;
        }
        if (res.status >= 500) {
          const { e } = await res.json();
          const error = new Error("Unexpected error");
          console.error(e);
          throw error;
        }
      }
      const { cursor, files, directories } = await res.json();
      const items2 = [];
      for (const dir of directories) {
        items2.push({
          type: "dir",
          id: dir,
          directory: options.directory || "",
          filename: dir
        });
      }
      for (const file of files) {
        items2.push({
          directory: options.directory || "",
          type: "file",
          id: file.filename,
          filename: file.filename,
          src: file.src,
          thumbnails: options.thumbnailSizes.reduce((acc, { w, h }) => {
            acc[`${w}x${h}`] = this.genThumbnail(file.src, { w, h });
            return acc;
          }, {})
        });
      }
      return {
        items: items2,
        nextOffset: cursor || 0
      };
    }
    async delete(media) {
      const path = `${media.directory ? `${media.directory}/${media.filename}` : media.filename}`;
      if (!this.isLocal) {
        if (await this.isAuthenticated()) {
          const res = await this.api.authProvider.fetchWithToken(
            `${this.url}/${path}`,
            {
              method: "DELETE"
            }
          );
          if (res.status == 200) {
            const { requestId } = await res.json();
            const deleteStartTime = Date.now();
            while (true) {
              await new Promise((resolve) => setTimeout(resolve, 1e3));
              const { error, message } = await this.api.getRequestStatus(requestId);
              if (error !== void 0) {
                if (error) {
                  throw new Error(message);
                } else {
                  break;
                }
              }
              if (Date.now() - deleteStartTime > 3e4) {
                throw new Error("Time out waiting for delete to complete");
              }
            }
          } else {
            throw new Error("Unexpected error deleting media asset");
          }
        } else {
          throw E_UNAUTHORIZED;
        }
      } else {
        await this.fetchFunction(`${this.url}/${path}`, {
          method: "DELETE"
        });
      }
    }
  }
  const encodeUrlIfNeeded = (url) => {
    if (url) {
      try {
        return new URL(url).toString();
      } catch (e) {
        return url;
      }
    } else {
      return url;
    }
  };
  let MediaManager$1 = class MediaManager {
    constructor(store, events) {
      this.store = store;
      this.events = events;
      this._pageSize = 36;
    }
    get isConfigured() {
      return !(this.store instanceof DummyMediaStore);
    }
    get pageSize() {
      return this._pageSize;
    }
    set pageSize(pageSize) {
      this._pageSize = pageSize;
      this.events.dispatch({
        type: "media:pageSize",
        pageSize
      });
    }
    open(options = {}) {
      this.events.dispatch({
        type: "media:open",
        ...options
      });
    }
    get accept() {
      return this.store.accept;
    }
    get maxSize() {
      return this.store.maxSize || void 0;
    }
    async persist(files) {
      try {
        this.events.dispatch({ type: "media:upload:start", uploaded: files });
        const media = await this.store.persist(files);
        this.events.dispatch({
          type: "media:upload:success",
          uploaded: files,
          media
        });
        return media;
      } catch (error) {
        console.error(error);
        this.events.dispatch({
          type: "media:upload:failure",
          uploaded: files,
          error
        });
        throw error;
      }
    }
    async delete(media) {
      try {
        this.events.dispatch({ type: "media:delete:start", media });
        await this.store.delete(media);
        this.events.dispatch({
          type: "media:delete:success",
          media
        });
      } catch (error) {
        this.events.dispatch({
          type: "media:delete:failure",
          media,
          error
        });
        throw error;
      }
    }
    async list(options) {
      try {
        this.events.dispatch({ type: "media:list:start", ...options });
        const media = await this.store.list(options);
        media.items = media.items.map((item) => {
          if (item.type === "dir") {
            return item;
          }
          if (item.thumbnails) {
            for (const [size, src] of Object.entries(item.thumbnails)) {
              item.thumbnails[size] = encodeUrlIfNeeded(src);
            }
          }
          return {
            ...item,
            src: encodeUrlIfNeeded(item.src)
          };
        });
        this.events.dispatch({ type: "media:list:success", ...options, media });
        return media;
      } catch (error) {
        this.events.dispatch({ type: "media:list:failure", ...options, error });
        throw error;
      }
    }
  };
  class MediaListError extends Error {
    constructor(config) {
      super(config.message);
      this.ERR_TYPE = "MediaListError";
      this.title = config.title;
      this.docsLink = config.docsLink;
    }
  }
  const E_UNAUTHORIZED = new MediaListError({
    title: "Unauthorized",
    message: "You don't have access to this resource.",
    docsLink: "https://tina.io/docs/reference/media/overview"
  });
  const E_BAD_ROUTE = new MediaListError({
    title: "Bad Route",
    message: "The Cloudinary API route is missing or misconfigured.",
    docsLink: "https://tina.io/docs/reference/media/external/authentication/"
  });
  new MediaListError({
    title: "An Error Occurred",
    message: "Something went wrong accessing your media from TinaCloud.",
    docsLink: ""
    // TODO
  });
  class Flags {
    constructor(events) {
      this.events = events;
      this._flags = /* @__PURE__ */ new Map();
    }
    get(key) {
      return this._flags.get(key);
    }
    set(key, value) {
      this._flags.set(key, value);
      this.events.dispatch({ type: "flag:set", key, value });
    }
  }
  const _CMS = class _CMS2 {
    /**
     * @hidden
     */
    constructor(config = {}) {
      this._enabled = false;
      this.api = {};
      this.unsubscribeHooks = {};
      this.events = new EventBus();
      this.media = new MediaManager$1(new DummyMediaStore(), this.events);
      this.enable = () => {
        this._enabled = true;
        this.events.dispatch(_CMS2.ENABLED);
      };
      this.disable = () => {
        this._enabled = false;
        this.events.dispatch(_CMS2.DISABLED);
      };
      this.toggle = () => {
        if (this.enabled) {
          this.disable();
        } else {
          this.enable();
        }
      };
      this.plugins = new PluginTypeManager(this.events);
      this.flags = new Flags(this.events);
      if (config.media) {
        this.media.store = config.media;
      } else {
        this.media.store = new DummyMediaStore();
      }
      if (config.mediaOptions && config.mediaOptions.pageSize) {
        this.media.pageSize = config.mediaOptions.pageSize;
      }
      if (config.plugins) {
        config.plugins.forEach((plugin) => this.plugins.add(plugin));
      }
      if (config.apis) {
        Object.entries(config.apis).forEach(
          ([name, api]) => this.registerApi(name, api)
        );
      }
      if (config.enabled) {
        this.enable();
      }
    }
    /**
     * Registers a new external API with the CMS.
     *
     * #### Example
     *
     * ```ts
     * import { CoolApi } from "cool-api"
     *
     * cms.registerApi("coolApi", new CoolApi())
     * ```
     *
     * @param name The name used to lookup the external API.
     * @param api An object for interacting with an external API.
     *
     * ### Additional Resources
     *
     * * https://github.com/tinacms/rfcs/blob/master/0010-api-events.md
     */
    registerApi(name, api) {
      if (this.unsubscribeHooks[name]) {
        this.unsubscribeHooks[name]();
      }
      if (api.events instanceof EventBus) {
        const unsubscribeHost = api.events.subscribe(
          "*",
          this.events.dispatch
        );
        const unsubscribeGuest = this.events.subscribe(
          "*",
          (e) => api.events.dispatch(e)
        );
        this.unsubscribeHooks[name] = () => {
          unsubscribeHost();
          unsubscribeGuest();
        };
      }
      this.api[name] = api;
    }
    /**
     * When `true` the CMS is enabled and content can be edited.
     */
    get enabled() {
      return this._enabled;
    }
    /**
     * When `true` the CMS is disabled and content cannot be edited.
     */
    get disabled() {
      return !this._enabled;
    }
  };
  _CMS.ENABLED = { type: "cms:enable" };
  _CMS.DISABLED = { type: "cms:disable" };
  let CMS = _CMS;
  const MarkdownFieldPlaceholder = {
    __type: "field",
    name: "markdown",
    Component: createPlaceholder(
      "Markdown"
    )
  };
  const HtmlFieldPlaceholder = {
    __type: "field",
    name: "html",
    Component: createPlaceholder(
      "HTML"
    )
  };
  function createPlaceholder(name, _pr) {
    return (props) => {
      return /* @__PURE__ */ React.createElement(
        FieldMeta,
        {
          name: props.input.name,
          label: `${name} Field not Registered`,
          tinaForm: props.tinaForm
        },
        /* @__PURE__ */ React.createElement("p", { className: "whitespace-normal text-[15px] mt-2" }, "The ", name, " field is not registered. Some built-in field types are not bundled by default in an effort to control bundle size. Consult the Tina docs to learn how to use this field type."),
        /* @__PURE__ */ React.createElement("p", { className: "whitespace-normal text-[15px] mt-2" }, /* @__PURE__ */ React.createElement(
          "a",
          {
            className: "text-blue-500 underline",
            href: "https://tina.io/docs/editing/markdown/#registering-the-field-plugins",
            target: "_blank",
            rel: "noreferrer noopener"
          },
          "Tina Docs: Registering Field Plugins"
        ))
      );
    };
  }
  function createScreen({
    Component,
    props,
    ...options
  }) {
    return {
      __type: "screen",
      layout: "popup",
      ...options,
      Component(screenProps) {
        return /* @__PURE__ */ React.createElement(Component, { ...screenProps, ...props });
      }
    };
  }
  function useScreenPlugin(options, deps) {
    const memo2 = React.useMemo(() => {
      return createScreen(options);
    }, deps);
    usePlugins(memo2);
  }
  const ScreenPluginModal = ({
    screen,
    close: close2
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(ModalLayout, { name: screen.name, close: close2, layout: screen.layout }, /* @__PURE__ */ React__namespace.createElement(screen.Component, { close: close2 }));
  };
  const ModalLayout = ({ children, name, close: close2, layout }) => {
    let Wrapper2;
    switch (layout) {
      case "popup":
        Wrapper2 = ModalPopup;
        break;
      case "fullscreen":
        Wrapper2 = ModalFullscreen;
        break;
      default:
        Wrapper2 = ModalPopup;
        break;
    }
    return /* @__PURE__ */ React__namespace.createElement(Modal, null, /* @__PURE__ */ React__namespace.createElement(Wrapper2, null, /* @__PURE__ */ React__namespace.createElement(ModalHeader, { close: close2 }, name), /* @__PURE__ */ React__namespace.createElement(
      ModalBody,
      {
        className: layout === "fullscreen" ? "flex h-full flex-col" : ""
      },
      children
    )));
  };
  function dirname(path) {
    var _a, _b;
    const pattern = new RegExp("(?<prevDir>.*)/");
    return (_b = (_a = path.match(pattern)) == null ? void 0 : _a.groups) == null ? void 0 : _b.prevDir;
  }
  const BreadcrumbButton = ({ className = "", ...props }) => /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "capitalize transition-colors duration-150 border-0 bg-transparent hover:text-blue-500 " + className,
      ...props
    }
  );
  function Breadcrumb$1({ directory = "", setDirectory }) {
    directory = directory.replace(/^\/|\/$/g, "");
    let prevDir = dirname(directory) || "";
    if (prevDir === ".") {
      prevDir = "";
    }
    return /* @__PURE__ */ React.createElement("div", { className: "w-full flex items-center text-[16px] text-gray-300" }, directory !== "" && /* @__PURE__ */ React.createElement(
      IconButton,
      {
        variant: "ghost",
        className: "mr-2",
        onClick: () => setDirectory(prevDir)
      },
      /* @__PURE__ */ React.createElement(
        LeftArrowIcon,
        {
          className: `w-7 h-auto fill-gray-300 hover:fill-gray-900 transition duration-150 ease-out`
        }
      )
    ), /* @__PURE__ */ React.createElement(
      BreadcrumbButton,
      {
        onClick: () => setDirectory(""),
        className: directory === "" ? "text-gray-500 font-bold" : "text-gray-300 font-medium after:pl-1.5 after:content-['/']"
      },
      "Media"
    ), directory && directory.split("/").map((part, index, parts) => {
      const currentDir = parts.slice(0, index + 1).join("/");
      return /* @__PURE__ */ React.createElement(
        BreadcrumbButton,
        {
          className: "pl-1.5 " + (index + 1 === parts.length ? "text-gray-500 font-bold" : "text-gray-300 font-medium after:pl-1.5 after:content-['/']"),
          key: currentDir,
          onClick: () => {
            setDirectory(currentDir);
          }
        },
        part
      );
    }));
  }
  const CopyField = ({ label, description, value }) => {
    const [copied, setCopied] = React.useState(false);
    const [fadeOut, setFadeOut] = React.useState(false);
    return /* @__PURE__ */ React.createElement("div", { className: "w-full" }, label && /* @__PURE__ */ React.createElement("label", { className: "w-full mb-1 block flex-1  text-sm font-bold leading-5 text-gray-700" }, label), /* @__PURE__ */ React.createElement(
      "span",
      {
        onClick: () => {
          if (copied === true)
            return;
          setCopied(true);
          setTimeout(() => {
            setFadeOut(true);
          }, 2500);
          setTimeout(() => {
            setCopied(false);
            setFadeOut(false);
          }, 3e3);
          navigator.clipboard.writeText(value);
        },
        className: `shadow-inner text-base leading-5 whitespace-normal break-all px-3 py-2 text-gray-600 w-full bg-gray-50 border border-gray-200 transition-all ease-out duration-150 rounded-md relative overflow-hidden appearance-none flex items-center w-full cursor-pointer hover:bg-white hover:text-blue-500  ${copied ? `pointer-events-none` : ``}`
      },
      /* @__PURE__ */ React.createElement(BiCopyAlt, { className: "relative text-blue-500 shrink-0 w-5 h-auto mr-1.5 -ml-0.5 z-20" }),
      " ",
      value,
      " ",
      copied && /* @__PURE__ */ React.createElement(
        "span",
        {
          className: `${fadeOut ? `opacity-0` : `opacity-100`} text-blue-500 transition-opacity	duration-500 absolute right-0 w-full h-full px-3 py-2 bg-white bg-opacity-90 flex items-center justify-center text-center tracking-wide font-medium z-10`
        },
        /* @__PURE__ */ React.createElement("span", null, "Copied to clipboard!")
      )
    ), description && /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-gray-500" }, description));
  };
  function ListMediaItem({ item, onClick, active }) {
    let FileIcon = BiFile;
    if (item.type === "dir") {
      FileIcon = BiFolder;
    } else if (isVideo(item.src)) {
      FileIcon = BiMovie;
    }
    const thumbnail = (item.thumbnails || {})["75x75"];
    return /* @__PURE__ */ React.createElement(
      "li",
      {
        className: `group relative flex shrink-0 items-center transition duration-150 ease-out cursor-pointer border-b border-gray-150 ${active ? "bg-gradient-to-r from-white to-gray-50/50 text-blue-500 hover:bg-gray-50" : "bg-white hover:bg-gray-50/50 hover:text-blue-500"}`,
        onClick: () => {
          if (!active) {
            onClick(item);
          } else {
            onClick(false);
          }
        }
      },
      item.new && /* @__PURE__ */ React.createElement("span", { className: "absolute top-1.5 left-1.5 rounded-full shadow bg-green-100 border border-green-200 text-[10px] tracking-wide	 font-bold text-green-600 px-1.5 py-0.5 z-10" }, "NEW"),
      /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 bg-gray-50 border-r border-gray-150 overflow-hidden flex justify-center flex-shrink-0" }, isImage(thumbnail) ? /* @__PURE__ */ React.createElement(
        "img",
        {
          className: "object-contain object-center w-full h-full origin-center transition-all duration-150 ease-out group-hover:scale-110",
          src: thumbnail,
          alt: item.filename
        }
      ) : /* @__PURE__ */ React.createElement(FileIcon, { className: "w-1/2 h-full fill-gray-300" })),
      /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "text-base flex-grow w-full break-words truncate px-3 py-2"
        },
        item.filename
      )
    );
  }
  function GridMediaItem({ item, active, onClick }) {
    let FileIcon = BiFile;
    if (item.type === "dir") {
      FileIcon = BiFolder;
    } else if (isVideo(item.src)) {
      FileIcon = BiMovie;
    }
    const thumbnail = (item.thumbnails || {})["400x400"];
    return /* @__PURE__ */ React.createElement(
      "li",
      {
        className: `relative pb-[100%] h-0 block border border-gray-100 rounded-md overflow-hidden flex justify-center shrink-0 w-full transition duration-150 ease-out ${active ? "shadow-outline" : "shadow hover:shadow-md hover:scale-103 hover:border-gray-150"} ${item.type === "dir" ? "cursor-pointer" : ""}`
      },
      item.new && /* @__PURE__ */ React.createElement("span", { className: "absolute top-1.5 left-1.5 rounded-full shadow bg-green-100 border border-green-200 text-[10px] tracking-wide	 font-bold text-green-600 px-1.5 py-0.5 z-10" }, "NEW"),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "absolute w-full h-full flex items-center justify-center bg-white",
          onClick: () => {
            if (!active) {
              onClick(item);
            } else {
              onClick(false);
            }
          }
        },
        isImage(thumbnail) ? /* @__PURE__ */ React.createElement(
          "img",
          {
            className: "object-contain object-center w-full h-full",
            src: thumbnail,
            alt: item.filename
          }
        ) : /* @__PURE__ */ React.createElement("div", { className: "p-4 w-full flex flex-col gap-4 items-center justify-center" }, /* @__PURE__ */ React.createElement(FileIcon, { className: "w-[30%] h-auto fill-gray-300" }), /* @__PURE__ */ React.createElement("span", { className: "block text-base text-gray-600 w-full break-words truncate" }, item.filename))
      )
    );
  }
  const DeleteModal$1 = ({
    close: close2,
    deleteFunc,
    filename
  }) => {
    const [processing, setProcessing] = React.useState(false);
    return /* @__PURE__ */ React.createElement(Modal, null, /* @__PURE__ */ React.createElement(PopupModal, null, /* @__PURE__ */ React.createElement(ModalHeader, { close: close2 }, "Delete ", filename), /* @__PURE__ */ React.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React.createElement("p", null, "Are you sure you want to delete ", /* @__PURE__ */ React.createElement("strong", null, filename), "?")), /* @__PURE__ */ React.createElement(ModalActions, null, /* @__PURE__ */ React.createElement(Button$1, { style: { flexGrow: 2 }, disabled: processing, onClick: close2 }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button$1,
      {
        style: { flexGrow: 3 },
        disabled: processing,
        variant: "danger",
        onClick: async () => {
          setProcessing(true);
          try {
            await deleteFunc();
          } catch (e) {
            console.error(e);
          } finally {
            close2();
          }
        }
      },
      /* @__PURE__ */ React.createElement("span", { className: "mr-1" }, "Delete"),
      processing && /* @__PURE__ */ React.createElement(LoadingDots, null)
    ))));
  };
  const NewFolderModal = ({ onSubmit, close: close2 }) => {
    const [folderName, setFolderName] = React.useState("");
    return /* @__PURE__ */ React.createElement(Modal, null, /* @__PURE__ */ React.createElement(PopupModal, null, /* @__PURE__ */ React.createElement(ModalHeader, { close: close2 }, "New Folder"), /* @__PURE__ */ React.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React.createElement("p", { className: "text-base text-gray-700 mb-2" }, "Please provide a name for your folder."), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-500 mb-4 italic" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold" }, "Note"), " – If you navigate away before uploading a media item, the folder will disappear."), /* @__PURE__ */ React.createElement(
      Input,
      {
        value: folderName,
        placeholder: "Folder Name",
        required: true,
        onChange: (e) => setFolderName(e.target.value)
      }
    )), /* @__PURE__ */ React.createElement(ModalActions, null, /* @__PURE__ */ React.createElement(Button$1, { style: { flexGrow: 2 }, onClick: close2 }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button$1,
      {
        disabled: !folderName,
        style: { flexGrow: 3 },
        variant: "primary",
        onClick: () => {
          if (!folderName)
            return;
          onSubmit(folderName);
          close2();
        }
      },
      "Create New Folder"
    ))));
  };
  const { useDropzone } = dropzone__namespace;
  const join = function(...parts) {
    const [first, last, slash] = [0, parts.length - 1, "/"];
    const matchLeadingSlash = new RegExp("^" + slash);
    const matchTrailingSlash = new RegExp(slash + "$");
    parts = parts.map(function(part, index) {
      if (index === first && part === "file://")
        return part;
      if (index > first)
        part = part.replace(matchLeadingSlash, "");
      if (index < last)
        part = part.replace(matchTrailingSlash, "");
      return part;
    });
    return parts.join(slash);
  };
  function MediaManager() {
    const cms = useCMS();
    const [request, setRequest] = React.useState();
    React.useEffect(() => {
      return cms.events.subscribe("media:open", ({ type, ...request2 }) => {
        setRequest(request2);
      });
    }, []);
    if (!request)
      return null;
    const close2 = () => setRequest(void 0);
    return /* @__PURE__ */ React.createElement(Modal, null, /* @__PURE__ */ React.createElement(FullscreenModal, null, /* @__PURE__ */ React.createElement("div", { className: "w-full bg-gray-50 flex items-center justify-between px-5 pt-3 m-0" }, /* @__PURE__ */ React.createElement("h2", { className: "text-gray-500 font-sans font-medium text-base leading-none m-0 block truncate" }, "Media Manager"), /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: close2,
        className: "flex items-center fill-gray-400 cursor-pointer transition-colors duration-100 ease-out hover:fill-gray-700"
      },
      /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-6 h-auto" })
    )), /* @__PURE__ */ React.createElement(ModalBody, { className: "flex h-full flex-col" }, /* @__PURE__ */ React.createElement(MediaPicker, { ...request, close: close2 }))));
  }
  const defaultListError = new MediaListError({
    title: "Error fetching media",
    message: "Something went wrong while requesting the resource.",
    docsLink: "https://tina.io/docs/media/#media-store"
  });
  function MediaPicker({
    allowDelete,
    onSelect,
    close: close2,
    ...props
  }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const cms = useCMS();
    const [listState, setListState] = React.useState(() => {
      if (cms.media.isConfigured)
        return "loading";
      return "not-configured";
    });
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [newFolderModalOpen, setNewFolderModalOpen] = React.useState(false);
    const [listError, setListError] = React.useState(defaultListError);
    const [directory, setDirectory] = React.useState(
      props.directory
    );
    const [list, setList] = React.useState({
      items: [],
      nextOffset: void 0
    });
    const resetList = () => setList({
      items: [],
      nextOffset: void 0
    });
    const [viewMode, setViewMode] = React.useState("grid");
    const [activeItem, setActiveItem] = React.useState(false);
    const closePreview = () => setActiveItem(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [loadFolders, setLoadFolders] = React.useState(true);
    const [offsetHistory, setOffsetHistory] = React.useState([]);
    const offset = offsetHistory[offsetHistory.length - 1];
    const resetOffset = () => setOffsetHistory([]);
    async function loadMedia(loadFolders2 = true) {
      setListState("loading");
      try {
        const _list = await cms.media.list({
          offset,
          limit: cms.media.pageSize,
          directory,
          thumbnailSizes: [
            { w: 75, h: 75 },
            { w: 400, h: 400 },
            { w: 1e3, h: 1e3 }
          ],
          filesOnly: !loadFolders2
        });
        setList({
          items: [...list.items, ..._list.items],
          nextOffset: _list.nextOffset
        });
        setListState("loaded");
      } catch (e) {
        console.error(e);
        if (e.ERR_TYPE === "MediaListError") {
          setListError(e);
        } else {
          setListError(defaultListError);
        }
        setListState("error");
      }
    }
    React.useEffect(() => {
      if (!refreshing)
        return;
      loadMedia();
      setRefreshing(false);
    }, [refreshing]);
    React.useEffect(() => {
      if (!cms.media.isConfigured)
        return;
      if (refreshing)
        return;
      loadMedia(loadFolders);
      if (loadFolders)
        setLoadFolders(false);
      return cms.events.subscribe(
        ["media:delete:success", "media:pageSize"],
        () => {
          setRefreshing(true);
          resetOffset();
          resetList();
        }
      );
    }, [offset, directory, cms.media.isConfigured]);
    const onClickMediaItem = (item) => {
      if (!item) {
        setActiveItem(false);
      } else if (item.type === "dir") {
        setDirectory(
          item.directory === "." || item.directory === "" ? item.filename : join(item.directory, item.filename)
        );
        setLoadFolders(true);
        resetOffset();
        resetList();
        setActiveItem(false);
      } else {
        setActiveItem(item);
      }
    };
    let deleteMediaItem;
    if (allowDelete) {
      deleteMediaItem = async (item) => {
        await cms.media.delete(item);
      };
    }
    let selectMediaItem;
    if (onSelect) {
      selectMediaItem = (item) => {
        onSelect(item);
        if (close2)
          close2();
      };
    }
    const [uploading, setUploading] = React.useState(false);
    const accept = Array.isArray(
      (_c = (_b = (_a = cms.api.tina.schema.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.media) == null ? void 0 : _c.accept
    ) ? (_f = (_e = (_d = cms.api.tina.schema.schema) == null ? void 0 : _d.config) == null ? void 0 : _e.media) == null ? void 0 : _f.accept.join(",") : (_i = (_h = (_g = cms.api.tina.schema.schema) == null ? void 0 : _g.config) == null ? void 0 : _h.media) == null ? void 0 : _i.accept;
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: dropzoneAcceptFromString(
        accept || cms.media.accept || DEFAULT_MEDIA_UPLOAD_TYPES
      ),
      maxSize: cms.media.maxSize,
      multiple: true,
      onDrop: async (files, fileRejections) => {
        try {
          setUploading(true);
          const mediaItems = await cms.media.persist(
            files.map((file) => {
              return {
                directory: directory || "/",
                file
              };
            })
          );
          const errorCodes = {
            "file-invalid-type": "Invalid file type",
            "file-too-large": "File too large",
            "file-too-small": "File too small",
            "too-many-files": "Too many files"
          };
          const printError = (error) => {
            const message = errorCodes[error.code];
            if (message) {
              return message;
            }
            console.error(error);
            return "Unknown error";
          };
          if (fileRejections.length > 0) {
            const messages = [];
            fileRejections.map((fileRejection) => {
              messages.push(
                `${fileRejection.file.name}: ${fileRejection.errors.map((error) => printError(error)).join(", ")}`
              );
            });
            cms.alerts.error(() => {
              return /* @__PURE__ */ React.createElement(React.Fragment, null, "Upload Failed. ", /* @__PURE__ */ React.createElement("br", null), messages.join(". "), ".");
            });
          }
          if (mediaItems.length !== 0) {
            setActiveItem(mediaItems[0]);
            setList((mediaList) => {
              return {
                items: [
                  // all the newly added items are new
                  ...mediaItems.map((x) => ({ ...x, new: true })),
                  ...mediaList.items
                ],
                nextOffset: mediaList.nextOffset
              };
            });
          }
        } catch {
        }
        setUploading(false);
      }
    });
    const { onClick, ...rootProps } = getRootProps();
    function disableScrollBody() {
      const body = document == null ? void 0 : document.body;
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = "auto";
      };
    }
    React.useEffect(disableScrollBody, []);
    const loaderRef = React.useRef(null);
    React.useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        const target = entries[0];
        if (target.isIntersecting && list.nextOffset) {
          setOffsetHistory((offsetHistory2) => [
            ...offsetHistory2,
            list.nextOffset
          ]);
        }
      });
      if (loaderRef.current) {
        observer.observe(loaderRef.current);
      }
      return () => {
        if (loaderRef.current) {
          observer.unobserve(loaderRef.current);
        }
      };
    }, [list.nextOffset, loaderRef.current]);
    if (listState === "loading" && !((_j = list == null ? void 0 : list.items) == null ? void 0 : _j.length) || uploading) {
      return /* @__PURE__ */ React.createElement(LoadingMediaList, null);
    }
    if (listState === "not-configured") {
      return /* @__PURE__ */ React.createElement(
        DocsLink,
        {
          title: "No Media Store Configured",
          message: "To use the media manager, you need to configure a Media Store.",
          docsLink: "https://tina.io/docs/reference/media/overview/"
        }
      );
    }
    if (listState === "error") {
      const { title, message, docsLink } = listError;
      return /* @__PURE__ */ React.createElement(DocsLink, { title, message, docsLink });
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, deleteModalOpen && /* @__PURE__ */ React.createElement(
      DeleteModal$1,
      {
        filename: activeItem ? activeItem.filename : "",
        deleteFunc: async () => {
          if (activeItem) {
            await deleteMediaItem(activeItem);
            setActiveItem(false);
          }
        },
        close: () => setDeleteModalOpen(false)
      }
    ), newFolderModalOpen && /* @__PURE__ */ React.createElement(
      NewFolderModal,
      {
        onSubmit: (name) => {
          setDirectory((oldDir) => {
            if (oldDir) {
              return join(oldDir, name);
            } else {
              return name;
            }
          });
          resetOffset();
          resetList();
        },
        close: () => setNewFolderModalOpen(false)
      }
    ), /* @__PURE__ */ React.createElement(MediaPickerWrap, null, /* @__PURE__ */ React.createElement(SyncStatusContainer, null, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center bg-gray-50 border-b border-gray-150 gap-4 py-3 px-5 shadow-sm flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-1 items-center gap-4" }, /* @__PURE__ */ React.createElement(ViewModeToggle, { viewMode, setViewMode }), /* @__PURE__ */ React.createElement(
      Breadcrumb$1,
      {
        directory,
        setDirectory: (dir) => {
          setDirectory(dir);
          setLoadFolders(true);
          resetOffset();
          resetList();
          setActiveItem(false);
        }
      }
    )), cms.media.store.isStatic ? null : /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-4" }, /* @__PURE__ */ React.createElement(
      Button$1,
      {
        busy: false,
        variant: "white",
        onClick: () => {
          setRefreshing(true);
          resetOffset();
          resetList();
          setActiveItem(false);
        },
        className: "whitespace-nowrap"
      },
      "Refresh",
      /* @__PURE__ */ React.createElement(IoMdRefresh, { className: "w-6 h-full ml-2 opacity-70 text-blue-500" })
    ), /* @__PURE__ */ React.createElement(
      Button$1,
      {
        busy: false,
        variant: "white",
        onClick: () => {
          setNewFolderModalOpen(true);
        },
        className: "whitespace-nowrap"
      },
      "New Folder",
      /* @__PURE__ */ React.createElement(BiFolder, { className: "w-6 h-full ml-2 opacity-70 text-blue-500" })
    ), /* @__PURE__ */ React.createElement(UploadButton, { onClick, uploading }))), /* @__PURE__ */ React.createElement("div", { className: "flex h-full overflow-hidden bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex w-full flex-col h-full @container" }, /* @__PURE__ */ React.createElement(
      "ul",
      {
        ...rootProps,
        className: `h-full grow overflow-y-auto transition duration-150 ease-out bg-gradient-to-b from-gray-50/50 to-gray-50 ${list.items.length === 0 || viewMode === "list" && "w-full flex flex-1 flex-col justify-start -mb-px"} ${list.items.length > 0 && viewMode === "grid" && "w-full p-4 gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 4xl:grid-cols-6 6xl:grid-cols-9 auto-rows-auto content-start justify-start"} ${isDragActive ? `border-2 border-blue-500 rounded-lg` : ``}`
      },
      /* @__PURE__ */ React.createElement("input", { ...getInputProps() }),
      listState === "loaded" && list.items.length === 0 && /* @__PURE__ */ React.createElement(EmptyMediaList, null),
      viewMode === "list" && list.items.map((item) => /* @__PURE__ */ React.createElement(
        ListMediaItem,
        {
          key: item.id,
          item,
          onClick: onClickMediaItem,
          active: activeItem && activeItem.id === item.id
        }
      )),
      viewMode === "grid" && list.items.map((item) => /* @__PURE__ */ React.createElement(
        GridMediaItem,
        {
          key: item.id,
          item,
          onClick: onClickMediaItem,
          active: activeItem && activeItem.id === item.id
        }
      )),
      !!list.nextOffset && /* @__PURE__ */ React.createElement(LoadingMediaList, { ref: loaderRef })
    )), /* @__PURE__ */ React.createElement(
      ActiveItemPreview,
      {
        activeItem,
        close: closePreview,
        selectMediaItem,
        allowDelete: cms.media.store.isStatic ? false : allowDelete,
        deleteMediaItem: () => {
          setDeleteModalOpen(true);
        }
      }
    )))));
  }
  const ActiveItemPreview = ({
    activeItem,
    close: close2,
    selectMediaItem,
    deleteMediaItem,
    allowDelete
  }) => {
    const thumbnail = activeItem ? (activeItem.thumbnails || {})["1000x1000"] : "";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `shrink-0 h-full flex flex-col items-start gap-3 overflow-y-auto bg-white border-l border-gray-100 bg-white shadow-md transition ease-out duration-150 ${activeItem ? `p-4 opacity-100 w-[35%] max-w-[560px] min-w-[240px]` : `translate-x-8 opacity-0 w-[0px]`}`
      },
      activeItem && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex grow-0 shrink-0 gap-2 w-full items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg text-gray-600 w-full max-w-full break-words block truncate flex-1" }, activeItem.filename), /* @__PURE__ */ React.createElement(
        IconButton,
        {
          variant: "ghost",
          className: "group grow-0 shrink-0",
          onClick: close2
        },
        /* @__PURE__ */ React.createElement(
          BiX,
          {
            className: `w-7 h-auto text-gray-500 opacity-50 group-hover:opacity-100 transition duration-150 ease-out`
          }
        )
      )), isImage(thumbnail) ? /* @__PURE__ */ React.createElement("div", { className: "w-full max-h-[75%]" }, /* @__PURE__ */ React.createElement(
        "img",
        {
          className: "block border border-gray-100 rounded-md overflow-hidden object-center object-contain max-w-full max-h-full m-auto shadow",
          src: thumbnail,
          alt: activeItem.filename
        }
      )) : /* @__PURE__ */ React.createElement("span", { className: "p-3 border border-gray-100 rounded-md overflow-hidden bg-gray-50 shadow" }, /* @__PURE__ */ React.createElement(BiFile, { className: "w-14 h-auto fill-gray-300" })), /* @__PURE__ */ React.createElement("div", { className: "grow h-full w-full shrink flex flex-col gap-3 items-start justify-start" }, /* @__PURE__ */ React.createElement(CopyField, { value: absoluteImgURL(activeItem.src), label: "URL" })), /* @__PURE__ */ React.createElement("div", { className: "shrink-0 w-full flex flex-col justify-end items-start" }, /* @__PURE__ */ React.createElement("div", { className: "flex w-full gap-3" }, selectMediaItem && /* @__PURE__ */ React.createElement(
        Button$1,
        {
          size: "medium",
          variant: "primary",
          className: "grow",
          onClick: () => selectMediaItem(activeItem)
        },
        "Insert",
        /* @__PURE__ */ React.createElement(BiArrowToBottom, { className: "ml-1 -mr-0.5 w-6 h-auto text-white opacity-70" })
      ), allowDelete && /* @__PURE__ */ React.createElement(
        Button$1,
        {
          variant: "white",
          size: "medium",
          className: "grow max-w-[40%]",
          onClick: deleteMediaItem
        },
        "Delete",
        /* @__PURE__ */ React.createElement(TrashIcon, { className: "ml-1 -mr-0.5 w-6 h-auto text-red-500 opacity-70" })
      ))))
    );
  };
  const UploadButton = ({ onClick, uploading }) => {
    return /* @__PURE__ */ React.createElement(
      Button$1,
      {
        variant: "primary",
        size: "custom",
        className: "text-sm h-10 px-6",
        busy: uploading,
        onClick
      },
      uploading ? /* @__PURE__ */ React.createElement(LoadingDots, null) : /* @__PURE__ */ React.createElement(React.Fragment, null, "Upload ", /* @__PURE__ */ React.createElement(BiCloudUpload, { className: "w-6 h-full ml-2 opacity-70" }))
    );
  };
  const LoadingMediaList = React.forwardRef(
    (props, ref) => {
      const { extraText, ...rest } = props;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          ref,
          className: "w-full h-full flex flex-col items-center justify-center",
          ...rest
        },
        extraText && /* @__PURE__ */ React.createElement("p", null, extraText),
        /* @__PURE__ */ React.createElement(LoadingDots, { color: "var(--tina-color-primary)" })
      );
    }
  );
  const MediaPickerWrap = ({ children }) => {
    return /* @__PURE__ */ React.createElement("div", { className: "h-full flex-1 text-gray-700 flex flex-col relative bg-gray-50 outline-none active:outline-none focus:outline-none" }, children);
  };
  const SyncStatusContext = React.createContext(
    void 0
  );
  const SyncStatusContainer = ({ children }) => {
    var _a, _b, _c;
    const cms = useCMS();
    const isLocal = cms.api.tina.isLocalMode;
    const tinaMedia = (_c = (_b = (_a = cms.api.tina.schema.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.media) == null ? void 0 : _c.tina;
    const hasTinaMedia = !!((tinaMedia == null ? void 0 : tinaMedia.mediaRoot) || (tinaMedia == null ? void 0 : tinaMedia.publicFolder));
    const doCheckSyncStatus = hasTinaMedia && !isLocal;
    const [syncStatus, setSyncStatus] = React.useState(doCheckSyncStatus ? "loading" : "synced");
    React.useEffect(() => {
      const checkSyncStatus = async () => {
        if (doCheckSyncStatus) {
          const project = await cms.api.tina.getProject();
          setSyncStatus(project.mediaBranch ? "synced" : "needs-sync");
        }
      };
      if (!cms.media.store.isStatic) {
        checkSyncStatus();
      }
    }, []);
    return syncStatus == "needs-sync" ? /* @__PURE__ */ React.createElement("div", { className: "h-full flex items-center justify-center p-6 bg-gradient-to-t from-gray-200 to-transparent" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg border shadow-sm px-4 lg:px-6 py-3 lg:py-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 mx-auto mb-12" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start sm:items-center gap-2" }, /* @__PURE__ */ React.createElement(
      BiError,
      {
        className: `w-7 h-auto flex-shrink-0 text-yellow-400 -mt-px`
      }
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `flex-1 flex flex-col items-start gap-0.5 text-base text-yellow-700`
      },
      "Media needs to be turned on for this project.",
      /* @__PURE__ */ React.createElement(
        "a",
        {
          className: "transition-all duration-150 ease-out text-blue-500 hover:text-blue-400 hover:underline underline decoration-blue-200 hover:decoration-blue-400 font-medium flex items-center justify-start gap-1",
          target: "_blank",
          href: `${cms.api.tina.appDashboardLink}/media`
        },
        "Sync Your Media In TinaCloud.",
        /* @__PURE__ */ React.createElement(BiLinkExternal, { className: `w-5 h-auto flex-shrink-0` })
      )
    )))) : /* @__PURE__ */ React.createElement(SyncStatusContext.Provider, { value: { syncStatus } }, children);
  };
  const useSyncStatus$1 = () => {
    const context = React.useContext(SyncStatusContext);
    if (!context) {
      throw new Error("useSyncStatus must be used within a SyncStatusProvider");
    }
    return context;
  };
  const EmptyMediaList = () => {
    const { syncStatus } = useSyncStatus$1();
    return /* @__PURE__ */ React.createElement("div", { className: `p-12 text-xl opacity-50 text-center` }, syncStatus == "synced" ? "Drag and drop assets here" : "Loading...");
  };
  const DocsLink = ({ title, message, docsLink, ...props }) => {
    return /* @__PURE__ */ React.createElement("div", { className: "h-3/4 text-center flex flex-col justify-center", ...props }, /* @__PURE__ */ React.createElement("h2", { className: "mb-3 text-xl text-gray-600" }, title), /* @__PURE__ */ React.createElement("div", { className: "mb-3 text-base text-gray-700" }, message), /* @__PURE__ */ React.createElement(
      "a",
      {
        href: docsLink,
        target: "_blank",
        rel: "noreferrer noopener",
        className: "font-bold text-blue-500 hover:text-blue-600 hover:underline transition-all ease-out duration-150"
      },
      "Learn More"
    ));
  };
  const ViewModeToggle = ({ viewMode, setViewMode }) => {
    const toggleClasses = {
      base: "relative whitespace-nowrap flex items-center justify-center flex-1 block font-medium text-base py-1 transition-all ease-out duration-150 border",
      active: "bg-white text-blue-500 shadow-inner border-gray-50 border-t-gray-100",
      inactive: "bg-gray-50 text-gray-400 shadow border-gray-100 border-t-white"
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `grow-0 flex justify-between rounded-md border border-gray-100`
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          className: `${toggleClasses.base} px-2.5 rounded-l-md ${viewMode === "grid" ? toggleClasses.active : toggleClasses.inactive}`,
          onClick: () => {
            setViewMode("grid");
          }
        },
        /* @__PURE__ */ React.createElement(BiGridAlt, { className: "w-6 h-full opacity-70" })
      ),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          className: `${toggleClasses.base} px-2 rounded-r-md ${viewMode === "list" ? toggleClasses.active : toggleClasses.inactive}`,
          onClick: () => {
            setViewMode("list");
          }
        },
        /* @__PURE__ */ React.createElement(BiListUl, { className: "w-8 h-full opacity-70" })
      )
    );
  };
  const MediaManagerScreenPlugin = createScreen({
    name: "Media Manager",
    Component: MediaPicker,
    Icon: MdOutlinePhotoLibrary,
    layout: "fullscreen",
    props: {
      allowDelete: true
    }
  });
  function UpdatePassword(props) {
    const cms = useCMS$1();
    const client = cms.api.tina;
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [dirty, setDirty] = React.useState(false);
    const [result, setResult] = React.useState(null);
    const [formState, setFormState] = React.useState("idle");
    const [passwordChangeRequired, setPasswordChangeRequired] = React.useState(false);
    React.useEffect(() => {
      var _a;
      (_a = client == null ? void 0 : client.authProvider) == null ? void 0 : _a.getUser().then(
        (user) => setPasswordChangeRequired((user == null ? void 0 : user.passwordChangeRequired) ?? false)
      );
    }, []);
    let err = null;
    if (dirty && password !== confirmPassword) {
      err = "Passwords do not match";
    }
    if (dirty && !password) {
      err = "Please enter a password";
    }
    const updatePassword = async () => {
      var _a;
      setResult(null);
      setFormState("busy");
      const res = await cms.api.tina.request(
        `mutation($password: String!) { updatePassword(password: $password) }`,
        {
          variables: {
            password
          }
        }
      );
      if (!(res == null ? void 0 : res.updatePassword)) {
        setResult("Error updating password");
      } else {
        setDirty(false);
        setPassword("");
        setConfirmPassword("");
        setResult("Password updated");
        setPasswordChangeRequired(false);
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        (_a = client == null ? void 0 : client.authProvider) == null ? void 0 : _a.logout().then(async () => {
          if (typeof (client == null ? void 0 : client.onLogout) === "function") {
            await client.onLogout();
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          window.location.href = new URL(window.location.href).pathname;
        }).catch((e) => console.error(e));
      }
      setFormState("idle");
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center h-full" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col space-y-8 p-6" }, passwordChangeRequired && /* @__PURE__ */ React.createElement("div", { className: "text-center text-red-500" }, "Your password has expired. Please update your password."), /* @__PURE__ */ React.createElement("label", { className: "block" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-700" }, "New Password"), /* @__PURE__ */ React.createElement(
      BaseTextField,
      {
        type: "password",
        name: "password",
        id: "password",
        placeholder: "Enter password",
        className: err ? "border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500",
        value: password,
        onKeyDown: () => {
          setDirty(true);
          setResult(null);
        },
        onChange: (e) => setPassword(e.target.value),
        required: true
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "block" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-700" }, "Confirm New Password"), /* @__PURE__ */ React.createElement(
      BaseTextField,
      {
        type: "password",
        name: "confirmPassword",
        id: "confirmPassword",
        placeholder: "Confirm password",
        className: err ? "border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500",
        value: confirmPassword,
        onKeyDown: () => {
          setDirty(true);
          setResult(null);
        },
        onChange: (e) => setConfirmPassword(e.target.value),
        required: true
      }
    )), result && /* @__PURE__ */ React.createElement("div", { className: "text-center text-sm text-gray-500" }, result), err && /* @__PURE__ */ React.createElement("div", { className: "text-center text-sm text-red-500" }, err), /* @__PURE__ */ React.createElement(
      Button$1,
      {
        onClick: updatePassword,
        disabled: err,
        variant: "primary",
        busy: formState === "busy"
      },
      "Update"
    ))));
  }
  const PasswordScreenPlugin = createScreen({
    name: "Change Password",
    Component: UpdatePassword,
    Icon: MdVpnKey,
    layout: "fullscreen",
    navCategory: "Account"
  });
  function createCloudConfig({
    ...options
  }) {
    return {
      __type: "cloud-config",
      Icon: MdOutlineCloud,
      ...options
    };
  }
  const SidebarLoadingPlaceholder = () => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: "relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto",
      style: {
        animationName: "fade-in",
        animationDelay: "300ms",
        animationTimingFunction: "ease-out",
        animationIterationCount: 1,
        animationFillMode: "both",
        animationDuration: "150ms"
      }
    },
    /* @__PURE__ */ React__namespace.createElement("p", { className: "block pb-5" }, "Please wait while TinaCMS", /* @__PURE__ */ React__namespace.createElement("br", null), "loads your content"),
    /* @__PURE__ */ React__namespace.createElement(LoadingDots, { color: "var(--tina-color-primary)" })
  );
  class SidebarState {
    constructor(events, options = {}) {
      var _a, _b;
      this.events = events;
      this._isOpen = false;
      this.position = "displace";
      this.renderNav = true;
      this.buttons = {
        save: "Save",
        reset: "Reset"
      };
      this.position = options.position || "displace";
      this.renderNav = options.renderNav || true;
      this.loadingPlaceholder = options.placeholder || SidebarLoadingPlaceholder;
      if ((_a = options.buttons) == null ? void 0 : _a.save) {
        this.buttons.save = options.buttons.save;
      }
      if ((_b = options.buttons) == null ? void 0 : _b.reset) {
        this.buttons.reset = options.buttons.reset;
      }
    }
    get isOpen() {
      return this._isOpen;
    }
    set isOpen(nextValue) {
      if (this._isOpen === nextValue) {
        return;
      }
      this._isOpen = nextValue;
      if (nextValue) {
        this.events.dispatch({ type: "sidebar:opened" });
      } else {
        this.events.dispatch({ type: "sidebar:closed" });
      }
    }
    subscribe(callback) {
      const unsub = this.events.subscribe("sidebar", callback);
      return () => unsub();
    }
  }
  function ImFilesEmpty(props) {
    return GenIcon({ "tag": "svg", "attr": { "version": "1.1", "viewBox": "0 0 16 16" }, "child": [{ "tag": "path", "attr": { "d": "M14.341 5.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-5.75c-0.689 0-1.25 0.561-1.25 1.25v11.5c0 0.689 0.561 1.25 1.25 1.25h9.5c0.689 0 1.25-0.561 1.25-1.25v-7.75c0-0.224-0.068-0.615-0.659-1.421zM12.271 4.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-9.5c-0.136 0-0.25-0.114-0.25-0.25v-11.5c0-0.135 0.114-0.25 0.25-0.25 0 0 5.749-0 5.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v7.75z" }, "child": [] }, { "tag": "path", "attr": { "d": "M9.421 0.659c-0.806-0.591-1.197-0.659-1.421-0.659h-5.75c-0.689 0-1.25 0.561-1.25 1.25v11.5c0 0.604 0.43 1.109 1 1.225v-12.725c0-0.135 0.115-0.25 0.25-0.25h7.607c-0.151-0.124-0.297-0.238-0.437-0.341z" }, "child": [] }] })(props);
  }
  function ImUsers(props) {
    return GenIcon({ "tag": "svg", "attr": { "version": "1.1", "viewBox": "0 0 18 16" }, "child": [{ "tag": "path", "attr": { "d": "M12 12.041v-0.825c1.102-0.621 2-2.168 2-3.716 0-2.485 0-4.5-3-4.5s-3 2.015-3 4.5c0 1.548 0.898 3.095 2 3.716v0.825c-3.392 0.277-6 1.944-6 3.959h14c0-2.015-2.608-3.682-6-3.959z" }, "child": [] }, { "tag": "path", "attr": { "d": "M5.112 12.427c0.864-0.565 1.939-0.994 3.122-1.256-0.235-0.278-0.449-0.588-0.633-0.922-0.475-0.863-0.726-1.813-0.726-2.748 0-1.344 0-2.614 0.478-3.653 0.464-1.008 1.299-1.633 2.488-1.867-0.264-1.195-0.968-1.98-2.841-1.98-3 0-3 2.015-3 4.5 0 1.548 0.898 3.095 2 3.716v0.825c-3.392 0.277-6 1.944-6 3.959h4.359c0.227-0.202 0.478-0.393 0.753-0.573z" }, "child": [] }] })(props);
  }
  const LocalWarning = () => {
    return /* @__PURE__ */ React__namespace.createElement(
      "a",
      {
        className: "flex-grow-0 flex w-full text-xs items-center py-1 px-4 text-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-gray-150 shadow-sm",
        href: "https://tina.io/docs/tina-cloud/",
        target: "_blank"
      },
      /* @__PURE__ */ React__namespace.createElement(AiFillWarning, { className: "w-5 h-auto inline-block mr-1 opacity-70 text-yellow-600" }),
      " ",
      "You are currently in",
      /* @__PURE__ */ React__namespace.createElement("strong", { className: "ml-1 font-bold text-yellow-700" }, "Local Mode")
    );
  };
  const BillingWarning = () => {
    var _a;
    const cms = useCMS$1();
    const api = (_a = cms == null ? void 0 : cms.api) == null ? void 0 : _a.tina;
    const isCustomContentApi = (api == null ? void 0 : api.isCustomContentApi) || false;
    const [billingState, setBillingState] = React__namespace.useState(
      null
    );
    React__namespace.useEffect(() => {
      const fetchBillingState = async () => {
        if (typeof (api == null ? void 0 : api.getBillingState) !== "function")
          return;
        const billingRes = await (api == null ? void 0 : api.getBillingState());
        setBillingState(billingRes);
      };
      if (!isCustomContentApi)
        fetchBillingState();
    }, []);
    if (isCustomContentApi || !billingState || billingState.billingState === "current") {
      return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null);
    }
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex-grow-0 flex flex-wrap w-full text-xs items-center justify-between gap-1.5 py-1.5 px-3 text-red-700 bg-gradient-to-br from-white via-red-50 to-red-100 border-b border-red-200" }, /* @__PURE__ */ React__namespace.createElement("span", { className: "flex items-center gap-1 font-bold" }, /* @__PURE__ */ React__namespace.createElement(BiError, { className: "w-5 h-auto flex-shrink-0 flex-grow-0 inline-block opacity-70 text-red-600" }), /* @__PURE__ */ React__namespace.createElement("span", { className: "flex whitespace-nowrap" }, "There is an issue with your billing.")), /* @__PURE__ */ React__namespace.createElement(
      "a",
      {
        className: "text-xs text-blue-600 underline decoration-blue-200 hover:text-blue-500 hover:decoration-blue-500 transition-all ease-out duration-150 flex items-center gap-1 self-end",
        href: `https://app.tina.io/projects/${billingState.clientId}/billing`,
        target: "_blank"
      },
      "Visit Billing Page",
      /* @__PURE__ */ React__namespace.createElement(BiRightArrowAlt, { className: "w-5 h-full opacity-70" })
    ));
  };
  function FiInfo(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "16", "x2": "12", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "8", "x2": "12.01", "y2": "8" }, "child": [] }] })(props);
  }
  function FiMoreVertical(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "1" }, "child": [] }, { "tag": "circle", "attr": { "cx": "12", "cy": "5", "r": "1" }, "child": [] }, { "tag": "circle", "attr": { "cx": "12", "cy": "19", "r": "1" }, "child": [] }] })(props);
  }
  function VscNewFile(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 16 16", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "fillRule": "evenodd", "clipRule": "evenodd", "d": "M9.5 1.1l3.4 3.5.1.4v2h-1V6H8V2H3v11h4v1H2.5l-.5-.5v-12l.5-.5h6.7l.3.1zM9 2v3h2.9L9 2zm4 14h-1v-3H9v-1h3V9h1v3h3v1h-3v3z" }, "child": [] }] })(props);
  }
  const FormModal = ({ plugin, close: close2 }) => {
    const cms = useCMS$1();
    const form = React.useMemo(
      () => new Form({
        id: "create-form-id",
        label: "create-form",
        fields: plugin.fields,
        actions: plugin.actions,
        buttons: plugin.buttons,
        initialValues: plugin.initialValues || {},
        reset: plugin.reset,
        onChange: plugin.onChange,
        onSubmit: async (values) => {
          await plugin.onSubmit(values, cms).then(() => {
            close2();
          });
        }
      }),
      [close2, cms, plugin]
    );
    return /* @__PURE__ */ React__namespace.createElement(Modal, { id: "content-creator-modal", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React__namespace.createElement(PopupModal, null, /* @__PURE__ */ React__namespace.createElement(ModalHeader, { close: close2 }, plugin.name), /* @__PURE__ */ React__namespace.createElement(ModalBody, null, /* @__PURE__ */ React__namespace.createElement(FormBuilder, { form: { tinaForm: form } }))));
  };
  function HiOutlineClipboardList(props) {
    return GenIcon({ "tag": "svg", "attr": { "fill": "none", "viewBox": "0 0 24 24", "strokeWidth": "2", "stroke": "currentColor", "aria-hidden": "true" }, "child": [{ "tag": "path", "attr": { "strokeLinecap": "round", "strokeLinejoin": "round", "d": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" }, "child": [] }] })(props);
  }
  const useGetEvents = (cms, cursor, existingEvents) => {
    const [events, setEvents] = React.useState([]);
    const [nextCursor, setNextCursor] = React.useState(void 0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(void 0);
    React__namespace.useEffect(() => {
      const fetchEvents = async () => {
        var _a, _b, _c, _d, _e;
        let doFetchEvents = false;
        if (!((_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isCustomContentApi)) {
          doFetchEvents = await ((_e = (_d = (_c = cms.api) == null ? void 0 : _c.tina) == null ? void 0 : _d.authProvider) == null ? void 0 : _e.isAuthenticated());
        }
        if (doFetchEvents) {
          try {
            const { events: nextEvents, cursor: nextCursor2 } = await cms.api.tina.fetchEvents(15, cursor);
            setEvents([...existingEvents, ...nextEvents]);
            setNextCursor(nextCursor2);
          } catch (error2) {
            cms.alerts.error(
              `[${error2.name}] GetEvents failed: ${error2.message}`,
              30 * 1e3
              // 30 seconds
            );
            console.error(error2);
            setEvents(void 0);
            setError(error2);
          }
          setLoading(false);
        }
      };
      setLoading(true);
      fetchEvents();
    }, [cms, cursor]);
    return { events, cursor: nextCursor, loading, error };
  };
  function useSyncStatus(cms) {
    var _a, _b;
    const [syncStatus, setSyncStatus] = React.useState({ state: "loading", message: "Loading..." });
    React__namespace.useEffect(() => {
      const interval = setInterval(async () => {
        var _a2, _b2, _c, _d, _e;
        let doFetchEvents = false;
        if (!((_b2 = (_a2 = cms.api) == null ? void 0 : _a2.tina) == null ? void 0 : _b2.isCustomContentApi)) {
          doFetchEvents = await ((_e = (_d = (_c = cms.api) == null ? void 0 : _c.tina) == null ? void 0 : _d.authProvider) == null ? void 0 : _e.isAuthenticated());
        }
        if (doFetchEvents) {
          const { events } = await cms.api.tina.fetchEvents();
          if (events.length === 0) {
            setSyncStatus({ state: "success", message: "No Events" });
          } else {
            if (events[0].isError) {
              setSyncStatus({
                state: "error",
                message: `Sync Failure ${events[0].message}`
              });
            } else {
              setSyncStatus({ state: "success", message: "Sync Successful" });
            }
          }
        } else {
          setSyncStatus({ state: "unauthorized", message: "Not Authenticated" });
        }
      }, 5e3);
      return () => clearInterval(interval);
    }, [(_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isCustomContentApi]);
    return syncStatus;
  }
  const SyncErrorWidget = ({ cms }) => {
    const syncStatus = useSyncStatus(cms);
    if (syncStatus.state !== "error") {
      return null;
    }
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        title: syncStatus.message,
        className: "flex-grow-0 flex text-xs items-center"
      },
      /* @__PURE__ */ React__namespace.createElement(MdSyncProblem, { className: "w-6 h-full ml-2 text-red-500 fill-current" })
    );
  };
  const EventsList = ({ cms }) => {
    const [cursor, setCursor] = React__namespace.useState(void 0);
    const [existingEvents, setExistingEvents] = React__namespace.useState([]);
    const {
      events,
      cursor: nextCursor,
      loading,
      error
    } = useGetEvents(cms, cursor, existingEvents);
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex flex-col gap-4 w-full h-full grow-0" }, events.length > 0 && /* @__PURE__ */ React__namespace.createElement("div", { className: "shrink grow-0 overflow-scroll w-full rounded-md shadow ring-1 ring-black ring-opacity-5" }, /* @__PURE__ */ React__namespace.createElement("table", { className: "w-full divide-y divide-gray-100" }, events.map((event, index) => {
      const date = new Date(event.timestamp).toDateString();
      const time = new Date(event.timestamp).toTimeString();
      return /* @__PURE__ */ React__namespace.createElement("tr", { className: index % 2 === 0 ? "" : "bg-gray-50" }, event.isError ? /* @__PURE__ */ React__namespace.createElement(
        "td",
        {
          key: `${event.id}_error_icon`,
          className: "py-3 pl-4 pr-0 w-0"
        },
        /* @__PURE__ */ React__namespace.createElement(BsExclamationOctagonFill, { className: "text-red-500 fill-current w-5 h-auto" })
      ) : /* @__PURE__ */ React__namespace.createElement(
        "td",
        {
          key: `${event.id}_ok_icon`,
          className: "py-3 pl-4 pr-0 w-0"
        },
        /* @__PURE__ */ React__namespace.createElement(BsCheckCircleFill, { className: "text-green-500 fill-current w-5 h-auto" })
      ), /* @__PURE__ */ React__namespace.createElement(
        "td",
        {
          key: `${event.id}_msg`,
          className: "whitespace-nowrap p-3 text-base text-gray-500"
        },
        event.message,
        event.isError && /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full text-gray-300 text-xs mt-0.5" }, event.id)
      ), /* @__PURE__ */ React__namespace.createElement(
        "td",
        {
          key: `${event.id}_ts`,
          className: "whitespace-nowrap py-3 pl-3 pr-4 text-sm text-gray-500"
        },
        date,
        /* @__PURE__ */ React__namespace.createElement("span", { className: "w-full block text-gray-300 text-xs mt-0.5" }, time)
      ));
    }).flat())), loading && /* @__PURE__ */ React__namespace.createElement("div", { className: "text-sm text-gray-400 text-center" }, "Loading..."), error && /* @__PURE__ */ React__namespace.createElement("div", null, "Error: ", error.message), /* @__PURE__ */ React__namespace.createElement("div", { className: "text-center flex-1" }, /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        onClick: () => {
          setExistingEvents(events);
          setCursor(nextCursor);
        }
      },
      "Load More Events"
    )));
  };
  const SyncStatusModal = ({ closeEventsModal, cms }) => /* @__PURE__ */ React__namespace.createElement(Modal, null, /* @__PURE__ */ React__namespace.createElement(FullscreenModal, null, /* @__PURE__ */ React__namespace.createElement(ModalHeader, { close: closeEventsModal }, "Event Log"), /* @__PURE__ */ React__namespace.createElement(ModalBody, { className: "flex h-full flex-col", padded: true }, /* @__PURE__ */ React__namespace.createElement(EventsList, { cms }))));
  const SyncStatus = ({ cms, setEventsOpen }) => {
    var _a, _b;
    const syncStatus = useSyncStatus(cms);
    function openEventsModal() {
      setEventsOpen(true);
    }
    if ((_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isCustomContentApi) {
      return null;
    }
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: `text-lg px-4 py-2 first:pt-3 last:pb-3 tracking-wide whitespace-nowrap flex items-center opacity-80 text-gray-600 hover:text-blue-400 hover:bg-gray-50 hover:opacity-100`,
        onClick: openEventsModal
      },
      syncStatus.state !== "error" ? /* @__PURE__ */ React__namespace.createElement(HiOutlineClipboardList, { className: "w-6 h-auto mr-2 text-blue-400" }) : /* @__PURE__ */ React__namespace.createElement(MdSyncProblem, { className: "w-6 h-auto mr-2 text-red-400" }),
      " ",
      "Event Log"
    ));
  };
  const version = "2.7.8";
  const Nav = ({
    isLocalMode,
    className = "",
    children,
    showCollections,
    collectionsInfo,
    screens,
    cloudConfigs,
    contentCreators,
    sidebarWidth,
    RenderNavSite,
    RenderNavCloud,
    RenderNavCollection,
    AuthRenderNavCollection,
    ...props
  }) => {
    const cms = useCMS$1();
    const [eventsOpen, setEventsOpen] = React__namespace.useState(false);
    const { contentCollections, authCollection } = collectionsInfo.collections.reduce(
      (acc, collection) => {
        if (collection.isAuthCollection) {
          acc.authCollection = collection;
        } else {
          acc.contentCollections.push(collection);
        }
        return acc;
      },
      {
        contentCollections: []
      }
    );
    function closeEventsModal() {
      setEventsOpen(false);
    }
    const WrappedSyncStatus = React__namespace.forwardRef(
      (props2, ref) => /* @__PURE__ */ React__namespace.createElement(SyncStatus, { ...props2 })
    );
    const screenCategories = screens.reduce(
      (acc, screen) => {
        const category = screen.navCategory || "Site";
        acc[category] = acc[category] || [];
        acc[category].push(screen);
        return acc;
      },
      { Site: [] }
    );
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: `relative z-30 flex flex-col bg-white border-r border-gray-200 w-96 h-full ${className}`,
        style: { maxWidth: `${sidebarWidth}px` },
        ...props
      },
      /* @__PURE__ */ React__namespace.createElement("div", { className: "border-b border-gray-200" }, /* @__PURE__ */ React__namespace.createElement(react.Menu, { as: "div", className: "relative block" }, ({ open: open2 }) => /* @__PURE__ */ React__namespace.createElement("div", null, /* @__PURE__ */ React__namespace.createElement(
        react.MenuButton,
        {
          className: `group w-full px-6 py-3 gap-2 flex justify-between items-center transition-colors duration-150 ease-out ${open2 ? "bg-gray-50" : "bg-transparent"}`
        },
        /* @__PURE__ */ React__namespace.createElement("span", { className: "text-left inline-flex items-center text-xl tracking-wide text-gray-800 flex-1 gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-150 ease-out" }, /* @__PURE__ */ React__namespace.createElement(
          "svg",
          {
            viewBox: "0 0 32 32",
            fill: "#EC4815",
            xmlns: "http://www.w3.org/2000/svg",
            className: "w-10 h-auto -ml-1"
          },
          /* @__PURE__ */ React__namespace.createElement("path", { d: "M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z" }),
          /* @__PURE__ */ React__namespace.createElement("path", { d: "M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z" })
        ), /* @__PURE__ */ React__namespace.createElement("span", null, "Tina")),
        /* @__PURE__ */ React__namespace.createElement(SyncErrorWidget, { cms }),
        /* @__PURE__ */ React__namespace.createElement(
          FiMoreVertical,
          {
            className: `flex-0 w-6 h-full inline-block group-hover:opacity-80 transition-all duration-300 ease-in-out transform ${open2 ? "opacity-100 text-blue-400" : "text-gray-400 opacity-50 hover:opacity-70"}`
          }
        )
      ), /* @__PURE__ */ React__namespace.createElement("div", { className: "transform translate-y-full absolute bottom-3 right-5 z-50" }, /* @__PURE__ */ React__namespace.createElement(
        react.Transition,
        {
          enter: "transition duration-150 ease-out",
          enterFrom: "transform opacity-0 -translate-y-2",
          enterTo: "transform opacity-100 translate-y-0",
          leave: "transition duration-75 ease-in",
          leaveFrom: "transform opacity-100 translate-y-0",
          leaveTo: "transform opacity-0 -translate-y-2"
        },
        /* @__PURE__ */ React__namespace.createElement(react.MenuItems, { className: "bg-white border border-gray-150 rounded-lg shadow-lg flex flex-col items-stretch overflow-hidden" }, /* @__PURE__ */ React__namespace.createElement(react.MenuItem, null, /* @__PURE__ */ React__namespace.createElement(
          "button",
          {
            className: `text-lg px-4 py-2 first:pt-3 last:pb-3 tracking-wide whitespace-nowrap flex items-center opacity-80 text-gray-600 hover:text-blue-400 hover:bg-gray-50 hover:opacity-100`,
            onClick: async () => {
              var _a, _b, _c, _d, _e, _f, _g, _h;
              updateBodyDisplacement({
                displayState: "closed",
                sidebarWidth: null,
                resizingSidebar: false
              });
              try {
                if ((_c = (_b = (_a = cms == null ? void 0 : cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.authProvider) == null ? void 0 : _c.logout) {
                  await ((_d = cms.api.tina) == null ? void 0 : _d.authProvider.logout());
                  if ((_f = (_e = cms == null ? void 0 : cms.api) == null ? void 0 : _e.tina) == null ? void 0 : _f.onLogout) {
                    await ((_h = (_g = cms == null ? void 0 : cms.api) == null ? void 0 : _g.tina) == null ? void 0 : _h.onLogout());
                    await new Promise(
                      (resolve) => setTimeout(resolve, 500)
                    );
                  }
                  window.location.href = new URL(
                    window.location.href
                  ).pathname;
                }
              } catch (e) {
                cms.alerts.error(`Error logging out: ${e}`);
                console.error("Unexpected error calling logout");
                console.error(e);
              }
            }
          },
          /* @__PURE__ */ React__namespace.createElement(BiExit, { className: "w-6 h-auto mr-2 text-blue-400" }),
          " Log Out"
        )), /* @__PURE__ */ React__namespace.createElement(react.MenuItem, null, /* @__PURE__ */ React__namespace.createElement(
          WrappedSyncStatus,
          {
            cms,
            setEventsOpen
          }
        )))
      ))))),
      eventsOpen && /* @__PURE__ */ React__namespace.createElement(SyncStatusModal, { cms, closeEventsModal }),
      children,
      /* @__PURE__ */ React__namespace.createElement("div", { className: "flex flex-col px-6 flex-1 overflow-auto" }, showCollections && /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("h4", { className: "flex space-x-1 justify-items-start uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700" }, /* @__PURE__ */ React__namespace.createElement("span", null, "Collections"), isLocalMode && /* @__PURE__ */ React__namespace.createElement("span", { className: "flex items-center" }, /* @__PURE__ */ React__namespace.createElement(
        "a",
        {
          href: "https://tina.io/docs/schema/#defining-collections",
          target: "_blank"
        },
        /* @__PURE__ */ React__namespace.createElement(FiInfo, null)
      ))), /* @__PURE__ */ React__namespace.createElement(
        CollectionsList,
        {
          RenderNavCollection,
          collections: contentCollections
        }
      )), (screenCategories.Site.length > 0 || contentCreators.length) > 0 && /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("h4", { className: "uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700" }, "Site"), /* @__PURE__ */ React__namespace.createElement("ul", { className: "flex flex-col gap-4" }, screenCategories.Site.map((view) => {
        return /* @__PURE__ */ React__namespace.createElement("li", { key: `nav-site-${view.name}` }, /* @__PURE__ */ React__namespace.createElement(RenderNavSite, { view }));
      }), contentCreators.map((plugin, idx) => {
        return /* @__PURE__ */ React__namespace.createElement(CreateContentNavItem, { key: `plugin-${idx}`, plugin });
      }), authCollection && /* @__PURE__ */ React__namespace.createElement(
        CollectionsList,
        {
          RenderNavCollection: AuthRenderNavCollection,
          collections: [authCollection]
        }
      ))), Object.entries(screenCategories).map(([category, screens2]) => {
        if (category !== "Site") {
          return /* @__PURE__ */ React__namespace.createElement("div", { key: category }, /* @__PURE__ */ React__namespace.createElement("h4", { className: "uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700" }, category), /* @__PURE__ */ React__namespace.createElement("ul", { className: "flex flex-col gap-4" }, screens2.map((view) => {
            return /* @__PURE__ */ React__namespace.createElement("li", { key: `nav-site-${view.name}` }, /* @__PURE__ */ React__namespace.createElement(RenderNavSite, { view }));
          })));
        }
      }), !!(cloudConfigs == null ? void 0 : cloudConfigs.length) && /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("h4", { className: "uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700" }, "Cloud"), /* @__PURE__ */ React__namespace.createElement("ul", { className: "flex flex-col gap-4" }, cloudConfigs.map((config) => {
        return /* @__PURE__ */ React__namespace.createElement("li", { key: `nav-site-${config.name}` }, /* @__PURE__ */ React__namespace.createElement(RenderNavCloud, { config }));
      }))), /* @__PURE__ */ React__namespace.createElement("div", { className: "grow" }), /* @__PURE__ */ React__namespace.createElement("span", { className: "font-sans font-light text-xs mb-3 mt-8 text-gray-500" }, "v", version))
    );
  };
  const CollectionsList = ({
    collections,
    RenderNavCollection
  }) => {
    if (collections.length === 0) {
      return /* @__PURE__ */ React__namespace.createElement("div", null, "No collections found");
    }
    return /* @__PURE__ */ React__namespace.createElement("ul", { className: "flex flex-col gap-4" }, collections.map((collection) => {
      return /* @__PURE__ */ React__namespace.createElement("li", { key: `nav-collection-${collection.name}` }, /* @__PURE__ */ React__namespace.createElement(RenderNavCollection, { collection }));
    }));
  };
  const CreateContentNavItem = ({ plugin }) => {
    const [open2, setOpen] = React__namespace.useState(false);
    return /* @__PURE__ */ React__namespace.createElement("li", { key: plugin.name }, /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: "text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100",
        onClick: () => {
          setOpen(true);
        }
      },
      /* @__PURE__ */ React__namespace.createElement(VscNewFile, { className: "mr-3 h-6 opacity-80 w-auto" }),
      " ",
      plugin.name
    ), open2 && /* @__PURE__ */ React__namespace.createElement(FormModal, { plugin, close: () => setOpen(false) }));
  };
  const ResizeHandle = () => {
    const {
      resizingSidebar,
      setResizingSidebar,
      fullscreen,
      setSidebarWidth,
      displayState
    } = React__namespace.useContext(SidebarContext);
    React__namespace.useEffect(() => {
      const handleMouseUp = () => setResizingSidebar(false);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, []);
    React__namespace.useEffect(() => {
      const handleMouseMove = (e) => {
        setSidebarWidth((sidebarWidth) => {
          const newWidth = sidebarWidth + e.movementX;
          const maxWidth = window.innerWidth - 8;
          if (newWidth < minSidebarWidth) {
            return minSidebarWidth;
          } else if (newWidth > maxWidth) {
            return maxWidth;
          } else {
            return newWidth;
          }
        });
      };
      if (resizingSidebar) {
        window.addEventListener("mousemove", handleMouseMove);
        document.body.classList.add("select-none");
      }
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        document.body.classList.remove("select-none");
      };
    }, [resizingSidebar]);
    const handleresizingSidebar = () => setResizingSidebar(true);
    if (fullscreen) {
      return null;
    }
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        onMouseDown: handleresizingSidebar,
        className: `z-100 absolute top-1/2 right-px w-2 h-32 bg-white rounded-r-md border border-gray-150 shadow-sm hover:shadow-md origin-left transition-all duration-150 ease-out transform translate-x-full -translate-y-1/2 group hover:bg-gray-50 ${displayState !== "closed" ? `opacity-100` : `opacity-0`} ${resizingSidebar ? `scale-110` : `scale-90 hover:scale-100`}`,
        style: { cursor: "grab" }
      },
      /* @__PURE__ */ React__namespace.createElement("span", { className: "absolute top-1/2 left-1/2 h-4/6 w-px bg-gray-200 transform -translate-y-1/2 -translate-x-1/2 opacity-30 transition-opacity duration-150 ease-out group-hover:opacity-100" })
    );
  };
  const Item = ({
    item,
    depth,
    setActiveFormId
  }) => {
    const cms = useCMS();
    const depths = ["pl-6", "pl-10", "pl-14"];
    const form = React__namespace.useMemo(
      () => cms.state.forms.find(({ tinaForm }) => item.formId === tinaForm.id),
      [item.formId]
    );
    return /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        type: "button",
        key: item.path,
        onClick: () => setActiveFormId(item.formId),
        className: `${depths[depth] || "pl-12"} pr-6 py-3 w-full h-full bg-transparent border-none text-lg text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center justify-between gap-2`
      },
      /* @__PURE__ */ React__namespace.createElement(BiEdit, { className: "opacity-70 w-5 h-auto text-blue-500 flex-none" }),
      /* @__PURE__ */ React__namespace.createElement("div", { className: "flex-1 flex flex-col gap-0.5 items-start" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "group-hover:text-blue-500 font-sans text-xs font-semibold text-gray-700 whitespace-normal" }, form.tinaForm.label), /* @__PURE__ */ React__namespace.createElement("div", { className: "group-hover:text-blue-500 text-base truncate leading-tight text-gray-600" }, form.tinaForm.id))
    );
  };
  const FormListItem = ({
    item,
    depth,
    setActiveFormId
  }) => {
    var _a;
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "divide-y divide-gray-200" }, /* @__PURE__ */ React__namespace.createElement(Item, { setActiveFormId, item, depth }), item.subItems && /* @__PURE__ */ React__namespace.createElement("ul", { className: "divide-y divide-gray-200" }, (_a = item.subItems) == null ? void 0 : _a.map((subItem) => {
      if (subItem.type === "document") {
        return /* @__PURE__ */ React__namespace.createElement("li", { key: subItem.formId }, /* @__PURE__ */ React__namespace.createElement(
          Item,
          {
            setActiveFormId,
            depth: depth + 1,
            item: subItem
          }
        ));
      }
    })));
  };
  const FormLists = (props) => {
    const cms = useCMS();
    return /* @__PURE__ */ React__namespace.createElement(
      react.Transition,
      {
        appear: true,
        show: true,
        as: "div",
        enter: "transition-all ease-out duration-150",
        enterFrom: "opacity-0 -translate-x-1/2",
        enterTo: "opacity-100",
        leave: "transition-all ease-out duration-150",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0 -translate-x-1/2"
      },
      cms.state.formLists.map((formList, index) => /* @__PURE__ */ React__namespace.createElement("div", { key: `${formList.id}-${index}`, className: "pt-16" }, /* @__PURE__ */ React__namespace.createElement(
        FormList,
        {
          isEditing: props.isEditing,
          setActiveFormId: (id) => {
            cms.dispatch({ type: "forms:set-active-form-id", value: id });
          },
          formList
        }
      )))
    );
  };
  const FormList = (props) => {
    const cms = useCMS();
    const listItems = React__namespace.useMemo(() => {
      var _a;
      const orderedListItems = [];
      const globalItems = [];
      const topItems = [];
      props.formList.items.forEach((item) => {
        if (item.type === "document") {
          const form = cms.state.forms.find(
            ({ tinaForm }) => tinaForm.id === item.formId
          );
          if (form.tinaForm.global) {
            globalItems.push(item);
          } else {
            orderedListItems.push(item);
          }
        } else {
          orderedListItems.push(item);
        }
      });
      if (((_a = orderedListItems[0]) == null ? void 0 : _a.type) === "document") {
        topItems.push({ type: "list", label: "Documents" });
      }
      let extra = [];
      if (globalItems.length) {
        extra = [{ type: "list", label: "Global Documents" }, ...globalItems];
      }
      return [...topItems, ...orderedListItems, ...extra];
    }, [JSON.stringify(props.formList.items)]);
    return /* @__PURE__ */ React__namespace.createElement("ul", null, /* @__PURE__ */ React__namespace.createElement("li", { className: "divide-y divide-gray-200" }, listItems.map((item, index) => {
      if (item.type === "list") {
        return /* @__PURE__ */ React__namespace.createElement(
          "div",
          {
            key: item.label,
            className: `relative group text-left w-full bg-white shadow-sm
   border-gray-100 px-6 -mt-px pb-3 ${index > 0 ? "pt-6 bg-gradient-to-b from-gray-50 via-white to-white" : "pt-3"}`
          },
          /* @__PURE__ */ React__namespace.createElement(
            "span",
            {
              className: "text-sm tracking-wide font-bold text-gray-700 uppercase"
            },
            item.label
          )
        );
      }
      return /* @__PURE__ */ React__namespace.createElement(
        FormListItem,
        {
          setActiveFormId: (id) => props.setActiveFormId(id),
          key: item.formId,
          item,
          depth: 0
        }
      );
    })));
  };
  const SidebarNoFormsPlaceholder = () => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: "relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto",
      style: {
        animationName: "fade-in",
        animationDelay: "300ms",
        animationTimingFunction: "ease-out",
        animationIterationCount: 1,
        animationFillMode: "both",
        animationDuration: "150ms"
      }
    },
    /* @__PURE__ */ React__namespace.createElement("p", { className: "block pb-5" }, "Looks like there's ", /* @__PURE__ */ React__namespace.createElement("br", null), "nothing to edit on ", /* @__PURE__ */ React__namespace.createElement("br", null), "this page."),
    /* @__PURE__ */ React__namespace.createElement("p", { className: "block pt-5" }, /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        href: "https://tina.io/docs/contextual-editing/overview",
        target: "_blank",
        as: "a"
      },
      /* @__PURE__ */ React__namespace.createElement(Emoji$1, { className: "mr-1.5" }, "📖"),
      " Contextual Editing Docs"
    ))
  );
  const Emoji$1 = ({ className = "", ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "span",
    {
      className: `text-[24px] leading-none inline-block ${className}`,
      ...props
    }
  );
  const minimumTimeToShowLoadingIndicator = 1e3;
  const FormsView = ({ loadingPlaceholder } = {}) => {
    const cms = useCMS$1();
    const { setFormIsPristine } = React__namespace.useContext(SidebarContext);
    const [isShowingLoading, setIsShowingLoading] = React__namespace.useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = React__namespace.useState(false);
    React__namespace.useEffect(() => {
      if (cms.state.isLoadingContent) {
        setIsShowingLoading(true);
        const timer = setTimeout(() => {
          if (!cms.state.isLoadingContent) {
            setIsShowingLoading(false);
            setInitialLoadComplete(true);
          }
        }, minimumTimeToShowLoadingIndicator);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsShowingLoading(false);
          setInitialLoadComplete(true);
        }, minimumTimeToShowLoadingIndicator);
        return () => clearTimeout(timer);
      }
    }, [cms.state.isLoadingContent]);
    if (isShowingLoading || !initialLoadComplete) {
      const LoadingPlaceholder = loadingPlaceholder || SidebarLoadingPlaceholder;
      return /* @__PURE__ */ React__namespace.createElement(LoadingPlaceholder, null);
    }
    if (!cms.state.formLists.length) {
      return /* @__PURE__ */ React__namespace.createElement(SidebarNoFormsPlaceholder, null);
    }
    const isMultiform = cms.state.forms.length > 1;
    const activeForm = cms.state.forms.find(
      ({ tinaForm }) => tinaForm.id === cms.state.activeFormId
    );
    const isEditing = !!activeForm;
    if (isMultiform && !activeForm) {
      return /* @__PURE__ */ React__namespace.createElement(FormLists, { isEditing });
    }
    const formMetas = cms.plugins.all("form:meta");
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, activeForm && /* @__PURE__ */ React__namespace.createElement(FormWrapper$1, { isEditing, isMultiform }, isMultiform && /* @__PURE__ */ React__namespace.createElement(MultiformFormHeader, { activeForm }), !isMultiform && /* @__PURE__ */ React__namespace.createElement(FormHeader, { activeForm }), formMetas == null ? void 0 : formMetas.map((meta) => /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, { key: meta.name }, /* @__PURE__ */ React__namespace.createElement(meta.Component, null))), /* @__PURE__ */ React__namespace.createElement(FormBuilder, { form: activeForm, onPristineChange: setFormIsPristine })));
  };
  const FormWrapper$1 = ({ isEditing, children }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: "flex-1 flex flex-col flex-nowrap overflow-hidden h-full w-full relative bg-white",
        style: isEditing ? {
          transform: "none",
          animationName: "fly-in-left",
          animationDuration: "150ms",
          animationDelay: "0",
          animationIterationCount: 1,
          animationTimingFunction: "ease-out"
        } : {
          transform: "translate3d(100%, 0, 0)"
        }
      },
      children
    );
  };
  const MultiformFormHeader = ({
    activeForm
  }) => {
    const cms = useCMS$1();
    const { formIsPristine } = React__namespace.useContext(SidebarContext);
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: "pt-18 pb-4 px-6 border-b border-gray-200 bg-gradient-to-t from-white to-gray-50"
      },
      /* @__PURE__ */ React__namespace.createElement("div", { className: "max-w-form mx-auto flex gap-2 justify-between items-center" }, /* @__PURE__ */ React__namespace.createElement(
        "button",
        {
          type: "button",
          className: "pointer-events-auto text-xs text-blue-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150",
          onClick: () => {
            const state = activeForm.tinaForm.finalForm.getState();
            if (state.invalid === true) {
              cms.alerts.error("Cannot navigate away from an invalid form.");
            } else {
              cms.dispatch({ type: "forms:set-active-form-id", value: null });
            }
          }
        },
        /* @__PURE__ */ React__namespace.createElement(BiDotsVertical, { className: "h-auto w-5 inline-block opacity-70" })
      ), /* @__PURE__ */ React__namespace.createElement(
        "button",
        {
          type: "button",
          className: "pointer-events-auto text-xs text-blue-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150",
          onClick: () => {
            const collectionName = cms.api.tina.schema.getCollectionByFullPath(
              cms.state.activeFormId
            ).name;
            window.location.href = `${new URL(window.location.href).pathname}#/collections/${collectionName}/~`;
          }
        },
        /* @__PURE__ */ React__namespace.createElement(BiHomeAlt, { className: "h-auto w-5 inline-block opacity-70" })
      ), /* @__PURE__ */ React__namespace.createElement("span", { className: "opacity-30 text-sm leading-tight whitespace-nowrap flex-0" }, "/"), /* @__PURE__ */ React__namespace.createElement("span", { className: "block w-full text-sm leading-tight whitespace-nowrap truncate" }, activeForm.tinaForm.label || activeForm.tinaForm.id), /* @__PURE__ */ React__namespace.createElement(FormStatus, { pristine: formIsPristine }))
    );
  };
  const FormHeader = ({ activeForm }) => {
    const { formIsPristine } = React__namespace.useContext(SidebarContext);
    const cms = useCMS$1();
    const shortFormLabel = activeForm.tinaForm.label ? activeForm.tinaForm.label.replace(/^.*[\\\/]/, "") : false;
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: "pt-18 pb-4 px-6 border-b border-gray-200 bg-gradient-to-t from-white to-gray-50"
      },
      /* @__PURE__ */ React__namespace.createElement("div", { className: "max-w-form mx-auto flex gap-2 justify-between items-center" }, /* @__PURE__ */ React__namespace.createElement(
        "button",
        {
          type: "button",
          className: "pointer-events-auto text-xs text-blue-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150",
          onClick: () => {
            const collectionName = cms.api.tina.schema.getCollectionByFullPath(
              cms.state.activeFormId
            ).name;
            window.location.href = `${new URL(window.location.href).pathname}#/collections/${collectionName}/~`;
          }
        },
        /* @__PURE__ */ React__namespace.createElement(BiHomeAlt, { className: "h-auto w-5 inline-block opacity-70" })
      ), shortFormLabel && /* @__PURE__ */ React__namespace.createElement("span", { className: "block w-full text-sm leading-tight whitespace-nowrap truncate" }, shortFormLabel), /* @__PURE__ */ React__namespace.createElement(FormStatus, { pristine: formIsPristine }))
    );
  };
  const SidebarContext = React__namespace.createContext(null);
  const minPreviewWidth = 440;
  const minSidebarWidth = 360;
  const navBreakpoint = 1279;
  const LOCALSTATEKEY = "tina.sidebarState";
  const LOCALWIDTHKEY = "tina.sidebarWidth";
  const defaultSidebarWidth = 440;
  const defaultSidebarPosition = "displace";
  const defaultSidebarState = "open";
  function SidebarProvider({
    position = defaultSidebarPosition,
    resizingSidebar,
    setResizingSidebar,
    defaultWidth = defaultSidebarWidth,
    sidebar
  }) {
    var _a, _b, _c;
    useSubscribable(sidebar);
    const cms = useCMS$1();
    if (!cms.enabled)
      return null;
    return /* @__PURE__ */ React__namespace.createElement(
      Sidebar$1,
      {
        position: ((_a = cms == null ? void 0 : cms.sidebar) == null ? void 0 : _a.position) || position,
        defaultWidth: ((_b = cms == null ? void 0 : cms.sidebar) == null ? void 0 : _b.defaultWidth) || defaultWidth,
        resizingSidebar,
        setResizingSidebar,
        renderNav: (
          // @ts-ignore
          typeof ((_c = cms == null ? void 0 : cms.sidebar) == null ? void 0 : _c.renderNav) !== "undefined" ? (
            // @ts-ignore
            cms.sidebar.renderNav
          ) : true
        ),
        sidebar
      }
    );
  }
  const useFetchCollections = (cms) => {
    return { collections: cms.api.admin.fetchCollections(), loading: false };
  };
  const Sidebar$1 = ({
    sidebar,
    defaultWidth,
    // defaultState,
    position,
    renderNav,
    resizingSidebar,
    setResizingSidebar
  }) => {
    var _a, _b, _c, _d, _e, _f;
    const cms = useCMS$1();
    const collectionsInfo = useFetchCollections(cms);
    const [branchingEnabled, setBranchingEnabled] = React__namespace.useState(
      () => cms.flags.get("branch-switcher")
    );
    React__namespace.useEffect(() => {
      cms.events.subscribe("flag:set", ({ key, value }) => {
        if (key === "branch-switcher") {
          setBranchingEnabled(value);
        }
      });
    }, [cms.events]);
    const screens = cms.plugins.getType("screen");
    const cloudConfigs = cms.plugins.getType("cloud-config");
    useSubscribable(sidebar);
    useSubscribable(screens);
    const allScreens = screens.all();
    const allConfigs = cloudConfigs.all();
    const [menuIsOpen, setMenuIsOpen] = React.useState(false);
    const [activeScreen, setActiveView] = React.useState(null);
    const [sidebarWidth, setSidebarWidth] = React__namespace.useState(defaultWidth);
    const [formIsPristine, setFormIsPristine] = React__namespace.useState(true);
    const activeScreens = allScreens.filter(
      (screen) => {
        var _a2, _b2;
        return screen.navCategory !== "Account" || ((_b2 = (_a2 = cms.api.tina) == null ? void 0 : _a2.authProvider) == null ? void 0 : _b2.getLoginStrategy()) === "UsernamePassword";
      }
    );
    const setDisplayState = (value) => cms.dispatch({ type: "sidebar:set-display-state", value });
    const displayState = cms.state.sidebarDisplayState;
    React__namespace.useEffect(() => {
      if (typeof window !== "undefined") {
        const localSidebarState = window.localStorage.getItem(LOCALSTATEKEY);
        const localSidebarWidth = window.localStorage.getItem(LOCALWIDTHKEY);
        if (localSidebarState !== null) {
          setDisplayState(JSON.parse(localSidebarState));
        }
        if (localSidebarWidth !== null) {
          setSidebarWidth(JSON.parse(localSidebarWidth));
        }
      }
    }, []);
    React__namespace.useEffect(() => {
      if (typeof window !== "undefined") {
        const localSidebarState = window.localStorage.getItem(LOCALSTATEKEY);
        if (localSidebarState === null) {
          setDisplayState(defaultSidebarState);
        }
      }
    }, [defaultSidebarState]);
    React__namespace.useEffect(() => {
      if (typeof window !== "undefined" && cms.enabled) {
        window.localStorage.setItem(LOCALSTATEKEY, JSON.stringify(displayState));
      }
    }, [displayState, cms]);
    React__namespace.useEffect(() => {
      if (resizingSidebar) {
        window.localStorage.setItem(LOCALWIDTHKEY, JSON.stringify(sidebarWidth));
      }
    }, [sidebarWidth, resizingSidebar]);
    const isTinaAdminEnabled = cms.flags.get("tina-admin") === false ? false : true;
    const contentCreators = isTinaAdminEnabled ? [] : cms.plugins.getType("content-creator").all();
    const toggleFullscreen = () => {
      if (displayState === "fullscreen") {
        setDisplayState("open");
      } else {
        setDisplayState("fullscreen");
      }
    };
    const toggleSidebarOpen = () => {
      cms.dispatch({ type: "toggle-edit-state" });
    };
    const toggleMenu = () => {
      setMenuIsOpen((menuIsOpen2) => !menuIsOpen2);
    };
    React__namespace.useEffect(() => {
      const updateLayout = () => {
        if (displayState === "fullscreen") {
          return;
        }
        updateBodyDisplacement({
          position,
          displayState,
          sidebarWidth,
          resizingSidebar
        });
      };
      updateLayout();
      window.addEventListener("resize", updateLayout);
      return () => {
        window.removeEventListener("resize", updateLayout);
      };
    }, [displayState, position, sidebarWidth, resizingSidebar]);
    const windowWidth = windowSize.useWindowWidth();
    const displayNav = renderNav && (sidebarWidth > navBreakpoint && windowWidth > navBreakpoint || displayState === "fullscreen" && windowWidth > navBreakpoint);
    const renderMobileNav = renderNav && (sidebarWidth < navBreakpoint + 1 || windowWidth < navBreakpoint + 1);
    return /* @__PURE__ */ React__namespace.createElement(
      SidebarContext.Provider,
      {
        value: {
          sidebarWidth,
          setSidebarWidth,
          displayState,
          setDisplayState,
          position,
          toggleFullscreen,
          toggleSidebarOpen,
          resizingSidebar,
          setResizingSidebar,
          menuIsOpen,
          setMenuIsOpen,
          toggleMenu,
          setActiveView,
          formIsPristine,
          setFormIsPristine
        }
      },
      /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(SidebarWrapper, null, /* @__PURE__ */ React__namespace.createElement(EditButton, null), displayNav && /* @__PURE__ */ React__namespace.createElement(
        Nav,
        {
          isLocalMode: (_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isLocalMode,
          showCollections: isTinaAdminEnabled,
          collectionsInfo,
          screens: activeScreens,
          cloudConfigs: allConfigs,
          contentCreators,
          sidebarWidth,
          RenderNavSite: ({ view }) => /* @__PURE__ */ React__namespace.createElement(
            SidebarSiteLink,
            {
              view,
              onClick: () => {
                setActiveView(view);
                setMenuIsOpen(false);
              }
            }
          ),
          RenderNavCloud: ({ config }) => /* @__PURE__ */ React__namespace.createElement(SidebarCloudLink$1, { config }),
          RenderNavCollection: ({ collection }) => /* @__PURE__ */ React__namespace.createElement(
            SidebarCollectionLink,
            {
              onClick: () => {
                setMenuIsOpen(false);
              },
              collection
            }
          ),
          AuthRenderNavCollection: ({ collection }) => /* @__PURE__ */ React__namespace.createElement(
            SidebarCollectionLink,
            {
              onClick: () => {
                setMenuIsOpen(false);
              },
              collection,
              Icon: ImUsers
            }
          )
        }
      ), /* @__PURE__ */ React__namespace.createElement(SidebarBody, null, /* @__PURE__ */ React__namespace.createElement(
        SidebarHeader,
        {
          displayNav,
          renderNav,
          isLocalMode: (_d = (_c = cms.api) == null ? void 0 : _c.tina) == null ? void 0 : _d.isLocalMode,
          branchingEnabled
        }
      ), /* @__PURE__ */ React__namespace.createElement(FormsView, { loadingPlaceholder: sidebar.loadingPlaceholder }), activeScreen && /* @__PURE__ */ React__namespace.createElement(
        ScreenPluginModal,
        {
          screen: activeScreen,
          close: () => setActiveView(null)
        }
      )), /* @__PURE__ */ React__namespace.createElement(ResizeHandle, null)), renderMobileNav && /* @__PURE__ */ React__namespace.createElement(react.Transition, { show: menuIsOpen, as: "div" }, /* @__PURE__ */ React__namespace.createElement(
        react.TransitionChild,
        {
          enter: "transform transition-all ease-out duration-300",
          enterFrom: "opacity-0 -translate-x-full",
          enterTo: "opacity-100 translate-x-0",
          leave: "transform transition-all ease-in duration-200",
          leaveFrom: "opacity-100 translate-x-0",
          leaveTo: "opacity-0 -translate-x-full"
        },
        /* @__PURE__ */ React__namespace.createElement("div", { className: "fixed left-0 top-0 z-overlay h-full transform" }, /* @__PURE__ */ React__namespace.createElement(
          Nav,
          {
            isLocalMode: (_f = (_e = cms.api) == null ? void 0 : _e.tina) == null ? void 0 : _f.isLocalMode,
            className: "rounded-r-md",
            showCollections: isTinaAdminEnabled,
            collectionsInfo,
            screens: activeScreens,
            cloudConfigs: allConfigs,
            contentCreators,
            sidebarWidth,
            RenderNavSite: ({ view }) => /* @__PURE__ */ React__namespace.createElement(
              SidebarSiteLink,
              {
                view,
                onClick: () => {
                  setActiveView(view);
                  setMenuIsOpen(false);
                }
              }
            ),
            RenderNavCloud: ({ config }) => /* @__PURE__ */ React__namespace.createElement(SidebarCloudLink$1, { config }),
            RenderNavCollection: ({ collection }) => /* @__PURE__ */ React__namespace.createElement(
              SidebarCollectionLink,
              {
                onClick: () => {
                  setMenuIsOpen(false);
                },
                collection
              }
            ),
            AuthRenderNavCollection: ({ collection }) => /* @__PURE__ */ React__namespace.createElement(
              SidebarCollectionLink,
              {
                onClick: () => {
                  setMenuIsOpen(false);
                },
                collection,
                Icon: ImUsers
              }
            )
          },
          /* @__PURE__ */ React__namespace.createElement("div", { className: "absolute top-8 right-0 transform translate-x-full overflow-hidden" }, /* @__PURE__ */ React__namespace.createElement(
            Button$1,
            {
              rounded: "right",
              variant: "secondary",
              onClick: () => {
                setMenuIsOpen(false);
              },
              className: "transition-opacity duration-150 ease-out"
            },
            /* @__PURE__ */ React__namespace.createElement(IoMdClose, { className: "h-5 w-auto text-blue-500" })
          ))
        ))
      ), /* @__PURE__ */ React__namespace.createElement(
        react.TransitionChild,
        {
          enter: "ease-out duration-300",
          enterFrom: "opacity-0",
          enterTo: "opacity-80",
          entered: "opacity-80",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-80",
          leaveTo: "opacity-0"
        },
        /* @__PURE__ */ React__namespace.createElement(
          "div",
          {
            onClick: () => {
              setMenuIsOpen(false);
            },
            className: "fixed z-menu inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          }
        )
      )))
    );
  };
  const updateBodyDisplacement = ({
    position = "overlay",
    displayState,
    sidebarWidth,
    resizingSidebar
  }) => {
    const body = document.getElementsByTagName("body")[0];
    const windowWidth = window.innerWidth;
    if (position === "displace") {
      body.style.transition = resizingSidebar ? "" : displayState === "fullscreen" ? "padding 0ms 150ms" : displayState === "closed" ? "padding 0ms 0ms" : "padding 0ms 300ms";
      if (displayState === "open") {
        const bodyDisplacement = Math.min(
          sidebarWidth,
          windowWidth - minPreviewWidth
        );
        body.style.paddingLeft = `${bodyDisplacement}px`;
      } else {
        body.style.paddingLeft = "0";
      }
    } else {
      body.style.transition = "";
      body.style.paddingLeft = "0";
    }
  };
  const SidebarHeader = ({
    branchingEnabled,
    renderNav,
    displayNav,
    isLocalMode
  }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const { toggleFullscreen, displayState, setMenuIsOpen, toggleSidebarOpen } = React__namespace.useContext(SidebarContext);
    const displayMenuButton = renderNav && !displayNav;
    const cms = useCMS$1();
    const previewFunction = (_f = (_e = (_d = (_c = (_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.schema) == null ? void 0 : _c.config) == null ? void 0 : _d.config) == null ? void 0 : _e.ui) == null ? void 0 : _f.previewUrl;
    const branch = (_h = (_g = cms.api) == null ? void 0 : _g.tina) == null ? void 0 : _h.branch;
    const previewUrl = typeof previewFunction === "function" ? (_i = previewFunction({ branch })) == null ? void 0 : _i.url : null;
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex-grow-0 w-full overflow-visible z-20" }, isLocalMode && /* @__PURE__ */ React__namespace.createElement(LocalWarning, null), !isLocalMode && /* @__PURE__ */ React__namespace.createElement(BillingWarning, null), /* @__PURE__ */ React__namespace.createElement("div", { className: "mt-4 -mb-14 w-full flex gap-3 items-center justify-between pointer-events-none" }, displayMenuButton && /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        rounded: "right",
        variant: "white",
        onClick: () => {
          setMenuIsOpen(true);
        },
        className: "pointer-events-auto -ml-px"
      },
      /* @__PURE__ */ React__namespace.createElement(BiMenu, { className: "h-6 w-auto text-blue-500" })
    ), /* @__PURE__ */ React__namespace.createElement("div", { className: "flex-1 flex gap-3 items-center shrink min-w-0" }, branchingEnabled && !isLocalMode && /* @__PURE__ */ React__namespace.createElement(BranchButton, null), branchingEnabled && !isLocalMode && previewUrl && /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: "pointer-events-auto flex min-w-0	shrink gap-1 items-center justify-between form-select text-sm h-10 px-4 shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-100 transition-color duration-150 ease-out rounded-full focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight min-w-[5rem]",
        onClick: () => {
          window.open(previewUrl, "_blank");
        }
      },
      /* @__PURE__ */ React__namespace.createElement(BiLinkExternal, { className: "flex-shrink-0 w-4 h-auto text-blue-500/70 mr-1" }),
      /* @__PURE__ */ React__namespace.createElement("span", { className: "truncate max-w-full min-w-0 shrink" }, "Preview")
    )), /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: "flex items-center pointer-events-auto transition-opacity duration-150 ease-in-out -mr-px"
      },
      /* @__PURE__ */ React__namespace.createElement(
        Button$1,
        {
          rounded: "left",
          variant: "white",
          onClick: toggleSidebarOpen,
          "aria-label": "closes cms sidebar",
          className: "-mr-px"
        },
        /* @__PURE__ */ React__namespace.createElement(MdOutlineArrowBackIos, { className: "h-[18px] w-auto -mr-1 text-blue-500" })
      ),
      /* @__PURE__ */ React__namespace.createElement(Button$1, { rounded: "custom", variant: "white", onClick: toggleFullscreen }, displayState === "fullscreen" ? (
        // BiCollapseAlt
        /* @__PURE__ */ React__namespace.createElement(
          "svg",
          {
            className: "h-5 w-auto -mx-1 text-blue-500",
            stroke: "currentColor",
            fill: "currentColor",
            strokeWidth: "0",
            viewBox: "0 0 24 24",
            xmlns: "http://www.w3.org/2000/svg"
          },
          /* @__PURE__ */ React__namespace.createElement("path", { d: "M2 15h7v7h2v-9H2v2zM15 2h-2v9h9V9h-7V2z" })
        )
      ) : /* @__PURE__ */ React__namespace.createElement(BiExpandAlt, { className: "h-5 -mx-1 w-auto text-blue-500" }))
    )));
  };
  const SidebarSiteLink = ({
    view,
    onClick
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: "text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100",
        value: view.name,
        onClick
      },
      /* @__PURE__ */ React__namespace.createElement(view.Icon, { className: "mr-2 h-6 opacity-80 w-auto" }),
      " ",
      view.name
    );
  };
  const SidebarCloudLink$1 = ({ config }) => {
    if (config.text) {
      return /* @__PURE__ */ React__namespace.createElement("span", { className: "text-base tracking-wide text-gray-500 flex items-center opacity-90" }, config.text, " ", /* @__PURE__ */ React__namespace.createElement(
        "a",
        {
          target: "_blank",
          className: "ml-1 text-blue-600 hover:opacity-60",
          href: config.link.href
        },
        config.link.text
      ));
    }
    return /* @__PURE__ */ React__namespace.createElement("span", { className: "text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100" }, /* @__PURE__ */ React__namespace.createElement(config.Icon, { className: "mr-2 h-6 opacity-80 w-auto" }), /* @__PURE__ */ React__namespace.createElement("a", { target: "_blank", href: config.link.href }, config.link.text));
  };
  const SidebarCollectionLink = ({
    Icon = ImFilesEmpty,
    collection,
    onClick
  }) => {
    const cms = useCMS$1();
    const tinaPreview = cms.flags.get("tina-preview") || false;
    return /* @__PURE__ */ React__namespace.createElement(
      "a",
      {
        onClick,
        href: `${tinaPreview ? `/${tinaPreview}/index.html#` : "/admin#"}/collections/${collection.name}/~`,
        className: "text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100"
      },
      /* @__PURE__ */ React__namespace.createElement(Icon, { className: "mr-2 h-6 opacity-80 w-auto" }),
      " ",
      collection.label ? collection.label : collection.name
    );
  };
  const EditButton = ({}) => {
    const { displayState, toggleSidebarOpen } = React__namespace.useContext(SidebarContext);
    return /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        rounded: "right",
        variant: "primary",
        size: "custom",
        onClick: toggleSidebarOpen,
        className: `z-chrome absolute top-6 right-0 translate-x-full text-sm h-10 pl-3 pr-4 transition-all duration-300 ${displayState !== "closed" ? "opacity-0 ease-in pointer-events-none" : "ease-out pointer-events-auto"}`,
        "aria-label": "opens cms sidebar"
      },
      /* @__PURE__ */ React__namespace.createElement(BiPencil, { className: "h-6 w-auto" })
    );
  };
  const SidebarWrapper = ({ children }) => {
    const { displayState, sidebarWidth, resizingSidebar } = React__namespace.useContext(SidebarContext);
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: `fixed top-0 left-0 h-dvh z-base ${displayState === "closed" ? "pointer-events-none" : ""}`
      },
      /* @__PURE__ */ React__namespace.createElement(
        "div",
        {
          className: `relative h-dvh transform flex ${displayState !== "closed" ? "" : "-translate-x-full"} ${resizingSidebar ? "transition-none" : displayState === "closed" ? "transition-all duration-300 ease-in" : displayState === "fullscreen" ? "transition-all duration-150 ease-out" : "transition-all duration-300 ease-out"}`,
          style: {
            width: displayState === "fullscreen" ? "100vw" : `${sidebarWidth}px`,
            maxWidth: displayState === "fullscreen" ? "100vw" : "calc(100vw - 8px)",
            minWidth: "360px"
          }
        },
        children
      )
    );
  };
  const SidebarBody = ({ children }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: "relative left-0 w-full h-full flex flex-col items-stretch bg-white border-r border-gray-200 overflow-hidden"
      },
      children
    );
  };
  const DEFAULT_FIELDS = [
    TextFieldPlugin,
    TextareaFieldPlugin,
    ImageFieldPlugin,
    ColorFieldPlugin,
    NumberFieldPlugin,
    ToggleFieldPlugin,
    SelectFieldPlugin,
    RadioGroupFieldPlugin,
    GroupFieldPlugin,
    GroupListFieldPlugin,
    ListFieldPlugin,
    BlocksFieldPlugin,
    TagsFieldPlugin,
    DateFieldPlugin,
    MarkdownFieldPlaceholder,
    HtmlFieldPlaceholder,
    CheckboxGroupFieldPlugin,
    ReferenceFieldPlugin,
    ButtonToggleFieldPlugin,
    HiddenFieldPlugin,
    PasswordFieldPlugin
  ];
  class TinaCMS extends CMS {
    constructor({
      sidebar,
      alerts = {},
      isLocalClient,
      isSelfHosted,
      clientId,
      ...config
    } = {}) {
      super(config);
      this.api = {};
      this.alerts.setMap({
        "media:upload:failure": (event) => {
          return {
            error: event.error,
            level: "error",
            message: `Failed to upload file(s) ${event == null ? void 0 : event.uploaded.map((x) => x.file.name).join(", ")}. 

 ${event == null ? void 0 : event.error.toString()}`
          };
        },
        "media:delete:failure": () => ({
          level: "error",
          message: "Failed to delete file."
        }),
        ...alerts
      });
      if (sidebar) {
        const sidebarConfig = typeof sidebar === "object" ? sidebar : void 0;
        this.sidebar = new SidebarState(this.events, sidebarConfig);
      }
      DEFAULT_FIELDS.forEach((field) => {
        if (!this.fields.find(field.name)) {
          this.fields.add(field);
        }
      });
      this.plugins.add(MediaManagerScreenPlugin);
      this.plugins.add(PasswordScreenPlugin);
      if (isLocalClient !== true) {
        if (clientId) {
          this.plugins.add(
            createCloudConfig({
              name: "Project Config",
              link: {
                text: "Project Config",
                href: `https://app.tina.io/projects/${clientId}/overview`
              }
            })
          );
          this.plugins.add(
            createCloudConfig({
              name: "User Management",
              link: {
                text: "User Management",
                href: `https://app.tina.io/projects/${clientId}/collaborators`
              },
              Icon: MdOutlinePerson
            })
          );
          this.plugins.add(
            createCloudConfig({
              name: "Support",
              link: {
                text: "Support",
                href: "https://tina.io/docs/support"
              },
              Icon: MdOutlineHelpOutline
            })
          );
        } else if (!isSelfHosted) {
          this.plugins.add(
            createCloudConfig({
              name: "Setup Cloud",
              text: "No project configured, set one up ",
              link: {
                text: "here",
                href: "https://app.tina.io"
              }
            })
          );
        }
      }
    }
    get alerts() {
      if (!this._alerts) {
        this._alerts = new Alerts$1(this.events);
      }
      return this._alerts;
    }
    registerApi(name, api) {
      if (api.alerts) {
        this.alerts.setMap(api.alerts);
      }
      super.registerApi(name, api);
    }
    get forms() {
      return this.plugins.findOrCreateMap("form");
    }
    get fields() {
      return this.plugins.findOrCreateMap("field");
    }
    get screens() {
      return this.plugins.findOrCreateMap("screen");
    }
    removeAllForms() {
      this.forms.all().forEach((form) => {
        this.forms.remove(form);
      });
    }
    /**
     * When a form is associated with any queries
     * it's considered orphaned.
     */
    removeOrphanedForms() {
      const orphanedForms = this.forms.all().filter((form) => form.queries.length === 0);
      orphanedForms.forEach((form) => {
        this.forms.remove(form);
      });
    }
  }
  const initialState = (cms) => {
    var _a;
    return {
      activeFormId: null,
      forms: [],
      formLists: [],
      editingMode: "basic",
      isLoadingContent: false,
      quickEditSupported: false,
      sidebarDisplayState: ((_a = cms == null ? void 0 : cms.sidebar) == null ? void 0 : _a.defaultState) || "open"
    };
  };
  function tinaReducer(state, action) {
    switch (action.type) {
      case "set-quick-editing-supported":
        return {
          ...state,
          quickEditSupported: action.value
        };
      case "set-edit-mode":
        return { ...state, editingMode: action.value };
      case "forms:add":
        if (state.forms.find((f) => f.tinaForm.id === action.value.id)) {
          return state;
        }
        return { ...state, forms: [...state.forms, { tinaForm: action.value }] };
      case "forms:remove":
        return {
          ...state,
          forms: state.forms.filter((form) => form.tinaForm.id !== action.value)
        };
      case "form-lists:clear": {
        return {
          ...state,
          quickEditSupported: false,
          activeFormId: null,
          formLists: [],
          forms: []
        };
      }
      case "form-lists:add": {
        let formListItemExists = false;
        const nextFormLists = state.formLists.map((formList) => {
          if (formList.id === action.value.id) {
            formListItemExists = true;
            return action.value;
          }
          return formList;
        });
        if (!formListItemExists) {
          nextFormLists.push(action.value);
        }
        let activeFormId = state.activeFormId;
        if (!activeFormId && state.formLists.length === 0) {
          action.value.items.forEach((item) => {
            if (!activeFormId) {
              if (item.type === "document") {
                const form = state.forms.find(
                  ({ tinaForm }) => item.formId === tinaForm.id
                );
                if (!form.tinaForm.global) {
                  activeFormId = item.formId;
                }
              }
            }
          });
        }
        return {
          ...state,
          activeFormId,
          formLists: nextFormLists,
          isLoadingContent: false
        };
      }
      case "form-lists:remove": {
        const nextFormLists = state.formLists.filter(
          ({ id }) => id !== action.value
        );
        const allFormIdsListed = [];
        nextFormLists.forEach((formList) => {
          formList.formIds.forEach((id) => {
            allFormIdsListed.push(id);
          });
        });
        const nextForms = state.forms.filter(
          ({ tinaForm }) => allFormIdsListed.includes(tinaForm.id)
        );
        return {
          ...state,
          quickEditSupported: false,
          // Always set it to null for now, this will become more annoying for users
          // when `useTina` hooks are mounting client-side as a result of the app itself
          // rather than route navigation
          activeFormId: null,
          forms: nextForms,
          formLists: nextFormLists
        };
      }
      case "forms:set-active-form-id":
        if (action.value !== state.activeFormId) {
          return {
            ...state,
            activeFormId: action.value
          };
        }
        return state;
      case "forms:set-active-field-name":
        const forms = state.forms.map((form) => {
          if (form.tinaForm.id === action.value.formId) {
            return {
              tinaForm: form.tinaForm,
              activeFieldName: action.value.fieldName
            };
          }
          return form;
        });
        return { ...state, forms, activeFormId: action.value.formId };
      case "toggle-edit-state": {
        return state.sidebarDisplayState === "closed" ? { ...state, sidebarDisplayState: "open" } : {
          ...state,
          sidebarDisplayState: "closed"
        };
      }
      case "sidebar:set-display-state": {
        if (action.value === "openOrFull") {
          if (state.sidebarDisplayState === "closed") {
            return {
              ...state,
              sidebarDisplayState: "open"
            };
          }
          return state;
        }
        if (action.value === "open") {
          return {
            ...state,
            sidebarDisplayState: action.value
          };
        }
        return { ...state, sidebarDisplayState: action.value };
      }
      case "sidebar:set-loading-state": {
        return { ...state, isLoadingContent: action.value };
      }
      default:
        throw new Error(`Unhandled action ${action.type}`);
    }
  }
  const INVALID_CMS_ERROR = "The `cms` prop must be an instance of `TinaCMS`.";
  const TinaCMSProvider = ({
    cms,
    children
  }) => {
    const [state, dispatch] = React__namespace.useReducer(tinaReducer, cms, initialState);
    if (!(cms instanceof TinaCMS)) {
      throw new Error(INVALID_CMS_ERROR);
    }
    return /* @__PURE__ */ React__namespace.createElement(CMSContext.Provider, { value: { cms, state, dispatch } }, children);
  };
  function Alerts({ alerts }) {
    useSubscribable(alerts);
    if (!alerts.all.length) {
      return null;
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-0 left-0 right-0 p-6 flex flex-col items-center z-[999999] pointer-events-none" }, alerts.all.filter((alert) => {
      return alert.level !== "error";
    }).map((alert) => {
      return /* @__PURE__ */ React.createElement(Alert, { key: alert.id, level: alert.level }, alert.level === "info" && /* @__PURE__ */ React.createElement(BiInfoCircle, { className: "w-5 h-auto opacity-70" }), alert.level === "success" && /* @__PURE__ */ React.createElement(BiCheckCircle, { className: "w-5 h-auto opacity-70" }), alert.level === "warn" && /* @__PURE__ */ React.createElement(BiError, { className: "w-5 h-auto opacity-70" }), /* @__PURE__ */ React.createElement("p", { className: "m-0 flex-1 max-w-[680px] text-left" }, alert.message.toString()), /* @__PURE__ */ React.createElement(
        CloseAlert,
        {
          onClick: () => {
            alerts.dismiss(alert);
          }
        }
      ));
    })), alerts.all.filter((alert) => {
      return alert.level === "error";
    }).map((alert) => {
      const AlertMessage = typeof alert.message === "string" ? () => {
        return /* @__PURE__ */ React.createElement("p", { className: "text-base mb-3 overflow-y-auto" }, alert.message.toString());
      } : alert.message;
      return /* @__PURE__ */ React.createElement(Modal, { key: alert.id }, /* @__PURE__ */ React.createElement(PopupModal, null, /* @__PURE__ */ React.createElement(
        ModalHeader,
        {
          close: () => {
            alerts.dismiss(alert);
          }
        },
        /* @__PURE__ */ React.createElement(BiError, { className: "mr-1 w-6 h-auto fill-current inline-block text-red-600" }),
        " ",
        "Error"
      ), /* @__PURE__ */ React.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React.createElement("div", { className: "tina-prose" }, /* @__PURE__ */ React.createElement(AlertMessage, null))), /* @__PURE__ */ React.createElement(ModalActions, null, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }), /* @__PURE__ */ React.createElement(
        Button$1,
        {
          style: { flexGrow: 1 },
          onClick: () => {
            alerts.dismiss(alert);
          }
        },
        "Close"
      ))));
    }));
  }
  const Alert = ({
    level,
    ...props
  }) => {
    const colorClasses = {
      info: "bg-blue-100 border-blue-500 text-blue-600 fill-blue-500",
      success: "bg-green-100 border-green-500 text-green-600 fill-green-500",
      warn: "bg-yellow-100 border-yellow-500 text-yellow-600 fill-yellow-500",
      error: "bg-red-100 border-red-500 text-red-600 fill-red-500"
    };
    const borderClasses = {
      info: "border-blue-200",
      success: "border-green-200",
      warn: "border-yellow-200",
      error: "border-red-200"
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `rounded shadow-lg border-l-[6px] font-normal cursor-pointer pointer-events-all text-sm transition-all duration-100 ease-out mb-4 max-w-full ${colorClasses[level]}}`,
        style: {
          animationName: "fly-in-up, fade-in",
          animationTimingFunction: "ease-out",
          animationIterationCount: 1,
          animationFillMode: "both",
          animationDuration: "150ms"
        }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          className: `flex items-center gap-1.5 min-w-[350px] rounded-r border p-2 ${borderClasses[level]}`,
          ...props
        }
      )
    );
  };
  const CloseAlert = ({ ...styleProps }) => /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "border-none bg-transparent p-0 outline-none flex items-center",
      ...styleProps
    },
    /* @__PURE__ */ React.createElement(BiX, { className: "w-5 auto flex-grow-0 flex-shrink-0 opacity-50" })
  );
  function CursorPaginator({
    navigateNext,
    navigatePrev,
    hasNext,
    hasPrev,
    variant = "white"
  }) {
    return /* @__PURE__ */ React.createElement("div", { className: "w-full flex flex-shrink-0 justify-end gap-2 items-center" }, /* @__PURE__ */ React.createElement(Button$1, { variant, disabled: !hasPrev, onClick: navigatePrev }, /* @__PURE__ */ React.createElement(BiLeftArrowAlt, { className: "w-6 h-full mr-2 opacity-70" }), " Previous"), /* @__PURE__ */ React.createElement(Button$1, { variant, disabled: !hasNext, onClick: navigateNext }, "Next ", /* @__PURE__ */ React.createElement(BiRightArrowAlt, { className: "w-6 h-full ml-2 opacity-70" })));
  }
  const MutationSignalContext = React__namespace.createContext(-1);
  const MutationSignalProvider = ({ children }) => {
    const observerAreaRef = React__namespace.useRef(null);
    const [signal, setSignal] = React__namespace.useState(0);
    React__namespace.useEffect(() => {
      if (!observerAreaRef)
        return;
      const observer = new MutationObserver(() => setSignal((s) => s + 1));
      observer.observe(observerAreaRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
      return () => observer.disconnect();
    }, []);
    return /* @__PURE__ */ React__namespace.createElement(MutationSignalContext.Provider, { value: signal }, /* @__PURE__ */ React__namespace.createElement("div", { ref: observerAreaRef }, children));
  };
  const useFieldReference = (fieldName) => {
    const signal = React__namespace.useContext(MutationSignalContext);
    const [ele, setEle] = React__namespace.useState(null);
    React__namespace.useEffect(() => {
      let doc;
      const iframe = document.getElementById("tina-iframe");
      if (iframe) {
        doc = iframe.contentDocument;
      } else {
        doc = document;
      }
      const fieldEle = doc.querySelector(
        `[data-tinafield="${fieldName}"]`
      );
      if (!fieldEle) {
        if (fieldName == null ? void 0 : fieldName.includes("#")) {
          const fieldNameWithoutFormId = fieldName.split("#")[1];
          const fieldEle2 = doc.querySelector(
            `[data-tinafield="${fieldNameWithoutFormId}"]`
          );
          setEle(fieldEle2);
        }
      } else {
        setEle(fieldEle);
      }
    }, [signal, fieldName]);
    return ele;
  };
  const IndicatorWrap = ({ style = {}, position, ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: "fixed left-0 py-2 px-0 text-center",
      style: {
        ...style,
        marginLeft: "var(--tina-sidebar-width)",
        width: "calc(100% - var(--tina-sidebar-width))",
        top: position === "top" ? 0 : "auto",
        bottom: position === "top" ? "auto" : 0,
        zIndex: "var(--tina-z-index-3)"
      },
      ...props
    }
  );
  const ArrowWrap = (props) => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: "inline-block fill-white rounded-[50%] bg-blue-500 shadow-md",
      ...props
    }
  );
  const AboveViewportIndicator = () => {
    return /* @__PURE__ */ React__namespace.createElement(IndicatorWrap, { position: "top" }, /* @__PURE__ */ React__namespace.createElement(ArrowWrap, null, /* @__PURE__ */ React__namespace.createElement(ChevronUpIcon, { className: "w-8 h-auto" })));
  };
  const BelowViewportIndicator = () => {
    return /* @__PURE__ */ React__namespace.createElement(IndicatorWrap, { position: "bottom" }, /* @__PURE__ */ React__namespace.createElement(ArrowWrap, null, /* @__PURE__ */ React__namespace.createElement(ChevronDownIcon$2, { className: "w-8 h-auto" })));
  };
  const useScrollToFocusedField = () => {
    const { subscribe } = useEvent("field:focus");
    React__namespace.useEffect(
      () => subscribe(({ fieldName }) => {
        const ele = document.querySelector(
          `[data-tinafield="${fieldName}"]`
        );
        if (!ele)
          return;
        const { top, height } = ele.getBoundingClientRect();
        const eleTopY = top + window.scrollY;
        const eleBottomY = top + height + window.scrollY;
        const viewportTopY = window.scrollY;
        const viewportBottomY = window.innerHeight + window.scrollY;
        if (height < window.innerHeight) {
          if (eleBottomY > viewportBottomY) {
            window.scrollTo({
              top: eleBottomY - window.innerHeight,
              behavior: "smooth"
            });
          } else if (eleTopY < viewportTopY) {
            window.scrollTo({
              top: eleTopY,
              behavior: "smooth"
            });
          }
        } else {
          if (eleBottomY < viewportBottomY) {
            window.scrollTo({
              top: eleBottomY - window.innerHeight,
              behavior: "smooth"
            });
          } else if (eleTopY > viewportTopY) {
            window.scrollTo({
              top: eleTopY,
              behavior: "smooth"
            });
          }
        }
      })
    );
  };
  const ActiveFieldIndicator = () => {
    const [activeFieldName, setActiveFieldName] = React__namespace.useState(
      null
    );
    const [display, setDisplay] = React__namespace.useState(false);
    const [position, setPosition] = React__namespace.useState(false);
    const [iframePosition, setIframePosition] = React__namespace.useState({ left: 0 });
    const activeEle = useFieldReference(activeFieldName);
    React__namespace.useEffect(() => {
      let displayTimeout;
      if (activeEle) {
        setDisplay(true);
        setPosition(activeEle.getBoundingClientRect());
        const iframe = document.getElementById(
          "tina-iframe"
        );
        if (iframe) {
          setIframePosition(iframe.getBoundingClientRect());
        }
      } else {
        displayTimeout = setTimeout(() => {
          setDisplay(false);
        }, 150);
      }
      return () => {
        clearTimeout(displayTimeout);
      };
    }, [activeEle]);
    const [, setArbitraryValue] = React__namespace.useState(0);
    const rerender = () => setArbitraryValue((s) => s + 1);
    React__namespace.useEffect(() => {
      window.addEventListener("scroll", rerender);
      return () => {
        window.removeEventListener("scroll", rerender);
      };
    }, []);
    const { subscribe } = useEvent("field:hover");
    React__namespace.useEffect(
      () => subscribe(({ fieldName, id }) => {
        setActiveFieldName(`${id}#${fieldName}`);
      })
    );
    useScrollToFocusedField();
    if (!display)
      return null;
    const eleTopY = position.top + window.scrollY;
    const eleBottomY = position.top + position.height + window.scrollY;
    const viewportTopY = window.scrollY;
    const viewportBottomY = window.innerHeight + window.scrollY;
    if (eleTopY > viewportBottomY) {
      return /* @__PURE__ */ React__namespace.createElement(BelowViewportIndicator, null);
    }
    if (eleBottomY < viewportTopY) {
      return /* @__PURE__ */ React__namespace.createElement(AboveViewportIndicator, null);
    }
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        style: {
          position: "absolute",
          zIndex: "var(--tina-z-index-3)",
          top: position.top + window.scrollY,
          left: position.left + window.scrollX + iframePosition.left,
          width: position.width,
          height: position.height,
          outline: "2px dashed var(--tina-color-indicator)",
          borderRadius: "var(--tina-radius-small)",
          transition: display ? activeEle ? `opacity 300ms ease-out` : `opacity 150ms ease-in` : `none`,
          opacity: activeEle && display ? 0.8 : 0
        }
      }
    );
  };
  const TinaUI = ({ children, position }) => {
    const cms = useCMS();
    const [resizingSidebar, setResizingSidebar] = React__namespace.useState(false);
    return /* @__PURE__ */ React__namespace.createElement(MutationSignalProvider, null, /* @__PURE__ */ React__namespace.createElement(ModalProvider, null, /* @__PURE__ */ React__namespace.createElement(Alerts, { alerts: cms.alerts }), /* @__PURE__ */ React__namespace.createElement(MediaManager, null), cms.sidebar && /* @__PURE__ */ React__namespace.createElement(
      SidebarProvider,
      {
        resizingSidebar,
        setResizingSidebar,
        position,
        sidebar: cms.sidebar
      }
    ), /* @__PURE__ */ React__namespace.createElement(ActiveFieldIndicator, null), /* @__PURE__ */ React__namespace.createElement("div", { className: `${resizingSidebar ? "pointer-events-none" : ""}` }, children)));
  };
  const TinaProvider = ({
    cms,
    children,
    position,
    styled = true
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(TinaCMSProvider, { cms }, /* @__PURE__ */ React__namespace.createElement(TinaUI, { position, styled }, children));
  };
  const Tina = TinaProvider;
  const BranchModal = ({ close: close2 }) => {
    const tinaApi = useCMS().api.tina;
    const { setCurrentBranch } = useBranchData();
    const [modalTitle, setModalTitle] = React__namespace.useState("Branch List");
    return /* @__PURE__ */ React__namespace.createElement(Modal, null, /* @__PURE__ */ React__namespace.createElement(PopupModal, { className: " w-[800px]" }, /* @__PURE__ */ React__namespace.createElement(ModalHeader, { close: close2 }, modalTitle), /* @__PURE__ */ React__namespace.createElement(ModalBody, { padded: false }, /* @__PURE__ */ React__namespace.createElement(
      BranchSwitcher,
      {
        listBranches: tinaApi.listBranches.bind(tinaApi),
        createBranch: async (data) => {
          return await tinaApi.createBranch(data);
        },
        chooseBranch: setCurrentBranch,
        setModalTitle
      }
    ))));
  };
  const trimPrefix$1 = (branchName) => {
    return branchName.replace(/^tina\//, "");
  };
  const BranchBanner = () => {
    var _a, _b, _c, _d, _e;
    const cms = useCMS();
    const [open2, setOpen] = React__namespace.useState(false);
    const openModal = () => setOpen(true);
    const { currentBranch } = useBranchData();
    const isProtected = cms.api.tina.usingProtectedBranch();
    const previewFunction = (_d = (_c = (_b = (_a = cms.api.tina.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.config) == null ? void 0 : _c.ui) == null ? void 0 : _d.previewUrl;
    const branch = decodeURIComponent(cms.api.tina.branch);
    const previewUrl = previewFunction ? (_e = previewFunction({ branch })) == null ? void 0 : _e.url : null;
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        className: `w-full bg-white flex items-center gap-2 -mb-px border-b border-gray-100 py-3 pr-4 pl-20 xl:pl-4`
      },
      /* @__PURE__ */ React__namespace.createElement(
        Button$1,
        {
          variant: isProtected ? "primary" : "white",
          size: "small",
          onClick: openModal
        },
        isProtected ? /* @__PURE__ */ React__namespace.createElement(BiLockAlt, { className: "flex-shrink-0 w-4 h-auto text-white opacity-70 mr-1" }) : /* @__PURE__ */ React__namespace.createElement(
          BiGitBranch,
          {
            className: `flex-shrink-0 w-4 h-auto text-blue-500/70 mr-1`
          }
        ),
        /* @__PURE__ */ React__namespace.createElement("span", { className: "truncate max-w-full" }, trimPrefix$1(currentBranch)),
        /* @__PURE__ */ React__namespace.createElement(
          BiChevronDown,
          {
            className: "-mr-1 h-4 w-4 opacity-70 shrink-0",
            "aria-hidden": "true"
          }
        )
      ),
      previewUrl && /* @__PURE__ */ React__namespace.createElement(
        Button$1,
        {
          variant: "white",
          size: "small",
          onClick: () => {
            window.open(previewUrl, "_blank");
          }
        },
        /* @__PURE__ */ React__namespace.createElement(BiLinkExternal, { className: "flex-shrink-0 w-4 h-auto text-blue-500/70 mr-1" }),
        "Preview"
      )
    ), open2 && /* @__PURE__ */ React__namespace.createElement(
      BranchModal,
      {
        close: () => {
          setOpen(false);
        }
      }
    ));
  };
  const trimPrefix = (branchName) => {
    return branchName.replace(/^tina\//, "");
  };
  const BranchButton = () => {
    const [open2, setOpen] = React__namespace.useState(false);
    const openModal = () => setOpen(true);
    const { currentBranch } = useBranchData();
    const cms = useCMS();
    const isProtected = cms.api.tina.usingProtectedBranch();
    return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        className: `pointer-events-auto flex min-w-0	shrink gap-1 items-center justify-between form-select text-sm h-10 px-4 shadow transition-color duration-150 ease-out rounded-full focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight min-w-[5rem] ${isProtected ? "text-white hover:text-blue-50 bg-blue-500 hover:bg-blue-400 border-0" : "text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-100"}`,
        onClick: openModal
      },
      isProtected ? /* @__PURE__ */ React__namespace.createElement(BiLockAlt, { className: "flex-shrink-0 w-4.5 h-auto opacity-70 text-white" }) : /* @__PURE__ */ React__namespace.createElement(
        BiGitBranch,
        {
          className: `flex-shrink-0 w-4.5 h-auto opacity-70 text-blue-500`
        }
      ),
      /* @__PURE__ */ React__namespace.createElement("span", { className: "truncate max-w-full -mr-1" }, trimPrefix(currentBranch)),
      /* @__PURE__ */ React__namespace.createElement(
        BiChevronDown,
        {
          className: "-mr-1 h-4 w-4 opacity-70 shrink-0",
          "aria-hidden": "true"
        }
      )
    ), open2 && /* @__PURE__ */ React__namespace.createElement(
      BranchModal,
      {
        close: () => {
          setOpen(false);
        }
      }
    ));
  };
  const NoFieldsPlaceholder = () => /* @__PURE__ */ React__namespace.createElement(
    "div",
    {
      className: "relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto",
      style: {
        animationName: "fade-in",
        animationDelay: "300ms",
        animationTimingFunction: "ease-out",
        animationIterationCount: 1,
        animationFillMode: "both",
        animationDuration: "150ms"
      }
    },
    /* @__PURE__ */ React__namespace.createElement(Emoji, { className: "block pb-5" }, "🤔"),
    /* @__PURE__ */ React__namespace.createElement("h3", { className: "font-sans font-normal text-lg block pb-5" }, "Hey, you don't have any fields added to this form."),
    /* @__PURE__ */ React__namespace.createElement("p", { className: "block pb-5" }, /* @__PURE__ */ React__namespace.createElement(
      "a",
      {
        className: "text-center rounded-3xl border border-solid border-gray-100 shadow-[0_2px_3px_rgba(0,0,0,0.12)] font-normal cursor-pointer text-[12px] transition-all duration-100 ease-out bg-white text-gray-700 py-3 pr-5 pl-14 relative no-underline inline-block hover:text-blue-500",
        href: "https://tinacms.org/docs/fields",
        target: "_blank"
      },
      /* @__PURE__ */ React__namespace.createElement(
        Emoji,
        {
          className: "absolute left-5 top-1/2 origin-center -translate-y-1/2 transition-all duration-100 ease-out",
          style: { fontSize: 24 }
        },
        "📖"
      ),
      " ",
      "Field Setup Guide"
    ))
  );
  const FormKeyBindings = ({ onSubmit }) => {
    React.useEffect(() => {
      const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "s") {
          e.preventDefault();
          onSubmit();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSubmit]);
    return null;
  };
  const FormBuilder = ({
    form,
    onPristineChange,
    ...rest
  }) => {
    const cms = useCMS$1();
    const hideFooter = !!rest.hideFooter;
    const [createBranchModalOpen, setCreateBranchModalOpen] = React__namespace.useState(false);
    const tinaForm = form.tinaForm;
    const finalForm2 = form.tinaForm.finalForm;
    const schema = cms.api.tina.schema;
    React__namespace.useEffect(() => {
      var _a;
      const collection = schema.getCollectionByFullPath(tinaForm.relativePath);
      if ((_a = collection == null ? void 0 : collection.ui) == null ? void 0 : _a.beforeSubmit) {
        tinaForm.beforeSubmit = (values) => collection.ui.beforeSubmit({ cms, form: tinaForm, values });
      } else {
        tinaForm.beforeSubmit = void 0;
      }
    }, [tinaForm.relativePath]);
    const moveArrayItem = React__namespace.useCallback(
      (result) => {
        if (!result.destination || !finalForm2)
          return;
        const name = result.type;
        finalForm2.mutators.move(
          name,
          result.source.index,
          result.destination.index
        );
      },
      [tinaForm]
    );
    React__namespace.useEffect(() => {
      const unsubscribe = finalForm2.subscribe(
        ({ pristine }) => {
          if (onPristineChange) {
            onPristineChange(pristine);
          }
        },
        { pristine: true }
      );
      return () => {
        unsubscribe();
      };
    }, [finalForm2]);
    const fieldGroup = tinaForm.getActiveField(form.activeFieldName);
    return /* @__PURE__ */ React__namespace.createElement(
      reactFinalForm.Form,
      {
        key: tinaForm.id,
        form: tinaForm.finalForm,
        onSubmit: tinaForm.onSubmit
      },
      ({
        handleSubmit,
        pristine,
        invalid,
        submitting,
        dirtySinceLastSubmit,
        hasValidationErrors
      }) => {
        const usingProtectedBranch = cms.api.tina.usingProtectedBranch();
        const canSubmit = !pristine && !submitting && !hasValidationErrors && !(invalid && !dirtySinceLastSubmit);
        const safeSubmit = async () => {
          if (canSubmit) {
            await handleSubmit();
          }
        };
        const safeHandleSubmit = async () => {
          if (usingProtectedBranch) {
            setCreateBranchModalOpen(true);
          } else {
            safeSubmit();
          }
        };
        return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, createBranchModalOpen && /* @__PURE__ */ React__namespace.createElement(
          CreateBranchModal,
          {
            safeSubmit,
            crudType: tinaForm.crudType,
            path: tinaForm.relativePath,
            values: tinaForm.values,
            close: () => setCreateBranchModalOpen(false)
          }
        ), /* @__PURE__ */ React__namespace.createElement(reactBeautifulDnd.DragDropContext, { onDragEnd: moveArrayItem }, /* @__PURE__ */ React__namespace.createElement(FormKeyBindings, { onSubmit: safeHandleSubmit }), /* @__PURE__ */ React__namespace.createElement(FormPortalProvider, null, /* @__PURE__ */ React__namespace.createElement(
          FormWrapper,
          {
            header: /* @__PURE__ */ React__namespace.createElement(PanelHeader, { ...fieldGroup, id: tinaForm.id }),
            id: tinaForm.id
          },
          (tinaForm == null ? void 0 : tinaForm.fields.length) ? /* @__PURE__ */ React__namespace.createElement(
            FieldsBuilder,
            {
              form: tinaForm,
              activeFieldName: form.activeFieldName,
              fields: fieldGroup.fields
            }
          ) : /* @__PURE__ */ React__namespace.createElement(NoFieldsPlaceholder, null)
        )), !hideFooter && /* @__PURE__ */ React__namespace.createElement("div", { className: "relative flex-none w-full h-16 px-12 bg-white border-t border-gray-100 flex items-center justify-end" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "flex-1 w-full justify-end gap-2	flex items-center max-w-form" }, tinaForm.reset && /* @__PURE__ */ React__namespace.createElement(
          ResetForm,
          {
            pristine,
            reset: async () => {
              finalForm2.reset();
              await tinaForm.reset();
            }
          },
          tinaForm.buttons.reset
        ), /* @__PURE__ */ React__namespace.createElement(
          Button$1,
          {
            onClick: safeHandleSubmit,
            disabled: !canSubmit,
            busy: submitting,
            variant: "primary"
          },
          submitting && /* @__PURE__ */ React__namespace.createElement(LoadingDots, null),
          !submitting && tinaForm.buttons.save
        ), tinaForm.actions.length > 0 && /* @__PURE__ */ React__namespace.createElement(
          FormActionMenu,
          {
            form: tinaForm,
            actions: tinaForm.actions
          }
        )))));
      }
    );
  };
  const FormStatus = ({ pristine }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "flex flex-0 items-center" }, !pristine && /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("p", { className: "text-gray-500 text-xs leading-tight whitespace-nowrap mr-2" }, "Unsaved Changes"), /* @__PURE__ */ React__namespace.createElement("span", { className: "w-3 h-3 flex-0 rounded-full bg-red-300 border border-red-400" }), " "), pristine && /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("span", { className: "w-3 h-3 flex-0 rounded-full bg-green-300 border border-green-400" }), " "));
  };
  const FormWrapper = ({
    header,
    children,
    id
  }) => {
    return /* @__PURE__ */ React__namespace.createElement(
      "div",
      {
        "data-test": `form:${id == null ? void 0 : id.replace(/\\/g, "/")}`,
        className: "h-full overflow-y-auto max-h-full bg-gray-50"
      },
      header,
      /* @__PURE__ */ React__namespace.createElement("div", { className: "py-5 px-6 xl:px-12" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full flex justify-center" }, /* @__PURE__ */ React__namespace.createElement("div", { className: "w-full" }, children)))
    );
  };
  const Emoji = ({ className = "", ...props }) => /* @__PURE__ */ React__namespace.createElement(
    "span",
    {
      className: `text-[40px] leading-none inline-block ${className}`,
      ...props
    }
  );
  const isNumber = (item) => {
    return !isNaN(Number(item));
  };
  const PanelHeader = (props) => {
    var _a;
    const cms = useCMS$1();
    const activePath = ((_a = props.name) == null ? void 0 : _a.split(".")) || [];
    if (!activePath || activePath.length === 0) {
      return null;
    }
    let lastItemIndex;
    activePath.forEach((item, index) => {
      if (!isNumber(item)) {
        lastItemIndex = index;
      }
    });
    const returnPath = activePath.slice(0, lastItemIndex);
    return /* @__PURE__ */ React__namespace.createElement(
      "button",
      {
        type: "button",
        className: `relative z-40 group text-left w-full bg-white hover:bg-gray-50 py-2 border-t border-b shadow-sm
   border-gray-100 px-6 -mt-px`,
        onClick: () => {
          cms.dispatch({
            type: "forms:set-active-field-name",
            value: {
              formId: props.id,
              fieldName: returnPath.length > 0 ? returnPath.join(".") : null
            }
          });
        },
        tabIndex: -1
      },
      /* @__PURE__ */ React__namespace.createElement("div", { className: "flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto" }, props.label || props.name || "Back", /* @__PURE__ */ React__namespace.createElement(IoMdClose, { className: "h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5" }))
    );
  };
  const CreateBranchModel = ({
    close: close2,
    safeSubmit,
    relativePath: relativePath2,
    values,
    crudType
  }) => /* @__PURE__ */ React__namespace.createElement(
    CreateBranchModal,
    {
      close: close2,
      safeSubmit,
      path: relativePath2,
      values,
      crudType
    }
  );
  const CreateBranchModal = ({
    close: close2,
    safeSubmit,
    path,
    values,
    crudType
  }) => {
    const cms = useCMS$1();
    const tinaApi = cms.api.tina;
    const [disabled, setDisabled] = React__namespace.useState(false);
    const [newBranchName, setNewBranchName] = React__namespace.useState("");
    const [error, setError] = React__namespace.useState("");
    const onCreateBranch = (newBranchName2) => {
      localStorage.setItem("tina.createBranchState", "starting");
      localStorage.setItem("tina.createBranchState.fullPath", path);
      localStorage.setItem(
        "tina.createBranchState.values",
        JSON.stringify(values)
      );
      localStorage.setItem("tina.createBranchState.kind", crudType);
      if (crudType === "create") {
        localStorage.setItem(
          "tina.createBranchState.back",
          // go back to the list view
          window.location.href.replace("/new", "")
        );
      } else {
        localStorage.setItem("tina.createBranchState.back", window.location.href);
      }
      const hash = window.location.hash;
      const newHash = `#/branch/new?branch=${newBranchName2}`;
      const newUrl = window.location.href.replace(hash, newHash);
      window.location.href = newUrl;
    };
    return /* @__PURE__ */ React__namespace.createElement(Modal, null, /* @__PURE__ */ React__namespace.createElement(PopupModal, null, /* @__PURE__ */ React__namespace.createElement(ModalHeader, { close: close2 }, /* @__PURE__ */ React__namespace.createElement(BiGitBranch, { className: "w-6 h-auto mr-1 text-blue-500 opacity-70" }), " ", "Create Branch"), /* @__PURE__ */ React__namespace.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React__namespace.createElement("p", { className: "text-lg text-gray-700 font-bold mb-2" }, "This content is protected 🚧"), /* @__PURE__ */ React__namespace.createElement("p", { className: "text-sm text-gray-700 mb-4" }, "To make changes, you need to create a copy then get it approved and merged for it to go live."), /* @__PURE__ */ React__namespace.createElement(
      PrefixedTextField,
      {
        placeholder: "e.g. {{PAGE-NAME}}-updates",
        value: newBranchName,
        onChange: (e) => {
          setError("");
          setNewBranchName(formatBranchName(e.target.value));
        }
      }
    ), error && /* @__PURE__ */ React__namespace.createElement("div", { className: "mt-2 text-sm text-red-700" }, error)), /* @__PURE__ */ React__namespace.createElement(ModalActions, null, /* @__PURE__ */ React__namespace.createElement(Button$1, { style: { flexGrow: 1 }, onClick: close2 }, "Cancel"), /* @__PURE__ */ React__namespace.createElement(
      Button$1,
      {
        variant: "primary",
        style: { flexGrow: 2 },
        disabled: newBranchName === "" || Boolean(error) || disabled,
        onClick: async () => {
          setDisabled(true);
          const branchList = await tinaApi.listBranches({
            includeIndexStatus: false
          });
          const contentBranches = branchList.filter((x) => {
            var _a;
            return (_a = x == null ? void 0 : x.name) == null ? void 0 : _a.startsWith("tina/");
          }).map((x) => x.name.replace("tina/", ""));
          if (contentBranches.includes(newBranchName)) {
            setError("Branch already exists");
            setDisabled(false);
            return;
          }
          if (!error)
            onCreateBranch(newBranchName);
        }
      },
      "Create Branch and Save"
    ), /* @__PURE__ */ React__namespace.createElement(
      OverflowMenu$1,
      {
        className: "-ml-2",
        toolbarItems: [
          {
            name: "override",
            label: "Save to Protected Branch",
            Icon: /* @__PURE__ */ React__namespace.createElement(MdOutlineSaveAlt, { size: "1rem" }),
            onMouseDown: () => {
              close2();
              safeSubmit();
            }
          }
        ]
      }
    ))));
  };
  const PrefixedTextField = ({ prefix = "tina/", ...props }) => {
    return /* @__PURE__ */ React__namespace.createElement("div", { className: "border border-gray-200 focus-within:border-blue-200 bg-gray-100 focus-within:bg-blue-100 rounded-md shadow-sm focus-within:shadow-outline overflow-hidden flex items-stretch divide-x divide-gray-200 focus-within:divide-blue-100 w-full transition-all ease-out duration-150" }, /* @__PURE__ */ React__namespace.createElement("span", { className: "pl-3 pr-2 py-2 font-medium text-base text-gray-700 opacity-50" }, prefix), /* @__PURE__ */ React__namespace.createElement(
      "input",
      {
        type: "text",
        className: "shadow-inner focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 flex-1 bg-white focus:text-gray-900",
        ...props
      }
    ));
  };
  const NestedForm = (props) => {
    const FormPortal = useFormPortal();
    const id = React.useMemo(() => uuid(), [props.id, props.initialValues]);
    const form = React.useMemo(() => {
      return new Form({
        ...props,
        relativePath: props.id,
        id,
        onChange: ({ values }) => {
          props.onChange(values);
        },
        onSubmit: () => {
        }
      });
    }, [id, props.onChange]);
    return /* @__PURE__ */ React.createElement(FormPortal, null, ({ zIndexShift }) => /* @__PURE__ */ React.createElement(GroupPanel, { isExpanded: true, style: { zIndex: zIndexShift + 1e6 } }, /* @__PURE__ */ React.createElement(PanelHeader$1, { onClick: props.onClose }, props.label), /* @__PURE__ */ React.createElement(FormBuilder, { form: { tinaForm: form }, hideFooter: true })));
  };
  const handleCloseBase = (editor, element) => {
    const path = slateReact.ReactEditor.findPath(editor, element);
    const editorEl = slateReact.ReactEditor.toDOMNode(editor, editor);
    if (editorEl) {
      editorEl.focus();
      setTimeout(() => {
        slate.Transforms.select(editor, path);
      }, 1);
    }
  };
  const handleRemoveBase = (editor, element) => {
    const path = slateReact.ReactEditor.findPath(editor, element);
    slate.Transforms.removeNodes(editor, {
      at: path
    });
  };
  const useHotkey = (key, callback) => {
    const selected = slateReact.useSelected();
    React.useEffect(() => {
      const handleEnter = (e) => {
        if (selected) {
          if (isHotkey.isHotkey(key, e)) {
            e.preventDefault();
            callback();
          }
        }
      };
      document.addEventListener("keydown", handleEnter);
      return () => document.removeEventListener("keydown", handleEnter);
    }, [selected]);
  };
  const useEmbedHandles = (editor, element, baseFieldName) => {
    const cms = useCMS$1();
    const { dispatch: setFocusedField } = useEvent("field:focus");
    const [isExpanded, setIsExpanded] = React.useState(false);
    const handleClose = () => {
      setIsExpanded(false);
      handleCloseBase(editor, element);
    };
    const path = slateReact.ReactEditor.findPath(editor, element);
    const fieldName = `${baseFieldName}.children.${path.join(".children.")}.props`;
    const handleSelect = () => {
      cms.dispatch({
        type: "forms:set-active-field-name",
        value: {
          formId: cms.state.activeFormId,
          fieldName
        }
      });
      setFocusedField({
        id: cms.state.activeFormId,
        fieldName
      });
    };
    const handleRemove = () => {
      handleRemoveBase(editor, element);
    };
    return { isExpanded, handleClose, handleRemove, handleSelect };
  };
  const ImgEmbed = ({
    attributes,
    children,
    element,
    editor,
    onChange
  }) => {
    const selected = slateReact.useSelected();
    const { fieldName } = useTemplates();
    const { handleClose, handleRemove, handleSelect, isExpanded } = useEmbedHandles(editor, element, fieldName);
    useHotkey("enter", () => {
      plateCommon.insertNodes(editor, [
        { type: plate.ELEMENT_PARAGRAPH, children: [{ text: "" }] }
      ]);
    });
    return /* @__PURE__ */ React.createElement("span", { ...attributes, className: "" }, children, element.url ? /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `relative w-full max-w-full flex justify-start ${isImage(element.url) ? "items-start gap-3" : "items-center gap-2"}`
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: `flex-shrink min-w-0 focus-within:shadow-outline focus-within:border-blue-500 rounded outline-none overflow-visible cursor-pointer border-none hover:opacity-60 transition ease-out duration-100 ${selected ? "shadow-outline border-blue-500" : ""}`,
          onClick: handleSelect
        },
        isImage(element.url) ? /* @__PURE__ */ React.createElement(StyledImage, { src: element.url }) : /* @__PURE__ */ React.createElement(StyledFile, { src: element.url })
      ),
      /* @__PURE__ */ React.createElement(
        DeleteImageButton,
        {
          onClick: (e) => {
            e.stopPropagation();
            handleRemove();
          }
        }
      )
    ) : /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "outline-none relative hover:opacity-60 w-full",
        onClick: handleSelect
      },
      /* @__PURE__ */ React.createElement("div", { className: "text-center rounded-[5px] bg-gray-100 text-gray-300 leading-[1.35] py-3 text-[15px] font-normal transition-all ease-out duration-100 hover:opacity-60" }, "Click to select an image")
    ), isExpanded && /* @__PURE__ */ React.createElement(
      ImageForm,
      {
        onChange,
        initialValues: element,
        onClose: handleClose,
        element
      }
    ));
  };
  const ImageForm = (props) => {
    return /* @__PURE__ */ React.createElement(
      NestedForm,
      {
        id: "image-form",
        label: "Image",
        fields: [
          {
            label: "URL",
            name: "url",
            component: "image",
            // @ts-ignore Field type doesn't like this
            clearable: true
          },
          { label: "Caption", name: "caption", component: "text" },
          { label: "Alt", name: "alt", component: "text" }
        ],
        initialValues: props.initialValues,
        onChange: props.onChange,
        onClose: props.onClose
      }
    );
  };
  const ELEMENT_IMG = "img";
  const createImgPlugin = plateCommon.createPluginFactory({
    key: ELEMENT_IMG,
    isVoid: true,
    isInline: true,
    isElement: true,
    component: (props) => {
      const handleChange = (values) => {
        const path = slateReact.ReactEditor.findPath(props.editor, props.element);
        plateCommon.setNodes(props.editor, values, { at: path });
      };
      return /* @__PURE__ */ React.createElement(ImgEmbed, { ...props, onChange: handleChange });
    }
  });
  const insertImg = (editor, media) => {
    if (isImage(media.src)) {
      insertInlineElement(editor, {
        type: ELEMENT_IMG,
        children: [{ text: "" }],
        url: media.src,
        caption: "",
        alt: ""
      });
    } else {
      insertInlineElement(editor, {
        type: "a",
        url: media.src,
        title: media.filename,
        children: [{ text: media.filename }]
      });
    }
    plateCommon.normalizeEditor(editor, { force: true });
  };
  const EllipsisIcon = ({ title }) => {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, title && /* @__PURE__ */ React.createElement("span", { className: "sr-only" }, title), /* @__PURE__ */ React.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-5 w-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor"
      },
      /* @__PURE__ */ React.createElement(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
        }
      )
    ));
  };
  const Wrapper$1 = ({ inline, children }) => {
    const Component = inline ? "span" : "div";
    return /* @__PURE__ */ React.createElement(
      Component,
      {
        contentEditable: false,
        style: { userSelect: "none" },
        className: "relative"
      },
      children
    );
  };
  const InlineEmbed = ({
    attributes,
    children,
    element,
    onChange,
    editor
  }) => {
    const selected = slateReact.useSelected();
    const { templates, fieldName } = useTemplates();
    const { handleClose, handleRemove, handleSelect, isExpanded } = useEmbedHandles(editor, element, fieldName);
    useHotkey("enter", () => {
      plateCommon.insertNodes(editor, [
        { type: plate.ELEMENT_PARAGRAPH, children: [{ text: "" }] }
      ]);
    });
    useHotkey("space", () => {
      plateCommon.insertNodes(editor, [{ text: " " }], {
        match: (n) => {
          if (slate.Element.isElement(n) && n.type === ELEMENT_MDX_INLINE) {
            return true;
          }
        },
        select: true
      });
    });
    const activeTemplate = templates.find(
      (template) => template.name === element.name
    );
    const formProps = {
      activeTemplate,
      element,
      editor,
      onChange,
      onClose: handleClose
    };
    if (!activeTemplate) {
      return null;
    }
    const label = getLabel(activeTemplate, formProps);
    return /* @__PURE__ */ React.createElement("span", { ...attributes }, children, /* @__PURE__ */ React.createElement(Wrapper$1, { inline: true }, /* @__PURE__ */ React.createElement(
      "span",
      {
        style: { margin: "0 0.5px" },
        className: "relative inline-flex shadow-sm rounded-md leading-none"
      },
      selected && /* @__PURE__ */ React.createElement("span", { className: "absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none" }),
      /* @__PURE__ */ React.createElement(
        "span",
        {
          style: { fontWeight: "inherit", maxWidth: "275px" },
          className: "truncate cursor-pointer relative inline-flex items-center justify-start px-2 py-0.5 rounded-l-md border border-gray-200 bg-white  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
          onMouseDown: handleSelect
        },
        label
      ),
      /* @__PURE__ */ React.createElement(DotMenu, { onOpen: handleSelect, onRemove: handleRemove })
    ), isExpanded && /* @__PURE__ */ React.createElement(EmbedNestedForm, { ...formProps })));
  };
  const BlockEmbed = ({
    attributes,
    children,
    element,
    editor,
    onChange
  }) => {
    const selected = slateReact.useSelected();
    const { templates, fieldName } = useTemplates();
    const { handleClose, handleRemove, handleSelect, isExpanded } = useEmbedHandles(editor, element, fieldName);
    useHotkey("enter", () => {
      plateCommon.insertNodes(editor, [
        { type: plate.ELEMENT_PARAGRAPH, children: [{ text: "" }] }
      ]);
    });
    const activeTemplate = templates.find(
      (template) => template.name === element.name
    );
    const formProps = {
      activeTemplate,
      element,
      editor,
      onChange,
      onClose: handleClose
    };
    if (!activeTemplate) {
      return null;
    }
    const label = getLabel(activeTemplate, formProps);
    return /* @__PURE__ */ React.createElement("div", { ...attributes, className: "w-full my-2" }, children, /* @__PURE__ */ React.createElement(Wrapper$1, { inline: false }, /* @__PURE__ */ React.createElement("span", { className: "relative w-full inline-flex shadow-sm rounded-md" }, selected && /* @__PURE__ */ React.createElement("span", { className: "absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none" }), /* @__PURE__ */ React.createElement(
      "span",
      {
        onMouseDown: handleSelect,
        className: "truncate cursor-pointer w-full relative inline-flex items-center justify-start px-4 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      },
      label
    ), /* @__PURE__ */ React.createElement(DotMenu, { onOpen: handleSelect, onRemove: handleRemove })), isExpanded && /* @__PURE__ */ React.createElement(EmbedNestedForm, { ...formProps })));
  };
  const getLabel = (activeTemplate, formProps) => {
    const titleField = activeTemplate.fields.find((field) => field.isTitle);
    let label = activeTemplate.label || activeTemplate.name;
    if (titleField) {
      const titleValue = formProps.element.props[titleField.name];
      if (titleValue) {
        label = `${label}: ${titleValue}`;
      }
    }
    return label;
  };
  const EmbedNestedForm = ({
    editor,
    element,
    activeTemplate,
    onClose,
    onChange
  }) => {
    const path = slateReact.ReactEditor.findPath(editor, element);
    const id = [...path, activeTemplate.name].join(".");
    return /* @__PURE__ */ React.createElement(
      NestedForm,
      {
        id,
        label: activeTemplate.label,
        fields: activeTemplate.fields,
        initialValues: element.props,
        onChange,
        onClose
      }
    );
  };
  const DotMenu = ({ onOpen, onRemove }) => {
    return /* @__PURE__ */ React.createElement(react.Popover, { as: "span", className: "-ml-px relative block" }, /* @__PURE__ */ React.createElement(
      react.PopoverButton,
      {
        as: "span",
        className: "cursor-pointer h-full relative inline-flex items-center px-1 py-0.5 rounded-r-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      },
      /* @__PURE__ */ React.createElement(EllipsisIcon, { title: "Open options" })
    ), /* @__PURE__ */ React.createElement(
      react.Transition,
      {
        enter: "transition ease-out duration-100",
        enterFrom: "transform opacity-0 scale-95",
        enterTo: "transform opacity-100 scale-100",
        leave: "transition ease-in duration-75",
        leaveFrom: "transform opacity-100 scale-100",
        leaveTo: "transform opacity-0 scale-95"
      },
      /* @__PURE__ */ React.createElement(react.PopoverPanel, { className: "z-30 absolute origin-top-right right-0" }, /* @__PURE__ */ React.createElement("div", { className: "mt-2 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" }, /* @__PURE__ */ React.createElement("div", { className: "py-1" }, /* @__PURE__ */ React.createElement(
        "span",
        {
          onClick: onOpen,
          className: classNames$1(
            "cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
          )
        },
        "Edit"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onMouseDown: (e) => {
            e.preventDefault();
            onRemove();
          },
          className: classNames$1(
            "cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
          )
        },
        "Remove"
      ))))
    ));
  };
  const ELEMENT_MDX_INLINE = "mdxJsxTextElement";
  const ELEMENT_MDX_BLOCK = "mdxJsxFlowElement";
  const Embed = (props) => {
    const handleChange = (values) => {
      const path = slateReact.ReactEditor.findPath(props.editor, props.element);
      plateCommon.setNodes(props.editor, { props: values }, { at: path });
    };
    if (props.inline) {
      return /* @__PURE__ */ React.createElement(InlineEmbed, { ...props, onChange: handleChange });
    }
    return /* @__PURE__ */ React.createElement(BlockEmbed, { ...props, onChange: handleChange });
  };
  const createMdxInlinePlugin = plateCommon.createPluginFactory({
    key: ELEMENT_MDX_INLINE,
    isInline: true,
    isVoid: true,
    isElement: true,
    component: (props) => /* @__PURE__ */ React.createElement(Embed, { ...props, inline: true })
  });
  const createMdxBlockPlugin = plateCommon.createPluginFactory({
    key: ELEMENT_MDX_BLOCK,
    isVoid: true,
    isElement: true,
    component: (props) => /* @__PURE__ */ React.createElement(Embed, { ...props, inline: false })
  });
  const insertMDX = (editor, value) => {
    const flow = !value.inline;
    if (!helpers.currentNodeSupportsMDX(editor)) {
      return;
    }
    if (flow) {
      insertBlockElement(editor, {
        type: ELEMENT_MDX_BLOCK,
        name: value.name,
        children: [{ text: "" }],
        props: value.defaultItem ? value.defaultItem : {}
      });
      plateCommon.normalizeEditor(editor, { force: true });
    } else {
      insertInlineElement(editor, {
        type: ELEMENT_MDX_INLINE,
        name: value.name,
        children: [{ text: "" }],
        props: value.defaultItem ? value.defaultItem : {}
      });
    }
  };
  const onKeyDownSoftBreak = (editor, { options: { rules: rules2 = [] } }) => (event) => {
    const entry = plateCommon.getBlockAbove(editor);
    if (!entry)
      return;
    rules2.forEach(({ hotkey, query }) => {
      if (isHotkey.isHotkey(hotkey, event) && plateCommon.queryNode(entry, query)) {
        event.preventDefault();
        event.stopPropagation();
        plateCommon.insertNodes(
          editor,
          [
            { type: KEY_SOFT_BREAK, children: [{ text: "" }] },
            { type: "text", text: "" }
          ],
          { select: true }
        );
      }
    });
  };
  const KEY_SOFT_BREAK = "break";
  const createSoftBreakPlugin = plateCommon.createPluginFactory({
    key: KEY_SOFT_BREAK,
    isElement: true,
    isInline: true,
    isVoid: true,
    component: (props) => {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("br", { className: props.className, ...props.attributes }), props.children);
    },
    handlers: {
      onKeyDown: onKeyDownSoftBreak
    },
    options: {
      rules: [{ hotkey: "shift+enter" }]
    }
  });
  const preFormat = (editor) => plate.unwrapList(editor);
  const format = (editor, customFormatting) => {
    if (editor.selection) {
      const parentEntry = plateCommon.getParentNode(editor, editor.selection);
      if (!parentEntry)
        return;
      const [node] = parentEntry;
      if (plateCommon.isElement(node) && !plateCommon.isType(editor, node, plate.ELEMENT_CODE_BLOCK) && !plateCommon.isType(editor, node, plate.ELEMENT_CODE_LINE)) {
        customFormatting();
      }
    }
  };
  const formatList = (editor, elementType) => {
    format(
      editor,
      () => plate.toggleList(editor, {
        type: elementType
      })
    );
  };
  const insertEmptyCodeBlock = (editor) => {
    const matchCodeElements = (node2) => node2.type === plateCommon.getPluginType(editor, plate.ELEMENT_CODE_BLOCK);
    if (plateCommon.someNode(editor, {
      match: matchCodeElements
    })) {
      return;
    }
    const node = {
      type: plate.ELEMENT_CODE_BLOCK,
      value: "",
      // TODO: this can probably be a config option
      lang: "javascript",
      children: [{ type: "text", text: "" }]
    };
    if (plateCommon.isSelectionAtBlockStart(editor)) {
      plateCommon.setElements(editor, node);
    } else {
      plateCommon.insertNode(editor, node);
    }
  };
  const autoformatBlocks = [
    {
      mode: "block",
      type: plate.ELEMENT_H1,
      match: "# ",
      preFormat
    },
    {
      mode: "block",
      type: plate.ELEMENT_H2,
      match: "## ",
      preFormat
    },
    {
      mode: "block",
      type: plate.ELEMENT_H3,
      match: "### ",
      preFormat
    },
    {
      mode: "block",
      type: plate.ELEMENT_H4,
      match: "#### ",
      preFormat
    },
    {
      mode: "block",
      type: plate.ELEMENT_H5,
      match: "##### ",
      preFormat
    },
    {
      mode: "block",
      type: plate.ELEMENT_H6,
      match: "###### ",
      preFormat
    },
    {
      mode: "block",
      type: plate.ELEMENT_BLOCKQUOTE,
      match: "> ",
      preFormat
    },
    {
      mode: "block",
      type: plate.ELEMENT_CODE_BLOCK,
      match: "```",
      triggerAtBlockStart: false,
      preFormat,
      format: (editor) => {
        insertEmptyCodeBlock(editor);
      }
    },
    {
      mode: "block",
      type: plate.ELEMENT_HR,
      match: ["---", "—-", "___ "],
      format: (editor) => {
        plateCommon.setNodes(editor, { type: plate.ELEMENT_HR });
        plateCommon.insertNodes(editor, {
          type: plateCommon.ELEMENT_DEFAULT,
          children: [{ text: "" }]
        });
      }
    }
  ];
  const autoformatLists = [
    {
      mode: "block",
      type: plate.ELEMENT_LI,
      match: ["* ", "- "],
      preFormat,
      format: (editor) => formatList(editor, plate.ELEMENT_UL)
    },
    {
      mode: "block",
      type: plate.ELEMENT_LI,
      match: ["1. ", "1) "],
      preFormat,
      format: (editor) => formatList(editor, plate.ELEMENT_OL)
    },
    {
      mode: "block",
      type: plate.ELEMENT_TODO_LI,
      match: "[] "
    },
    {
      mode: "block",
      type: plate.ELEMENT_TODO_LI,
      match: "[x] ",
      format: (editor) => plateCommon.setNodes(
        editor,
        { type: plate.ELEMENT_TODO_LI, checked: true },
        {
          match: (n) => plateCommon.isBlock(editor, n)
        }
      )
    }
  ];
  const autoformatMarks = [
    {
      mode: "mark",
      type: [plate.MARK_BOLD, plate.MARK_ITALIC],
      match: "***"
    },
    {
      mode: "mark",
      type: plate.MARK_BOLD,
      match: "**"
    },
    {
      mode: "mark",
      type: plate.MARK_ITALIC,
      match: "*"
    },
    {
      mode: "mark",
      type: plate.MARK_ITALIC,
      match: "_"
    },
    {
      mode: "mark",
      type: plate.MARK_CODE,
      match: "`"
    },
    {
      mode: "mark",
      type: plate.MARK_STRIKETHROUGH,
      match: ["~~", "~"]
    }
  ];
  const autoformatRules = [
    ...autoformatBlocks,
    ...autoformatLists,
    ...autoformatMarks
  ];
  const withCorrectVoidBehavior = (editor) => {
    const { deleteBackward, insertBreak } = editor;
    editor.insertBreak = () => {
      if (!editor.selection || !slate.Range.isCollapsed(editor.selection)) {
        return insertBreak();
      }
      const selectedNodePath = slate.Path.parent(editor.selection.anchor.path);
      const selectedNode = slate.Node.get(editor, selectedNodePath);
      if (plateCommon.isElement(selectedNode)) {
        if (slate.Editor.isVoid(editor, selectedNode)) {
          slate.Editor.insertNode(editor, {
            // @ts-ignore bad type from slate
            type: "p",
            children: [{ text: "" }]
          });
          return;
        }
      }
      insertBreak();
    };
    editor.deleteBackward = (unit) => {
      if (!editor.selection || !slate.Range.isCollapsed(editor.selection) || editor.selection.anchor.offset !== 0) {
        return deleteBackward(unit);
      }
      const parentPath = slate.Path.parent(editor.selection.anchor.path);
      const parentNode = slate.Node.get(editor, parentPath);
      const parentIsEmpty = slate.Node.string(parentNode).length === 0;
      if (parentIsEmpty && slate.Path.hasPrevious(parentPath)) {
        const prevNodePath = slate.Path.previous(parentPath);
        const prevNode = slate.Node.get(editor, prevNodePath);
        if (plateCommon.isElement(prevNode)) {
          if (slate.Editor.isVoid(editor, prevNode)) {
            slate.Transforms.removeNodes(editor);
            slate.Editor.normalize(editor, { force: true });
            return;
          }
        }
      }
      deleteBackward(unit);
    };
    return editor;
  };
  const HANDLES_MDX = [
    plate.ELEMENT_H1,
    plate.ELEMENT_H2,
    plate.ELEMENT_H3,
    plate.ELEMENT_H3,
    plate.ELEMENT_H4,
    plate.ELEMENT_H5,
    plate.ELEMENT_H6,
    plate.ELEMENT_PARAGRAPH
  ];
  const resetBlockTypesCommonRule = {
    types: [
      plate.ELEMENT_BLOCKQUOTE,
      plate.ELEMENT_H1,
      plate.ELEMENT_H2,
      plate.ELEMENT_H3,
      plate.ELEMENT_H3,
      plate.ELEMENT_H4,
      plate.ELEMENT_H5,
      plate.ELEMENT_H6
      // NOTE: code blocks behave strangely when used here
    ],
    defaultType: plate.ELEMENT_PARAGRAPH
  };
  const createCorrectNodeBehaviorPlugin = plateCommon.createPluginFactory({
    key: "WITH_CORRECT_NODE_BEHAVIOR",
    withOverrides: withCorrectVoidBehavior
  });
  const plugins$1 = [
    plate.createTrailingBlockPlugin(),
    createCorrectNodeBehaviorPlugin(),
    plate.createAutoformatPlugin({
      options: {
        rules: autoformatRules
      }
    }),
    plate.createExitBreakPlugin({
      options: {
        rules: [
          // Break out of a block entirely, eg. get out of a blockquote
          // TOOD: maybe this should be shift+enter, but that's a soft break
          // for other things like list items (see below)
          {
            hotkey: "mod+enter"
          },
          // Same as above but drops you at the top of a block
          {
            hotkey: "mod+shift+enter",
            before: true
          },
          {
            hotkey: "enter",
            query: {
              start: true,
              end: true,
              allow: plate.KEYS_HEADING
            }
          }
        ]
      }
    }),
    plate.createResetNodePlugin({
      options: {
        rules: [
          {
            ...resetBlockTypesCommonRule,
            hotkey: "Enter",
            predicate: plateCommon.isBlockAboveEmpty
          },
          {
            ...resetBlockTypesCommonRule,
            hotkey: "Backspace",
            predicate: plateCommon.isSelectionAtBlockStart
          }
        ]
      }
    }),
    createSoftBreakPlugin({
      options: {
        rules: [
          { hotkey: "shift+enter" },
          {
            hotkey: "enter",
            query: {
              allow: [plate.ELEMENT_CODE_BLOCK, plate.ELEMENT_BLOCKQUOTE]
            }
          }
        ]
      }
    })
  ];
  const plugins = [
    plate.createBasicMarksPlugin(),
    plate.createHeadingPlugin(),
    plate.createParagraphPlugin(),
    createCodeBlockPlugin(),
    createHTMLBlockPlugin(),
    createHTMLInlinePlugin(),
    plate.createBlockquotePlugin(),
    plate.createUnderlinePlugin(),
    plate.createListPlugin(),
    plate.createIndentListPlugin(),
    plate.createHorizontalRulePlugin(),
    // Allows us to do things like copy/paste, remembering the state of the element (like mdx)
    plate.createNodeIdPlugin(),
    plateSlashCommand.createSlashPlugin(),
    plate.createTablePlugin()
  ];
  const unsupportedItemsInTable = /* @__PURE__ */ new Set([
    "Code Block",
    "Unordered List",
    "Ordered List",
    "Quote",
    "Mermaid",
    "Heading 1",
    "Heading 2",
    "Heading 3",
    "Heading 4",
    "Heading 5",
    "Heading 6"
  ]);
  const isNodeActive = (editor, type) => {
    const pluginType = plateCommon.getPluginType(editor, type);
    return !!(editor == null ? void 0 : editor.selection) && plateCommon.someNode(editor, { match: { type: pluginType } });
  };
  const isListActive = (editor, type) => {
    const res = !!(editor == null ? void 0 : editor.selection) && plate.getListItemEntry(editor);
    return !!res && res.list[0].type === type;
  };
  const normalize = (node) => {
    if ([ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE, ELEMENT_IMG].includes(node.type)) {
      return {
        ...node,
        children: [{ type: "text", text: "" }],
        id: Date.now()
      };
    }
    if (node.children) {
      if (node.children.length) {
        return {
          ...node,
          children: node.children.map(normalize),
          id: Date.now()
        };
      }
      return {
        ...node,
        children: [{ text: "" }],
        id: Date.now()
      };
    }
    return node;
  };
  const insertInlineElement = (editor, inlineElement) => {
    plateCommon.insertNodes(editor, [inlineElement]);
    setTimeout(() => {
      slate.Transforms.move(editor);
    }, 1);
  };
  const insertBlockElement = (editor, blockElement) => {
    const editorEl = slateReact.ReactEditor.toDOMNode(editor, editor);
    if (editorEl) {
      editorEl.focus();
      setTimeout(() => {
        if (isCurrentBlockEmpty(editor)) {
          plateCommon.setNodes(editor, blockElement);
        } else {
          plateCommon.insertNodes(editor, [blockElement]);
        }
      }, 1);
    }
  };
  const isCurrentBlockEmpty = (editor) => {
    var _a;
    if (!editor.selection) {
      return false;
    }
    const [node] = slate.Editor.node(editor, editor.selection);
    const cursor = editor.selection.focus;
    const blockAbove = plateCommon.getBlockAbove(editor);
    const isEmpty = !slate.Node.string(node) && // @ts-ignore bad type from slate
    !((_a = node.children) == null ? void 0 : _a.some((n) => slate.Editor.isInline(editor, n))) && // Only do this if we're at the start of a block
    slate.Editor.isStart(editor, cursor, blockAbove[1]);
    return isEmpty;
  };
  const currentNodeSupportsMDX = (editor) => plateCommon.findNode(editor, {
    match: { type: HANDLES_MDX }
  });
  const helpers = {
    isNodeActive,
    isListActive,
    currentNodeSupportsMDX,
    normalize
  };
  const buildError = (element) => {
    return {
      message: element.message,
      position: element.position && {
        endColumn: element.position.end.column,
        startColumn: element.position.start.column,
        startLineNumber: element.position.start.line,
        endLineNumber: element.position.end.line
      }
    };
  };
  const buildErrorMessage = (element) => {
    if (!element) {
      return "";
    }
    const errorMessage = buildError(element);
    const message = errorMessage ? `${errorMessage.message}${errorMessage.position ? ` at line: ${errorMessage.position.startLineNumber}, column: ${errorMessage.position.startColumn}` : ""}` : null;
    return message;
  };
  const ELEMENT_INVALID_MARKDOWN = "invalid_markdown";
  const createInvalidMarkdownPlugin = plateCommon.createPluginFactory({
    key: ELEMENT_INVALID_MARKDOWN,
    isVoid: true,
    isInline: false,
    isElement: true,
    component: ({ attributes, element, children }) => {
      return /* @__PURE__ */ React.createElement("div", { ...attributes }, /* @__PURE__ */ React.createElement(ErrorMessage, { error: element }), children);
    }
  });
  function ErrorMessage({ error }) {
    const message = buildErrorMessage(error);
    const { setRawMode } = useEditorContext();
    return /* @__PURE__ */ React.createElement("div", { contentEditable: false, className: "bg-red-50 sm:rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "px-4 py-5 sm:p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg leading-6 font-medium text-red-800" }, "❌ Error parsing markdown"), /* @__PURE__ */ React.createElement("div", { className: "mt-2 max-w-xl text-sm text-red-800 space-y-4" }, /* @__PURE__ */ React.createElement("p", null, message), /* @__PURE__ */ React.createElement("p", null, "To fix these errors, edit the content in raw-mode."), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setRawMode(true),
        className: "rounded-l-md border-r-0 shadow rounded-md bg-white cursor-pointer relative inline-flex items-center px-2 py-2 border border-gray-200 hover:text-white text-sm font-medium transition-all ease-out duration-150 hover:bg-gray-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
      },
      "Switch to raw-mode"
    ))));
  }
  const editorVariants = classVarianceAuthority.cva(
    cn$1.cn(
      "relative overflow-x-auto whitespace-pre-wrap break-words",
      "min-h-[80px] w-full rounded-md bg-background px-6 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
      "[&_[data-slate-placeholder]]:text-muted-foreground [&_[data-slate-placeholder]]:!opacity-100",
      "[&_[data-slate-placeholder]]:top-[auto_!important]",
      "[&_strong]:font-bold"
    ),
    {
      defaultVariants: {
        focusRing: false,
        size: "sm",
        variant: "outline"
      },
      variants: {
        disabled: {
          true: "cursor-not-allowed opacity-50"
        },
        focusRing: {
          false: "",
          true: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        },
        focused: {
          true: "ring-2 ring-ring ring-offset-2"
        },
        size: {
          md: "text-base",
          sm: "text-sm"
        },
        variant: {
          ghost: "",
          outline: ""
        }
      }
    }
  );
  const Editor = React.forwardRef(
    ({
      className,
      disabled,
      focusRing,
      focused,
      readOnly,
      size,
      variant,
      ...props
    }, ref) => {
      return /* @__PURE__ */ React.createElement("div", { className: "relative w-full", ref }, /* @__PURE__ */ React.createElement(
        plateCommon.PlateContent,
        {
          "aria-disabled": disabled,
          className: cn$1.cn(
            editorVariants({
              disabled,
              focusRing,
              focused,
              size,
              variant
            }),
            className
          ),
          disableDefaultStyles: true,
          readOnly: disabled ?? readOnly,
          ...props
        }
      ));
    }
  );
  Editor.displayName = "Editor";
  const TooltipProvider$1 = TooltipPrimitive__namespace.Provider;
  const Tooltip$1 = TooltipPrimitive__namespace.Root;
  const TooltipTrigger$1 = TooltipPrimitive__namespace.Trigger;
  const TooltipPortal = TooltipPrimitive__namespace.Portal;
  const TooltipContent$1 = cn$1.withCn(
    cn$1.withProps(TooltipPrimitive__namespace.Content, {
      sideOffset: 4
    }),
    "z-[9999] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
  );
  function withTooltip(Component) {
    return React.forwardRef(function ExtendComponent({ tooltip, tooltipContentProps, tooltipProps, ...props }, ref) {
      const [mounted, setMounted] = React.useState(false);
      React.useEffect(() => {
        setMounted(true);
      }, []);
      const component = /* @__PURE__ */ React.createElement(Component, { ref, ...props });
      if (tooltip && mounted) {
        return /* @__PURE__ */ React.createElement(Tooltip$1, { ...tooltipProps }, /* @__PURE__ */ React.createElement(TooltipTrigger$1, { asChild: true }, component), /* @__PURE__ */ React.createElement(TooltipPortal, null, /* @__PURE__ */ React.createElement(TooltipContent$1, { ...tooltipContentProps }, tooltip)));
      }
      return component;
    });
  }
  const Toolbar = cn$1.withCn(
    ToolbarPrimitive__namespace.Root,
    "relative flex select-none items-center gap-1 bg-background"
  );
  const ToolbarToggleGroup = cn$1.withCn(
    ToolbarPrimitive__namespace.ToolbarToggleGroup,
    "flex items-center"
  );
  cn$1.withCn(
    ToolbarPrimitive__namespace.Link,
    "font-medium underline underline-offset-4"
  );
  cn$1.withCn(
    ToolbarPrimitive__namespace.Separator,
    "my-1 w-px shrink-0 bg-border"
  );
  const toolbarButtonVariants = classVarianceAuthority.cva(
    cn$1.cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "[&_svg:not([data-icon])]:size-5"
    ),
    {
      defaultVariants: {
        size: "sm",
        variant: "default"
      },
      variants: {
        size: {
          default: "h-10 px-3",
          lg: "h-11 px-5",
          sm: "h-9 px-2"
        },
        variant: {
          default: "bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground",
          outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
        }
      }
    }
  );
  const ToolbarButton = withTooltip(
    // eslint-disable-next-line react/display-name
    React__namespace.forwardRef(
      ({
        children,
        className,
        isDropdown = true,
        showArrow,
        pressed,
        size,
        variant,
        ...props
      }, ref) => {
        return typeof pressed === "boolean" ? /* @__PURE__ */ React__namespace.createElement(
          ToolbarToggleGroup,
          {
            disabled: props.disabled,
            type: "single",
            value: "single"
          },
          /* @__PURE__ */ React__namespace.createElement(
            ToolbarToggleItem,
            {
              className: cn$1.cn(
                toolbarButtonVariants({
                  size,
                  variant
                }),
                isDropdown && "my-1 justify-between pr-1",
                className
              ),
              ref,
              value: pressed ? "single" : "",
              ...props
            },
            isDropdown && showArrow ? /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement("div", { className: "flex flex-1" }, children), /* @__PURE__ */ React__namespace.createElement("div", null, /* @__PURE__ */ React__namespace.createElement(Icons.arrowDown, { className: "ml-0.5 size-4", "data-icon": true }))) : children
          )
        ) : /* @__PURE__ */ React__namespace.createElement(
          ToolbarPrimitive__namespace.Button,
          {
            className: cn$1.cn(
              toolbarButtonVariants({
                size,
                variant
              }),
              isDropdown && "pr-1",
              className
            ),
            ref,
            ...props
          },
          children
        );
      }
    )
  );
  ToolbarButton.displayName = "ToolbarButton";
  const ToolbarToggleItem = cn$1.withVariants(
    ToolbarPrimitive__namespace.ToggleItem,
    toolbarButtonVariants,
    ["variant", "size"]
  );
  const ToolbarGroup = cn$1.withRef(({ children, className, noSeparator }, ref) => {
    const childArr = React__namespace.Children.map(children, (c) => c);
    if (!childArr || childArr.length === 0)
      return null;
    return /* @__PURE__ */ React__namespace.createElement("div", { className: cn$1.cn("flex", className), ref }, !noSeparator && /* @__PURE__ */ React__namespace.createElement("div", { className: "h-full py-1" }, /* @__PURE__ */ React__namespace.createElement(Separator, { orientation: "vertical" })), /* @__PURE__ */ React__namespace.createElement("div", { className: "mx-1 flex items-center gap-1" }, children));
  });
  const FixedToolbar = cn$1.withCn(
    Toolbar,
    "p-1 sticky left-0 top-0 z-50 w-full justify-between overflow-x-auto border border-border bg-background"
  );
  const useResize = (ref, callback) => {
    React.useEffect(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          callback(entry);
        }
      });
      if (ref.current) {
        resizeObserver.observe(ref.current);
      }
      return () => resizeObserver.disconnect();
    }, [ref.current]);
  };
  const STANDARD_ICON_WIDTH = 32;
  const HEADING_ICON_WITH_TEXT = 127;
  const HEADING_ICON_ONLY = 58;
  const EMBED_ICON_WIDTH = 78;
  const CONTAINER_MD_BREAKPOINT = 448;
  const FLOAT_BUTTON_WIDTH = 25;
  const HEADING_LABEL = "Headings";
  const ToolbarContext = React.createContext(
    void 0
  );
  const ToolbarProvider = ({
    tinaForm,
    templates,
    overrides,
    children
  }) => {
    return /* @__PURE__ */ React.createElement(ToolbarContext.Provider, { value: { tinaForm, templates, overrides } }, children);
  };
  const useToolbarContext = () => {
    const context = React.useContext(ToolbarContext);
    if (!context) {
      throw new Error("useToolbarContext must be used within a ToolbarProvider");
    }
    return context;
  };
  const items$1 = [
    {
      description: "Paragraph",
      icon: Icons.heading,
      label: "Paragraph",
      value: plateParagraph.ELEMENT_PARAGRAPH
    },
    {
      description: "Heading 1",
      icon: Icons.h1,
      label: "Heading 1",
      value: plateHeading.ELEMENT_H1
    },
    {
      description: "Heading 2",
      icon: Icons.h2,
      label: "Heading 2",
      value: plateHeading.ELEMENT_H2
    },
    {
      description: "Heading 3",
      icon: Icons.h3,
      label: "Heading 3",
      value: plateHeading.ELEMENT_H3
    },
    {
      description: "Heading 4",
      icon: Icons.h4,
      label: "Heading 4",
      value: plateHeading.ELEMENT_H4
    },
    {
      description: "Heading 5",
      icon: Icons.h5,
      label: "Heading 5",
      value: plateHeading.ELEMENT_H5
    },
    {
      description: "Heading 6",
      icon: Icons.h6,
      label: "Heading 6",
      value: plateHeading.ELEMENT_H6
    }
  ];
  const defaultItem$1 = items$1.find((item) => item.value === plateParagraph.ELEMENT_PARAGRAPH) || items$1[0];
  function HeadingsMenu(props) {
    const value = plateCommon.useEditorSelector((editor2) => {
      let initialNodeType = plateParagraph.ELEMENT_PARAGRAPH;
      let allNodesMatchInitialNodeType = false;
      const codeBlockEntries = plateCommon.getNodeEntries(editor2, {
        match: (n) => plateCommon.isBlock(editor2, n),
        mode: "highest"
      });
      const nodes = Array.from(codeBlockEntries);
      if (nodes.length > 0) {
        initialNodeType = nodes[0][0].type;
        allNodesMatchInitialNodeType = nodes.every(([node]) => {
          const type = (node == null ? void 0 : node.type) || plateParagraph.ELEMENT_PARAGRAPH;
          return type === initialNodeType;
        });
      }
      return allNodesMatchInitialNodeType ? initialNodeType : plateParagraph.ELEMENT_PARAGRAPH;
    }, []);
    const editor = plateCommon.useEditorRef();
    const editorState = plateCommon.useEditorState();
    const openState = useOpenState();
    const userInTable = helpers.isNodeActive(editorState, plateTable.ELEMENT_TABLE);
    const selectedItem = items$1.find((item) => item.value === value) ?? defaultItem$1;
    const { icon: SelectedItemIcon, label: selectedItemLabel } = selectedItem;
    return /* @__PURE__ */ React.createElement(DropdownMenu, { modal: false, ...openState, ...props }, /* @__PURE__ */ React.createElement(DropdownMenuTrigger, { asChild: true }, /* @__PURE__ */ React.createElement(
      ToolbarButton,
      {
        showArrow: true,
        isDropdown: true,
        pressed: openState.open,
        tooltip: "Headings"
      },
      /* @__PURE__ */ React.createElement(SelectedItemIcon, { className: "size-5" }),
      /* @__PURE__ */ React.createElement("span", { className: "@md/toolbar:flex hidden" }, selectedItemLabel)
    )), /* @__PURE__ */ React.createElement(DropdownMenuContent, { align: "start", className: "min-w-0" }, /* @__PURE__ */ React.createElement(
      DropdownMenuRadioGroup,
      {
        className: "flex flex-col gap-0.5",
        onValueChange: (type) => {
          plateCommon.toggleNodeType(editor, { activeType: type });
          plateCommon.collapseSelection(editor);
          plateCommon.focusEditor(editor);
        },
        value
      },
      items$1.filter((item) => {
        if (userInTable) {
          return !unsupportedItemsInTable.has(item.label);
        }
        return true;
      }).map(({ icon: Icon, label, value: itemValue }) => /* @__PURE__ */ React.createElement(
        DropdownMenuRadioItem,
        {
          className: "min-w-[180px]",
          key: itemValue,
          value: itemValue
        },
        /* @__PURE__ */ React.createElement(Icon, { className: "mr-2 size-5" }),
        label
      ))
    )));
  }
  const useCodeBlockToolbarButtonState = () => {
    const editor = plateCommon.useEditorState();
    const isBlockActive = () => helpers.isNodeActive(editor, plateCodeBlock.ELEMENT_CODE_BLOCK);
    return {
      pressed: isBlockActive()
    };
  };
  const useCodeBlockToolbarButton = (state) => {
    const editor = plateCommon.useEditorState();
    const onClick = () => {
      insertEmptyCodeBlock(editor);
    };
    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    return {
      props: {
        onClick,
        onMouseDown,
        pressed: state.pressed
      }
    };
  };
  const CodeBlockToolbarButton = cn$1.withRef(({ clear, ...rest }, ref) => {
    const state = useCodeBlockToolbarButtonState();
    const { props } = useCodeBlockToolbarButton(state);
    return /* @__PURE__ */ React.createElement(ToolbarButton, { ref, tooltip: "Code Block", ...rest, ...props }, /* @__PURE__ */ React.createElement(Icons.codeBlock, null));
  });
  const useImageToolbarButtonState = () => {
    const editor = plateCommon.useEditorState();
    const isBlockActive = () => helpers.isNodeActive(editor, ELEMENT_IMG);
    return {
      pressed: isBlockActive()
    };
  };
  const useImageToolbarButton = (state) => {
    const editor = plateCommon.useEditorState();
    const cms = useCMS$1();
    const onMouseDown = (e) => {
      e.preventDefault();
      cms.media.open({
        allowDelete: true,
        directory: "",
        onSelect: (media) => {
          insertImg(editor, media);
        }
      });
    };
    return {
      props: {
        onMouseDown,
        pressed: state.pressed
      }
    };
  };
  const ImageToolbarButton = cn$1.withRef(({ clear, ...rest }, ref) => {
    const state = useImageToolbarButtonState();
    const { props } = useImageToolbarButton(state);
    return /* @__PURE__ */ React.createElement(ToolbarButton, { ref, tooltip: "Image", ...rest, ...props }, /* @__PURE__ */ React.createElement(Icons.image, null));
  });
  const UnorderedListToolbarButton = cn$1.withRef(
    (props, ref) => {
      const editor = plateCommon.useEditorState();
      const state = plate.useListToolbarButtonState({ nodeType: plate.ELEMENT_UL });
      const { props: buttonProps } = plate.useListToolbarButton(state);
      return /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          ref,
          tooltip: "Bulleted List",
          ...buttonProps,
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            plate.toggleList(editor, { type: plate.ELEMENT_UL });
          }
        },
        /* @__PURE__ */ React.createElement(Icons.ul, null)
      );
    }
  );
  const OrderedListToolbarButton = cn$1.withRef(
    (props, ref) => {
      const editor = plateCommon.useEditorState();
      const state = plate.useListToolbarButtonState({ nodeType: plate.ELEMENT_OL });
      const { props: buttonProps } = plate.useListToolbarButton(state);
      return /* @__PURE__ */ React.createElement(
        ToolbarButton,
        {
          ref,
          tooltip: "Numbered List",
          ...buttonProps,
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            plate.toggleList(editor, { type: plate.ELEMENT_OL });
          }
        },
        /* @__PURE__ */ React.createElement(Icons.ol, null)
      );
    }
  );
  const LinkToolbarButton = cn$1.withRef((rest, ref) => {
    const state = plateLink.useLinkToolbarButtonState();
    const { props } = plateLink.useLinkToolbarButton(state);
    return /* @__PURE__ */ React.createElement(ToolbarButton, { ref, ...props, ...rest, tooltip: "Link" }, /* @__PURE__ */ React.createElement(Icons.link, null));
  });
  const useMermaidToolbarButtonState = () => {
    const editor = plateCommon.useEditorState();
    const isBlockActive = () => helpers.isNodeActive(editor, ELEMENT_MERMAID);
    return {
      pressed: isBlockActive()
    };
  };
  const useMermaidToolbarButton = (state) => {
    const editor = plateCommon.useEditorState();
    const onClick = () => {
      plateCommon.insertEmptyElement(editor, ELEMENT_MERMAID, {
        nextBlock: true,
        select: true
      });
    };
    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    return {
      props: {
        onClick,
        onMouseDown,
        pressed: state.pressed
      }
    };
  };
  const MermaidToolbarButton = cn$1.withRef(({ clear, ...rest }, ref) => {
    const state = useMermaidToolbarButtonState();
    const { props } = useMermaidToolbarButton(state);
    return /* @__PURE__ */ React.createElement(ToolbarButton, { ref, tooltip: "Mermaid", ...rest, ...props }, /* @__PURE__ */ React.createElement(Icons.mermaid, null));
  });
  function OverflowMenu({
    children,
    ...props
  }) {
    const openState = useOpenState();
    return /* @__PURE__ */ React.createElement(DropdownMenu, { modal: false, ...openState, ...props }, /* @__PURE__ */ React.createElement(DropdownMenuTrigger, { asChild: true }, /* @__PURE__ */ React.createElement(
      ToolbarButton,
      {
        showArrow: false,
        "data-testid": "rich-text-editor-overflow-menu-button",
        className: "lg:min-w-[130px]",
        isDropdown: true,
        pressed: openState.open,
        tooltip: "Headings"
      },
      /* @__PURE__ */ React.createElement(Icons.overflow, { className: "size-5" })
    )), /* @__PURE__ */ React.createElement(DropdownMenuContent, { align: "start", className: "min-w-0 flex flex-grow" }, children));
  }
  const useBlockQuoteToolbarButtonState = () => {
    const editor = plateCommon.useEditorState();
    const isBlockActive = () => helpers.isNodeActive(editor, plateBlockQuote.ELEMENT_BLOCKQUOTE);
    return {
      pressed: isBlockActive()
    };
  };
  const useBlockQuoteToolbarButton = (state) => {
    const editor = plateCommon.useEditorState();
    const onClick = () => {
      plateCommon.toggleNodeType(editor, {
        activeType: plateBlockQuote.ELEMENT_BLOCKQUOTE
      });
    };
    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    return {
      props: {
        onClick,
        onMouseDown,
        pressed: state.pressed
      }
    };
  };
  const QuoteToolbarButton = cn$1.withRef(({ clear, ...rest }, ref) => {
    const state = useBlockQuoteToolbarButtonState();
    const { props } = useBlockQuoteToolbarButton(state);
    return /* @__PURE__ */ React.createElement(ToolbarButton, { ref, tooltip: "Quote (⌘+⇧+.)", ...rest, ...props }, /* @__PURE__ */ React.createElement(Icons.quote, null));
  });
  const useRawMarkdownToolbarButton = () => {
    const { setRawMode } = useEditorContext();
    const onMouseDown = (e) => {
      setRawMode(true);
    };
    return {
      props: {
        onMouseDown,
        pressed: false
      }
    };
  };
  const RawMarkdownToolbarButton = cn$1.withRef(({ clear, ...rest }, ref) => {
    const { props } = useRawMarkdownToolbarButton();
    return /* @__PURE__ */ React.createElement(
      ToolbarButton,
      {
        ref,
        tooltip: "Raw Markdown",
        ...rest,
        ...props,
        "data-testid": "markdown-button"
      },
      /* @__PURE__ */ React.createElement(Icons.raw, null)
    );
  });
  function TableDropdownMenu(props) {
    const tableSelected = plateCommon.useEditorSelector(
      (editor2) => plateCommon.someNode(editor2, { match: { type: plateTable.ELEMENT_TABLE } }),
      []
    );
    const [enableDeleteColumn, enableDeleteRow] = plateCommon.useEditorSelector((editor2) => {
      const tableNodeEntry = plateCommon.findNode(editor2, { match: { type: plateTable.ELEMENT_TABLE } });
      if (!tableNodeEntry)
        return [false, false];
      const [tableNode] = tableNodeEntry;
      if (!plateCommon.isElement(tableNode))
        return [false, false];
      const columnCount = plateTable.getTableColumnCount(tableNode);
      const rowCount = tableNode.children.length;
      return [columnCount > 1, rowCount > 1];
    }, []);
    const editor = plateCommon.useEditorRef();
    const openState = useOpenState();
    return /* @__PURE__ */ React.createElement(DropdownMenu, { modal: false, ...openState, ...props }, /* @__PURE__ */ React.createElement(DropdownMenuTrigger, { asChild: true }, /* @__PURE__ */ React.createElement(ToolbarButton, { isDropdown: true, pressed: openState.open, tooltip: "Table" }, /* @__PURE__ */ React.createElement(Icons.table, null))), /* @__PURE__ */ React.createElement(
      DropdownMenuContent,
      {
        align: "start",
        className: "flex w-[180px] min-w-0 flex-col gap-0.5"
      },
      /* @__PURE__ */ React.createElement(
        DropdownMenuItem,
        {
          className: "min-w-[180px]",
          disabled: tableSelected,
          onSelect: () => {
            plateTable.insertTable(editor);
            plateCommon.focusEditor(editor);
          }
        },
        /* @__PURE__ */ React.createElement(Icons.add, { className: iconVariants({ variant: "menuItem" }) }),
        "Insert table"
      ),
      /* @__PURE__ */ React.createElement(
        DropdownMenuItem,
        {
          className: "min-w-[180px]",
          disabled: !tableSelected,
          onSelect: () => {
            plateTable.deleteTable(editor);
            plateCommon.focusEditor(editor);
          }
        },
        /* @__PURE__ */ React.createElement(Icons.minus, { className: iconVariants({ variant: "menuItem" }) }),
        "Delete table"
      ),
      /* @__PURE__ */ React.createElement(DropdownMenuSub, null, /* @__PURE__ */ React.createElement(DropdownMenuSubTrigger, { disabled: !tableSelected }, /* @__PURE__ */ React.createElement(Icons.column, { className: iconVariants({ variant: "menuItem" }) }), /* @__PURE__ */ React.createElement("span", null, "Column")), /* @__PURE__ */ React.createElement(DropdownMenuSubContent, null, /* @__PURE__ */ React.createElement(
        DropdownMenuItem,
        {
          className: "min-w-[180px]",
          disabled: !tableSelected,
          onSelect: () => {
            plateTable.insertTableColumn(editor);
            plateCommon.focusEditor(editor);
          }
        },
        /* @__PURE__ */ React.createElement(Icons.add, { className: iconVariants({ variant: "menuItem" }) }),
        "Insert column after"
      ), /* @__PURE__ */ React.createElement(
        DropdownMenuItem,
        {
          className: "min-w-[180px]",
          disabled: !enableDeleteColumn,
          onSelect: () => {
            plateTable.deleteColumn(editor);
            plateCommon.focusEditor(editor);
          }
        },
        /* @__PURE__ */ React.createElement(Icons.minus, { className: iconVariants({ variant: "menuItem" }) }),
        "Delete column"
      ))),
      /* @__PURE__ */ React.createElement(DropdownMenuSub, null, /* @__PURE__ */ React.createElement(DropdownMenuSubTrigger, { disabled: !tableSelected }, /* @__PURE__ */ React.createElement(Icons.row, { className: iconVariants({ variant: "menuItem" }) }), /* @__PURE__ */ React.createElement("span", null, "Row")), /* @__PURE__ */ React.createElement(DropdownMenuSubContent, null, /* @__PURE__ */ React.createElement(
        DropdownMenuItem,
        {
          className: "min-w-[180px]",
          disabled: !tableSelected,
          onSelect: () => {
            plateTable.insertTableRow(editor);
            plateCommon.focusEditor(editor);
          }
        },
        /* @__PURE__ */ React.createElement(Icons.add, { className: iconVariants({ variant: "menuItem" }) }),
        "Insert row after"
      ), /* @__PURE__ */ React.createElement(
        DropdownMenuItem,
        {
          className: "min-w-[180px]",
          disabled: !enableDeleteRow,
          onSelect: () => {
            plateTable.deleteRow(editor);
            plateCommon.focusEditor(editor);
          }
        },
        /* @__PURE__ */ React.createElement(Icons.minus, { className: iconVariants({ variant: "menuItem" }) }),
        "Delete row"
      )))
    ));
  }
  function TemplatesToolbarButton() {
    const { templates } = useToolbarContext();
    const editor = plateCommon.useEditorState();
    return /* @__PURE__ */ React.createElement(EmbedButton, { templates, editor });
  }
  const EmbedButton = ({ editor, templates }) => {
    const [open2, setOpen] = React.useState(false);
    const [filteredTemplates, setFilteredTemplates] = React.useState(templates);
    const filterChange = (e) => {
      const filterText = e.target.value.toLowerCase();
      setFilteredTemplates(
        templates.filter(
          (template) => template.name.toLowerCase().includes(filterText)
        )
      );
    };
    return /* @__PURE__ */ React.createElement(DropdownMenu, { open: open2, onOpenChange: setOpen }, /* @__PURE__ */ React.createElement(DropdownMenuTrigger, { className: "inline-flex items-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([data-icon])]:size-5 h-9 px-2 bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground my-1 justify-between pr-1" }, /* @__PURE__ */ React.createElement("span", { className: "flex" }, "Embed"), /* @__PURE__ */ React.createElement(
      PlusIcon,
      {
        className: `origin-center transition-all ease-out duration-150 ${open2 ? "rotate-45" : ""}`
      }
    )), /* @__PURE__ */ React.createElement(DropdownMenuContent, { className: "max-h-48 overflow-y-auto" }, templates.length > 10 && /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Filter templates...",
        className: "w-full p-2 border border-gray-300 rounded-md",
        onChange: filterChange
      }
    ), /* @__PURE__ */ React.createElement(DropdownMenuSeparator, null), filteredTemplates.map((template) => /* @__PURE__ */ React.createElement(
      DropdownMenuItem,
      {
        key: template.name,
        onMouseDown: (e) => {
          e.preventDefault();
          setOpen(false);
          insertMDX(editor, template);
        },
        className: ""
      },
      template.label || template.name
    ))));
  };
  const MarkToolbarButton = cn$1.withRef(({ clear, nodeType, ...rest }, ref) => {
    const state = plateCommon.useMarkToolbarButtonState({ clear, nodeType });
    const { props } = plateCommon.useMarkToolbarButton(state);
    return /* @__PURE__ */ React.createElement(ToolbarButton, { ref, ...props, ...rest });
  });
  const BoldToolbarButton = () => /* @__PURE__ */ React.createElement(MarkToolbarButton, { tooltip: "Bold (⌘+B)", nodeType: plate.MARK_BOLD }, /* @__PURE__ */ React.createElement(Icons.bold, null));
  const StrikethroughToolbarButton = () => /* @__PURE__ */ React.createElement(MarkToolbarButton, { tooltip: "Strikethrough", nodeType: plate.MARK_STRIKETHROUGH }, /* @__PURE__ */ React.createElement(Icons.strikethrough, null));
  const ItalicToolbarButton = () => /* @__PURE__ */ React.createElement(MarkToolbarButton, { tooltip: "Italic (⌘+I)", nodeType: plate.MARK_ITALIC }, /* @__PURE__ */ React.createElement(Icons.italic, null));
  const CodeToolbarButton = () => /* @__PURE__ */ React.createElement(MarkToolbarButton, { tooltip: "Code (⌘+E)", nodeType: plate.MARK_CODE }, /* @__PURE__ */ React.createElement(Icons.code, null));
  const toolbarItems = {
    heading: {
      label: HEADING_LABEL,
      width: (paragraphIconExists) => paragraphIconExists ? HEADING_ICON_WITH_TEXT : HEADING_ICON_ONLY,
      // Dynamically handle width based on paragraph icon
      Component: /* @__PURE__ */ React.createElement(ToolbarGroup, { noSeparator: true }, /* @__PURE__ */ React.createElement(HeadingsMenu, null))
    },
    link: {
      label: "Link",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(LinkToolbarButton, null)
    },
    image: {
      label: "Image",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(ImageToolbarButton, null)
    },
    quote: {
      label: "Quote",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(QuoteToolbarButton, null)
    },
    ul: {
      label: "Unordered List",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(UnorderedListToolbarButton, null)
    },
    ol: {
      label: "Ordered List",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(OrderedListToolbarButton, null)
    },
    bold: {
      label: "Bold",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(BoldToolbarButton, null)
    },
    strikethrough: {
      label: "Strikethrough",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(StrikethroughToolbarButton, null)
    },
    italic: {
      label: "Italic",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(ItalicToolbarButton, null)
    },
    code: {
      label: "Code",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(CodeToolbarButton, null)
    },
    codeBlock: {
      label: "Code Block",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(CodeBlockToolbarButton, null)
    },
    mermaid: {
      label: "Mermaid",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(MermaidToolbarButton, null)
    },
    table: {
      label: "Table",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(TableDropdownMenu, null)
    },
    raw: {
      label: "Raw Markdown",
      width: () => STANDARD_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(RawMarkdownToolbarButton, null)
    },
    embed: {
      label: "Templates",
      width: () => EMBED_ICON_WIDTH,
      Component: /* @__PURE__ */ React.createElement(TemplatesToolbarButton, null)
    }
  };
  function FixedToolbarButtons() {
    const toolbarRef = React.useRef(null);
    const [itemsShown, setItemsShown] = React.useState(11);
    const { overrides, templates } = useToolbarContext();
    const showEmbedButton = templates.length > 0;
    let items2 = [];
    if (Array.isArray(overrides)) {
      items2 = overrides === void 0 ? Object.values(toolbarItems) : overrides.map((item) => toolbarItems[item]).filter((item) => item !== void 0);
    } else {
      items2 = (overrides == null ? void 0 : overrides.toolbar) === void 0 ? Object.values(toolbarItems) : overrides.toolbar.map((item) => toolbarItems[item]).filter((item) => item !== void 0);
    }
    if (!showEmbedButton) {
      items2 = items2.filter((item) => item.label !== toolbarItems.embed.label);
    }
    const editorState = plateCommon.useEditorState();
    const userInTable = helpers.isNodeActive(editorState, plate.ELEMENT_TABLE);
    if (userInTable) {
      items2 = items2.filter((item) => !unsupportedItemsInTable.has(item.label));
    }
    useResize(toolbarRef, (entry) => {
      const width = entry.target.getBoundingClientRect().width;
      const headingButton = items2.find((item) => item.label === HEADING_LABEL);
      const headingWidth = headingButton ? headingButton.width(width > CONTAINER_MD_BREAKPOINT) : 0;
      const availableWidth = width - headingWidth - FLOAT_BUTTON_WIDTH;
      const { itemFitCount } = items2.reduce(
        (acc, item) => {
          if (item.label !== HEADING_LABEL && acc.totalItemsWidth + item.width() <= availableWidth) {
            return {
              totalItemsWidth: acc.totalItemsWidth + item.width(),
              itemFitCount: acc.itemFitCount + 1
            };
          }
          return acc;
        },
        { totalItemsWidth: 0, itemFitCount: 1 }
      );
      setItemsShown(itemFitCount);
    });
    return /* @__PURE__ */ React.createElement("div", { className: "w-full overflow-hidden @container/toolbar", ref: toolbarRef }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "flex",
        style: {
          transform: "translateX(calc(-1px))"
        }
      },
      /* @__PURE__ */ React.createElement(React.Fragment, null, items2.slice(0, itemsShown).map((item) => /* @__PURE__ */ React.createElement(React.Fragment, { key: item.label }, item.Component)), items2.length > itemsShown && /* @__PURE__ */ React.createElement(OverflowMenu, null, items2.slice(itemsShown).flatMap((c) => /* @__PURE__ */ React.createElement(React.Fragment, { key: c.label }, c.Component))))
    ));
  }
  const FloatingToolbar = cn$1.withRef(({ children, state, ...props }, componentRef) => {
    const editorId = plateCommon.usePlateSelectors().id();
    const focusedEditorId = plateCommon.useEventEditorSelectors.focus();
    const floatingToolbarState = plateFloating.useFloatingToolbarState({
      editorId,
      focusedEditorId,
      ...state,
      floatingOptions: {
        middleware: [
          plateFloating.offset(12),
          plateFloating.flip({
            fallbackPlacements: [
              "top-start",
              "top-end",
              "bottom-start",
              "bottom-end"
            ],
            padding: 12
          })
        ],
        placement: "top",
        ...state == null ? void 0 : state.floatingOptions
      }
    });
    const {
      hidden,
      props: rootProps,
      ref: floatingRef
    } = plateFloating.useFloatingToolbar(floatingToolbarState);
    const ref = plateCommon.useComposedRef(componentRef, floatingRef);
    if (hidden)
      return null;
    return /* @__PURE__ */ React.createElement(plateCommon.PortalBody, null, /* @__PURE__ */ React.createElement(
      Toolbar,
      {
        className: cn$1.cn(
          "absolute z-[999999] whitespace-nowrap border bg-popover px-1 opacity-100 shadow-md print:hidden"
        ),
        ref,
        ...rootProps,
        ...props
      },
      children
    ));
  });
  const items = [
    {
      description: "Paragraph",
      icon: Icons.paragraph,
      label: "Paragraph",
      value: plateParagraph.ELEMENT_PARAGRAPH
    },
    {
      description: "Heading 1",
      icon: Icons.h1,
      label: "Heading 1",
      value: plateHeading.ELEMENT_H1
    },
    {
      description: "Heading 2",
      icon: Icons.h2,
      label: "Heading 2",
      value: plateHeading.ELEMENT_H2
    },
    {
      description: "Heading 3",
      icon: Icons.h3,
      label: "Heading 3",
      value: plateHeading.ELEMENT_H3
    },
    {
      description: "Heading 4",
      icon: Icons.h4,
      label: "Heading 4",
      value: plateHeading.ELEMENT_H4
    },
    {
      description: "Heading 5",
      icon: Icons.h5,
      label: "Heading 5",
      value: plateHeading.ELEMENT_H5
    },
    {
      description: "Heading 6",
      icon: Icons.h6,
      label: "Heading 6",
      value: plateHeading.ELEMENT_H6
    }
  ];
  const defaultItem = items.find((item) => item.value === plateParagraph.ELEMENT_PARAGRAPH);
  function TurnIntoDropdownMenu(props) {
    const value = plateCommon.useEditorSelector((editor2) => {
      let initialNodeType = plateParagraph.ELEMENT_PARAGRAPH;
      let allNodesMatchInitialNodeType = false;
      const codeBlockEntries = plateCommon.getNodeEntries(editor2, {
        match: (n) => plateCommon.isBlock(editor2, n),
        mode: "highest"
      });
      const nodes = Array.from(codeBlockEntries);
      if (nodes.length > 0) {
        initialNodeType = nodes[0][0].type;
        allNodesMatchInitialNodeType = nodes.every(([node]) => {
          const type = (node == null ? void 0 : node.type) || plateParagraph.ELEMENT_PARAGRAPH;
          return type === initialNodeType;
        });
      }
      return allNodesMatchInitialNodeType ? initialNodeType : plateParagraph.ELEMENT_PARAGRAPH;
    }, []);
    const editor = plateCommon.useEditorRef();
    const openState = useOpenState();
    const selectedItem = items.find((item) => item.value === value) ?? defaultItem;
    const { icon: SelectedItemIcon, label: selectedItemLabel } = selectedItem;
    const editorState = plateCommon.useEditorState();
    const userInTable = helpers.isNodeActive(editorState, plateTable.ELEMENT_TABLE);
    if (userInTable)
      return null;
    return /* @__PURE__ */ React.createElement(DropdownMenu, { modal: false, ...openState, ...props }, /* @__PURE__ */ React.createElement(DropdownMenuTrigger, { asChild: true }, /* @__PURE__ */ React.createElement(
      ToolbarButton,
      {
        className: "lg:min-w-[130px]",
        isDropdown: true,
        showArrow: true,
        pressed: openState.open,
        tooltip: "Turn into"
      },
      /* @__PURE__ */ React.createElement("span", { className: "" }, selectedItemLabel)
    )), /* @__PURE__ */ React.createElement(DropdownMenuContent, { align: "start", className: "min-w-0" }, /* @__PURE__ */ React.createElement(DropdownMenuLabel, null, "Turn into"), /* @__PURE__ */ React.createElement(
      DropdownMenuRadioGroup,
      {
        className: "flex flex-col gap-0.5",
        onValueChange: (type) => {
          if (type === "ul" || type === "ol") {
            plate.toggleList(editor, { type });
          } else {
            plate.unwrapList(editor);
            plateCommon.toggleNodeType(editor, { activeType: type });
          }
          plateCommon.collapseSelection(editor);
          plateCommon.focusEditor(editor);
        },
        value
      },
      items.map(({ icon: Icon, label, value: itemValue }) => /* @__PURE__ */ React.createElement(
        DropdownMenuRadioItem,
        {
          className: "min-w-[180px]",
          key: itemValue,
          value: itemValue
        },
        /* @__PURE__ */ React.createElement(Icon, { className: "mr-2 size-5" }),
        label
      ))
    )));
  }
  function FloatingToolbarButtons() {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(TurnIntoDropdownMenu, null));
  }
  const inputVariants = classVarianceAuthority.cva(
    "flex w-full rounded-md bg-transparent text-sm file:border-0 file:bg-background file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    {
      defaultVariants: {
        h: "md",
        variant: "default"
      },
      variants: {
        h: {
          md: "h-10 px-3 py-2",
          sm: "h-9 px-3 py-2"
        },
        variant: {
          default: "border border-input ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          ghost: "border-none focus-visible:ring-transparent"
        }
      }
    }
  );
  cn$1.withVariants("input", inputVariants, ["variant", "h"]);
  const floatingOptions = {
    middleware: [
      plateFloating.offset(12),
      plateFloating.flip({
        fallbackPlacements: ["bottom-end", "top-start", "top-end"],
        padding: 12
      })
    ],
    placement: "bottom-start"
  };
  function LinkFloatingToolbar({ state }) {
    const insertState = plateLink.useFloatingLinkInsertState({
      ...state,
      floatingOptions: {
        ...floatingOptions,
        ...state == null ? void 0 : state.floatingOptions
      }
    });
    const {
      hidden,
      props: insertProps,
      ref: insertRef,
      textInputProps
    } = plateLink.useFloatingLinkInsert(insertState);
    const editState = plateLink.useFloatingLinkEditState({
      ...state,
      floatingOptions: {
        ...floatingOptions,
        ...state == null ? void 0 : state.floatingOptions
      }
    });
    const {
      editButtonProps,
      props: editProps,
      ref: editRef,
      unlinkButtonProps
    } = plateLink.useFloatingLinkEdit(editState);
    const inputProps = plateCommon.useFormInputProps({
      preventDefaultOnEnterKeydown: true
    });
    if (hidden)
      return null;
    const input = /* @__PURE__ */ React.createElement("div", { className: "flex max-w-[330px] flex-col", ...inputProps }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center pl-3 text-muted-foreground" }, /* @__PURE__ */ React.createElement(Icons.link, { className: "size-4" })), /* @__PURE__ */ React.createElement(
      plateLink.FloatingLinkUrlInput,
      {
        className: inputVariants({ h: "sm", variant: "ghost" }),
        placeholder: "Paste link"
      }
    )), /* @__PURE__ */ React.createElement(Separator, null), /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center pl-3 text-muted-foreground" }, /* @__PURE__ */ React.createElement(Icons.text, { className: "size-4" })), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: inputVariants({ h: "sm", variant: "ghost" }),
        placeholder: "Text to display",
        ...textInputProps
      }
    )));
    const editContent = editState.isEditing ? input : /* @__PURE__ */ React.createElement("div", { className: "box-content flex h-9 items-center gap-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: buttonVariants$1({ size: "sm", variant: "ghost" }),
        type: "button",
        ...editButtonProps
      },
      "Edit link"
    ), /* @__PURE__ */ React.createElement(Separator, { orientation: "vertical" }), /* @__PURE__ */ React.createElement(
      plateLink.LinkOpenButton,
      {
        className: buttonVariants$1({
          size: "sms",
          variant: "ghost"
        })
      },
      /* @__PURE__ */ React.createElement(Icons.externalLink, { width: 18 })
    ), /* @__PURE__ */ React.createElement(Separator, { orientation: "vertical" }), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: buttonVariants$1({
          size: "sms",
          variant: "ghost"
        }),
        type: "button",
        ...unlinkButtonProps
      },
      /* @__PURE__ */ React.createElement(Icons.unlink, { width: 18 })
    ));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: cn$1.cn(popoverVariants(), "w-auto p-1"),
        ref: insertRef,
        ...insertProps
      },
      input
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: cn$1.cn(popoverVariants(), "w-auto p-1"),
        ref: editRef,
        ...editProps
      },
      editContent
    ));
  }
  const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
  const emailLintRE = /mailto:([^?\\]+)/;
  const telLintRE = /tel:([\d-]+)/;
  const localhostDomainRE = /^localhost[\d:?]*(?:[^\d:?]\S*)?$/;
  const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/;
  const localUrlRE = /^\/\S+/;
  const isUrl = (string) => {
    if (typeof string !== "string") {
      return false;
    }
    if (string.startsWith("#")) {
      return true;
    }
    const generalMatch = string.match(protocolAndDomainRE);
    const emailLinkMatch = string.match(emailLintRE);
    const telLinkMatch = string.match(telLintRE);
    const localUrlMatch = string.match(localUrlRE);
    if (emailLinkMatch || telLinkMatch || localUrlMatch) {
      return true;
    }
    if (generalMatch) {
      const everythingAfterProtocol = generalMatch[1];
      if (!everythingAfterProtocol) {
        return false;
      }
      try {
        new URL(string);
      } catch {
        return false;
      }
      return localhostDomainRE.test(everythingAfterProtocol) || nonLocalhostDomainRE.test(everythingAfterProtocol);
    }
    return false;
  };
  const RichEditor = ({ input, tinaForm, field }) => {
    var _a;
    const initialValue = React.useMemo(
      () => {
        var _a2, _b;
        return ((_b = (_a2 = input.value) == null ? void 0 : _a2.children) == null ? void 0 : _b.length) ? input.value.children.map(helpers.normalize) : [{ type: "p", children: [{ type: "text", text: "" }] }];
      },
      []
    );
    const plugins$2 = React.useMemo(
      () => plateCommon.createPlugins(
        [
          ...plugins$1,
          ...plugins,
          createMdxBlockPlugin(),
          createMdxInlinePlugin(),
          createImgPlugin(),
          createMermaidPlugin(),
          createInvalidMarkdownPlugin(),
          plateLink.createLinkPlugin({
            options: {
              //? NOTE: This is a custom validation function that allows for relative links i.e. /about
              isUrl: (url) => isUrl(url)
            },
            renderAfterEditable: LinkFloatingToolbar
          })
        ],
        {
          components: Components()
        }
      ),
      []
    );
    const tempId = [tinaForm.id, input.name].join(".");
    const id = React.useMemo(() => uuid() + tempId, [tempId]);
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (ref.current) {
        setTimeout(() => {
          var _a2;
          const plateElement = (_a2 = ref.current) == null ? void 0 : _a2.querySelector(
            '[role="textbox"]'
          );
          if (field.experimental_focusIntent && plateElement) {
            if (plateElement)
              plateElement.focus();
          }
        }, 100);
      }
    }, [field.experimental_focusIntent, ref]);
    return /* @__PURE__ */ React.createElement("div", { ref }, /* @__PURE__ */ React.createElement(
      plateCommon.Plate,
      {
        id,
        initialValue,
        plugins: plugins$2,
        onChange: (value) => {
          input.onChange({
            type: "root",
            children: value
          });
        }
      },
      /* @__PURE__ */ React.createElement(TooltipProvider$1, null, /* @__PURE__ */ React.createElement(
        ToolbarProvider,
        {
          tinaForm,
          templates: field.templates,
          overrides: (field == null ? void 0 : field.toolbarOverride) ? field.toolbarOverride : field.overrides
        },
        /* @__PURE__ */ React.createElement(FixedToolbar, null, /* @__PURE__ */ React.createElement(FixedToolbarButtons, null)),
        ((_a = field == null ? void 0 : field.overrides) == null ? void 0 : _a.showFloatingToolbar) !== false ? /* @__PURE__ */ React.createElement(FloatingToolbar, null, /* @__PURE__ */ React.createElement(FloatingToolbarButtons, null)) : null
      ), /* @__PURE__ */ React.createElement(Editor, null))
    ));
  };
  const MdxFieldPlugin = {
    name: "rich-text",
    Component: wrapFieldsWithMeta((props) => {
      const [rawMode, setRawMode] = React.useState(false);
      const [key, setKey] = React.useState(0);
      React.useMemo(() => {
        const { reset } = props.form;
        props.form.reset = (initialValues) => {
          setKey((key2) => key2 + 1);
          return reset(initialValues);
        };
      }, []);
      return /* @__PURE__ */ React.createElement(
        EditorContext.Provider,
        {
          key,
          value: {
            fieldName: props.field.name,
            templates: props.field.templates,
            rawMode,
            setRawMode
          }
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            className: "min-h-[100px] max-w-full tina-prose relative shadow-inner focus-within:shadow-outline focus-within:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus-within:text-gray-900 rounded-md pt-0 py-2"
          },
          /* @__PURE__ */ React.createElement(RichEditor, { ...props })
        )
      );
    })
  };
  const MdxFieldPluginExtendible = {
    name: "rich-text",
    validate(value) {
      if (typeof value !== "undefined" && value !== null && Array.isArray(value.children) && value.children[0] && value.children[0].type === "invalid_markdown") {
        return "Unable to parse rich-text";
      }
      return void 0;
    },
    Component: wrapFieldsWithMeta((props) => {
      const [key, setKey] = React.useState(0);
      React.useMemo(() => {
        const { reset } = props.form;
        props.form.reset = (initialValues) => {
          setKey((key2) => key2 + 1);
          return reset(initialValues);
        };
      }, []);
      return /* @__PURE__ */ React.createElement(
        EditorContext.Provider,
        {
          key,
          value: {
            fieldName: props.field.name,
            templates: props.field.templates,
            rawMode: props.rawMode,
            setRawMode: props.setRawMode
          }
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            className: "min-h-[100px] max-w-full tina-prose relative shadow-inner focus-within:shadow-outline focus-within:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus-within:text-gray-900 rounded-md pt-0 py-2"
          },
          props.rawMode ? props.rawEditor : /* @__PURE__ */ React.createElement(RichEditor, { ...props })
        )
      );
    })
  };
  class FormMetaPlugin {
    constructor(options) {
      this.__type = "form:meta";
      this.name = options.name;
      this.Component = options.Component;
    }
  }
  function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = React__namespace.useState(initialValue);
    React__namespace.useEffect(() => {
      const valueFromStorage = window.localStorage && window.localStorage.getItem(key);
      if (valueFromStorage != null && valueFromStorage != void 0) {
        setStoredValue(JSON.parse(valueFromStorage));
      }
    }, [key]);
    const setValue = (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    };
    return [storedValue, setValue];
  }
  const num123 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const numFas = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"];
  const numKor = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
  const numMya = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
  const numTel = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];
  const _123 = [...num123, ...numFas, ...numKor, ...numMya, ...numTel];
  const afr = [
    "die",
    "het",
    "en",
    "sy",
    "nie",
    "was",
    "hy",
    "te",
    "is",
    "ek",
    "om",
    "hulle",
    "in",
    "my",
    "'n",
    "vir",
    "toe",
    "haar",
    "van",
    "dit",
    "op",
    "se",
    "wat",
    "met",
    "gaan",
    "baie",
    "ons",
    "jy",
    "na",
    "maar",
    "hom",
    "so",
    "n",
    "huis",
    "kan",
    "aan",
    "dat",
    "daar",
    "sal",
    "jou",
    "gesê",
    "by",
    "kom",
    "een",
    "ma",
    "as",
    "son",
    "groot",
    "begin",
    "al"
  ];
  const ara = [
    "،",
    "ّآض",
    "آمينَ",
    "آه",
    "آهاً",
    "آي",
    "أ",
    "أب",
    "أجل",
    "أجمع",
    "أخ",
    "أخذ",
    "أصبح",
    "أضحى",
    "أقبل",
    "أقل",
    "أكثر",
    "ألا",
    "أم",
    "أما",
    "أمامك",
    "أمامكَ",
    "أمسى",
    "أمّا",
    "أن",
    "أنا",
    "أنت",
    "أنتم",
    "أنتما",
    "أنتن",
    "أنتِ",
    "أنشأ",
    "أنّى",
    "أو",
    "أوشك",
    "أولئك",
    "أولئكم",
    "أولاء",
    "أولالك",
    "أوّهْ",
    "أي",
    "أيا",
    "أين",
    "أينما",
    "أيّ",
    "أَنَّ",
    "أََيُّ",
    "أُفٍّ",
    "إذ",
    "إذا",
    "إذاً",
    "إذما",
    "إذن",
    "إلى",
    "إليكم",
    "إليكما",
    "إليكنّ",
    "إليكَ",
    "إلَيْكَ",
    "إلّا",
    "إمّا",
    "إن",
    "إنّما",
    "إي",
    "إياك",
    "إياكم",
    "إياكما",
    "إياكن",
    "إيانا",
    "إياه",
    "إياها",
    "إياهم",
    "إياهما",
    "إياهن",
    "إياي",
    "إيهٍ",
    "إِنَّ",
    "ا",
    "ابتدأ",
    "اثر",
    "اجل",
    "احد",
    "اخرى",
    "اخلولق",
    "اذا",
    "اربعة",
    "ارتدّ",
    "استحال",
    "اطار",
    "اعادة",
    "اعلنت",
    "اف",
    "اكثر",
    "اكد",
    "الألاء",
    "الألى",
    "الا",
    "الاخيرة",
    "الان",
    "الاول",
    "الاولى",
    "التى",
    "التي",
    "الثاني",
    "الثانية",
    "الذاتي",
    "الذى",
    "الذي",
    "الذين",
    "السابق",
    "الف",
    "اللائي",
    "اللاتي",
    "اللتان",
    "اللتيا",
    "اللتين",
    "اللذان",
    "اللذين",
    "اللواتي",
    "الماضي",
    "المقبل",
    "الوقت",
    "الى",
    "اليوم",
    "اما",
    "امام",
    "امس",
    "ان",
    "انبرى",
    "انقلب",
    "انه",
    "انها",
    "او",
    "اول",
    "اي",
    "ايار",
    "ايام",
    "ايضا",
    "ب",
    "بات",
    "باسم",
    "بان",
    "بخٍ",
    "برس",
    "بسبب",
    "بسّ",
    "بشكل",
    "بضع",
    "بطآن",
    "بعد",
    "بعض",
    "بك",
    "بكم",
    "بكما",
    "بكن",
    "بل",
    "بلى",
    "بما",
    "بماذا",
    "بمن",
    "بن",
    "بنا",
    "به",
    "بها",
    "بي",
    "بيد",
    "بين",
    "بَسْ",
    "بَلْهَ",
    "بِئْسَ",
    "تانِ",
    "تانِك",
    "تبدّل",
    "تجاه",
    "تحوّل",
    "تلقاء",
    "تلك",
    "تلكم",
    "تلكما",
    "تم",
    "تينك",
    "تَيْنِ",
    "تِه",
    "تِي",
    "ثلاثة",
    "ثم",
    "ثمّ",
    "ثمّة",
    "ثُمَّ",
    "جعل",
    "جلل",
    "جميع",
    "جير",
    "حار",
    "حاشا",
    "حاليا",
    "حاي",
    "حتى",
    "حرى",
    "حسب",
    "حم",
    "حوالى",
    "حول",
    "حيث",
    "حيثما",
    "حين",
    "حيَّ",
    "حَبَّذَا",
    "حَتَّى",
    "حَذارِ",
    "خلا",
    "خلال",
    "دون",
    "دونك",
    "ذا",
    "ذات",
    "ذاك",
    "ذانك",
    "ذانِ",
    "ذلك",
    "ذلكم",
    "ذلكما",
    "ذلكن",
    "ذو",
    "ذوا",
    "ذواتا",
    "ذواتي",
    "ذيت",
    "ذينك",
    "ذَيْنِ",
    "ذِه",
    "ذِي",
    "راح",
    "رجع",
    "رويدك",
    "ريث",
    "رُبَّ",
    "زيارة",
    "سبحان",
    "سرعان",
    "سنة",
    "سنوات",
    "سوف",
    "سوى",
    "سَاءَ",
    "سَاءَمَا",
    "شبه",
    "شخصا",
    "شرع",
    "شَتَّانَ",
    "صار",
    "صباح",
    "صفر",
    "صهٍ",
    "صهْ",
    "ضد",
    "ضمن",
    "طاق",
    "طالما",
    "طفق",
    "طَق",
    "ظلّ",
    "عاد",
    "عام",
    "عاما",
    "عامة",
    "عدا",
    "عدة",
    "عدد",
    "عدم",
    "عسى",
    "عشر",
    "عشرة",
    "علق",
    "على",
    "عليك",
    "عليه",
    "عليها",
    "علًّ",
    "عن",
    "عند",
    "عندما",
    "عوض",
    "عين",
    "عَدَسْ",
    "عَمَّا",
    "غدا",
    "غير",
    "ـ",
    "ف",
    "فان",
    "فلان",
    "فو",
    "فى",
    "في",
    "فيم",
    "فيما",
    "فيه",
    "فيها",
    "قال",
    "قام",
    "قبل",
    "قد",
    "قطّ",
    "قلما",
    "قوة",
    "كأنّما",
    "كأين",
    "كأيّ",
    "كأيّن",
    "كاد",
    "كان",
    "كانت",
    "كذا",
    "كذلك",
    "كرب",
    "كل",
    "كلا",
    "كلاهما",
    "كلتا",
    "كلم",
    "كليكما",
    "كليهما",
    "كلّما",
    "كلَّا",
    "كم",
    "كما",
    "كي",
    "كيت",
    "كيف",
    "كيفما",
    "كَأَنَّ",
    "كِخ",
    "لئن",
    "لا",
    "لات",
    "لاسيما",
    "لدن",
    "لدى",
    "لعمر",
    "لقاء",
    "لك",
    "لكم",
    "لكما",
    "لكن",
    "لكنَّما",
    "لكي",
    "لكيلا",
    "للامم",
    "لم",
    "لما",
    "لمّا",
    "لن",
    "لنا",
    "له",
    "لها",
    "لو",
    "لوكالة",
    "لولا",
    "لوما",
    "لي",
    "لَسْتَ",
    "لَسْتُ",
    "لَسْتُم",
    "لَسْتُمَا",
    "لَسْتُنَّ",
    "لَسْتِ",
    "لَسْنَ",
    "لَعَلَّ",
    "لَكِنَّ",
    "لَيْتَ",
    "لَيْسَ",
    "لَيْسَا",
    "لَيْسَتَا",
    "لَيْسَتْ",
    "لَيْسُوا",
    "لَِسْنَا",
    "ما",
    "ماانفك",
    "مابرح",
    "مادام",
    "ماذا",
    "مازال",
    "مافتئ",
    "مايو",
    "متى",
    "مثل",
    "مذ",
    "مساء",
    "مع",
    "معاذ",
    "مقابل",
    "مكانكم",
    "مكانكما",
    "مكانكنّ",
    "مكانَك",
    "مليار",
    "مليون",
    "مما",
    "ممن",
    "من",
    "منذ",
    "منها",
    "مه",
    "مهما",
    "مَنْ",
    "مِن",
    "نحن",
    "نحو",
    "نعم",
    "نفس",
    "نفسه",
    "نهاية",
    "نَخْ",
    "نِعِمّا",
    "نِعْمَ",
    "ها",
    "هاؤم",
    "هاكَ",
    "هاهنا",
    "هبّ",
    "هذا",
    "هذه",
    "هكذا",
    "هل",
    "هلمَّ",
    "هلّا",
    "هم",
    "هما",
    "هن",
    "هنا",
    "هناك",
    "هنالك",
    "هو",
    "هي",
    "هيا",
    "هيت",
    "هيّا",
    "هَؤلاء",
    "هَاتانِ",
    "هَاتَيْنِ",
    "هَاتِه",
    "هَاتِي",
    "هَجْ",
    "هَذا",
    "هَذانِ",
    "هَذَيْنِ",
    "هَذِه",
    "هَذِي",
    "هَيْهَاتَ",
    "و",
    "وا",
    "واحد",
    "واضاف",
    "واضافت",
    "واكد",
    "وان",
    "واهاً",
    "واوضح",
    "وراءَك",
    "وفي",
    "وقال",
    "وقالت",
    "وقد",
    "وقف",
    "وكان",
    "وكانت",
    "ولا",
    "ولم",
    "ومن",
    "وهو",
    "وهي",
    "ويكأنّ",
    "وَيْ",
    "وُشْكَانََ",
    "يكون",
    "يمكن",
    "يوم",
    "ّأيّان"
  ];
  const hye = [
    "այդ",
    "այլ",
    "այն",
    "այս",
    "դու",
    "դուք",
    "եմ",
    "են",
    "ենք",
    "ես",
    "եք",
    "է",
    "էի",
    "էին",
    "էինք",
    "էիր",
    "էիք",
    "էր",
    "ըստ",
    "թ",
    "ի",
    "ին",
    "իսկ",
    "իր",
    "կամ",
    "համար",
    "հետ",
    "հետո",
    "մենք",
    "մեջ",
    "մի",
    "ն",
    "նա",
    "նաև",
    "նրա",
    "նրանք",
    "որ",
    "որը",
    "որոնք",
    "որպես",
    "ու",
    "ում",
    "պիտի",
    "վրա",
    "և"
  ];
  const eus = [
    "al",
    "anitz",
    "arabera",
    "asko",
    "baina",
    "bat",
    "batean",
    "batek",
    "bati",
    "batzuei",
    "batzuek",
    "batzuetan",
    "batzuk",
    "bera",
    "beraiek",
    "berau",
    "berauek",
    "bere",
    "berori",
    "beroriek",
    "beste",
    "bezala",
    "da",
    "dago",
    "dira",
    "ditu",
    "du",
    "dute",
    "edo",
    "egin",
    "ere",
    "eta",
    "eurak",
    "ez",
    "gainera",
    "gu",
    "gutxi",
    "guzti",
    "haiei",
    "haiek",
    "haietan",
    "hainbeste",
    "hala",
    "han",
    "handik",
    "hango",
    "hara",
    "hari",
    "hark",
    "hartan",
    "hau",
    "hauei",
    "hauek",
    "hauetan",
    "hemen",
    "hemendik",
    "hemengo",
    "hi",
    "hona",
    "honek",
    "honela",
    "honetan",
    "honi",
    "hor",
    "hori",
    "horiei",
    "horiek",
    "horietan",
    "horko",
    "horra",
    "horrek",
    "horrela",
    "horretan",
    "horri",
    "hortik",
    "hura",
    "izan",
    "ni",
    "noiz",
    "nola",
    "non",
    "nondik",
    "nongo",
    "nor",
    "nora",
    "ze",
    "zein",
    "zen",
    "zenbait",
    "zenbat",
    "zer",
    "zergatik",
    "ziren",
    "zituen",
    "zu",
    "zuek",
    "zuen",
    "zuten"
  ];
  const ben = [
    "অতএব",
    "অথচ",
    "অথবা",
    "অনুযায়ী",
    "অনেক",
    "অনেকে",
    "অনেকেই",
    "অন্তত",
    "অন্য",
    "অবধি",
    "অবশ্য",
    "অর্থাত",
    "আই",
    "আগামী",
    "আগে",
    "আগেই",
    "আছে",
    "আজ",
    "আদ্যভাগে",
    "আপনার",
    "আপনি",
    "আবার",
    "আমরা",
    "আমাকে",
    "আমাদের",
    "আমার",
    "আমি",
    "আর",
    "আরও",
    "ই",
    "ইত্যাদি",
    "ইহা",
    "উচিত",
    "উত্তর",
    "উনি",
    "উপর",
    "উপরে",
    "এ",
    "এঁদের",
    "এঁরা",
    "এই",
    "একই",
    "একটি",
    "একবার",
    "একে",
    "এক্",
    "এখন",
    "এখনও",
    "এখানে",
    "এখানেই",
    "এটা",
    "এটাই",
    "এটি",
    "এত",
    "এতটাই",
    "এতে",
    "এদের",
    "এব",
    "এবং",
    "এবার",
    "এমন",
    "এমনকী",
    "এমনি",
    "এর",
    "এরা",
    "এল",
    "এস",
    "এসে",
    "ঐ",
    "ও",
    "ওঁদের",
    "ওঁর",
    "ওঁরা",
    "ওই",
    "ওকে",
    "ওখানে",
    "ওদের",
    "ওর",
    "ওরা",
    "কখনও",
    "কত",
    "কবে",
    "কমনে",
    "কয়েক",
    "কয়েকটি",
    "করছে",
    "করছেন",
    "করতে",
    "করবে",
    "করবেন",
    "করলে",
    "করলেন",
    "করা",
    "করাই",
    "করায়",
    "করার",
    "করি",
    "করিতে",
    "করিয়া",
    "করিয়ে",
    "করে",
    "করেই",
    "করেছিলেন",
    "করেছে",
    "করেছেন",
    "করেন",
    "কাউকে",
    "কাছ",
    "কাছে",
    "কাজ",
    "কাজে",
    "কারও",
    "কারণ",
    "কি",
    "কিংবা",
    "কিছু",
    "কিছুই",
    "কিন্তু",
    "কী",
    "কে",
    "কেউ",
    "কেউই",
    "কেখা",
    "কেন",
    "কোটি",
    "কোন",
    "কোনও",
    "কোনো",
    "ক্ষেত্রে",
    "কয়েক",
    "খুব",
    "গিয়ে",
    "গিয়েছে",
    "গিয়ে",
    "গুলি",
    "গেছে",
    "গেল",
    "গেলে",
    "গোটা",
    "চলে",
    "চান",
    "চায়",
    "চার",
    "চালু",
    "চেয়ে",
    "চেষ্টা",
    "ছাড়া",
    "ছাড়াও",
    "ছিল",
    "ছিলেন",
    "জন",
    "জনকে",
    "জনের",
    "জন্য",
    "জন্যওজে",
    "জানতে",
    "জানা",
    "জানানো",
    "জানায়",
    "জানিয়ে",
    "জানিয়েছে",
    "জে",
    "জ্নজন",
    "টি",
    "ঠিক",
    "তখন",
    "তত",
    "তথা",
    "তবু",
    "তবে",
    "তা",
    "তাঁকে",
    "তাঁদের",
    "তাঁর",
    "তাঁরা",
    "তাঁাহারা",
    "তাই",
    "তাও",
    "তাকে",
    "তাতে",
    "তাদের",
    "তার",
    "তারপর",
    "তারা",
    "তারৈ",
    "তাহলে",
    "তাহা",
    "তাহাতে",
    "তাহার",
    "তিনঐ",
    "তিনি",
    "তিনিও",
    "তুমি",
    "তুলে",
    "তেমন",
    "তো",
    "তোমার",
    "থাকবে",
    "থাকবেন",
    "থাকা",
    "থাকায়",
    "থাকে",
    "থাকেন",
    "থেকে",
    "থেকেই",
    "থেকেও",
    "দিকে",
    "দিতে",
    "দিন",
    "দিয়ে",
    "দিয়েছে",
    "দিয়েছেন",
    "দিলেন",
    "দু",
    "দুই",
    "দুটি",
    "দুটো",
    "দেওয়া",
    "দেওয়ার",
    "দেওয়া",
    "দেখতে",
    "দেখা",
    "দেখে",
    "দেন",
    "দেয়",
    "দ্বারা",
    "ধরা",
    "ধরে",
    "ধামার",
    "নতুন",
    "নয়",
    "না",
    "নাই",
    "নাকি",
    "নাগাদ",
    "নানা",
    "নিজে",
    "নিজেই",
    "নিজেদের",
    "নিজের",
    "নিতে",
    "নিয়ে",
    "নিয়ে",
    "নেই",
    "নেওয়া",
    "নেওয়ার",
    "নেওয়া",
    "নয়",
    "পক্ষে",
    "পর",
    "পরে",
    "পরেই",
    "পরেও",
    "পর্যন্ত",
    "পাওয়া",
    "পাচ",
    "পারি",
    "পারে",
    "পারেন",
    "পি",
    "পেয়ে",
    "পেয়্র্",
    "প্রতি",
    "প্রথম",
    "প্রভৃতি",
    "প্রযন্ত",
    "প্রাথমিক",
    "প্রায়",
    "প্রায়",
    "ফলে",
    "ফিরে",
    "ফের",
    "বক্তব্য",
    "বদলে",
    "বন",
    "বরং",
    "বলতে",
    "বলল",
    "বললেন",
    "বলা",
    "বলে",
    "বলেছেন",
    "বলেন",
    "বসে",
    "বহু",
    "বা",
    "বাদে",
    "বার",
    "বি",
    "বিনা",
    "বিভিন্ন",
    "বিশেষ",
    "বিষয়টি",
    "বেশ",
    "বেশি",
    "ব্যবহার",
    "ব্যাপারে",
    "ভাবে",
    "ভাবেই",
    "মতো",
    "মতোই",
    "মধ্যভাগে",
    "মধ্যে",
    "মধ্যেই",
    "মধ্যেও",
    "মনে",
    "মাত্র",
    "মাধ্যমে",
    "মোট",
    "মোটেই",
    "যখন",
    "যত",
    "যতটা",
    "যথেষ্ট",
    "যদি",
    "যদিও",
    "যা",
    "যাঁর",
    "যাঁরা",
    "যাওয়া",
    "যাওয়ার",
    "যাওয়া",
    "যাকে",
    "যাচ্ছে",
    "যাতে",
    "যাদের",
    "যান",
    "যাবে",
    "যায়",
    "যার",
    "যারা",
    "যিনি",
    "যে",
    "যেখানে",
    "যেতে",
    "যেন",
    "যেমন",
    "র",
    "রকম",
    "রয়েছে",
    "রাখা",
    "রেখে",
    "লক্ষ",
    "শুধু",
    "শুরু",
    "সঙ্গে",
    "সঙ্গেও",
    "সব",
    "সবার",
    "সমস্ত",
    "সম্প্রতি",
    "সহ",
    "সহিত",
    "সাধারণ",
    "সামনে",
    "সি",
    "সুতরাং",
    "সে",
    "সেই",
    "সেখান",
    "সেখানে",
    "সেটা",
    "সেটাই",
    "সেটাও",
    "সেটি",
    "স্পষ্ট",
    "স্বয়ং",
    "হইতে",
    "হইবে",
    "হইয়া",
    "হওয়া",
    "হওয়ায়",
    "হওয়ার",
    "হচ্ছে",
    "হত",
    "হতে",
    "হতেই",
    "হন",
    "হবে",
    "হবেন",
    "হয়",
    "হয়তো",
    "হয়নি",
    "হয়ে",
    "হয়েই",
    "হয়েছিল",
    "হয়েছে",
    "হয়েছেন",
    "হল",
    "হলে",
    "হলেই",
    "হলেও",
    "হলো",
    "হাজার",
    "হিসাবে",
    "হৈলে",
    "হোক",
    "হয়"
  ];
  const bre = [
    "'blam",
    "'d",
    "'m",
    "'r",
    "'ta",
    "'vat",
    "'z",
    "'zo",
    "a",
    "a:",
    "aba",
    "abalamour",
    "abaoe",
    "ac'hane",
    "ac'hanoc'h",
    "ac'hanomp",
    "ac'hanon",
    "ac'hanout",
    "adal",
    "adalek",
    "adarre",
    "ae",
    "aec'h",
    "aed",
    "aemp",
    "aen",
    "aent",
    "aes",
    "afe",
    "afec'h",
    "afed",
    "afemp",
    "afen",
    "afent",
    "afes",
    "ag",
    "ah",
    "aimp",
    "aint",
    "aio",
    "aiou",
    "aje",
    "ajec'h",
    "ajed",
    "ajemp",
    "ajen",
    "ajent",
    "ajes",
    "al",
    "alato",
    "alies",
    "aliesañ",
    "alkent",
    "all",
    "allas",
    "allo",
    "allô",
    "am",
    "amañ",
    "amzer",
    "an",
    "anezhañ",
    "anezhe",
    "anezhi",
    "anezho",
    "anvet",
    "aon",
    "aotren",
    "ar",
    "arall",
    "araok",
    "araoki",
    "araozañ",
    "araozo",
    "araozoc'h",
    "araozomp",
    "araozon",
    "araozor",
    "araozout",
    "arbenn",
    "arre",
    "atalek",
    "atav",
    "az",
    "azalek",
    "azirazañ",
    "azirazi",
    "azirazo",
    "azirazoc'h",
    "azirazomp",
    "azirazon",
    "azirazor",
    "azirazout",
    "b:",
    "ba",
    "ba'l",
    "ba'n",
    "ba'r",
    "bad",
    "bah",
    "bal",
    "ban",
    "bar",
    "bastañ",
    "befe",
    "bell",
    "benaos",
    "benn",
    "bennag",
    "bennak",
    "bennozh",
    "bep",
    "bepred",
    "berr",
    "berzh",
    "bet",
    "betek",
    "betra",
    "bev",
    "bevet",
    "bez",
    "bezañ",
    "beze",
    "bezent",
    "bezet",
    "bezh",
    "bezit",
    "bezomp",
    "bihan",
    "bije",
    "biou",
    "biskoazh",
    "blam",
    "bo",
    "boa",
    "bominapl",
    "boudoudom",
    "bouez",
    "boull",
    "boum",
    "bout",
    "bras",
    "brasañ",
    "brav",
    "bravo",
    "bremañ",
    "bres",
    "brokenn",
    "bronn",
    "brrr",
    "brutal",
    "buhezek",
    "c'h:",
    "c'haout",
    "c'he",
    "c'hem",
    "c'herz",
    "c'heñver",
    "c'hichen",
    "c'hiz",
    "c'hoazh",
    "c'horre",
    "c'houde",
    "c'houst",
    "c'hreiz",
    "c'hwec'h",
    "c'hwec'hvet",
    "c'hwezek",
    "c'hwi",
    "ch:",
    "chaous",
    "chik",
    "chit",
    "chom",
    "chut",
    "d'",
    "d'al",
    "d'an",
    "d'ar",
    "d'az",
    "d'e",
    "d'he",
    "d'ho",
    "d'hol",
    "d'hon",
    "d'hor",
    "d'o",
    "d'ober",
    "d'ul",
    "d'un",
    "d'ur",
    "d:",
    "da",
    "dak",
    "daka",
    "dal",
    "dalbezh",
    "dalc'hmat",
    "dalit",
    "damdost",
    "damheñvel",
    "damm",
    "dan",
    "danvez",
    "dao",
    "daol",
    "daonet",
    "daou",
    "daoust",
    "daouzek",
    "daouzekvet",
    "darn",
    "dastrewiñ",
    "dav",
    "davedoc'h",
    "davedomp",
    "davedon",
    "davedor",
    "davedout",
    "davet",
    "davetañ",
    "davete",
    "daveti",
    "daveto",
    "defe",
    "dehou",
    "dek",
    "dekvet",
    "den",
    "deoc'h",
    "deomp",
    "deor",
    "derc'hel",
    "deus",
    "dez",
    "deze",
    "dezhañ",
    "dezhe",
    "dezhi",
    "dezho",
    "di",
    "diabarzh",
    "diagent",
    "diar",
    "diaraok",
    "diavaez",
    "dibaoe",
    "dibaot",
    "dibar",
    "dic'halañ",
    "didiac'h",
    "dienn",
    "difer",
    "diganeoc'h",
    "diganeomp",
    "diganeor",
    "diganimp",
    "diganin",
    "diganit",
    "digant",
    "digantañ",
    "digante",
    "diganti",
    "diganto",
    "digemmesk",
    "diget",
    "digor",
    "digoret",
    "dija",
    "dije",
    "dimp",
    "din",
    "dinaou",
    "dindan",
    "dindanañ",
    "dindani",
    "dindano",
    "dindanoc'h",
    "dindanomp",
    "dindanon",
    "dindanor",
    "dindanout",
    "dioutañ",
    "dioute",
    "diouti",
    "diouto",
    "diouzh",
    "diouzhin",
    "diouzhit",
    "diouzhoc'h",
    "diouzhomp",
    "diouzhor",
    "dirak",
    "dirazañ",
    "dirazi",
    "dirazo",
    "dirazoc'h",
    "dirazomp",
    "dirazon",
    "dirazor",
    "dirazout",
    "disheñvel",
    "dispar",
    "distank",
    "dister",
    "disterañ",
    "disterig",
    "distro",
    "dit",
    "divaez",
    "diwar",
    "diwezhat",
    "diwezhañ",
    "do",
    "doa",
    "doare",
    "dont",
    "dost",
    "doue",
    "douetus",
    "douez",
    "doug",
    "draou",
    "draoñ",
    "dre",
    "drede",
    "dreist",
    "dreistañ",
    "dreisti",
    "dreisto",
    "dreistoc'h",
    "dreistomp",
    "dreiston",
    "dreistor",
    "dreistout",
    "drek",
    "dreñv",
    "dring",
    "dro",
    "du",
    "e",
    "e:",
    "eas",
    "ebet",
    "ec'h",
    "edo",
    "edoc'h",
    "edod",
    "edomp",
    "edon",
    "edont",
    "edos",
    "eer",
    "eeun",
    "efed",
    "egedoc'h",
    "egedomp",
    "egedon",
    "egedor",
    "egedout",
    "eget",
    "egetañ",
    "egete",
    "egeti",
    "egeto",
    "eh",
    "eil",
    "eilvet",
    "eizh",
    "eizhvet",
    "ejoc'h",
    "ejod",
    "ejomp",
    "ejont",
    "ejout",
    "el",
    "em",
    "emaint",
    "emaoc'h",
    "emaomp",
    "emaon",
    "emaout",
    "emañ",
    "eme",
    "emeur",
    "emezañ",
    "emezi",
    "emezo",
    "emezoc'h",
    "emezomp",
    "emezon",
    "emezout",
    "emporzhiañ",
    "en",
    "end",
    "endan",
    "endra",
    "enep",
    "ennañ",
    "enni",
    "enno",
    "ennoc'h",
    "ennomp",
    "ennon",
    "ennor",
    "ennout",
    "enta",
    "eo",
    "eomp",
    "eont",
    "eor",
    "eot",
    "er",
    "erbet",
    "erfin",
    "esa",
    "esae",
    "espar",
    "estlamm",
    "estrañj",
    "eta",
    "etre",
    "etreoc'h",
    "etrezo",
    "etrezoc'h",
    "etrezomp",
    "etrezor",
    "euh",
    "eur",
    "eus",
    "evel",
    "evelato",
    "eveldoc'h",
    "eveldomp",
    "eveldon",
    "eveldor",
    "eveldout",
    "evelkent",
    "eveltañ",
    "evelte",
    "evelti",
    "evelto",
    "evidoc'h",
    "evidomp",
    "evidon",
    "evidor",
    "evidout",
    "evit",
    "evitañ",
    "evite",
    "eviti",
    "evito",
    "ez",
    "eñ",
    "f:",
    "fac'h",
    "fall",
    "fed",
    "feiz",
    "fenn",
    "fezh",
    "fin",
    "finsalvet",
    "foei",
    "fouilhezañ",
    "g:",
    "gallout",
    "ganeoc'h",
    "ganeomp",
    "ganin",
    "ganit",
    "gant",
    "gantañ",
    "ganti",
    "ganto",
    "gaout",
    "gast",
    "gein",
    "gellout",
    "genndost",
    "gentañ",
    "ger",
    "gerz",
    "get",
    "geñver",
    "gichen",
    "gin",
    "giz",
    "glan",
    "gloev",
    "goll",
    "gorre",
    "goude",
    "gouez",
    "gouezit",
    "gouezomp",
    "goulz",
    "gounnar",
    "gour",
    "goust",
    "gouze",
    "gouzout",
    "gra",
    "grak",
    "grec'h",
    "greiz",
    "grenn",
    "greomp",
    "grit",
    "groñs",
    "gutez",
    "gwall",
    "gwashoc'h",
    "gwazh",
    "gwech",
    "gwechall",
    "gwechoù",
    "gwell",
    "gwezh",
    "gwezhall",
    "gwezharall",
    "gwezhoù",
    "gwig",
    "gwirionez",
    "gwitibunan",
    "gêr",
    "h:",
    "ha",
    "hag",
    "han",
    "hanter",
    "hanterc'hantad",
    "hanterkantved",
    "harz",
    "hañ",
    "hañval",
    "he",
    "hebioù",
    "hec'h",
    "hei",
    "hein",
    "hem",
    "hemañ",
    "hen",
    "hend",
    "henhont",
    "henn",
    "hennezh",
    "hent",
    "hep",
    "hervez",
    "hervezañ",
    "hervezi",
    "hervezo",
    "hervezoc'h",
    "hervezomp",
    "hervezon",
    "hervezor",
    "hervezout",
    "heul",
    "heuliañ",
    "hevelep",
    "heverk",
    "heñvel",
    "heñvelat",
    "heñvelañ",
    "heñveliñ",
    "heñveloc'h",
    "heñvelout",
    "hi",
    "hilh",
    "hini",
    "hirie",
    "hirio",
    "hiziv",
    "hiziviken",
    "ho",
    "hoaliñ",
    "hoc'h",
    "hogen",
    "hogos",
    "hogozik",
    "hol",
    "holl",
    "holà",
    "homañ",
    "hon",
    "honhont",
    "honnezh",
    "hont",
    "hop",
    "hopala",
    "hor",
    "hou",
    "houp",
    "hudu",
    "hue",
    "hui",
    "hum",
    "hurrah",
    "i",
    "i:",
    "in",
    "int",
    "is",
    "ispisial",
    "isurzhiet",
    "it",
    "ivez",
    "izelañ",
    "j:",
    "just",
    "k:",
    "kae",
    "kaer",
    "kalon",
    "kalz",
    "kant",
    "kaout",
    "kar",
    "kazi",
    "keid",
    "kein",
    "keit",
    "kel",
    "kellies",
    "keloù",
    "kement",
    "ken",
    "kenkent",
    "kenkoulz",
    "kenment",
    "kent",
    "kentañ",
    "kentizh",
    "kentoc'h",
    "kentre",
    "ker",
    "kerkent",
    "kerz",
    "kerzh",
    "ket",
    "keta",
    "keñver",
    "keñverel",
    "keñverius",
    "kichen",
    "kichenik",
    "kit",
    "kiz",
    "klak",
    "klek",
    "klik",
    "komprenet",
    "komz",
    "kont",
    "korf",
    "korre",
    "koulskoude",
    "koulz",
    "koust",
    "krak",
    "krampouezh",
    "krec'h",
    "kreiz",
    "kuit",
    "kwir",
    "l:",
    "la",
    "laez",
    "laoskel",
    "laouen",
    "lavar",
    "lavaret",
    "lavarout",
    "lec'h",
    "lein",
    "leizh",
    "lerc'h",
    "leun",
    "leuskel",
    "lew",
    "lies",
    "liesañ",
    "lod",
    "lusk",
    "lâr",
    "lârout",
    "m:",
    "ma",
    "ma'z",
    "mac'h",
    "mac'hat",
    "mac'hañ",
    "mac'hoc'h",
    "mad",
    "maez",
    "maksimal",
    "mann",
    "mar",
    "mard",
    "marg",
    "marzh",
    "mat",
    "mañ",
    "me",
    "memes",
    "memestra",
    "merkapl",
    "mersi",
    "mes",
    "mesk",
    "met",
    "meur",
    "mil",
    "minimal",
    "moan",
    "moaniaat",
    "mod",
    "mont",
    "mout",
    "mui",
    "muiañ",
    "muioc'h",
    "n",
    "n'",
    "n:",
    "na",
    "nag",
    "naontek",
    "naturel",
    "nav",
    "navet",
    "ne",
    "nebeudig",
    "nebeut",
    "nebeutañ",
    "nebeutoc'h",
    "neketa",
    "nemedoc'h",
    "nemedomp",
    "nemedon",
    "nemedor",
    "nemedout",
    "nemet",
    "nemetañ",
    "nemete",
    "nemeti",
    "nemeto",
    "nemeur",
    "neoac'h",
    "nepell",
    "nerzh",
    "nes",
    "neseser",
    "netra",
    "neubeudoù",
    "neuhe",
    "neuze",
    "nevez",
    "newazh",
    "nez",
    "ni",
    "nikun",
    "niverus",
    "nul",
    "o",
    "o:",
    "oa",
    "oac'h",
    "oad",
    "oamp",
    "oan",
    "oant",
    "oar",
    "oas",
    "ober",
    "oc'h",
    "oc'ho",
    "oc'hola",
    "oc'hpenn",
    "oh",
    "ohe",
    "ollé",
    "olole",
    "olé",
    "omp",
    "on",
    "ordin",
    "ordinal",
    "ouejoc'h",
    "ouejod",
    "ouejomp",
    "ouejont",
    "ouejout",
    "ouek",
    "ouezas",
    "ouezi",
    "ouezimp",
    "ouezin",
    "ouezint",
    "ouezis",
    "ouezo",
    "ouezoc'h",
    "ouezor",
    "ouf",
    "oufe",
    "oufec'h",
    "oufed",
    "oufemp",
    "oufen",
    "oufent",
    "oufes",
    "ouie",
    "ouiec'h",
    "ouied",
    "ouiemp",
    "ouien",
    "ouient",
    "ouies",
    "ouije",
    "ouijec'h",
    "ouijed",
    "ouijemp",
    "ouijen",
    "ouijent",
    "ouijes",
    "out",
    "outañ",
    "outi",
    "outo",
    "ouzer",
    "ouzh",
    "ouzhin",
    "ouzhit",
    "ouzhoc'h",
    "ouzhomp",
    "ouzhor",
    "ouzhpenn",
    "ouzhpennik",
    "ouzoc'h",
    "ouzomp",
    "ouzon",
    "ouzont",
    "ouzout",
    "p'",
    "p:",
    "pa",
    "pad",
    "padal",
    "paf",
    "pan",
    "panevedeoc'h",
    "panevedo",
    "panevedomp",
    "panevedon",
    "panevedout",
    "panevet",
    "panevetañ",
    "paneveti",
    "pas",
    "paseet",
    "pe",
    "peadra",
    "peder",
    "pedervet",
    "pedervetvet",
    "pefe",
    "pegeit",
    "pegement",
    "pegen",
    "pegiz",
    "pegoulz",
    "pehini",
    "pelec'h",
    "pell",
    "pemod",
    "pemp",
    "pempved",
    "pemzek",
    "penaos",
    "penn",
    "peogwir",
    "peotramant",
    "pep",
    "perak",
    "perc'hennañ",
    "pergen",
    "permetiñ",
    "peseurt",
    "pet",
    "petiaoul",
    "petoare",
    "petra",
    "peur",
    "peurgetket",
    "peurheñvel",
    "peurliesañ",
    "peurvuiañ",
    "peus",
    "peustost",
    "peuz",
    "pevar",
    "pevare",
    "pevarevet",
    "pevarzek",
    "pez",
    "peze",
    "pezh",
    "pff",
    "pfft",
    "pfut",
    "picher",
    "pif",
    "pife",
    "pign",
    "pije",
    "pikol",
    "pitiaoul",
    "piv",
    "plaouf",
    "plok",
    "plouf",
    "po",
    "poa",
    "poelladus",
    "pof",
    "pok",
    "posupl",
    "pouah",
    "pourc'henn",
    "prest",
    "prestik",
    "prim",
    "prin",
    "provostapl",
    "pst",
    "pu",
    "pur",
    "r:",
    "ra",
    "rae",
    "raec'h",
    "raed",
    "raemp",
    "raen",
    "raent",
    "raes",
    "rafe",
    "rafec'h",
    "rafed",
    "rafemp",
    "rafen",
    "rafent",
    "rafes",
    "rag",
    "raimp",
    "raint",
    "raio",
    "raje",
    "rajec'h",
    "rajed",
    "rajemp",
    "rajen",
    "rajent",
    "rajes",
    "rak",
    "ral",
    "ran",
    "rankout",
    "raok",
    "razh",
    "re",
    "reas",
    "reer",
    "regennoù",
    "reiñ",
    "rejoc'h",
    "rejod",
    "rejomp",
    "rejont",
    "rejout",
    "rener",
    "rentañ",
    "reoc'h",
    "reomp",
    "reont",
    "reor",
    "reot",
    "resis",
    "ret",
    "reve",
    "rez",
    "ri",
    "rik",
    "rin",
    "ris",
    "rit",
    "rouez",
    "s:",
    "sac'h",
    "sant",
    "sav",
    "sañset",
    "se",
    "sed",
    "seitek",
    "seizh",
    "seizhvet",
    "sell",
    "sellit",
    "ser",
    "setu",
    "seul",
    "seurt",
    "siwazh",
    "skignañ",
    "skoaz",
    "skouer",
    "sort",
    "souden",
    "souvitañ",
    "soñj",
    "speriañ",
    "spririñ",
    "stad",
    "stlabezañ",
    "stop",
    "stranañ",
    "strewiñ",
    "strishaat",
    "stumm",
    "sujed",
    "surtoud",
    "t:",
    "ta",
    "taer",
    "tailh",
    "tak",
    "tal",
    "talvoudegezh",
    "tamm",
    "tanav",
    "taol",
    "te",
    "techet",
    "teir",
    "teirvet",
    "telt",
    "teltenn",
    "teus",
    "teut",
    "teuteu",
    "ti",
    "tik",
    "toa",
    "tok",
    "tost",
    "tostig",
    "toud",
    "touesk",
    "touez",
    "toull",
    "tra",
    "trantenn",
    "traoñ",
    "trawalc'h",
    "tre",
    "trede",
    "tregont",
    "tremenet",
    "tri",
    "trivet",
    "triwec'h",
    "trizek",
    "tro",
    "trugarez",
    "trumm",
    "tsoin",
    "tsouin",
    "tu",
    "tud",
    "u:",
    "ugent",
    "uhel",
    "uhelañ",
    "ul",
    "un",
    "unan",
    "unanez",
    "unanig",
    "unnek",
    "unnekvet",
    "ur",
    "urzh",
    "us",
    "v:",
    "va",
    "vale",
    "van",
    "vare",
    "vat",
    "vefe",
    "vefec'h",
    "vefed",
    "vefemp",
    "vefen",
    "vefent",
    "vefes",
    "vesk",
    "vete",
    "vez",
    "vezan",
    "vezañ",
    "veze",
    "vezec'h",
    "vezed",
    "vezemp",
    "vezen",
    "vezent",
    "vezer",
    "vezes",
    "vezez",
    "vezit",
    "vezomp",
    "vezont",
    "vi",
    "vihan",
    "vihanañ",
    "vije",
    "vijec'h",
    "vijed",
    "vijemp",
    "vijen",
    "vijent",
    "vijes",
    "viken",
    "vimp",
    "vin",
    "vint",
    "vior",
    "viot",
    "virviken",
    "viskoazh",
    "vlan",
    "vlaou",
    "vo",
    "vod",
    "voe",
    "voec'h",
    "voed",
    "voemp",
    "voen",
    "voent",
    "voes",
    "vont",
    "vostapl",
    "vrac'h",
    "vrasañ",
    "vremañ",
    "w:",
    "walc'h",
    "war",
    "warnañ",
    "warni",
    "warno",
    "warnoc'h",
    "warnomp",
    "warnon",
    "warnor",
    "warnout",
    "wazh",
    "wech",
    "wechoù",
    "well",
    "y:",
    "you",
    "youadenn",
    "youc'hadenn",
    "youc'hou",
    "z:",
    "za",
    "zan",
    "zaw",
    "zeu",
    "zi",
    "ziar",
    "zigarez",
    "ziget",
    "zindan",
    "zioc'h",
    "ziouzh",
    "zirak",
    "zivout",
    "ziwar",
    "ziwezhañ",
    "zo",
    "zoken",
    "zokenoc'h",
    "zouesk",
    "zouez",
    "zro",
    "zu"
  ];
  const bul = [
    "а",
    "автентичен",
    "аз",
    "ако",
    "ала",
    "бе",
    "без",
    "беше",
    "би",
    "бивш",
    "бивша",
    "бившо",
    "бил",
    "била",
    "били",
    "било",
    "благодаря",
    "близо",
    "бъдат",
    "бъде",
    "бяха",
    "в",
    "вас",
    "ваш",
    "ваша",
    "вероятно",
    "вече",
    "взема",
    "ви",
    "вие",
    "винаги",
    "внимава",
    "време",
    "все",
    "всеки",
    "всички",
    "всичко",
    "всяка",
    "във",
    "въпреки",
    "върху",
    "г",
    "ги",
    "главен",
    "главна",
    "главно",
    "глас",
    "го",
    "година",
    "години",
    "годишен",
    "д",
    "да",
    "дали",
    "два",
    "двама",
    "двамата",
    "две",
    "двете",
    "ден",
    "днес",
    "дни",
    "до",
    "добра",
    "добре",
    "добро",
    "добър",
    "докато",
    "докога",
    "дори",
    "досега",
    "доста",
    "друг",
    "друга",
    "други",
    "е",
    "евтин",
    "едва",
    "един",
    "една",
    "еднаква",
    "еднакви",
    "еднакъв",
    "едно",
    "екип",
    "ето",
    "живот",
    "за",
    "забавям",
    "зад",
    "заедно",
    "заради",
    "засега",
    "заспал",
    "затова",
    "защо",
    "защото",
    "и",
    "из",
    "или",
    "им",
    "има",
    "имат",
    "иска",
    "й",
    "каза",
    "как",
    "каква",
    "какво",
    "както",
    "какъв",
    "като",
    "кога",
    "когато",
    "което",
    "които",
    "кой",
    "който",
    "колко",
    "която",
    "къде",
    "където",
    "към",
    "лесен",
    "лесно",
    "ли",
    "лош",
    "м",
    "май",
    "малко",
    "ме",
    "между",
    "мек",
    "мен",
    "месец",
    "ми",
    "много",
    "мнозина",
    "мога",
    "могат",
    "може",
    "мокър",
    "моля",
    "момента",
    "му",
    "н",
    "на",
    "над",
    "назад",
    "най",
    "направи",
    "напред",
    "например",
    "нас",
    "не",
    "него",
    "нещо",
    "нея",
    "ни",
    "ние",
    "никой",
    "нито",
    "нищо",
    "но",
    "нов",
    "нова",
    "нови",
    "новина",
    "някои",
    "някой",
    "няколко",
    "няма",
    "обаче",
    "около",
    "освен",
    "особено",
    "от",
    "отгоре",
    "отново",
    "още",
    "пак",
    "по",
    "повече",
    "повечето",
    "под",
    "поне",
    "поради",
    "после",
    "почти",
    "прави",
    "пред",
    "преди",
    "през",
    "при",
    "пък",
    "първата",
    "първи",
    "първо",
    "пъти",
    "равен",
    "равна",
    "с",
    "са",
    "сам",
    "само",
    "се",
    "сега",
    "си",
    "син",
    "скоро",
    "след",
    "следващ",
    "сме",
    "смях",
    "според",
    "сред",
    "срещу",
    "сте",
    "съм",
    "със",
    "също",
    "т",
    "т.н.",
    "тази",
    "така",
    "такива",
    "такъв",
    "там",
    "твой",
    "те",
    "тези",
    "ти",
    "то",
    "това",
    "тогава",
    "този",
    "той",
    "толкова",
    "точно",
    "три",
    "трябва",
    "тук",
    "тъй",
    "тя",
    "тях",
    "у",
    "утре",
    "харесва",
    "хиляди",
    "ч",
    "часа",
    "че",
    "често",
    "чрез",
    "ще",
    "щом",
    "юмрук",
    "я",
    "як"
  ];
  const cat = [
    "a",
    "abans",
    "ací",
    "ah",
    "així",
    "això",
    "al",
    "aleshores",
    "algun",
    "alguna",
    "algunes",
    "alguns",
    "alhora",
    "allà",
    "allí",
    "allò",
    "als",
    "altra",
    "altre",
    "altres",
    "amb",
    "ambdues",
    "ambdós",
    "apa",
    "aquell",
    "aquella",
    "aquelles",
    "aquells",
    "aquest",
    "aquesta",
    "aquestes",
    "aquests",
    "aquí",
    "baix",
    "cada",
    "cadascuna",
    "cadascunes",
    "cadascuns",
    "cadascú",
    "com",
    "contra",
    "d'un",
    "d'una",
    "d'unes",
    "d'uns",
    "dalt",
    "de",
    "del",
    "dels",
    "des",
    "després",
    "dins",
    "dintre",
    "donat",
    "doncs",
    "durant",
    "e",
    "eh",
    "el",
    "els",
    "em",
    "en",
    "encara",
    "ens",
    "entre",
    "eren",
    "es",
    "esta",
    "estaven",
    "esteu",
    "està",
    "estàvem",
    "estàveu",
    "et",
    "etc",
    "ets",
    "fins",
    "fora",
    "gairebé",
    "ha",
    "han",
    "has",
    "havia",
    "he",
    "hem",
    "heu",
    "hi",
    "ho",
    "i",
    "igual",
    "iguals",
    "ja",
    "l'hi",
    "la",
    "les",
    "li",
    "li'n",
    "llavors",
    "m'he",
    "ma",
    "mal",
    "malgrat",
    "mateix",
    "mateixa",
    "mateixes",
    "mateixos",
    "me",
    "mentre",
    "meu",
    "meus",
    "meva",
    "meves",
    "molt",
    "molta",
    "moltes",
    "molts",
    "mon",
    "mons",
    "més",
    "n'he",
    "n'hi",
    "ne",
    "ni",
    "no",
    "nogensmenys",
    "només",
    "nosaltres",
    "nostra",
    "nostre",
    "nostres",
    "o",
    "oh",
    "oi",
    "on",
    "pas",
    "pel",
    "pels",
    "per",
    "perquè",
    "però",
    "poc",
    "poca",
    "pocs",
    "poques",
    "potser",
    "propi",
    "qual",
    "quals",
    "quan",
    "quant",
    "que",
    "quelcom",
    "qui",
    "quin",
    "quina",
    "quines",
    "quins",
    "què",
    "s'ha",
    "s'han",
    "sa",
    "semblant",
    "semblants",
    "ses",
    "seu",
    "seus",
    "seva",
    "seves",
    "si",
    "sobre",
    "sobretot",
    "solament",
    "sols",
    "son",
    "sons",
    "sota",
    "sou",
    "sóc",
    "són",
    "t'ha",
    "t'han",
    "t'he",
    "ta",
    "tal",
    "també",
    "tampoc",
    "tan",
    "tant",
    "tanta",
    "tantes",
    "teu",
    "teus",
    "teva",
    "teves",
    "ton",
    "tons",
    "tot",
    "tota",
    "totes",
    "tots",
    "un",
    "una",
    "unes",
    "uns",
    "us",
    "va",
    "vaig",
    "vam",
    "van",
    "vas",
    "veu",
    "vosaltres",
    "vostra",
    "vostre",
    "vostres",
    "érem",
    "éreu",
    "és"
  ];
  const zho = [
    "的",
    "地",
    "得",
    "和",
    "跟",
    "与",
    "及",
    "向",
    "并",
    "等",
    "更",
    "已",
    "含",
    "做",
    "我",
    "你",
    "他",
    "她",
    "们",
    "某",
    "该",
    "各",
    "每",
    "这",
    "那",
    "哪",
    "什",
    "么",
    "谁",
    "年",
    "月",
    "日",
    "时",
    "分",
    "秒",
    "几",
    "多",
    "来",
    "在",
    "就",
    "又",
    "很",
    "呢",
    "吧",
    "吗",
    "了",
    "嘛",
    "哇",
    "儿",
    "哼",
    "啊",
    "嗯",
    "是",
    "着",
    "都",
    "不",
    "说",
    "也",
    "看",
    "把",
    "还",
    "个",
    "有",
    "小",
    "到",
    "一",
    "为",
    "中",
    "于",
    "对",
    "会",
    "之",
    "第",
    "此",
    "或",
    "共",
    "按",
    "请"
  ];
  const hrv = [
    "a",
    "ako",
    "ali",
    "bi",
    "bih",
    "bila",
    "bili",
    "bilo",
    "bio",
    "bismo",
    "biste",
    "biti",
    "bumo",
    "da",
    "do",
    "duž",
    "ga",
    "hoće",
    "hoćemo",
    "hoćete",
    "hoćeš",
    "hoću",
    "i",
    "iako",
    "ih",
    "ili",
    "iz",
    "ja",
    "je",
    "jedna",
    "jedne",
    "jedno",
    "jer",
    "jesam",
    "jesi",
    "jesmo",
    "jest",
    "jeste",
    "jesu",
    "jim",
    "joj",
    "još",
    "ju",
    "kada",
    "kako",
    "kao",
    "koja",
    "koje",
    "koji",
    "kojima",
    "koju",
    "kroz",
    "li",
    "me",
    "mene",
    "meni",
    "mi",
    "mimo",
    "moj",
    "moja",
    "moje",
    "mu",
    "na",
    "nad",
    "nakon",
    "nam",
    "nama",
    "nas",
    "naš",
    "naša",
    "naše",
    "našeg",
    "ne",
    "nego",
    "neka",
    "neki",
    "nekog",
    "neku",
    "nema",
    "netko",
    "neće",
    "nećemo",
    "nećete",
    "nećeš",
    "neću",
    "nešto",
    "ni",
    "nije",
    "nikoga",
    "nikoje",
    "nikoju",
    "nisam",
    "nisi",
    "nismo",
    "niste",
    "nisu",
    "njega",
    "njegov",
    "njegova",
    "njegovo",
    "njemu",
    "njezin",
    "njezina",
    "njezino",
    "njih",
    "njihov",
    "njihova",
    "njihovo",
    "njim",
    "njima",
    "njoj",
    "nju",
    "no",
    "o",
    "od",
    "odmah",
    "on",
    "ona",
    "oni",
    "ono",
    "ova",
    "pa",
    "pak",
    "po",
    "pod",
    "pored",
    "prije",
    "s",
    "sa",
    "sam",
    "samo",
    "se",
    "sebe",
    "sebi",
    "si",
    "smo",
    "ste",
    "su",
    "sve",
    "svi",
    "svog",
    "svoj",
    "svoja",
    "svoje",
    "svom",
    "ta",
    "tada",
    "taj",
    "tako",
    "te",
    "tebe",
    "tebi",
    "ti",
    "to",
    "toj",
    "tome",
    "tu",
    "tvoj",
    "tvoja",
    "tvoje",
    "u",
    "uz",
    "vam",
    "vama",
    "vas",
    "vaš",
    "vaša",
    "vaše",
    "već",
    "vi",
    "vrlo",
    "za",
    "zar",
    "će",
    "ćemo",
    "ćete",
    "ćeš",
    "ću",
    "što"
  ];
  const ces = [
    "a",
    "aby",
    "ahoj",
    "aj",
    "ale",
    "anebo",
    "ani",
    "ano",
    "asi",
    "aspoň",
    "atd",
    "atp",
    "ačkoli",
    "až",
    "bez",
    "beze",
    "blízko",
    "bohužel",
    "brzo",
    "bude",
    "budem",
    "budeme",
    "budete",
    "budeš",
    "budou",
    "budu",
    "by",
    "byl",
    "byla",
    "byli",
    "bylo",
    "byly",
    "bys",
    "být",
    "během",
    "chce",
    "chceme",
    "chcete",
    "chceš",
    "chci",
    "chtít",
    "chtějí",
    "chut'",
    "chuti",
    "co",
    "což",
    "cz",
    "daleko",
    "další",
    "den",
    "deset",
    "devatenáct",
    "devět",
    "dnes",
    "do",
    "dobrý",
    "docela",
    "dva",
    "dvacet",
    "dvanáct",
    "dvě",
    "dál",
    "dále",
    "děkovat",
    "děkujeme",
    "děkuji",
    "ho",
    "hodně",
    "i",
    "jak",
    "jakmile",
    "jako",
    "jakož",
    "jde",
    "je",
    "jeden",
    "jedenáct",
    "jedna",
    "jedno",
    "jednou",
    "jedou",
    "jeho",
    "jehož",
    "jej",
    "jejich",
    "její",
    "jelikož",
    "jemu",
    "jen",
    "jenom",
    "jestli",
    "jestliže",
    "ještě",
    "jež",
    "ji",
    "jich",
    "jimi",
    "jinak",
    "jiné",
    "již",
    "jsem",
    "jseš",
    "jsi",
    "jsme",
    "jsou",
    "jste",
    "já",
    "jí",
    "jím",
    "jíž",
    "k",
    "kam",
    "kde",
    "kdo",
    "kdy",
    "když",
    "ke",
    "kolik",
    "kromě",
    "kterou",
    "která",
    "které",
    "který",
    "kteří",
    "kvůli",
    "mají",
    "mezi",
    "mi",
    "mne",
    "mnou",
    "mně",
    "moc",
    "mohl",
    "mohou",
    "moje",
    "moji",
    "možná",
    "musí",
    "my",
    "má",
    "málo",
    "mám",
    "máme",
    "máte",
    "máš",
    "mé",
    "mí",
    "mít",
    "mě",
    "můj",
    "může",
    "na",
    "nad",
    "nade",
    "napište",
    "naproti",
    "načež",
    "naše",
    "naši",
    "ne",
    "nebo",
    "nebyl",
    "nebyla",
    "nebyli",
    "nebyly",
    "nedělají",
    "nedělá",
    "nedělám",
    "neděláme",
    "neděláte",
    "neděláš",
    "neg",
    "nejsi",
    "nejsou",
    "nemají",
    "nemáme",
    "nemáte",
    "neměl",
    "není",
    "nestačí",
    "nevadí",
    "než",
    "nic",
    "nich",
    "nimi",
    "nové",
    "nový",
    "nula",
    "nám",
    "námi",
    "nás",
    "náš",
    "ním",
    "ně",
    "něco",
    "nějak",
    "někde",
    "někdo",
    "němu",
    "němuž",
    "o",
    "od",
    "ode",
    "on",
    "ona",
    "oni",
    "ono",
    "ony",
    "osm",
    "osmnáct",
    "pak",
    "patnáct",
    "po",
    "pod",
    "podle",
    "pokud",
    "potom",
    "pouze",
    "pozdě",
    "pořád",
    "pravé",
    "pro",
    "prostě",
    "prosím",
    "proti",
    "proto",
    "protože",
    "proč",
    "první",
    "pta",
    "pět",
    "před",
    "přes",
    "přese",
    "při",
    "přičemž",
    "re",
    "rovně",
    "s",
    "se",
    "sedm",
    "sedmnáct",
    "si",
    "skoro",
    "smí",
    "smějí",
    "snad",
    "spolu",
    "sta",
    "sto",
    "strana",
    "sté",
    "své",
    "svých",
    "svým",
    "svými",
    "ta",
    "tady",
    "tak",
    "takhle",
    "taky",
    "také",
    "takže",
    "tam",
    "tamhle",
    "tamhleto",
    "tamto",
    "tato",
    "tebe",
    "tebou",
    "ted'",
    "tedy",
    "ten",
    "tento",
    "teto",
    "ti",
    "tipy",
    "tisíc",
    "tisíce",
    "to",
    "tobě",
    "tohle",
    "toho",
    "tohoto",
    "tom",
    "tomto",
    "tomu",
    "tomuto",
    "toto",
    "trošku",
    "tu",
    "tuto",
    "tvoje",
    "tvá",
    "tvé",
    "tvůj",
    "ty",
    "tyto",
    "téma",
    "tím",
    "tímto",
    "tě",
    "těm",
    "těmu",
    "třeba",
    "tři",
    "třináct",
    "u",
    "určitě",
    "už",
    "v",
    "vaše",
    "vaši",
    "ve",
    "vedle",
    "večer",
    "vlastně",
    "vy",
    "vám",
    "vámi",
    "vás",
    "váš",
    "více",
    "však",
    "všechno",
    "všichni",
    "vůbec",
    "vždy",
    "z",
    "za",
    "zatímco",
    "zač",
    "zda",
    "zde",
    "ze",
    "zprávy",
    "zpět",
    "čau",
    "či",
    "článku",
    "články",
    "čtrnáct",
    "čtyři",
    "šest",
    "šestnáct",
    "že"
  ];
  const dan = [
    "ad",
    "af",
    "aldrig",
    "alle",
    "alt",
    "anden",
    "andet",
    "andre",
    "at",
    "bare",
    "begge",
    "blev",
    "blive",
    "bliver",
    "da",
    "de",
    "dem",
    "den",
    "denne",
    "der",
    "deres",
    "det",
    "dette",
    "dig",
    "din",
    "dine",
    "disse",
    "dit",
    "dog",
    "du",
    "efter",
    "ej",
    "eller",
    "en",
    "end",
    "ene",
    "eneste",
    "enhver",
    "er",
    "et",
    "far",
    "fem",
    "fik",
    "fire",
    "flere",
    "fleste",
    "for",
    "fordi",
    "forrige",
    "fra",
    "få",
    "får",
    "før",
    "god",
    "godt",
    "ham",
    "han",
    "hans",
    "har",
    "havde",
    "have",
    "hej",
    "helt",
    "hende",
    "hendes",
    "her",
    "hos",
    "hun",
    "hvad",
    "hvem",
    "hver",
    "hvilken",
    "hvis",
    "hvor",
    "hvordan",
    "hvorfor",
    "hvornår",
    "i",
    "ikke",
    "ind",
    "ingen",
    "intet",
    "ja",
    "jeg",
    "jer",
    "jeres",
    "jo",
    "kan",
    "kom",
    "komme",
    "kommer",
    "kun",
    "kunne",
    "lad",
    "lav",
    "lidt",
    "lige",
    "lille",
    "man",
    "mand",
    "mange",
    "med",
    "meget",
    "men",
    "mens",
    "mere",
    "mig",
    "min",
    "mine",
    "mit",
    "mod",
    "må",
    "ned",
    "nej",
    "ni",
    "nogen",
    "noget",
    "nogle",
    "nu",
    "ny",
    "nyt",
    "når",
    "nær",
    "næste",
    "næsten",
    "og",
    "også",
    "okay",
    "om",
    "op",
    "os",
    "otte",
    "over",
    "på",
    "se",
    "seks",
    "selv",
    "ser",
    "ses",
    "sig",
    "sige",
    "sin",
    "sine",
    "sit",
    "skal",
    "skulle",
    "som",
    "stor",
    "store",
    "syv",
    "så",
    "sådan",
    "tag",
    "tage",
    "thi",
    "ti",
    "til",
    "to",
    "tre",
    "ud",
    "under",
    "var",
    "ved",
    "vi",
    "vil",
    "ville",
    "vor",
    "vores",
    "være",
    "været"
  ];
  const nld = [
    "aan",
    "af",
    "al",
    "alles",
    "als",
    "altijd",
    "andere",
    "ben",
    "bij",
    "daar",
    "dan",
    "dat",
    "de",
    "der",
    "deze",
    "die",
    "dit",
    "doch",
    "doen",
    "door",
    "dus",
    "een",
    "eens",
    "en",
    "er",
    "ge",
    "geen",
    "geweest",
    "haar",
    "had",
    "heb",
    "hebben",
    "heeft",
    "hem",
    "het",
    "hier",
    "hij",
    "hoe",
    "hun",
    "iemand",
    "iets",
    "ik",
    "in",
    "is",
    "ja",
    "je ",
    "kan",
    "kon",
    "kunnen",
    "maar",
    "me",
    "meer",
    "men",
    "met",
    "mij",
    "mijn",
    "moet",
    "na",
    "naar",
    "niet",
    "niets",
    "nog",
    "nu",
    "of",
    "om",
    "omdat",
    "ons",
    "ook",
    "op",
    "over",
    "reeds",
    "te",
    "tegen",
    "toch",
    "toen",
    "tot",
    "u",
    "uit",
    "uw",
    "van",
    "veel",
    "voor",
    "want",
    "waren",
    "was",
    "wat",
    "we",
    "wel",
    "werd",
    "wezen",
    "wie",
    "wij",
    "wil",
    "worden",
    "zal",
    "ze",
    "zei",
    "zelf",
    "zich",
    "zij",
    "zijn",
    "zo",
    "zonder",
    "zou"
  ];
  const eng = [
    "about",
    "after",
    "all",
    "also",
    "am",
    "an",
    "and",
    "another",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "between",
    "both",
    "but",
    "by",
    "came",
    "can",
    "come",
    "could",
    "did",
    "do",
    "each",
    "for",
    "from",
    "get",
    "got",
    "has",
    "had",
    "he",
    "have",
    "her",
    "here",
    "him",
    "himself",
    "his",
    "how",
    "if",
    "in",
    "into",
    "is",
    "it",
    "like",
    "make",
    "many",
    "me",
    "might",
    "more",
    "most",
    "much",
    "must",
    "my",
    "never",
    "now",
    "of",
    "on",
    "only",
    "or",
    "other",
    "our",
    "out",
    "over",
    "said",
    "same",
    "should",
    "since",
    "some",
    "still",
    "such",
    "take",
    "than",
    "that",
    "the",
    "their",
    "them",
    "then",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "up",
    "very",
    "was",
    "way",
    "we",
    "well",
    "were",
    "what",
    "where",
    "which",
    "while",
    "who",
    "with",
    "would",
    "you",
    "your",
    "a",
    "i"
  ];
  const epo = [
    "adiaŭ",
    "ajn",
    "al",
    "ankoraŭ",
    "antaŭ",
    "aŭ",
    "bonan",
    "bonvole",
    "bonvolu",
    "bv",
    "ci",
    "cia",
    "cian",
    "cin",
    "d-ro",
    "da",
    "de",
    "dek",
    "deka",
    "do",
    "doktor'",
    "doktoro",
    "du",
    "dua",
    "dum",
    "eble",
    "ekz",
    "ekzemple",
    "en",
    "estas",
    "estis",
    "estos",
    "estu",
    "estus",
    "eĉ",
    "f-no",
    "feliĉan",
    "for",
    "fraŭlino",
    "ha",
    "havas",
    "havis",
    "havos",
    "havu",
    "havus",
    "he",
    "ho",
    "hu",
    "ili",
    "ilia",
    "ilian",
    "ilin",
    "inter",
    "io",
    "ion",
    "iu",
    "iujn",
    "iun",
    "ja",
    "jam",
    "je",
    "jes",
    "k",
    "kaj",
    "ke",
    "kio",
    "kion",
    "kiu",
    "kiujn",
    "kiun",
    "kvankam",
    "kvar",
    "kvara",
    "kvazaŭ",
    "kvin",
    "kvina",
    "la",
    "li",
    "lia",
    "lian",
    "lin",
    "malantaŭ",
    "male",
    "malgraŭ",
    "mem",
    "mi",
    "mia",
    "mian",
    "min",
    "minus",
    "naŭ",
    "naŭa",
    "ne",
    "nek",
    "nenio",
    "nenion",
    "neniu",
    "neniun",
    "nepre",
    "ni",
    "nia",
    "nian",
    "nin",
    "nu",
    "nun",
    "nur",
    "ok",
    "oka",
    "oni",
    "onia",
    "onian",
    "onin",
    "plej",
    "pli",
    "plu",
    "plus",
    "por",
    "post",
    "preter",
    "s-no",
    "s-ro",
    "se",
    "sed",
    "sep",
    "sepa",
    "ses",
    "sesa",
    "si",
    "sia",
    "sian",
    "sin",
    "sinjor'",
    "sinjorino",
    "sinjoro",
    "sub",
    "super",
    "supren",
    "sur",
    "tamen",
    "tio",
    "tion",
    "tiu",
    "tiujn",
    "tiun",
    "tra",
    "tri",
    "tria",
    "tuj",
    "tute",
    "unu",
    "unua",
    "ve",
    "verŝajne",
    "vi",
    "via",
    "vian",
    "vin",
    "ĉi",
    "ĉio",
    "ĉion",
    "ĉiu",
    "ĉiujn",
    "ĉiun",
    "ĉu",
    "ĝi",
    "ĝia",
    "ĝian",
    "ĝin",
    "ĝis",
    "ĵus",
    "ŝi",
    "ŝia",
    "ŝin"
  ];
  const est = [
    "aga",
    "ei",
    "et",
    "ja",
    "jah",
    "kas",
    "kui",
    "kõik",
    "ma",
    "me",
    "mida",
    "midagi",
    "mind",
    "minu",
    "mis",
    "mu",
    "mul",
    "mulle",
    "nad",
    "nii",
    "oled",
    "olen",
    "oli",
    "oma",
    "on",
    "pole",
    "sa",
    "seda",
    "see",
    "selle",
    "siin",
    "siis",
    "ta",
    "te",
    "ära"
  ];
  const fin = [
    "ja",
    "on",
    "oli",
    "hän",
    "vuonna",
    "myös",
    "joka",
    "se",
    "sekä",
    "sen",
    "mutta",
    "ei",
    "ovat",
    "hänen",
    "n",
    "kanssa",
    "vuoden",
    "jälkeen",
    "että",
    "s",
    "tai",
    "jonka",
    "jossa",
    "mukaan",
    "kun",
    "muun",
    "muassa",
    "hänet",
    "olivat",
    "kuitenkin",
    "noin",
    "vuosina",
    "aikana",
    "lisäksi",
    "kaksi",
    "kuin",
    "ollut",
    "the",
    "myöhemmin",
    "eli",
    "vain",
    "teki",
    "mm",
    "jotka",
    "ennen",
    "ensimmäinen",
    "a",
    "9",
    "jo",
    "kuten",
    "yksi",
    "ensimmäisen",
    "vastaan",
    "tämän",
    "vuodesta",
    "sitä",
    "voi",
    "luvun",
    "luvulla",
    "of",
    "ole",
    "kauden",
    "osa",
    "esimerkiksi",
    "jolloin",
    "yli",
    "de",
    "kaudella",
    "eri",
    "sillä",
    "kolme",
    "he",
    "vuotta"
  ];
  const fra = [
    "être",
    "avoir",
    "faire",
    "a",
    "au",
    "aux",
    "avec",
    "ce",
    "ces",
    "dans",
    "de",
    "des",
    "du",
    "elle",
    "en",
    "et",
    "eux",
    "il",
    "je",
    "la",
    "le",
    "leur",
    "lui",
    "ma",
    "mais",
    "me",
    "même",
    "mes",
    "moi",
    "mon",
    "ne",
    "nos",
    "notre",
    "nous",
    "on",
    "ou",
    "où",
    "par",
    "pas",
    "pour",
    "qu",
    "que",
    "qui",
    "sa",
    "se",
    "ses",
    "son",
    "sur",
    "ta",
    "te",
    "tes",
    "toi",
    "ton",
    "tu",
    "un",
    "une",
    "vos",
    "votre",
    "vous",
    "c",
    "d",
    "j",
    "l",
    "à",
    "m",
    "n",
    "s",
    "t",
    "y",
    "été",
    "étée",
    "étées",
    "étés",
    "étant",
    "suis",
    "es",
    "est",
    "sommes",
    "êtes",
    "sont",
    "serai",
    "seras",
    "sera",
    "serons",
    "serez",
    "seront",
    "serais",
    "serait",
    "serions",
    "seriez",
    "seraient",
    "étais",
    "était",
    "étions",
    "étiez",
    "étaient",
    "fus",
    "fut",
    "fûmes",
    "fûtes",
    "furent",
    "sois",
    "soit",
    "soyons",
    "soyez",
    "soient",
    "fusse",
    "fusses",
    "fût",
    "fussions",
    "fussiez",
    "fussent",
    "ayant",
    "eu",
    "eue",
    "eues",
    "eus",
    "ai",
    "as",
    "avons",
    "avez",
    "ont",
    "aurai",
    "auras",
    "aura",
    "aurons",
    "aurez",
    "auront",
    "aurais",
    "aurait",
    "aurions",
    "auriez",
    "auraient",
    "avais",
    "avait",
    "avions",
    "aviez",
    "avaient",
    "eut",
    "eûmes",
    "eûtes",
    "eurent",
    "aie",
    "aies",
    "ait",
    "ayons",
    "ayez",
    "aient",
    "eusse",
    "eusses",
    "eût",
    "eussions",
    "eussiez",
    "eussent",
    "ceci",
    "cela",
    "cet",
    "cette",
    "ici",
    "ils",
    "les",
    "leurs",
    "quel",
    "quels",
    "quelle",
    "quelles",
    "sans",
    "soi"
  ];
  const glg = [
    "a",
    "alí",
    "ao",
    "aos",
    "aquel",
    "aquela",
    "aquelas",
    "aqueles",
    "aquilo",
    "aquí",
    "as",
    "así",
    "aínda",
    "ben",
    "cando",
    "che",
    "co",
    "coa",
    "coas",
    "comigo",
    "con",
    "connosco",
    "contigo",
    "convosco",
    "cos",
    "cun",
    "cunha",
    "cunhas",
    "cuns",
    "da",
    "dalgunha",
    "dalgunhas",
    "dalgún",
    "dalgúns",
    "das",
    "de",
    "del",
    "dela",
    "delas",
    "deles",
    "desde",
    "deste",
    "do",
    "dos",
    "dun",
    "dunha",
    "dunhas",
    "duns",
    "e",
    "el",
    "ela",
    "elas",
    "eles",
    "en",
    "era",
    "eran",
    "esa",
    "esas",
    "ese",
    "eses",
    "esta",
    "estaba",
    "estar",
    "este",
    "estes",
    "estiven",
    "estou",
    "está",
    "están",
    "eu",
    "facer",
    "foi",
    "foron",
    "fun",
    "había",
    "hai",
    "iso",
    "isto",
    "la",
    "las",
    "lle",
    "lles",
    "lo",
    "los",
    "mais",
    "me",
    "meu",
    "meus",
    "min",
    "miña",
    "miñas",
    "moi",
    "na",
    "nas",
    "neste",
    "nin",
    "no",
    "non",
    "nos",
    "nosa",
    "nosas",
    "noso",
    "nosos",
    "nun",
    "nunha",
    "nunhas",
    "nuns",
    "nós",
    "o",
    "os",
    "ou",
    "para",
    "pero",
    "pode",
    "pois",
    "pola",
    "polas",
    "polo",
    "polos",
    "por",
    "que",
    "se",
    "senón",
    "ser",
    "seu",
    "seus",
    "sexa",
    "sido",
    "sobre",
    "súa",
    "súas",
    "tamén",
    "tan",
    "te",
    "ten",
    "ter",
    "teu",
    "teus",
    "teñen",
    "teño",
    "ti",
    "tido",
    "tiven",
    "tiña",
    "túa",
    "túas",
    "un",
    "unha",
    "unhas",
    "uns",
    "vos",
    "vosa",
    "vosas",
    "voso",
    "vosos",
    "vós",
    "á",
    "é",
    "ó",
    "ós"
  ];
  const deu = [
    "a",
    "ab",
    "aber",
    "ach",
    "acht",
    "achte",
    "achten",
    "achter",
    "achtes",
    "ag",
    "alle",
    "allein",
    "allem",
    "allen",
    "aller",
    "allerdings",
    "alles",
    "allgemeinen",
    "als",
    "also",
    "am",
    "an",
    "ander",
    "andere",
    "anderem",
    "anderen",
    "anderer",
    "anderes",
    "anderm",
    "andern",
    "anderr",
    "anders",
    "au",
    "auch",
    "auf",
    "aus",
    "ausser",
    "ausserdem",
    "außer",
    "außerdem",
    "b",
    "bald",
    "bei",
    "beide",
    "beiden",
    "beim",
    "beispiel",
    "bekannt",
    "bereits",
    "besonders",
    "besser",
    "besten",
    "bin",
    "bis",
    "bisher",
    "bist",
    "c",
    "d",
    "d.h",
    "da",
    "dabei",
    "dadurch",
    "dafür",
    "dagegen",
    "daher",
    "dahin",
    "dahinter",
    "damals",
    "damit",
    "danach",
    "daneben",
    "dank",
    "dann",
    "daran",
    "darauf",
    "daraus",
    "darf",
    "darfst",
    "darin",
    "darum",
    "darunter",
    "darüber",
    "das",
    "dasein",
    "daselbst",
    "dass",
    "dasselbe",
    "davon",
    "davor",
    "dazu",
    "dazwischen",
    "daß",
    "dein",
    "deine",
    "deinem",
    "deinen",
    "deiner",
    "deines",
    "dem",
    "dementsprechend",
    "demgegenüber",
    "demgemäss",
    "demgemäß",
    "demselben",
    "demzufolge",
    "den",
    "denen",
    "denn",
    "denselben",
    "der",
    "deren",
    "derer",
    "derjenige",
    "derjenigen",
    "dermassen",
    "dermaßen",
    "derselbe",
    "derselben",
    "des",
    "deshalb",
    "desselben",
    "dessen",
    "deswegen",
    "dich",
    "die",
    "diejenige",
    "diejenigen",
    "dies",
    "diese",
    "dieselbe",
    "dieselben",
    "diesem",
    "diesen",
    "dieser",
    "dieses",
    "dir",
    "doch",
    "dort",
    "drei",
    "drin",
    "dritte",
    "dritten",
    "dritter",
    "drittes",
    "du",
    "durch",
    "durchaus",
    "durfte",
    "durften",
    "dürfen",
    "dürft",
    "e",
    "eben",
    "ebenso",
    "ehrlich",
    "ei",
    "ei, ",
    "eigen",
    "eigene",
    "eigenen",
    "eigener",
    "eigenes",
    "ein",
    "einander",
    "eine",
    "einem",
    "einen",
    "einer",
    "eines",
    "einig",
    "einige",
    "einigem",
    "einigen",
    "einiger",
    "einiges",
    "einmal",
    "eins",
    "elf",
    "en",
    "ende",
    "endlich",
    "entweder",
    "er",
    "ernst",
    "erst",
    "erste",
    "ersten",
    "erster",
    "erstes",
    "es",
    "etwa",
    "etwas",
    "euch",
    "euer",
    "eure",
    "eurem",
    "euren",
    "eurer",
    "eures",
    "f",
    "folgende",
    "früher",
    "fünf",
    "fünfte",
    "fünften",
    "fünfter",
    "fünftes",
    "für",
    "g",
    "gab",
    "ganz",
    "ganze",
    "ganzen",
    "ganzer",
    "ganzes",
    "gar",
    "gedurft",
    "gegen",
    "gegenüber",
    "gehabt",
    "gehen",
    "geht",
    "gekannt",
    "gekonnt",
    "gemacht",
    "gemocht",
    "gemusst",
    "genug",
    "gerade",
    "gern",
    "gesagt",
    "geschweige",
    "gewesen",
    "gewollt",
    "geworden",
    "gibt",
    "ging",
    "gleich",
    "gott",
    "gross",
    "grosse",
    "grossen",
    "grosser",
    "grosses",
    "groß",
    "große",
    "großen",
    "großer",
    "großes",
    "gut",
    "gute",
    "guter",
    "gutes",
    "h",
    "hab",
    "habe",
    "haben",
    "habt",
    "hast",
    "hat",
    "hatte",
    "hatten",
    "hattest",
    "hattet",
    "heisst",
    "her",
    "heute",
    "hier",
    "hin",
    "hinter",
    "hoch",
    "hätte",
    "hätten",
    "i",
    "ich",
    "ihm",
    "ihn",
    "ihnen",
    "ihr",
    "ihre",
    "ihrem",
    "ihren",
    "ihrer",
    "ihres",
    "im",
    "immer",
    "in",
    "indem",
    "infolgedessen",
    "ins",
    "irgend",
    "ist",
    "j",
    "ja",
    "jahr",
    "jahre",
    "jahren",
    "je",
    "jede",
    "jedem",
    "jeden",
    "jeder",
    "jedermann",
    "jedermanns",
    "jedes",
    "jedoch",
    "jemand",
    "jemandem",
    "jemanden",
    "jene",
    "jenem",
    "jenen",
    "jener",
    "jenes",
    "jetzt",
    "k",
    "kam",
    "kann",
    "kannst",
    "kaum",
    "kein",
    "keine",
    "keinem",
    "keinen",
    "keiner",
    "keines",
    "kleine",
    "kleinen",
    "kleiner",
    "kleines",
    "kommen",
    "kommt",
    "konnte",
    "konnten",
    "kurz",
    "können",
    "könnt",
    "könnte",
    "l",
    "lang",
    "lange",
    "leicht",
    "leide",
    "lieber",
    "los",
    "m",
    "machen",
    "macht",
    "machte",
    "mag",
    "magst",
    "mahn",
    "mal",
    "man",
    "manche",
    "manchem",
    "manchen",
    "mancher",
    "manches",
    "mann",
    "mehr",
    "mein",
    "meine",
    "meinem",
    "meinen",
    "meiner",
    "meines",
    "mensch",
    "menschen",
    "mich",
    "mir",
    "mit",
    "mittel",
    "mochte",
    "mochten",
    "morgen",
    "muss",
    "musst",
    "musste",
    "mussten",
    "muß",
    "mußt",
    "möchte",
    "mögen",
    "möglich",
    "mögt",
    "müssen",
    "müsst",
    "müßt",
    "n",
    "na",
    "nach",
    "nachdem",
    "nahm",
    "natürlich",
    "neben",
    "nein",
    "neue",
    "neuen",
    "neun",
    "neunte",
    "neunten",
    "neunter",
    "neuntes",
    "nicht",
    "nichts",
    "nie",
    "niemand",
    "niemandem",
    "niemanden",
    "noch",
    "nun",
    "nur",
    "o",
    "ob",
    "oben",
    "oder",
    "offen",
    "oft",
    "ohne",
    "ordnung",
    "p",
    "q",
    "r",
    "recht",
    "rechte",
    "rechten",
    "rechter",
    "rechtes",
    "richtig",
    "rund",
    "s",
    "sa",
    "sache",
    "sagt",
    "sagte",
    "sah",
    "satt",
    "schlecht",
    "schluss",
    "schon",
    "sechs",
    "sechste",
    "sechsten",
    "sechster",
    "sechstes",
    "sehr",
    "sei",
    "seid",
    "seien",
    "sein",
    "seine",
    "seinem",
    "seinen",
    "seiner",
    "seines",
    "seit",
    "seitdem",
    "selbst",
    "sich",
    "sie",
    "sieben",
    "siebente",
    "siebenten",
    "siebenter",
    "siebentes",
    "sind",
    "so",
    "solang",
    "solche",
    "solchem",
    "solchen",
    "solcher",
    "solches",
    "soll",
    "sollen",
    "sollst",
    "sollt",
    "sollte",
    "sollten",
    "sondern",
    "sonst",
    "soweit",
    "sowie",
    "später",
    "startseite",
    "statt",
    "steht",
    "suche",
    "t",
    "tag",
    "tage",
    "tagen",
    "tat",
    "teil",
    "tel",
    "tritt",
    "trotzdem",
    "tun",
    "u",
    "uhr",
    "um",
    "und",
    "und?",
    "uns",
    "unse",
    "unsem",
    "unsen",
    "unser",
    "unsere",
    "unserer",
    "unses",
    "unter",
    "v",
    "vergangenen",
    "viel",
    "viele",
    "vielem",
    "vielen",
    "vielleicht",
    "vier",
    "vierte",
    "vierten",
    "vierter",
    "viertes",
    "vom",
    "von",
    "vor",
    "w",
    "wahr?",
    "wann",
    "war",
    "waren",
    "warst",
    "wart",
    "warum",
    "was",
    "weg",
    "wegen",
    "weil",
    "weit",
    "weiter",
    "weitere",
    "weiteren",
    "weiteres",
    "welche",
    "welchem",
    "welchen",
    "welcher",
    "welches",
    "wem",
    "wen",
    "wenig",
    "wenige",
    "weniger",
    "weniges",
    "wenigstens",
    "wenn",
    "wer",
    "werde",
    "werden",
    "werdet",
    "weshalb",
    "wessen",
    "wie",
    "wieder",
    "wieso",
    "will",
    "willst",
    "wir",
    "wird",
    "wirklich",
    "wirst",
    "wissen",
    "wo",
    "woher",
    "wohin",
    "wohl",
    "wollen",
    "wollt",
    "wollte",
    "wollten",
    "worden",
    "wurde",
    "wurden",
    "während",
    "währenddem",
    "währenddessen",
    "wäre",
    "würde",
    "würden",
    "x",
    "y",
    "z",
    "z.b",
    "zehn",
    "zehnte",
    "zehnten",
    "zehnter",
    "zehntes",
    "zeit",
    "zu",
    "zuerst",
    "zugleich",
    "zum",
    "zunächst",
    "zur",
    "zurück",
    "zusammen",
    "zwanzig",
    "zwar",
    "zwei",
    "zweite",
    "zweiten",
    "zweiter",
    "zweites",
    "zwischen",
    "zwölf",
    "über",
    "überhaupt",
    "übrigens"
  ];
  const ell = [
    "αλλα",
    "αν",
    "αντι",
    "απο",
    "αυτα",
    "αυτεσ",
    "αυτη",
    "αυτο",
    "αυτοι",
    "αυτοσ",
    "αυτουσ",
    "αυτων",
    "για",
    "δε",
    "δεν",
    "εαν",
    "ειμαι",
    "ειμαστε",
    "ειναι",
    "εισαι",
    "ειστε",
    "εκεινα",
    "εκεινεσ",
    "εκεινη",
    "εκεινο",
    "εκεινοι",
    "εκεινοσ",
    "εκεινουσ",
    "εκεινων",
    "ενω",
    "επι",
    "η",
    "θα",
    "ισωσ",
    "κ",
    "και",
    "κατα",
    "κι",
    "μα",
    "με",
    "μετα",
    "μη",
    "μην",
    "να",
    "ο",
    "οι",
    "ομωσ",
    "οπωσ",
    "οσο",
    "οτι",
    "παρα",
    "ποια",
    "ποιεσ",
    "ποιο",
    "ποιοι",
    "ποιοσ",
    "ποιουσ",
    "ποιων",
    "που",
    "προσ",
    "πωσ",
    "σε",
    "στη",
    "στην",
    "στο",
    "στον",
    "τα",
    "την",
    "τησ",
    "το",
    "τον",
    "τοτε",
    "του",
    "των",
    "ωσ"
  ];
  const guj = [
    "અંગે",
    "અંદર",
    "અથવા",
    "અને",
    "અમને",
    "અમારું",
    "અમે",
    "અહીં",
    "આ",
    "આગળ",
    "આથી",
    "આનું",
    "આને",
    "આપણને",
    "આપણું",
    "આપણે",
    "આપી",
    "આર",
    "આવી",
    "આવે",
    "ઉપર",
    "ઉભા",
    "ઊંચે",
    "ઊભું",
    "એ",
    "એક",
    "એન",
    "એના",
    "એનાં",
    "એની",
    "એનું",
    "એને",
    "એનો",
    "એમ",
    "એવા",
    "એવાં",
    "એવી",
    "એવું",
    "એવો",
    "ઓછું",
    "કંઈક",
    "કઈ",
    "કયું",
    "કયો",
    "કરતાં",
    "કરવું",
    "કરી",
    "કરીએ",
    "કરું",
    "કરે",
    "કરેલું",
    "કર્યા",
    "કર્યાં",
    "કર્યું",
    "કર્યો",
    "કાંઈ",
    "કે",
    "કેટલું",
    "કેમ",
    "કેવી",
    "કેવું",
    "કોઈ",
    "કોઈક",
    "કોણ",
    "કોણે",
    "કોને",
    "ક્યાં",
    "ક્યારે",
    "ખૂબ",
    "ગઈ",
    "ગયા",
    "ગયાં",
    "ગયું",
    "ગયો",
    "ઘણું",
    "છ",
    "છતાં",
    "છીએ",
    "છું",
    "છે",
    "છેક",
    "છો",
    "જ",
    "જાય",
    "જી",
    "જે",
    "જેટલું",
    "જેને",
    "જેમ",
    "જેવી",
    "જેવું",
    "જેવો",
    "જો",
    "જોઈએ",
    "જ્યાં",
    "જ્યારે",
    "ઝાઝું",
    "તને",
    "તમને",
    "તમારું",
    "તમે",
    "તા",
    "તારાથી",
    "તારામાં",
    "તારું",
    "તું",
    "તે",
    "તેં",
    "તેઓ",
    "તેણે",
    "તેથી",
    "તેના",
    "તેની",
    "તેનું",
    "તેને",
    "તેમ",
    "તેમનું",
    "તેમને",
    "તેવી",
    "તેવું",
    "તો",
    "ત્યાં",
    "ત્યારે",
    "થઇ",
    "થઈ",
    "થઈએ",
    "થતા",
    "થતાં",
    "થતી",
    "થતું",
    "થતો",
    "થયા",
    "થયાં",
    "થયું",
    "થયેલું",
    "થયો",
    "થવું",
    "થાઉં",
    "થાઓ",
    "થાય",
    "થી",
    "થોડું",
    "દરેક",
    "ન",
    "નં",
    "નં.",
    "નથી",
    "નહિ",
    "નહી",
    "નહીં",
    "ના",
    "ની",
    "નીચે",
    "નું",
    "ને",
    "નો",
    "પછી",
    "પણ",
    "પર",
    "પરંતુ",
    "પહેલાં",
    "પાછળ",
    "પાસે",
    "પોતાનું",
    "પ્રત્યેક",
    "ફક્ત",
    "ફરી",
    "ફરીથી",
    "બંને",
    "બધા",
    "બધું",
    "બની",
    "બહાર",
    "બહુ",
    "બાદ",
    "બે",
    "મને",
    "મા",
    "માં",
    "માટે",
    "માત્ર",
    "મારું",
    "મી",
    "મૂકવું",
    "મૂકી",
    "મૂક્યા",
    "મૂક્યાં",
    "મૂક્યું",
    "મેં",
    "રહી",
    "રહે",
    "રહેવું",
    "રહ્યા",
    "રહ્યાં",
    "રહ્યો",
    "રીતે",
    "રૂ.",
    "રૂા",
    "લેતા",
    "લેતું",
    "લેવા",
    "વગેરે",
    "વધુ",
    "શકે",
    "શા",
    "શું",
    "સરખું",
    "સામે",
    "સુધી",
    "હતા",
    "હતાં",
    "હતી",
    "હતું",
    "હવે",
    "હશે",
    "હશો",
    "હા",
    "હું",
    "હો",
    "હોઈ",
    "હોઈશ",
    "હોઈશું",
    "હોય",
    "હોવા"
  ];
  const hau = [
    "ta",
    "da",
    "ya",
    "sai",
    "ba",
    "yi",
    "na",
    "kuma",
    "ma",
    "ji",
    "cikin",
    "in",
    "ni",
    "wata",
    "wani",
    "ce",
    "tana",
    "don",
    "za",
    "sun",
    "amma",
    "ga",
    "ina",
    "ne",
    "tselane",
    "mai",
    "suka",
    "wannan",
    "a",
    "ko",
    "lokacin",
    "su",
    "take",
    "kaka",
    "shi",
    "yake",
    "yana",
    "mulongo",
    "mata",
    "ka",
    "ban",
    "ita",
    "tafi",
    "shanshani",
    "kai",
    "daɗi",
    "mi",
    "ƙato",
    "fara",
    "rana"
  ];
  const heb = [
    "אבל",
    "או",
    "אולי",
    "אותה",
    "אותו",
    "אותי",
    "אותך",
    "אותם",
    "אותן",
    "אותנו",
    "אז",
    "אחר",
    "אחרות",
    "אחרי",
    "אחריכן",
    "אחרים",
    "אחרת",
    "אי",
    "איזה",
    "איך",
    "אין",
    "איפה",
    "איתה",
    "איתו",
    "איתי",
    "איתך",
    "איתכם",
    "איתכן",
    "איתם",
    "איתן",
    "איתנו",
    "אך",
    "אל",
    "אלה",
    "אלו",
    "אם",
    "אנחנו",
    "אני",
    "אס",
    "אף",
    "אצל",
    "אשר",
    "את",
    "אתה",
    "אתכם",
    "אתכן",
    "אתם",
    "אתן",
    "באיזומידה",
    "באמצע",
    "באמצעות",
    "בגלל",
    "בין",
    "בלי",
    "במידה",
    "במקוםשבו",
    "ברם",
    "בשביל",
    "בשעהש",
    "בתוך",
    "גם",
    "דרך",
    "הוא",
    "היא",
    "היה",
    "היכן",
    "היתה",
    "היתי",
    "הם",
    "הן",
    "הנה",
    "הסיבהשבגללה",
    "הרי",
    "ואילו",
    "ואת",
    "זאת",
    "זה",
    "זות",
    "יהיה",
    "יוכל",
    "יוכלו",
    "יותרמדי",
    "יכול",
    "יכולה",
    "יכולות",
    "יכולים",
    "יכל",
    "יכלה",
    "יכלו",
    "יש",
    "כאן",
    "כאשר",
    "כולם",
    "כולן",
    "כזה",
    "כי",
    "כיצד",
    "כך",
    "ככה",
    "כל",
    "כלל",
    "כמו",
    "כן",
    "כפי",
    "כש",
    "לא",
    "לאו",
    "לאיזותכלית",
    "לאן",
    "לבין",
    "לה",
    "להיות",
    "להם",
    "להן",
    "לו",
    "לי",
    "לכם",
    "לכן",
    "למה",
    "למטה",
    "למעלה",
    "למקוםשבו",
    "למרות",
    "לנו",
    "לעבר",
    "לעיכן",
    "לפיכך",
    "לפני",
    "מאד",
    "מאחורי",
    "מאיזוסיבה",
    "מאין",
    "מאיפה",
    "מבלי",
    "מבעד",
    "מדוע",
    "מה",
    "מהיכן",
    "מול",
    "מחוץ",
    "מי",
    "מכאן",
    "מכיוון",
    "מלבד",
    "מן",
    "מנין",
    "מסוגל",
    "מעט",
    "מעטים",
    "מעל",
    "מצד",
    "מקוםבו",
    "מתחת",
    "מתי",
    "נגד",
    "נגר",
    "נו",
    "עד",
    "עז",
    "על",
    "עלי",
    "עליה",
    "עליהם",
    "עליהן",
    "עליו",
    "עליך",
    "עליכם",
    "עלינו",
    "עם",
    "עצמה",
    "עצמהם",
    "עצמהן",
    "עצמו",
    "עצמי",
    "עצמם",
    "עצמן",
    "עצמנו",
    "פה",
    "רק",
    "שוב",
    "של",
    "שלה",
    "שלהם",
    "שלהן",
    "שלו",
    "שלי",
    "שלך",
    "שלכה",
    "שלכם",
    "שלכן",
    "שלנו",
    "שם",
    "תהיה",
    "תחת"
  ];
  const hin = [
    "अंदर",
    "अत",
    "अदि",
    "अप",
    "अपना",
    "अपनि",
    "अपनी",
    "अपने",
    "अभि",
    "अभी",
    "आदि",
    "आप",
    "इंहिं",
    "इंहें",
    "इंहों",
    "इतयादि",
    "इत्यादि",
    "इन",
    "इनका",
    "इन्हीं",
    "इन्हें",
    "इन्हों",
    "इस",
    "इसका",
    "इसकि",
    "इसकी",
    "इसके",
    "इसमें",
    "इसि",
    "इसी",
    "इसे",
    "उंहिं",
    "उंहें",
    "उंहों",
    "उन",
    "उनका",
    "उनकि",
    "उनकी",
    "उनके",
    "उनको",
    "उन्हीं",
    "उन्हें",
    "उन्हों",
    "उस",
    "उसके",
    "उसि",
    "उसी",
    "उसे",
    "एक",
    "एवं",
    "एस",
    "एसे",
    "ऐसे",
    "ओर",
    "और",
    "कइ",
    "कई",
    "कर",
    "करता",
    "करते",
    "करना",
    "करने",
    "करें",
    "कहते",
    "कहा",
    "का",
    "काफि",
    "काफ़ी",
    "कि",
    "किंहें",
    "किंहों",
    "कितना",
    "किन्हें",
    "किन्हों",
    "किया",
    "किर",
    "किस",
    "किसि",
    "किसी",
    "किसे",
    "की",
    "कुछ",
    "कुल",
    "के",
    "को",
    "कोइ",
    "कोई",
    "कोन",
    "कोनसा",
    "कौन",
    "कौनसा",
    "गया",
    "घर",
    "जब",
    "जहाँ",
    "जहां",
    "जा",
    "जिंहें",
    "जिंहों",
    "जितना",
    "जिधर",
    "जिन",
    "जिन्हें",
    "जिन्हों",
    "जिस",
    "जिसे",
    "जीधर",
    "जेसा",
    "जेसे",
    "जैसा",
    "जैसे",
    "जो",
    "तक",
    "तब",
    "तरह",
    "तिंहें",
    "तिंहों",
    "तिन",
    "तिन्हें",
    "तिन्हों",
    "तिस",
    "तिसे",
    "तो",
    "था",
    "थि",
    "थी",
    "थे",
    "दबारा",
    "दवारा",
    "दिया",
    "दुसरा",
    "दुसरे",
    "दूसरे",
    "दो",
    "द्वारा",
    "न",
    "नहिं",
    "नहीं",
    "ना",
    "निचे",
    "निहायत",
    "नीचे",
    "ने",
    "पर",
    "पहले",
    "पुरा",
    "पूरा",
    "पे",
    "फिर",
    "बनि",
    "बनी",
    "बहि",
    "बही",
    "बहुत",
    "बाद",
    "बाला",
    "बिलकुल",
    "भि",
    "भितर",
    "भी",
    "भीतर",
    "मगर",
    "मानो",
    "मे",
    "में",
    "यदि",
    "यह",
    "यहाँ",
    "यहां",
    "यहि",
    "यही",
    "या",
    "यिह",
    "ये",
    "रखें",
    "रवासा",
    "रहा",
    "रहे",
    "ऱ्वासा",
    "लिए",
    "लिये",
    "लेकिन",
    "व",
    "वगेरह",
    "वरग",
    "वर्ग",
    "वह",
    "वहाँ",
    "वहां",
    "वहिं",
    "वहीं",
    "वाले",
    "वुह",
    "वे",
    "वग़ैरह",
    "संग",
    "सकता",
    "सकते",
    "सबसे",
    "सभि",
    "सभी",
    "साथ",
    "साबुत",
    "साभ",
    "सारा",
    "से",
    "सो",
    "हि",
    "ही",
    "हुअ",
    "हुआ",
    "हुइ",
    "हुई",
    "हुए",
    "हे",
    "हें",
    "है",
    "हैं",
    "हो",
    "होता",
    "होति",
    "होती",
    "होते",
    "होना",
    "होने"
  ];
  const gle = [
    "a",
    "ach",
    "ag",
    "agus",
    "an",
    "aon",
    "ar",
    "arna",
    "as",
    "b'",
    "ba",
    "beirt",
    "bhúr",
    "caoga",
    "ceathair",
    "ceathrar",
    "chomh",
    "chtó",
    "chuig",
    "chun",
    "cois",
    "céad",
    "cúig",
    "cúigear",
    "d'",
    "daichead",
    "dar",
    "de",
    "deich",
    "deichniúr",
    "den",
    "dhá",
    "do",
    "don",
    "dtí",
    "dá",
    "dár",
    "dó",
    "faoi",
    "faoin",
    "faoina",
    "faoinár",
    "fara",
    "fiche",
    "gach",
    "gan",
    "go",
    "gur",
    "haon",
    "hocht",
    "i",
    "iad",
    "idir",
    "in",
    "ina",
    "ins",
    "inár",
    "is",
    "le",
    "leis",
    "lena",
    "lenár",
    "m'",
    "mar",
    "mo",
    "mé",
    "na",
    "nach",
    "naoi",
    "naonúr",
    "ná",
    "ní",
    "níor",
    "nó",
    "nócha",
    "ocht",
    "ochtar",
    "os",
    "roimh",
    "sa",
    "seacht",
    "seachtar",
    "seachtó",
    "seasca",
    "seisear",
    "siad",
    "sibh",
    "sinn",
    "sna",
    "sé",
    "sí",
    "tar",
    "thar",
    "thú",
    "triúr",
    "trí",
    "trína",
    "trínár",
    "tríocha",
    "tú",
    "um",
    "ár",
    "é",
    "éis",
    "í",
    "ó",
    "ón",
    "óna",
    "ónár"
  ];
  const hun = [
    "a",
    "abba",
    "abban",
    "abból",
    "addig",
    "ahhoz",
    "ahogy",
    "ahol",
    "aki",
    "akik",
    "akkor",
    "akár",
    "alapján",
    "alatt",
    "alatta",
    "alattad",
    "alattam",
    "alattatok",
    "alattuk",
    "alattunk",
    "alá",
    "alád",
    "alájuk",
    "alám",
    "alánk",
    "alátok",
    "alól",
    "alóla",
    "alólad",
    "alólam",
    "alólatok",
    "alóluk",
    "alólunk",
    "amely",
    "amelyből",
    "amelyek",
    "amelyekben",
    "amelyeket",
    "amelyet",
    "amelyik",
    "amelynek",
    "ami",
    "amikor",
    "amit",
    "amolyan",
    "amott",
    "amíg",
    "annak",
    "annál",
    "arra",
    "arról",
    "attól",
    "az",
    "aznap",
    "azok",
    "azokat",
    "azokba",
    "azokban",
    "azokból",
    "azokhoz",
    "azokig",
    "azokkal",
    "azokká",
    "azoknak",
    "azoknál",
    "azokon",
    "azokra",
    "azokról",
    "azoktól",
    "azokért",
    "azon",
    "azonban",
    "azonnal",
    "azt",
    "aztán",
    "azután",
    "azzal",
    "azzá",
    "azért",
    "bal",
    "balra",
    "ban",
    "be",
    "belé",
    "beléd",
    "beléjük",
    "belém",
    "belénk",
    "belétek",
    "belül",
    "belőle",
    "belőled",
    "belőlem",
    "belőletek",
    "belőlük",
    "belőlünk",
    "ben",
    "benne",
    "benned",
    "bennem",
    "bennetek",
    "bennük",
    "bennünk",
    "bár",
    "bárcsak",
    "bármilyen",
    "búcsú",
    "cikk",
    "cikkek",
    "cikkeket",
    "csak",
    "csakhogy",
    "csupán",
    "de",
    "dehogy",
    "e",
    "ebbe",
    "ebben",
    "ebből",
    "eddig",
    "egy",
    "egyebek",
    "egyebet",
    "egyedül",
    "egyelőre",
    "egyes",
    "egyet",
    "egyetlen",
    "egyik",
    "egymás",
    "egyre",
    "egyszerre",
    "egyéb",
    "együtt",
    "egész",
    "egészen",
    "ehhez",
    "ekkor",
    "el",
    "eleinte",
    "ellen",
    "ellenes",
    "elleni",
    "ellenére",
    "elmondta",
    "első",
    "elsők",
    "elsősorban",
    "elsőt",
    "elé",
    "eléd",
    "elég",
    "eléjük",
    "elém",
    "elénk",
    "elétek",
    "elő",
    "előbb",
    "elől",
    "előle",
    "előled",
    "előlem",
    "előletek",
    "előlük",
    "előlünk",
    "először",
    "előtt",
    "előtte",
    "előtted",
    "előttem",
    "előttetek",
    "előttük",
    "előttünk",
    "előző",
    "emilyen",
    "engem",
    "ennek",
    "ennyi",
    "ennél",
    "enyém",
    "erre",
    "erről",
    "esetben",
    "ettől",
    "ez",
    "ezek",
    "ezekbe",
    "ezekben",
    "ezekből",
    "ezeken",
    "ezeket",
    "ezekhez",
    "ezekig",
    "ezekkel",
    "ezekké",
    "ezeknek",
    "ezeknél",
    "ezekre",
    "ezekről",
    "ezektől",
    "ezekért",
    "ezen",
    "ezentúl",
    "ezer",
    "ezret",
    "ezt",
    "ezután",
    "ezzel",
    "ezzé",
    "ezért",
    "fel",
    "fele",
    "felek",
    "felet",
    "felett",
    "felé",
    "fent",
    "fenti",
    "fél",
    "fölé",
    "gyakran",
    "ha",
    "halló",
    "hamar",
    "hanem",
    "harmadik",
    "harmadikat",
    "harminc",
    "hat",
    "hatodik",
    "hatodikat",
    "hatot",
    "hatvan",
    "helyett",
    "hetedik",
    "hetediket",
    "hetet",
    "hetven",
    "hirtelen",
    "hiszen",
    "hiába",
    "hogy",
    "hogyan",
    "hol",
    "holnap",
    "holnapot",
    "honnan",
    "hova",
    "hozzá",
    "hozzád",
    "hozzájuk",
    "hozzám",
    "hozzánk",
    "hozzátok",
    "hurrá",
    "huszadik",
    "hány",
    "hányszor",
    "hármat",
    "három",
    "hát",
    "hátha",
    "hátulsó",
    "hét",
    "húsz",
    "ide",
    "ide-оda",
    "idén",
    "igazán",
    "igen",
    "ill",
    "illetve",
    "ilyen",
    "ilyenkor",
    "immár",
    "inkább",
    "is",
    "ismét",
    "ison",
    "itt",
    "jelenleg",
    "jobban",
    "jobbra",
    "jó",
    "jól",
    "jólesik",
    "jóval",
    "jövőre",
    "kell",
    "kellene",
    "kellett",
    "kelljen",
    "keressünk",
    "keresztül",
    "ketten",
    "kettő",
    "kettőt",
    "kevés",
    "ki",
    "kiben",
    "kiből",
    "kicsit",
    "kicsoda",
    "kihez",
    "kik",
    "kikbe",
    "kikben",
    "kikből",
    "kiken",
    "kiket",
    "kikhez",
    "kikkel",
    "kikké",
    "kiknek",
    "kiknél",
    "kikre",
    "kikről",
    "kiktől",
    "kikért",
    "kilenc",
    "kilencedik",
    "kilencediket",
    "kilencet",
    "kilencven",
    "kin",
    "kinek",
    "kinél",
    "kire",
    "kiről",
    "kit",
    "kitől",
    "kivel",
    "kivé",
    "kié",
    "kiért",
    "korábban",
    "képest",
    "kérem",
    "kérlek",
    "kész",
    "késő",
    "később",
    "későn",
    "két",
    "kétszer",
    "kívül",
    "körül",
    "köszönhetően",
    "köszönöm",
    "közben",
    "közel",
    "közepesen",
    "közepén",
    "közé",
    "között",
    "közül",
    "külön",
    "különben",
    "különböző",
    "különbözőbb",
    "különbözőek",
    "lassan",
    "le",
    "legalább",
    "legyen",
    "lehet",
    "lehetetlen",
    "lehetett",
    "lehetőleg",
    "lehetőség",
    "lenne",
    "lenni",
    "lennék",
    "lennének",
    "lesz",
    "leszek",
    "lesznek",
    "leszünk",
    "lett",
    "lettek",
    "lettem",
    "lettünk",
    "lévő",
    "ma",
    "maga",
    "magad",
    "magam",
    "magatokat",
    "magukat",
    "magunkat",
    "magát",
    "mai",
    "majd",
    "majdnem",
    "manapság",
    "meg",
    "megcsinál",
    "megcsinálnak",
    "megint",
    "megvan",
    "mellett",
    "mellette",
    "melletted",
    "mellettem",
    "mellettetek",
    "mellettük",
    "mellettünk",
    "mellé",
    "melléd",
    "melléjük",
    "mellém",
    "mellénk",
    "mellétek",
    "mellől",
    "mellőle",
    "mellőled",
    "mellőlem",
    "mellőletek",
    "mellőlük",
    "mellőlünk",
    "mely",
    "melyek",
    "melyik",
    "mennyi",
    "mert",
    "mi",
    "miatt",
    "miatta",
    "miattad",
    "miattam",
    "miattatok",
    "miattuk",
    "miattunk",
    "mibe",
    "miben",
    "miből",
    "mihez",
    "mik",
    "mikbe",
    "mikben",
    "mikből",
    "miken",
    "miket",
    "mikhez",
    "mikkel",
    "mikké",
    "miknek",
    "miknél",
    "mikor",
    "mikre",
    "mikről",
    "miktől",
    "mikért",
    "milyen",
    "min",
    "mind",
    "mindegyik",
    "mindegyiket",
    "minden",
    "mindenesetre",
    "mindenki",
    "mindent",
    "mindenütt",
    "mindig",
    "mindketten",
    "minek",
    "minket",
    "mint",
    "mintha",
    "minél",
    "mire",
    "miről",
    "mit",
    "mitől",
    "mivel",
    "mivé",
    "miért",
    "mondta",
    "most",
    "mostanáig",
    "már",
    "más",
    "másik",
    "másikat",
    "másnap",
    "második",
    "másodszor",
    "mások",
    "másokat",
    "mást",
    "még",
    "mégis",
    "míg",
    "mögé",
    "mögéd",
    "mögéjük",
    "mögém",
    "mögénk",
    "mögétek",
    "mögött",
    "mögötte",
    "mögötted",
    "mögöttem",
    "mögöttetek",
    "mögöttük",
    "mögöttünk",
    "mögül",
    "mögüle",
    "mögüled",
    "mögülem",
    "mögületek",
    "mögülük",
    "mögülünk",
    "múltkor",
    "múlva",
    "na",
    "nagy",
    "nagyobb",
    "nagyon",
    "naponta",
    "napot",
    "ne",
    "negyedik",
    "negyediket",
    "negyven",
    "neked",
    "nekem",
    "neki",
    "nekik",
    "nektek",
    "nekünk",
    "nem",
    "nemcsak",
    "nemrég",
    "nincs",
    "nyolc",
    "nyolcadik",
    "nyolcadikat",
    "nyolcat",
    "nyolcvan",
    "nála",
    "nálad",
    "nálam",
    "nálatok",
    "náluk",
    "nálunk",
    "négy",
    "négyet",
    "néha",
    "néhány",
    "nélkül",
    "o",
    "oda",
    "ok",
    "olyan",
    "onnan",
    "ott",
    "pedig",
    "persze",
    "pár",
    "például",
    "rajta",
    "rajtad",
    "rajtam",
    "rajtatok",
    "rajtuk",
    "rajtunk",
    "rendben",
    "rosszul",
    "rá",
    "rád",
    "rájuk",
    "rám",
    "ránk",
    "rátok",
    "régen",
    "régóta",
    "részére",
    "róla",
    "rólad",
    "rólam",
    "rólatok",
    "róluk",
    "rólunk",
    "rögtön",
    "s",
    "saját",
    "se",
    "sem",
    "semmi",
    "semmilyen",
    "semmiség",
    "senki",
    "soha",
    "sok",
    "sokan",
    "sokat",
    "sokkal",
    "sokszor",
    "sokáig",
    "során",
    "stb.",
    "szemben",
    "szerbusz",
    "szerint",
    "szerinte",
    "szerinted",
    "szerintem",
    "szerintetek",
    "szerintük",
    "szerintünk",
    "szervusz",
    "szinte",
    "számára",
    "száz",
    "századik",
    "százat",
    "szépen",
    "szét",
    "szíves",
    "szívesen",
    "szíveskedjék",
    "sőt",
    "talán",
    "tavaly",
    "te",
    "tegnap",
    "tegnapelőtt",
    "tehát",
    "tele",
    "teljes",
    "tessék",
    "ti",
    "tied",
    "titeket",
    "tizedik",
    "tizediket",
    "tizenegy",
    "tizenegyedik",
    "tizenhat",
    "tizenhárom",
    "tizenhét",
    "tizenkettedik",
    "tizenkettő",
    "tizenkilenc",
    "tizenkét",
    "tizennyolc",
    "tizennégy",
    "tizenöt",
    "tizet",
    "tovább",
    "további",
    "továbbá",
    "távol",
    "téged",
    "tényleg",
    "tíz",
    "több",
    "többi",
    "többször",
    "túl",
    "tőle",
    "tőled",
    "tőlem",
    "tőletek",
    "tőlük",
    "tőlünk",
    "ugyanakkor",
    "ugyanez",
    "ugyanis",
    "ugye",
    "urak",
    "uram",
    "urat",
    "utoljára",
    "utolsó",
    "után",
    "utána",
    "vagy",
    "vagyis",
    "vagyok",
    "vagytok",
    "vagyunk",
    "vajon",
    "valahol",
    "valaki",
    "valakit",
    "valamelyik",
    "valami",
    "valamint",
    "való",
    "van",
    "vannak",
    "vele",
    "veled",
    "velem",
    "veletek",
    "velük",
    "velünk",
    "vissza",
    "viszlát",
    "viszont",
    "viszontlátásra",
    "volna",
    "volnának",
    "volnék",
    "volt",
    "voltak",
    "voltam",
    "voltunk",
    "végre",
    "végén",
    "végül",
    "által",
    "általában",
    "ám",
    "át",
    "éljen",
    "én",
    "éppen",
    "érte",
    "érted",
    "értem",
    "értetek",
    "értük",
    "értünk",
    "és",
    "év",
    "évben",
    "éve",
    "évek",
    "éves",
    "évi",
    "évvel",
    "így",
    "óta",
    "ön",
    "önbe",
    "önben",
    "önből",
    "önhöz",
    "önnek",
    "önnel",
    "önnél",
    "önre",
    "önről",
    "önt",
    "öntől",
    "önért",
    "önök",
    "önökbe",
    "önökben",
    "önökből",
    "önöket",
    "önökhöz",
    "önökkel",
    "önöknek",
    "önöknél",
    "önökre",
    "önökről",
    "önöktől",
    "önökért",
    "önökön",
    "önön",
    "össze",
    "öt",
    "ötven",
    "ötödik",
    "ötödiket",
    "ötöt",
    "úgy",
    "úgyis",
    "úgynevezett",
    "új",
    "újabb",
    "újra",
    "úr",
    "ő",
    "ők",
    "őket",
    "őt"
  ];
  const ind = [
    "ada",
    "adalah",
    "adanya",
    "adapun",
    "agak",
    "agaknya",
    "agar",
    "akan",
    "akankah",
    "akhir",
    "akhiri",
    "akhirnya",
    "aku",
    "akulah",
    "amat",
    "amatlah",
    "anda",
    "andalah",
    "antar",
    "antara",
    "antaranya",
    "apa",
    "apaan",
    "apabila",
    "apakah",
    "apalagi",
    "apatah",
    "artinya",
    "asal",
    "asalkan",
    "atas",
    "atau",
    "ataukah",
    "ataupun",
    "awal",
    "awalnya",
    "bagai",
    "bagaikan",
    "bagaimana",
    "bagaimanakah",
    "bagaimanapun",
    "bagi",
    "bagian",
    "bahkan",
    "bahwa",
    "bahwasanya",
    "bakal",
    "bakalan",
    "balik",
    "banyak",
    "bapak",
    "baru",
    "bawah",
    "beberapa",
    "begini",
    "beginian",
    "beginikah",
    "beginilah",
    "begitu",
    "begitukah",
    "begitulah",
    "begitupun",
    "bekerja",
    "belakang",
    "belakangan",
    "belum",
    "belumlah",
    "benar",
    "benarkah",
    "benarlah",
    "berada",
    "berakhir",
    "berakhirlah",
    "berakhirnya",
    "berapa",
    "berapakah",
    "berapalah",
    "berapapun",
    "berarti",
    "berawal",
    "berbagai",
    "berdatangan",
    "beri",
    "berikan",
    "berikut",
    "berikutnya",
    "berjumlah",
    "berkali-kali",
    "berkata",
    "berkehendak",
    "berkeinginan",
    "berkenaan",
    "berlainan",
    "berlalu",
    "berlangsung",
    "berlebihan",
    "bermacam",
    "bermacam-macam",
    "bermaksud",
    "bermula",
    "bersama",
    "bersama-sama",
    "bersiap",
    "bersiap-siap",
    "bertanya",
    "bertanya-tanya",
    "berturut",
    "berturut-turut",
    "bertutur",
    "berujar",
    "berupa",
    "besar",
    "betul",
    "betulkah",
    "biasa",
    "biasanya",
    "bila",
    "bilakah",
    "bisa",
    "bisakah",
    "boleh",
    "bolehkah",
    "bolehlah",
    "buat",
    "bukan",
    "bukankah",
    "bukanlah",
    "bukannya",
    "bulan",
    "bung",
    "cara",
    "caranya",
    "cukup",
    "cukupkah",
    "cukuplah",
    "cuma",
    "dahulu",
    "dalam",
    "dan",
    "dapat",
    "dari",
    "daripada",
    "datang",
    "dekat",
    "demi",
    "demikian",
    "demikianlah",
    "dengan",
    "depan",
    "di",
    "dia",
    "diakhiri",
    "diakhirinya",
    "dialah",
    "diantara",
    "diantaranya",
    "diberi",
    "diberikan",
    "diberikannya",
    "dibuat",
    "dibuatnya",
    "didapat",
    "didatangkan",
    "digunakan",
    "diibaratkan",
    "diibaratkannya",
    "diingat",
    "diingatkan",
    "diinginkan",
    "dijawab",
    "dijelaskan",
    "dijelaskannya",
    "dikarenakan",
    "dikatakan",
    "dikatakannya",
    "dikerjakan",
    "diketahui",
    "diketahuinya",
    "dikira",
    "dilakukan",
    "dilalui",
    "dilihat",
    "dimaksud",
    "dimaksudkan",
    "dimaksudkannya",
    "dimaksudnya",
    "diminta",
    "dimintai",
    "dimisalkan",
    "dimulai",
    "dimulailah",
    "dimulainya",
    "dimungkinkan",
    "dini",
    "dipastikan",
    "diperbuat",
    "diperbuatnya",
    "dipergunakan",
    "diperkirakan",
    "diperlihatkan",
    "diperlukan",
    "diperlukannya",
    "dipersoalkan",
    "dipertanyakan",
    "dipunyai",
    "diri",
    "dirinya",
    "disampaikan",
    "disebut",
    "disebutkan",
    "disebutkannya",
    "disini",
    "disinilah",
    "ditambahkan",
    "ditandaskan",
    "ditanya",
    "ditanyai",
    "ditanyakan",
    "ditegaskan",
    "ditujukan",
    "ditunjuk",
    "ditunjuki",
    "ditunjukkan",
    "ditunjukkannya",
    "ditunjuknya",
    "dituturkan",
    "dituturkannya",
    "diucapkan",
    "diucapkannya",
    "diungkapkan",
    "dong",
    "dulu",
    "empat",
    "enggak",
    "enggaknya",
    "entah",
    "entahlah",
    "guna",
    "gunakan",
    "hal",
    "hampir",
    "hanya",
    "hanyalah",
    "harus",
    "haruslah",
    "harusnya",
    "hendak",
    "hendaklah",
    "hendaknya",
    "hingga",
    "ia",
    "ialah",
    "ibarat",
    "ibaratkan",
    "ibaratnya",
    "ikut",
    "ingat",
    "ingat-ingat",
    "ingin",
    "inginkah",
    "inginkan",
    "ini",
    "inikah",
    "inilah",
    "itu",
    "itukah",
    "itulah",
    "jadi",
    "jadilah",
    "jadinya",
    "jangan",
    "jangankan",
    "janganlah",
    "jauh",
    "jawab",
    "jawaban",
    "jawabnya",
    "jelas",
    "jelaskan",
    "jelaslah",
    "jelasnya",
    "jika",
    "jikalau",
    "juga",
    "jumlah",
    "jumlahnya",
    "justru",
    "kala",
    "kalau",
    "kalaulah",
    "kalaupun",
    "kalian",
    "kami",
    "kamilah",
    "kamu",
    "kamulah",
    "kan",
    "kapan",
    "kapankah",
    "kapanpun",
    "karena",
    "karenanya",
    "kasus",
    "kata",
    "katakan",
    "katakanlah",
    "katanya",
    "ke",
    "keadaan",
    "kebetulan",
    "kecil",
    "kedua",
    "keduanya",
    "keinginan",
    "kelamaan",
    "kelihatan",
    "kelihatannya",
    "kelima",
    "keluar",
    "kembali",
    "kemudian",
    "kemungkinan",
    "kemungkinannya",
    "kenapa",
    "kepada",
    "kepadanya",
    "kesampaian",
    "keseluruhan",
    "keseluruhannya",
    "keterlaluan",
    "ketika",
    "khususnya",
    "kini",
    "kinilah",
    "kira",
    "kira-kira",
    "kiranya",
    "kita",
    "kitalah",
    "kok",
    "kurang",
    "lagi",
    "lagian",
    "lah",
    "lain",
    "lainnya",
    "lalu",
    "lama",
    "lamanya",
    "lanjut",
    "lanjutnya",
    "lebih",
    "lewat",
    "lima",
    "luar",
    "macam",
    "maka",
    "makanya",
    "makin",
    "malah",
    "malahan",
    "mampu",
    "mampukah",
    "mana",
    "manakala",
    "manalagi",
    "masa",
    "masalah",
    "masalahnya",
    "masih",
    "masihkah",
    "masing",
    "masing-masing",
    "mau",
    "maupun",
    "melainkan",
    "melakukan",
    "melalui",
    "melihat",
    "melihatnya",
    "memang",
    "memastikan",
    "memberi",
    "memberikan",
    "membuat",
    "memerlukan",
    "memihak",
    "meminta",
    "memintakan",
    "memisalkan",
    "memperbuat",
    "mempergunakan",
    "memperkirakan",
    "memperlihatkan",
    "mempersiapkan",
    "mempersoalkan",
    "mempertanyakan",
    "mempunyai",
    "memulai",
    "memungkinkan",
    "menaiki",
    "menambahkan",
    "menandaskan",
    "menanti",
    "menanti-nanti",
    "menantikan",
    "menanya",
    "menanyai",
    "menanyakan",
    "mendapat",
    "mendapatkan",
    "mendatang",
    "mendatangi",
    "mendatangkan",
    "menegaskan",
    "mengakhiri",
    "mengapa",
    "mengatakan",
    "mengatakannya",
    "mengenai",
    "mengerjakan",
    "mengetahui",
    "menggunakan",
    "menghendaki",
    "mengibaratkan",
    "mengibaratkannya",
    "mengingat",
    "mengingatkan",
    "menginginkan",
    "mengira",
    "mengucapkan",
    "mengucapkannya",
    "mengungkapkan",
    "menjadi",
    "menjawab",
    "menjelaskan",
    "menuju",
    "menunjuk",
    "menunjuki",
    "menunjukkan",
    "menunjuknya",
    "menurut",
    "menuturkan",
    "menyampaikan",
    "menyangkut",
    "menyatakan",
    "menyebutkan",
    "menyeluruh",
    "menyiapkan",
    "merasa",
    "mereka",
    "merekalah",
    "merupakan",
    "meski",
    "meskipun",
    "meyakini",
    "meyakinkan",
    "minta",
    "mirip",
    "misal",
    "misalkan",
    "misalnya",
    "mula",
    "mulai",
    "mulailah",
    "mulanya",
    "mungkin",
    "mungkinkah",
    "nah",
    "naik",
    "namun",
    "nanti",
    "nantinya",
    "nyaris",
    "nyatanya",
    "oleh",
    "olehnya",
    "pada",
    "padahal",
    "padanya",
    "paling",
    "panjang",
    "pantas",
    "para",
    "pasti",
    "pastilah",
    "penting",
    "pentingnya",
    "per",
    "percuma",
    "perlu",
    "perlukah",
    "perlunya",
    "pernah",
    "persoalan",
    "pertama",
    "pertama-tama",
    "pertanyaan",
    "pertanyakan",
    "pihak",
    "pihaknya",
    "pukul",
    "pula",
    "pun",
    "punya",
    "rasa",
    "rasanya",
    "rata",
    "rupanya",
    "saat",
    "saatnya",
    "saja",
    "sajalah",
    "saling",
    "sama",
    "sama-sama",
    "sambil",
    "sampai",
    "sampai-sampai",
    "sampaikan",
    "sana",
    "sangat",
    "sangatlah",
    "satu",
    "saya",
    "sayalah",
    "se",
    "sebab",
    "sebabnya",
    "sebagai",
    "sebagaimana",
    "sebagainya",
    "sebagian",
    "sebaik",
    "sebaik-baiknya",
    "sebaiknya",
    "sebaliknya",
    "sebanyak",
    "sebegini",
    "sebegitu",
    "sebelum",
    "sebelumnya",
    "sebenarnya",
    "seberapa",
    "sebesar",
    "sebetulnya",
    "sebisanya",
    "sebuah",
    "sebut",
    "sebutlah",
    "sebutnya",
    "secara",
    "secukupnya",
    "sedang",
    "sedangkan",
    "sedemikian",
    "sedikit",
    "sedikitnya",
    "seenaknya",
    "segala",
    "segalanya",
    "segera",
    "seharusnya",
    "sehingga",
    "seingat",
    "sejak",
    "sejauh",
    "sejenak",
    "sejumlah",
    "sekadar",
    "sekadarnya",
    "sekali",
    "sekali-kali",
    "sekalian",
    "sekaligus",
    "sekalipun",
    "sekarang",
    "sekarang",
    "sekecil",
    "seketika",
    "sekiranya",
    "sekitar",
    "sekitarnya",
    "sekurang-kurangnya",
    "sekurangnya",
    "sela",
    "selain",
    "selaku",
    "selalu",
    "selama",
    "selama-lamanya",
    "selamanya",
    "selanjutnya",
    "seluruh",
    "seluruhnya",
    "semacam",
    "semakin",
    "semampu",
    "semampunya",
    "semasa",
    "semasih",
    "semata",
    "semata-mata",
    "semaunya",
    "sementara",
    "semisal",
    "semisalnya",
    "sempat",
    "semua",
    "semuanya",
    "semula",
    "sendiri",
    "sendirian",
    "sendirinya",
    "seolah",
    "seolah-olah",
    "seorang",
    "sepanjang",
    "sepantasnya",
    "sepantasnyalah",
    "seperlunya",
    "seperti",
    "sepertinya",
    "sepihak",
    "sering",
    "seringnya",
    "serta",
    "serupa",
    "sesaat",
    "sesama",
    "sesampai",
    "sesegera",
    "sesekali",
    "seseorang",
    "sesuatu",
    "sesuatunya",
    "sesudah",
    "sesudahnya",
    "setelah",
    "setempat",
    "setengah",
    "seterusnya",
    "setiap",
    "setiba",
    "setibanya",
    "setidak-tidaknya",
    "setidaknya",
    "setinggi",
    "seusai",
    "sewaktu",
    "siap",
    "siapa",
    "siapakah",
    "siapapun",
    "sini",
    "sinilah",
    "soal",
    "soalnya",
    "suatu",
    "sudah",
    "sudahkah",
    "sudahlah",
    "supaya",
    "tadi",
    "tadinya",
    "tahu",
    "tahun",
    "tak",
    "tambah",
    "tambahnya",
    "tampak",
    "tampaknya",
    "tandas",
    "tandasnya",
    "tanpa",
    "tanya",
    "tanyakan",
    "tanyanya",
    "tapi",
    "tegas",
    "tegasnya",
    "telah",
    "tempat",
    "tengah",
    "tentang",
    "tentu",
    "tentulah",
    "tentunya",
    "tepat",
    "terakhir",
    "terasa",
    "terbanyak",
    "terdahulu",
    "terdapat",
    "terdiri",
    "terhadap",
    "terhadapnya",
    "teringat",
    "teringat-ingat",
    "terjadi",
    "terjadilah",
    "terjadinya",
    "terkira",
    "terlalu",
    "terlebih",
    "terlihat",
    "termasuk",
    "ternyata",
    "tersampaikan",
    "tersebut",
    "tersebutlah",
    "tertentu",
    "tertuju",
    "terus",
    "terutama",
    "tetap",
    "tetapi",
    "tiap",
    "tiba",
    "tiba-tiba",
    "tidak",
    "tidakkah",
    "tidaklah",
    "tiga",
    "tinggi",
    "toh",
    "tunjuk",
    "turut",
    "tutur",
    "tuturnya",
    "ucap",
    "ucapnya",
    "ujar",
    "ujarnya",
    "umum",
    "umumnya",
    "ungkap",
    "ungkapnya",
    "untuk",
    "usah",
    "usai",
    "waduh",
    "wah",
    "wahai",
    "waktu",
    "waktunya",
    "walau",
    "walaupun",
    "wong",
    "yaitu",
    "yakin",
    "yakni",
    "yang"
  ];
  const ita = [
    "ad",
    "al",
    "allo",
    "ai",
    "agli",
    "all",
    "agl",
    "alla",
    "alle",
    "con",
    "col",
    "coi",
    "da",
    "dal",
    "dallo",
    "dai",
    "dagli",
    "dall",
    "dagl",
    "dalla",
    "dalle",
    "di",
    "del",
    "dello",
    "dei",
    "degli",
    "dell",
    "degl",
    "della",
    "delle",
    "in",
    "nel",
    "nello",
    "nei",
    "negli",
    "nell",
    "negl",
    "nella",
    "nelle",
    "su",
    "sul",
    "sullo",
    "sui",
    "sugli",
    "sull",
    "sugl",
    "sulla",
    "sulle",
    "per",
    "tra",
    "contro",
    "io",
    "tu",
    "lui",
    "lei",
    "noi",
    "voi",
    "loro",
    "mio",
    "mia",
    "miei",
    "mie",
    "tuo",
    "tua",
    "tuoi",
    "tue",
    "suo",
    "sua",
    "suoi",
    "sue",
    "nostro",
    "nostra",
    "nostri",
    "nostre",
    "vostro",
    "vostra",
    "vostri",
    "vostre",
    "mi",
    "ti",
    "ci",
    "vi",
    "lo",
    "la",
    "li",
    "le",
    "gli",
    "ne",
    "il",
    "un",
    "uno",
    "una",
    "ma",
    "ed",
    "se",
    "perché",
    "anche",
    "come",
    "dov",
    "dove",
    "che",
    "chi",
    "cui",
    "non",
    "più",
    "quale",
    "quanto",
    "quanti",
    "quanta",
    "quante",
    "quello",
    "quelli",
    "quella",
    "quelle",
    "questo",
    "questi",
    "questa",
    "queste",
    "si",
    "tutto",
    "tutti",
    "a",
    "c",
    "e",
    "i",
    "l",
    "o",
    "ho",
    "hai",
    "ha",
    "abbiamo",
    "avete",
    "hanno",
    "abbia",
    "abbiate",
    "abbiano",
    "avrò",
    "avrai",
    "avrà",
    "avremo",
    "avrete",
    "avranno",
    "avrei",
    "avresti",
    "avrebbe",
    "avremmo",
    "avreste",
    "avrebbero",
    "avevo",
    "avevi",
    "aveva",
    "avevamo",
    "avevate",
    "avevano",
    "ebbi",
    "avesti",
    "ebbe",
    "avemmo",
    "aveste",
    "ebbero",
    "avessi",
    "avesse",
    "avessimo",
    "avessero",
    "avendo",
    "avuto",
    "avuta",
    "avuti",
    "avute",
    "sono",
    "sei",
    "è",
    "siamo",
    "siete",
    "sia",
    "siate",
    "siano",
    "sarò",
    "sarai",
    "sarà",
    "saremo",
    "sarete",
    "saranno",
    "sarei",
    "saresti",
    "sarebbe",
    "saremmo",
    "sareste",
    "sarebbero",
    "ero",
    "eri",
    "era",
    "eravamo",
    "eravate",
    "erano",
    "fui",
    "fosti",
    "fu",
    "fummo",
    "foste",
    "furono",
    "fossi",
    "fosse",
    "fossimo",
    "fossero",
    "essendo",
    "faccio",
    "fai",
    "facciamo",
    "fanno",
    "faccia",
    "facciate",
    "facciano",
    "farò",
    "farai",
    "farà",
    "faremo",
    "farete",
    "faranno",
    "farei",
    "faresti",
    "farebbe",
    "faremmo",
    "fareste",
    "farebbero",
    "facevo",
    "facevi",
    "faceva",
    "facevamo",
    "facevate",
    "facevano",
    "feci",
    "facesti",
    "fece",
    "facemmo",
    "faceste",
    "fecero",
    "facessi",
    "facesse",
    "facessimo",
    "facessero",
    "facendo",
    "sto",
    "stai",
    "sta",
    "stiamo",
    "stanno",
    "stia",
    "stiate",
    "stiano",
    "starò",
    "starai",
    "starà",
    "staremo",
    "starete",
    "staranno",
    "starei",
    "staresti",
    "starebbe",
    "staremmo",
    "stareste",
    "starebbero",
    "stavo",
    "stavi",
    "stava",
    "stavamo",
    "stavate",
    "stavano",
    "stetti",
    "stesti",
    "stette",
    "stemmo",
    "steste",
    "stettero",
    "stessi",
    "stesse",
    "stessimo",
    "stessero",
    "stando"
  ];
  const jpn = [
    "の",
    "に",
    "は",
    "を",
    "た",
    "が",
    "で",
    "て",
    "と",
    "し",
    "れ",
    "さ",
    "ある",
    "いる",
    "も",
    "する",
    "から",
    "な",
    "こと",
    "として",
    "い",
    "や",
    "れる",
    "など",
    "なっ",
    "ない",
    "この",
    "ため",
    "その",
    "あっ",
    "よう",
    "また",
    "もの",
    "という",
    "あり",
    "まで",
    "られ",
    "なる",
    "へ",
    "か",
    "だ",
    "これ",
    "によって",
    "により",
    "おり",
    "より",
    "による",
    "ず",
    "なり",
    "られる",
    "において",
    "ば",
    "なかっ",
    "なく",
    "しかし",
    "について",
    "せ",
    "だっ",
    "その後",
    "できる",
    "それ",
    "う",
    "ので",
    "なお",
    "のみ",
    "でき",
    "き",
    "つ",
    "における",
    "および",
    "いう",
    "さらに",
    "でも",
    "ら",
    "たり",
    "その他",
    "に関する",
    "たち",
    "ます",
    "ん",
    "なら",
    "に対して",
    "特に",
    "せる",
    "及び",
    "これら",
    "とき",
    "では",
    "にて",
    "ほか",
    "ながら",
    "うち",
    "そして",
    "とともに",
    "ただし",
    "かつて",
    "それぞれ",
    "または",
    "お",
    "ほど",
    "ものの",
    "に対する",
    "ほとんど",
    "と共に",
    "といった",
    "です",
    "とも",
    "ところ",
    "ここ"
  ];
  const kor = [
    "가",
    "가까스로",
    "가령",
    "각",
    "각각",
    "각자",
    "각종",
    "갖고말하자면",
    "같다",
    "같이",
    "개의치않고",
    "거니와",
    "거바",
    "거의",
    "것",
    "것과 같이",
    "것들",
    "게다가",
    "게우다",
    "겨우",
    "견지에서",
    "결과에 이르다",
    "결국",
    "결론을 낼 수 있다",
    "겸사겸사",
    "고려하면",
    "고로",
    "곧",
    "공동으로",
    "과",
    "과연",
    "관계가 있다",
    "관계없이",
    "관련이 있다",
    "관하여",
    "관한",
    "관해서는",
    "구",
    "구체적으로",
    "구토하다",
    "그",
    "그들",
    "그때",
    "그래",
    "그래도",
    "그래서",
    "그러나",
    "그러니",
    "그러니까",
    "그러면",
    "그러므로",
    "그러한즉",
    "그런 까닭에",
    "그런데",
    "그런즉",
    "그럼",
    "그럼에도 불구하고",
    "그렇게 함으로써",
    "그렇지",
    "그렇지 않다면",
    "그렇지 않으면",
    "그렇지만",
    "그렇지않으면",
    "그리고",
    "그리하여",
    "그만이다",
    "그에 따르는",
    "그위에",
    "그저",
    "그중에서",
    "그치지 않다",
    "근거로",
    "근거하여",
    "기대여",
    "기점으로",
    "기준으로",
    "기타",
    "까닭으로",
    "까악",
    "까지",
    "까지 미치다",
    "까지도",
    "꽈당",
    "끙끙",
    "끼익",
    "나",
    "나머지는",
    "남들",
    "남짓",
    "너",
    "너희",
    "너희들",
    "네",
    "넷",
    "년",
    "논하지 않다",
    "놀라다",
    "누가 알겠는가",
    "누구",
    "다른",
    "다른 방면으로",
    "다만",
    "다섯",
    "다소",
    "다수",
    "다시 말하자면",
    "다시말하면",
    "다음",
    "다음에",
    "다음으로",
    "단지",
    "답다",
    "당신",
    "당장",
    "대로 하다",
    "대하면",
    "대하여",
    "대해 말하자면",
    "대해서",
    "댕그",
    "더구나",
    "더군다나",
    "더라도",
    "더불어",
    "더욱더",
    "더욱이는",
    "도달하다",
    "도착하다",
    "동시에",
    "동안",
    "된바에야",
    "된이상",
    "두번째로",
    "둘",
    "둥둥",
    "뒤따라",
    "뒤이어",
    "든간에",
    "들",
    "등",
    "등등",
    "딩동",
    "따라",
    "따라서",
    "따위",
    "따지지 않다",
    "딱",
    "때",
    "때가 되어",
    "때문에",
    "또",
    "또한",
    "뚝뚝",
    "라 해도",
    "령",
    "로",
    "로 인하여",
    "로부터",
    "로써",
    "륙",
    "를",
    "마음대로",
    "마저",
    "마저도",
    "마치",
    "막론하고",
    "만 못하다",
    "만약",
    "만약에",
    "만은 아니다",
    "만이 아니다",
    "만일",
    "만큼",
    "말하자면",
    "말할것도 없고",
    "매",
    "매번",
    "메쓰겁다",
    "몇",
    "모",
    "모두",
    "무렵",
    "무릎쓰고",
    "무슨",
    "무엇",
    "무엇때문에",
    "물론",
    "및",
    "바꾸어말하면",
    "바꾸어말하자면",
    "바꾸어서 말하면",
    "바꾸어서 한다면",
    "바꿔 말하면",
    "바로",
    "바와같이",
    "밖에 안된다",
    "반대로",
    "반대로 말하자면",
    "반드시",
    "버금",
    "보는데서",
    "보다더",
    "보드득",
    "본대로",
    "봐",
    "봐라",
    "부류의 사람들",
    "부터",
    "불구하고",
    "불문하고",
    "붕붕",
    "비걱거리다",
    "비교적",
    "비길수 없다",
    "비로소",
    "비록",
    "비슷하다",
    "비추어 보아",
    "비하면",
    "뿐만 아니라",
    "뿐만아니라",
    "뿐이다",
    "삐걱",
    "삐걱거리다",
    "사",
    "삼",
    "상대적으로 말하자면",
    "생각한대로",
    "설령",
    "설마",
    "설사",
    "셋",
    "소생",
    "소인",
    "솨",
    "쉿",
    "습니까",
    "습니다",
    "시각",
    "시간",
    "시작하여",
    "시초에",
    "시키다",
    "실로",
    "심지어",
    "아",
    "아니",
    "아니나다를가",
    "아니라면",
    "아니면",
    "아니었다면",
    "아래윗",
    "아무거나",
    "아무도",
    "아야",
    "아울러",
    "아이",
    "아이고",
    "아이구",
    "아이야",
    "아이쿠",
    "아하",
    "아홉",
    "안 그러면",
    "않기 위하여",
    "않기 위해서",
    "알 수 있다",
    "알았어",
    "앗",
    "앞에서",
    "앞의것",
    "야",
    "약간",
    "양자",
    "어",
    "어기여차",
    "어느",
    "어느 년도",
    "어느것",
    "어느곳",
    "어느때",
    "어느쪽",
    "어느해",
    "어디",
    "어때",
    "어떠한",
    "어떤",
    "어떤것",
    "어떤것들",
    "어떻게",
    "어떻해",
    "어이",
    "어째서",
    "어쨋든",
    "어쩔수 없다",
    "어찌",
    "어찌됏든",
    "어찌됏어",
    "어찌하든지",
    "어찌하여",
    "언제",
    "언젠가",
    "얼마",
    "얼마 안 되는 것",
    "얼마간",
    "얼마나",
    "얼마든지",
    "얼마만큼",
    "얼마큼",
    "엉엉",
    "에",
    "에 가서",
    "에 달려 있다",
    "에 대해",
    "에 있다",
    "에 한하다",
    "에게",
    "에서",
    "여",
    "여기",
    "여덟",
    "여러분",
    "여보시오",
    "여부",
    "여섯",
    "여전히",
    "여차",
    "연관되다",
    "연이서",
    "영",
    "영차",
    "옆사람",
    "예",
    "예를 들면",
    "예를 들자면",
    "예컨대",
    "예하면",
    "오",
    "오로지",
    "오르다",
    "오자마자",
    "오직",
    "오호",
    "오히려",
    "와",
    "와 같은 사람들",
    "와르르",
    "와아",
    "왜",
    "왜냐하면",
    "외에도",
    "요만큼",
    "요만한 것",
    "요만한걸",
    "요컨대",
    "우르르",
    "우리",
    "우리들",
    "우선",
    "우에 종합한것과같이",
    "운운",
    "월",
    "위에서 서술한바와같이",
    "위하여",
    "위해서",
    "윙윙",
    "육",
    "으로",
    "으로 인하여",
    "으로서",
    "으로써",
    "을",
    "응",
    "응당",
    "의",
    "의거하여",
    "의지하여",
    "의해",
    "의해되다",
    "의해서",
    "이",
    "이 되다",
    "이 때문에",
    "이 밖에",
    "이 외에",
    "이 정도의",
    "이것",
    "이곳",
    "이때",
    "이라면",
    "이래",
    "이러이러하다",
    "이러한",
    "이런",
    "이럴정도로",
    "이렇게 많은 것",
    "이렇게되면",
    "이렇게말하자면",
    "이렇구나",
    "이로 인하여",
    "이르기까지",
    "이리하여",
    "이만큼",
    "이번",
    "이봐",
    "이상",
    "이어서",
    "이었다",
    "이와 같다",
    "이와 같은",
    "이와 반대로",
    "이와같다면",
    "이외에도",
    "이용하여",
    "이유만으로",
    "이젠",
    "이지만",
    "이쪽",
    "이천구",
    "이천육",
    "이천칠",
    "이천팔",
    "인 듯하다",
    "인젠",
    "일",
    "일것이다",
    "일곱",
    "일단",
    "일때",
    "일반적으로",
    "일지라도",
    "임에 틀림없다",
    "입각하여",
    "입장에서",
    "잇따라",
    "있다",
    "자",
    "자기",
    "자기집",
    "자마자",
    "자신",
    "잠깐",
    "잠시",
    "저",
    "저것",
    "저것만큼",
    "저기",
    "저쪽",
    "저희",
    "전부",
    "전자",
    "전후",
    "점에서 보아",
    "정도에 이르다",
    "제",
    "제각기",
    "제외하고",
    "조금",
    "조차",
    "조차도",
    "졸졸",
    "좀",
    "좋아",
    "좍좍",
    "주룩주룩",
    "주저하지 않고",
    "줄은 몰랏다",
    "줄은모른다",
    "중에서",
    "중의하나",
    "즈음하여",
    "즉",
    "즉시",
    "지든지",
    "지만",
    "지말고",
    "진짜로",
    "쪽으로",
    "차라리",
    "참",
    "참나",
    "첫번째로",
    "쳇",
    "총적으로",
    "총적으로 말하면",
    "총적으로 보면",
    "칠",
    "콸콸",
    "쾅쾅",
    "쿵",
    "타다",
    "타인",
    "탕탕",
    "토하다",
    "통하여",
    "툭",
    "퉤",
    "틈타",
    "팍",
    "팔",
    "퍽",
    "펄렁",
    "하",
    "하게될것이다",
    "하게하다",
    "하겠는가",
    "하고 있다",
    "하고있었다",
    "하곤하였다",
    "하구나",
    "하기 때문에",
    "하기 위하여",
    "하기는한데",
    "하기만 하면",
    "하기보다는",
    "하기에",
    "하나",
    "하느니",
    "하는 김에",
    "하는 편이 낫다",
    "하는것도",
    "하는것만 못하다",
    "하는것이 낫다",
    "하는바",
    "하더라도",
    "하도다",
    "하도록시키다",
    "하도록하다",
    "하든지",
    "하려고하다",
    "하마터면",
    "하면 할수록",
    "하면된다",
    "하면서",
    "하물며",
    "하여금",
    "하여야",
    "하자마자",
    "하지 않는다면",
    "하지 않도록",
    "하지마",
    "하지마라",
    "하지만",
    "하하",
    "한 까닭에",
    "한 이유는",
    "한 후",
    "한다면",
    "한다면 몰라도",
    "한데",
    "한마디",
    "한적이있다",
    "한켠으로는",
    "한항목",
    "할 따름이다",
    "할 생각이다",
    "할 줄 안다",
    "할 지경이다",
    "할 힘이 있다",
    "할때",
    "할만하다",
    "할망정",
    "할뿐",
    "할수있다",
    "할수있어",
    "할줄알다",
    "할지라도",
    "할지언정",
    "함께",
    "해도된다",
    "해도좋다",
    "해봐요",
    "해서는 안된다",
    "해야한다",
    "해요",
    "했어요",
    "향하다",
    "향하여",
    "향해서",
    "허",
    "허걱",
    "허허",
    "헉",
    "헉헉",
    "헐떡헐떡",
    "형식으로 쓰여",
    "혹시",
    "혹은",
    "혼자",
    "훨씬",
    "휘익",
    "휴",
    "흐흐",
    "흥",
    "힘입어",
    "︿",
    "～",
    "￥"
  ];
  const kur = [
    "ئێمە",
    "ئێوە",
    "ئەم",
    "ئەو",
    "ئەوان",
    "ئەوەی",
    "بۆ",
    "بێ",
    "بێجگە",
    "بە",
    "بەبێ",
    "بەدەم",
    "بەردەم",
    "بەرلە",
    "بەرەوی",
    "بەرەوە",
    "بەلای",
    "بەپێی",
    "تۆ",
    "تێ",
    "جگە",
    "دوای",
    "دوو",
    "دە",
    "دەکات",
    "دەگەڵ",
    "سەر",
    "لێ",
    "لە",
    "لەبابەت",
    "لەباتی",
    "لەبارەی",
    "لەبرێتی",
    "لەبن",
    "لەبەر",
    "لەبەینی",
    "لەدەم",
    "لەرێ",
    "لەرێگا",
    "لەرەوی",
    "لەسەر",
    "لەلایەن",
    "لەناو",
    "لەنێو",
    "لەو",
    "لەپێناوی",
    "لەژێر",
    "لەگەڵ",
    "من",
    "ناو",
    "نێوان",
    "هەر",
    "هەروەها",
    "و",
    "وەک",
    "پاش",
    "پێ",
    "پێش",
    "چەند",
    "کرد",
    "کە",
    "ی"
  ];
  const lat = [
    "a",
    "ab",
    "ac",
    "ad",
    "at",
    "atque",
    "aut",
    "autem",
    "cum",
    "de",
    "dum",
    "e",
    "erant",
    "erat",
    "est",
    "et",
    "etiam",
    "ex",
    "haec",
    "hic",
    "hoc",
    "in",
    "ita",
    "me",
    "nec",
    "neque",
    "non",
    "per",
    "qua",
    "quae",
    "quam",
    "qui",
    "quibus",
    "quidem",
    "quo",
    "quod",
    "re",
    "rebus",
    "rem",
    "res",
    "sed",
    "si",
    "sic",
    "sunt",
    "tamen",
    "tandem",
    "te",
    "ut",
    "vel"
  ];
  const lav = [
    "aiz",
    "ap",
    "apakš",
    "apakšpus",
    "ar",
    "arī",
    "augšpus",
    "bet",
    "bez",
    "bija",
    "biji",
    "biju",
    "bijām",
    "bijāt",
    "būs",
    "būsi",
    "būsiet",
    "būsim",
    "būt",
    "būšu",
    "caur",
    "diemžēl",
    "diezin",
    "droši",
    "dēļ",
    "esam",
    "esat",
    "esi",
    "esmu",
    "gan",
    "gar",
    "iekam",
    "iekams",
    "iekām",
    "iekāms",
    "iekš",
    "iekšpus",
    "ik",
    "ir",
    "it",
    "itin",
    "iz",
    "ja",
    "jau",
    "jeb",
    "jebšu",
    "jel",
    "jo",
    "jā",
    "ka",
    "kamēr",
    "kaut",
    "kolīdz",
    "kopš",
    "kā",
    "kļuva",
    "kļuvi",
    "kļuvu",
    "kļuvām",
    "kļuvāt",
    "kļūs",
    "kļūsi",
    "kļūsiet",
    "kļūsim",
    "kļūst",
    "kļūstam",
    "kļūstat",
    "kļūsti",
    "kļūstu",
    "kļūt",
    "kļūšu",
    "labad",
    "lai",
    "lejpus",
    "līdz",
    "līdzko",
    "ne",
    "nebūt",
    "nedz",
    "nekā",
    "nevis",
    "nezin",
    "no",
    "nu",
    "nē",
    "otrpus",
    "pa",
    "par",
    "pat",
    "pie",
    "pirms",
    "pret",
    "priekš",
    "pār",
    "pēc",
    "starp",
    "tad",
    "tak",
    "tapi",
    "taps",
    "tapsi",
    "tapsiet",
    "tapsim",
    "tapt",
    "tapāt",
    "tapšu",
    "taču",
    "te",
    "tiec",
    "tiek",
    "tiekam",
    "tiekat",
    "tieku",
    "tik",
    "tika",
    "tikai",
    "tiki",
    "tikko",
    "tiklab",
    "tiklīdz",
    "tiks",
    "tiksiet",
    "tiksim",
    "tikt",
    "tiku",
    "tikvien",
    "tikām",
    "tikāt",
    "tikšu",
    "tomēr",
    "topat",
    "turpretim",
    "turpretī",
    "tā",
    "tādēļ",
    "tālab",
    "tāpēc",
    "un",
    "uz",
    "vai",
    "var",
    "varat",
    "varēja",
    "varēji",
    "varēju",
    "varējām",
    "varējāt",
    "varēs",
    "varēsi",
    "varēsiet",
    "varēsim",
    "varēt",
    "varēšu",
    "vien",
    "virs",
    "virspus",
    "vis",
    "viņpus",
    "zem",
    "ārpus",
    "šaipus"
  ];
  const lit = [
    "abi",
    "abidvi",
    "abiejose",
    "abiejuose",
    "abiejø",
    "abiem",
    "abigaliai",
    "abipus",
    "abu",
    "abudu",
    "ai",
    "ana",
    "anaiptol",
    "anaisiais",
    "anajai",
    "anajam",
    "anajame",
    "anapus",
    "anas",
    "anasai",
    "anasis",
    "anei",
    "aniedvi",
    "anieji",
    "aniesiems",
    "anoji",
    "anojo",
    "anojoje",
    "anokia",
    "anoks",
    "anosiomis",
    "anosioms",
    "anosios",
    "anosiose",
    "anot",
    "ant",
    "antai",
    "anuodu",
    "anuoju",
    "anuosiuose",
    "anuosius",
    "anàja",
    "anàjà",
    "anàjá",
    "anàsias",
    "anøjø",
    "apie",
    "aplink",
    "ar",
    "arba",
    "argi",
    "arti",
    "aukðèiau",
    "að",
    "be",
    "bei",
    "beje",
    "bemaþ",
    "bent",
    "bet",
    "betgi",
    "beveik",
    "dar",
    "dargi",
    "daugmaþ",
    "deja",
    "dëka",
    "dël",
    "dëlei",
    "dëlto",
    "ech",
    "et",
    "gal",
    "galbût",
    "galgi",
    "gan",
    "gana",
    "gi",
    "greta",
    "idant",
    "iki",
    "ir",
    "irgi",
    "it",
    "itin",
    "ið",
    "iðilgai",
    "iðvis",
    "jaisiais",
    "jajai",
    "jajam",
    "jajame",
    "jei",
    "jeigu",
    "ji",
    "jiedu",
    "jiedvi",
    "jieji",
    "jiesiems",
    "jinai",
    "jis",
    "jisai",
    "jog",
    "joji",
    "jojo",
    "jojoje",
    "jokia",
    "joks",
    "josiomis",
    "josioms",
    "josios",
    "josiose",
    "judu",
    "judvi",
    "juk",
    "jumis",
    "jums",
    "jumyse",
    "juodu",
    "juoju",
    "juosiuose",
    "juosius",
    "jus",
    "jàja",
    "jàjà",
    "jàsias",
    "jájá",
    "jøjø",
    "jûs",
    "jûsiðkis",
    "jûsiðkë",
    "jûsø",
    "kad",
    "kada",
    "kadangi",
    "kai",
    "kaip",
    "kaipgi",
    "kas",
    "katra",
    "katras",
    "katriedvi",
    "katruodu",
    "kaþin",
    "kaþkas",
    "kaþkatra",
    "kaþkatras",
    "kaþkokia",
    "kaþkoks",
    "kaþkuri",
    "kaþkuris",
    "kiaurai",
    "kiek",
    "kiekvienas",
    "kieno",
    "kita",
    "kitas",
    "kitokia",
    "kitoks",
    "kodël",
    "kokia",
    "koks",
    "kol",
    "kolei",
    "kone",
    "kuomet",
    "kur",
    "kurgi",
    "kuri",
    "kuriedvi",
    "kuris",
    "kuriuodu",
    "lai",
    "lig",
    "ligi",
    "link",
    "lyg",
    "man",
    "manaisiais",
    "manajai",
    "manajam",
    "manajame",
    "manas",
    "manasai",
    "manasis",
    "mane",
    "manieji",
    "maniesiems",
    "manim",
    "manimi",
    "maniðkis",
    "maniðkë",
    "mano",
    "manoji",
    "manojo",
    "manojoje",
    "manosiomis",
    "manosioms",
    "manosios",
    "manosiose",
    "manuoju",
    "manuosiuose",
    "manuosius",
    "manyje",
    "manàja",
    "manàjà",
    "manàjá",
    "manàsias",
    "manæs",
    "manøjø",
    "mat",
    "maþdaug",
    "maþne",
    "mes",
    "mudu",
    "mudvi",
    "mumis",
    "mums",
    "mumyse",
    "mus",
    "mûsiðkis",
    "mûsiðkë",
    "mûsø",
    "na",
    "nagi",
    "ne",
    "nebe",
    "nebent",
    "negi",
    "negu",
    "nei",
    "nejau",
    "nejaugi",
    "nekaip",
    "nelyginant",
    "nes",
    "net",
    "netgi",
    "netoli",
    "neva",
    "nors",
    "nuo",
    "në",
    "o",
    "ogi",
    "oi",
    "paeiliui",
    "pagal",
    "pakeliui",
    "palaipsniui",
    "palei",
    "pas",
    "pasak",
    "paskos",
    "paskui",
    "paskum",
    "pat",
    "pati",
    "patiems",
    "paties",
    "pats",
    "patys",
    "patá",
    "paèiais",
    "paèiam",
    "paèiame",
    "paèiu",
    "paèiuose",
    "paèius",
    "paèiø",
    "per",
    "pernelyg",
    "pirm",
    "pirma",
    "pirmiau",
    "po",
    "prie",
    "prieð",
    "prieðais",
    "pro",
    "pusiau",
    "rasi",
    "rodos",
    "sau",
    "savaisiais",
    "savajai",
    "savajam",
    "savajame",
    "savas",
    "savasai",
    "savasis",
    "save",
    "savieji",
    "saviesiems",
    "savimi",
    "saviðkis",
    "saviðkë",
    "savo",
    "savoji",
    "savojo",
    "savojoje",
    "savosiomis",
    "savosioms",
    "savosios",
    "savosiose",
    "savuoju",
    "savuosiuose",
    "savuosius",
    "savyje",
    "savàja",
    "savàjà",
    "savàjá",
    "savàsias",
    "savæs",
    "savøjø",
    "skersai",
    "skradþiai",
    "staèiai",
    "su",
    "sulig",
    "ta",
    "tad",
    "tai",
    "taigi",
    "taip",
    "taipogi",
    "taisiais",
    "tajai",
    "tajam",
    "tajame",
    "tamsta",
    "tarp",
    "tarsi",
    "tartum",
    "tarytum",
    "tas",
    "tasai",
    "tau",
    "tavaisiais",
    "tavajai",
    "tavajam",
    "tavajame",
    "tavas",
    "tavasai",
    "tavasis",
    "tave",
    "tavieji",
    "taviesiems",
    "tavimi",
    "taviðkis",
    "taviðkë",
    "tavo",
    "tavoji",
    "tavojo",
    "tavojoje",
    "tavosiomis",
    "tavosioms",
    "tavosios",
    "tavosiose",
    "tavuoju",
    "tavuosiuose",
    "tavuosius",
    "tavyje",
    "tavàja",
    "tavàjà",
    "tavàjá",
    "tavàsias",
    "tavæs",
    "tavøjø",
    "taèiau",
    "te",
    "tegu",
    "tegul",
    "tiedvi",
    "tieji",
    "ties",
    "tiesiems",
    "tiesiog",
    "tik",
    "tikriausiai",
    "tiktai",
    "toji",
    "tojo",
    "tojoje",
    "tokia",
    "toks",
    "tol",
    "tolei",
    "toliau",
    "tosiomis",
    "tosioms",
    "tosios",
    "tosiose",
    "tu",
    "tuodu",
    "tuoju",
    "tuosiuose",
    "tuosius",
    "turbût",
    "tàja",
    "tàjà",
    "tàjá",
    "tàsias",
    "tøjø",
    "tûlas",
    "uþ",
    "uþtat",
    "uþvis",
    "va",
    "vai",
    "viduj",
    "vidury",
    "vien",
    "vienas",
    "vienokia",
    "vienoks",
    "vietoj",
    "virð",
    "virðuj",
    "virðum",
    "vis",
    "vis dëlto",
    "visa",
    "visas",
    "visgi",
    "visokia",
    "visoks",
    "vos",
    "vël",
    "vëlgi",
    "ypaè",
    "á",
    "ákypai",
    "ástriþai",
    "ðalia",
    "ðe",
    "ði",
    "ðiaisiais",
    "ðiajai",
    "ðiajam",
    "ðiajame",
    "ðiapus",
    "ðiedvi",
    "ðieji",
    "ðiesiems",
    "ðioji",
    "ðiojo",
    "ðiojoje",
    "ðiokia",
    "ðioks",
    "ðiosiomis",
    "ðiosioms",
    "ðiosios",
    "ðiosiose",
    "ðis",
    "ðisai",
    "ðit",
    "ðita",
    "ðitas",
    "ðitiedvi",
    "ðitokia",
    "ðitoks",
    "ðituodu",
    "ðiuodu",
    "ðiuoju",
    "ðiuosiuose",
    "ðiuosius",
    "ðiàja",
    "ðiàjà",
    "ðiàsias",
    "ðiøjø",
    "ðtai",
    "ðájá",
    "þemiau"
  ];
  const lgg = [
    "́",
    "̀",
    "nɨ",
    "mà",
    "rɨ",
    "dɨ",
    "ɨ",
    "́nɨ",
    "èrɨ",
    "́á'",
    "sɨ",
    "àzɨ",
    "yɨ",
    "rá",
    "vɨ",
    "nga",
    "be",
    "mɨ",
    "à",
    "dà",
    "kʉ",
    "bá",
    " ́lé",
    "má",
    "e",
    "yo",
    "̀yɨ",
    "ma",
    "kɨ",
    "àlʉ",
    "́mà",
    "rʉ́",
    "drɨ",
    "patí",
    "a",
    "è",
    "yó",
    "te",
    "̀á",
    "mà",
    "mâ",
    "dálé",
    "yí",
    "̌",
    "pɨ",
    "e'yó",
    "ndráa",
    "bo",
    "di",
    "drìá"
  ];
  const lggNd = [
    "ma",
    "ni",
    "ri",
    "eri",
    "di",
    "yi",
    "si",
    "ba",
    "nga",
    "i",
    "ra",
    "ku",
    "be",
    "yo",
    "da",
    "azini",
    "dria",
    "ru",
    "azi",
    "mu",
    "te",
    "ndra",
    "diyi",
    "ima",
    "mi",
    "alu",
    "nde",
    "alia",
    "le",
    "vile",
    "dri",
    "pati",
    "aria",
    "bo",
    "e'yo",
    "tu",
    "kini",
    "dii",
    "ama",
    "eyi",
    "dika",
    "pi",
    "e",
    "angu",
    "e'do",
    "pie",
    "ka",
    "ti",
    "o'du",
    "du"
  ];
  const msa = [
    "abdul",
    "abdullah",
    "acara",
    "ada",
    "adalah",
    "ahmad",
    "air",
    "akan",
    "akhbar",
    "akhir",
    "aktiviti",
    "alam",
    "amat",
    "amerika",
    "anak",
    "anggota",
    "antara",
    "antarabangsa",
    "apa",
    "apabila",
    "april",
    "as",
    "asas",
    "asean",
    "asia",
    "asing",
    "atas",
    "atau",
    "australia",
    "awal",
    "awam",
    "bagaimanapun",
    "bagi",
    "bahagian",
    "bahan",
    "baharu",
    "bahawa",
    "baik",
    "bandar",
    "bank",
    "banyak",
    "barangan",
    "baru",
    "baru-baru",
    "bawah",
    "beberapa",
    "bekas",
    "beliau",
    "belum",
    "berada",
    "berakhir",
    "berbanding",
    "berdasarkan",
    "berharap",
    "berikutan",
    "berjaya",
    "berjumlah",
    "berkaitan",
    "berkata",
    "berkenaan",
    "berlaku",
    "bermula",
    "bernama",
    "bernilai",
    "bersama",
    "berubah",
    "besar",
    "bhd",
    "bidang",
    "bilion",
    "bn",
    "boleh",
    "bukan",
    "bulan",
    "bursa",
    "cadangan",
    "china",
    "dagangan",
    "dalam",
    "dan",
    "dana",
    "dapat",
    "dari",
    "daripada",
    "dasar",
    "datang",
    "datuk",
    "demikian",
    "dengan",
    "depan",
    "derivatives",
    "dewan",
    "di",
    "diadakan",
    "dibuka",
    "dicatatkan",
    "dijangka",
    "diniagakan",
    "dis",
    "disember",
    "ditutup",
    "dolar",
    "dr",
    "dua",
    "dunia",
    "ekonomi",
    "eksekutif",
    "eksport",
    "empat",
    "enam",
    "faedah",
    "feb",
    "global",
    "hadapan",
    "hanya",
    "harga",
    "hari",
    "hasil",
    "hingga",
    "hubungan",
    "ia",
    "iaitu",
    "ialah",
    "indeks",
    "india",
    "indonesia",
    "industri",
    "ini",
    "islam",
    "isnin",
    "isu",
    "itu",
    "jabatan",
    "jalan",
    "jan",
    "jawatan",
    "jawatankuasa",
    "jepun",
    "jika",
    "jualan",
    "juga",
    "julai",
    "jumaat",
    "jumlah",
    "jun",
    "juta",
    "kadar",
    "kalangan",
    "kali",
    "kami",
    "kata",
    "katanya",
    "kaunter",
    "kawasan",
    "ke",
    "keadaan",
    "kecil",
    "kedua",
    "kedua-dua",
    "kedudukan",
    "kekal",
    "kementerian",
    "kemudahan",
    "kenaikan",
    "kenyataan",
    "kepada",
    "kepentingan",
    "keputusan",
    "kerajaan",
    "kerana",
    "kereta",
    "kerja",
    "kerjasama",
    "kes",
    "keselamatan",
    "keseluruhan",
    "kesihatan",
    "ketika",
    "ketua",
    "keuntungan",
    "kewangan",
    "khamis",
    "kini",
    "kira-kira",
    "kita",
    "klci",
    "klibor",
    "komposit",
    "kontrak",
    "kos",
    "kuala",
    "kuasa",
    "kukuh",
    "kumpulan",
    "lagi",
    "lain",
    "langkah",
    "laporan",
    "lebih",
    "lepas",
    "lima",
    "lot",
    "luar",
    "lumpur",
    "mac",
    "mahkamah",
    "mahu",
    "majlis",
    "makanan",
    "maklumat",
    "malam",
    "malaysia",
    "mana",
    "manakala",
    "masa",
    "masalah",
    "masih",
    "masing-masing",
    "masyarakat",
    "mata",
    "media",
    "mei",
    "melalui",
    "melihat",
    "memandangkan",
    "memastikan",
    "membantu",
    "membawa",
    "memberi",
    "memberikan",
    "membolehkan",
    "membuat",
    "mempunyai",
    "menambah",
    "menarik",
    "menawarkan",
    "mencapai",
    "mencatatkan",
    "mendapat",
    "mendapatkan",
    "menerima",
    "menerusi",
    "mengadakan",
    "mengambil",
    "mengenai",
    "menggalakkan",
    "menggunakan",
    "mengikut",
    "mengumumkan",
    "mengurangkan",
    "meningkat",
    "meningkatkan",
    "menjadi",
    "menjelang",
    "menokok",
    "menteri",
    "menunjukkan",
    "menurut",
    "menyaksikan",
    "menyediakan",
    "mereka",
    "merosot",
    "merupakan",
    "mesyuarat",
    "minat",
    "minggu",
    "minyak",
    "modal",
    "mohd",
    "mudah",
    "mungkin",
    "naik",
    "najib",
    "nasional",
    "negara",
    "negara-negara",
    "negeri",
    "niaga",
    "nilai",
    "nov",
    "ogos",
    "okt",
    "oleh",
    "operasi",
    "orang",
    "pada",
    "pagi",
    "paling",
    "pameran",
    "papan",
    "para",
    "paras",
    "parlimen",
    "parti",
    "pasaran",
    "pasukan",
    "pegawai",
    "pejabat",
    "pekerja",
    "pelabur",
    "pelaburan",
    "pelancongan",
    "pelanggan",
    "pelbagai",
    "peluang",
    "pembangunan",
    "pemberita",
    "pembinaan",
    "pemimpin",
    "pendapatan",
    "pendidikan",
    "penduduk",
    "penerbangan",
    "pengarah",
    "pengeluaran",
    "pengerusi",
    "pengguna",
    "pengurusan",
    "peniaga",
    "peningkatan",
    "penting",
    "peratus",
    "perdagangan",
    "perdana",
    "peringkat",
    "perjanjian",
    "perkara",
    "perkhidmatan",
    "perladangan",
    "perlu",
    "permintaan",
    "perniagaan",
    "persekutuan",
    "persidangan",
    "pertama",
    "pertubuhan",
    "pertumbuhan",
    "perusahaan",
    "peserta",
    "petang",
    "pihak",
    "pilihan",
    "pinjaman",
    "polis",
    "politik",
    "presiden",
    "prestasi",
    "produk",
    "program",
    "projek",
    "proses",
    "proton",
    "pukul",
    "pula",
    "pusat",
    "rabu",
    "rakan",
    "rakyat",
    "ramai",
    "rantau",
    "raya",
    "rendah",
    "ringgit",
    "rumah",
    "sabah",
    "sahaja",
    "saham",
    "sama",
    "sarawak",
    "satu",
    "sawit",
    "saya",
    "sdn",
    "sebagai",
    "sebahagian",
    "sebanyak",
    "sebarang",
    "sebelum",
    "sebelumnya",
    "sebuah",
    "secara",
    "sedang",
    "segi",
    "sehingga",
    "sejak",
    "sekarang",
    "sektor",
    "sekuriti",
    "selain",
    "selama",
    "selasa",
    "selatan",
    "selepas",
    "seluruh",
    "semakin",
    "semalam",
    "semasa",
    "sementara",
    "semua",
    "semula",
    "sen",
    "sendiri",
    "seorang",
    "sepanjang",
    "seperti",
    "sept",
    "september",
    "serantau",
    "seri",
    "serta",
    "sesi",
    "setiap",
    "setiausaha",
    "sidang",
    "singapura",
    "sini",
    "sistem",
    "sokongan",
    "sri",
    "sudah",
    "sukan",
    "suku",
    "sumber",
    "supaya",
    "susut",
    "syarikat",
    "syed",
    "tahap",
    "tahun",
    "tan",
    "tanah",
    "tanpa",
    "tawaran",
    "teknologi",
    "telah",
    "tempat",
    "tempatan",
    "tempoh",
    "tenaga",
    "tengah",
    "tentang",
    "terbaik",
    "terbang",
    "terbesar",
    "terbuka",
    "terdapat",
    "terhadap",
    "termasuk",
    "tersebut",
    "terus",
    "tetapi",
    "thailand",
    "tiada",
    "tidak",
    "tiga",
    "timbalan",
    "timur",
    "tindakan",
    "tinggi",
    "tun",
    "tunai",
    "turun",
    "turut",
    "umno",
    "unit",
    "untuk",
    "untung",
    "urus",
    "usaha",
    "utama",
    "walaupun",
    "wang",
    "wanita",
    "wilayah",
    "yang"
  ];
  const mar = [
    "अधिक",
    "अनेक",
    "अशी",
    "असलयाचे",
    "असलेल्या",
    "असा",
    "असून",
    "असे",
    "आज",
    "आणि",
    "आता",
    "आपल्या",
    "आला",
    "आली",
    "आले",
    "आहे",
    "आहेत",
    "एक",
    "एका",
    "कमी",
    "करणयात",
    "करून",
    "का",
    "काम",
    "काय",
    "काही",
    "किवा",
    "की",
    "केला",
    "केली",
    "केले",
    "कोटी",
    "गेल्या",
    "घेऊन",
    "जात",
    "झाला",
    "झाली",
    "झाले",
    "झालेल्या",
    "टा",
    "डॉ",
    "तर",
    "तरी",
    "तसेच",
    "ता",
    "ती",
    "तीन",
    "ते",
    "तो",
    "त्या",
    "त्याचा",
    "त्याची",
    "त्याच्या",
    "त्याना",
    "त्यानी",
    "त्यामुळे",
    "त्री",
    "दिली",
    "दोन",
    "न",
    "नाही",
    "निर्ण्य",
    "पण",
    "पम",
    "परयतन",
    "पाटील",
    "म",
    "मात्र",
    "माहिती",
    "मी",
    "मुबी",
    "म्हणजे",
    "म्हणाले",
    "म्हणून",
    "या",
    "याचा",
    "याची",
    "याच्या",
    "याना",
    "यानी",
    "येणार",
    "येत",
    "येथील",
    "येथे",
    "लाख",
    "व",
    "व्यकत",
    "सर्व",
    "सागित्ले",
    "सुरू",
    "हजार",
    "हा",
    "ही",
    "हे",
    "होणार",
    "होत",
    "होता",
    "होती",
    "होते"
  ];
  const mya = [
    "အပေါ်",
    "အနက်",
    "အမြဲတမ်း",
    "အတွင်းတွင်",
    "မကြာမီ",
    "မတိုင်မီ",
    "ဒါ့အပြင်",
    "အောက်မှာ",
    "အထဲမှာ",
    "ဘယ်တော့မျှ",
    "မကြာခဏ",
    "တော်တော်လေး",
    "စဉ်တွင်",
    "နှင့်အတူ",
    "နှင့်",
    "နှင့်တကွ",
    "ကျွန်တော်",
    "ကျွန်မ",
    "ငါ",
    "ကျုပ်",
    "ကျွနု်ပ်",
    "ကျနော်",
    "ကျမ",
    "သူ",
    "သူမ",
    "ထိုဟာ",
    "ထိုအရာ",
    "ဤအရာ",
    "ထို",
    "၄င်း",
    "ကျွန်တော်တို့",
    "ကျွန်မတို့",
    "ငါတို့",
    "ကျုပ်တို့",
    "ကျွနု်ပ်တို့",
    "ကျနော်တို့",
    "ကျမတို့",
    "သင်",
    "သင်တို့",
    "နင်တို့",
    "မင်း",
    "မင်းတို့",
    "သူတို့",
    "ကျွန်တော်အား",
    "ကျွန်တော်ကို",
    "ကျွန်မကို",
    "ငါကို",
    "ကျုပ်ကို",
    "ကျွနု်ပ်ကို",
    "သူ့ကို",
    "သူမကို",
    "ထိုအရာကို",
    "သင့်ကို",
    "သင်တို့ကို",
    "နင်တို့ကို",
    "မင်းကို",
    "မင်းတို့ကို",
    "ငါတို့ကို",
    "ကျုပ်တို့ကို",
    "ကျွနု်ပ်တို့ကို",
    "မိမိကိုယ်တိုင်",
    "မိမိဘာသာ",
    "မင်းကိုယ်တိုင်",
    "မင်းဘာသာ",
    "မင်းတို့ကိုယ်တိုင်",
    "မင်းတို့ဘာသာ",
    "သူကိုယ်တိုင်",
    "ကိုယ်တိုင်",
    "သူမကိုယ်တိုင်",
    "သူ့ဘာသာ",
    "သူ့ကိုယ်ကို",
    "ကိုယ့်ကိုယ်ကို",
    "မိမိကိုယ်ကို",
    "၄င်းပင်",
    "ထိုအရာပင်",
    "သည့်",
    "မည့်",
    "တဲ့",
    "ကျွနု်ပ်၏",
    "ကျွန်တော်၏",
    "ကျွန်မ၏",
    "ကျနော်၏",
    "ကျမ၏",
    "သူ၏",
    "သူမ၏",
    "ထိုအရာ၏",
    "ထိုဟာ၏",
    "ကျွနု်ပ်တို့၏",
    "ငါတို့၏",
    "ကျွန်တော်တို့၏",
    "ကျွန်မတို့၏",
    "ကျနော်တို့၏",
    "ကျမတို့၏",
    "သင်၏",
    "သင်တို့၏",
    "မင်း၏",
    "မင်းတို့၏",
    "သူတို့၏",
    "ကျွန်တော့်ဟာ",
    "ကျွန်မဟာ",
    "ကျနော်၏ဟာ",
    "ကျမ၏ဟာ",
    "ကျမဟာ",
    "ကျနော်ဟာ",
    "သူဟာ",
    "သူမဟာ",
    "သူ့ဟာ",
    "ကျွနု်ပ်တို့ဟာ",
    "ကျွန်တော်တို့ဟာ",
    "ကျွန်မတို့ဟာ",
    "သင်တို့ဟာ",
    "မင်းတို့ဟာ",
    "သူတို့ဟာ",
    "သူမတို့ဟာ",
    "ဤအရာ",
    "ဟောဒါ",
    "ဟောဒီ",
    "ဟောဒီဟာ",
    "ဒီဟာ",
    "ဒါ",
    "ထိုအရာ",
    "၄င်းအရာ",
    "ယင်းအရာ",
    "အဲဒါ",
    "ဟိုဟာ",
    "အချို့",
    "တစ်ခုခု",
    "အဘယ်မဆို",
    "ဘယ်အရာမဆို",
    "အဘယ်မည်သော",
    "အကြင်",
    "အရာရာတိုင်း",
    "စိုးစဉ်မျှ",
    "စိုးစဉ်းမျှ",
    "ဘယ်လောက်မဆို",
    "တစ်စုံတစ်ရာ",
    "တစုံတရာ",
    "အလျဉ်းမဟုတ်",
    "မည်သည့်နည်းနှင့်မျှမဟုတ်",
    "အလျဉ်းမရှိသော",
    "အခြားဖြစ်သော",
    "အခြားသော",
    "အခြားတစ်ခု",
    "အခြားတစ်ယောက်",
    "အားလုံး",
    "အရာရာတိုင်း",
    "အကုန်လုံး",
    "အလုံးစုံ",
    "အရာခပ်သိမ်း",
    "တစ်ခုစီ",
    "အသီးသီး",
    "တစ်ဦးဦး",
    "တစ်ခုခု",
    "ကိုယ်စီကိုယ်ငှ",
    "ကိုယ်စီ",
    "တစ်ဦးစီ",
    "တစ်ယောက်စီ",
    "တစ်ခုစီ",
    "အကုန်",
    "အပြည့်အစုံ",
    "လုံးလုံး",
    "နှစ်ခုလုံး",
    "နှစ်ယောက်လုံး",
    "နှစ်ဘက်လုံး",
    "တစ်စုံတစ်ရာ",
    "တစ်စုံတစ်ခု",
    "တစုံတခု",
    "တစ်စုံတစ်ယောက်",
    "တစုံတယောက်",
    "တစ်ယောက်ယောက်",
    "မည်သူမဆို",
    "ဘာမျှမရှိ",
    "ဘာမှမရှိ",
    "အဘယ်အရာမျှမရှိ",
    "လူတိုင်း",
    "လူတကာ",
    "နှင့်",
    "ပြီးလျှင်",
    "၄င်းနောက်",
    "သို့မဟုတ်",
    "သို့တည်းမဟုတ်",
    "သို့မဟုတ်လျှင်",
    "ဒါမှမဟုတ်",
    "ဖြစ်စေ",
    "သို့စေကာမူ",
    "ဒါပေမယ့်",
    "ဒါပေမဲ့",
    "မှတစ်ပါး",
    "မှလွဲလျှင်",
    "အဘယ်ကြောင့်ဆိုသော်",
    "သောကြောင့်",
    "သဖြင့်",
    "၍",
    "သည့်အတွက်ကြောင့်",
    "လျှင်",
    "ပါက",
    "အကယ်၍",
    "သော်ငြားလည်း",
    "စေကာမူ",
    "နည်းတူ",
    "ပေမယ့်",
    "ပေမဲ့",
    "ထိုနည်းတူစွာ",
    "ထိုနည်းတူ",
    "ကဲ့သို့",
    "သကဲ့သို့",
    "ယင်းကဲ့သို့",
    "ထိုကဲ့သို့",
    "နှင့်စပ်လျဉ်း၍",
    "ဤမျှ",
    "ဤမျှလောက်",
    "ဤကဲ့သို့",
    "အခုလောက်ထိ",
    "ဒါကတော့",
    "အဘယ်ကဲ့သလို့",
    "မည်ကဲ့သို့",
    "မည်သည့်နည်းနှင့်",
    "မည်သည့်နည်းဖြင့်",
    "မည်သည့်နည့်နှင့်မဆို",
    "မည်သည့်နည်းဖြင့်မဆို",
    "မည်သို့",
    "ဘယ်လိုလဲ",
    "သို့ပေတည့်",
    "သို့ပေမည့်",
    "ဘယ်နည်းနှင့်",
    "မည်ရွေ့မည်မျှ",
    "အဘယ်မျှလောက်",
    "ဘယ်လောက်",
    "မည်သူ",
    "ဘယ်သူ",
    "မည်သည့်အကြောင်းကြောင့်",
    "ဘာအတွက်ကြောင့်",
    "အဘယ်ကြောင့်",
    "မည်သည့်အတွက်ကြောင့်",
    "ဘာကြောင့်",
    "ဘာအတွက်နဲ့လဲ",
    "မည်သည်",
    "ဘာလဲ",
    "အဘယ်အရာနည်း",
    "မည်သည့်အရပ်မှာ",
    "ဘယ်နေရာတွင်",
    "မည်သည့်နေရာတွင်",
    "မည်သည့်နေရာသို့",
    "ဘယ်နေရာသို့",
    "ဘယ်နေရာမှာ",
    "ဘယ်သူ၏",
    "မည်သည့်အရာ၏",
    "မည်သည့်အခါ",
    "ဘယ်အချိန်",
    "ဘယ်အခါ",
    "မည်သည့်အချိန်",
    "ဘယ်တော့",
    "မည်သူကို",
    "မည်သူက",
    "ဘယ်သူ့ကို",
    "မည်သူမည်ဝါ",
    "မည်သည့်အရာ",
    "ဘယ်အရာ",
    "မည်သို့ပင်ဖြစ်စေ",
    "ဘယ်လိုပဲဖြစ်ဖြစ်",
    "မည်ရွေ့မည်မျှဖြစ်စေ",
    "မည်သည့်နည်းနှင့်မဆို",
    "ဘယ်နည်းနဲ့ဖြစ်ဖြစ်",
    "မည်သူမဆို",
    "ဘယ်သူမဆို",
    "အဘယ်သူမဆို",
    "မည်သည့်အရာမဆို",
    "ဘာဖြစ်ဖြစ်",
    "မည်သည့်အရာဖြစ်ဖြစ်",
    "မည်သည့်အရပ်၌မဆို",
    "မည်သည့်နေရာမဆို",
    "ဘယ်အခါမဆို",
    "ဘယ်အချိန်မဆို",
    "ဘယ်အခါဖြစ်ဖြစ်",
    "အချိန်အခါမရွေး"
  ];
  const nob = [
    "og",
    "i",
    "jeg",
    "det",
    "at",
    "en",
    "et",
    "den",
    "til",
    "er",
    "som",
    "på",
    "de",
    "med",
    "han",
    "av",
    "ikke",
    "der",
    "så",
    "var",
    "meg",
    "seg",
    "men",
    "ett",
    "har",
    "om",
    "vi",
    "min",
    "mitt",
    "ha",
    "hadde",
    "hun",
    "nå",
    "over",
    "da",
    "ved",
    "fra",
    "du",
    "ut",
    "sin",
    "dem",
    "oss",
    "opp",
    "man",
    "kan",
    "hans",
    "hvor",
    "eller",
    "hva",
    "skal",
    "selv",
    "sjøl",
    "her",
    "alle",
    "vil",
    "bli",
    "ble",
    "blitt",
    "kunne",
    "inn",
    "når",
    "kom",
    "noen",
    "noe",
    "ville",
    "dere",
    "som",
    "deres",
    "kun",
    "ja",
    "etter",
    "ned",
    "skulle",
    "denne",
    "for",
    "deg",
    "si",
    "sine",
    "sitt",
    "mot",
    "å",
    "meget",
    "hvorfor",
    "dette",
    "disse",
    "uten",
    "hvordan",
    "ingen",
    "din",
    "ditt",
    "blir",
    "samme",
    "hvilken",
    "hvilke",
    "sånn",
    "inni",
    "mellom",
    "vår",
    "hver",
    "hvem",
    "vors",
    "hvis",
    "både",
    "bare",
    "enn",
    "fordi",
    "før",
    "mange",
    "også",
    "slik",
    "vært",
    "være",
    "begge",
    "siden",
    "henne",
    "hennar",
    "hennes"
  ];
  const panGu = [
    "ਦੇ",
    "ਵਿੱਚ",
    "ਦਾ",
    "ਅਤੇ",
    "ਦੀ",
    "ਇੱਕ",
    "ਨੂੰ",
    "ਹੈ",
    "ਤੋਂ",
    "ਇਸ",
    "ਇਹ",
    "ਨੇ",
    "ਤੇ",
    "ਨਾਲ",
    "ਲਈ",
    "ਵੀ",
    "ਸੀ",
    "ਵਿਚ",
    "ਕਿ",
    "ਜੋ",
    "ਉਹ",
    "ਉਸ",
    "ਹਨ",
    "ਜਾਂਦਾ",
    "ਕੀਤਾ",
    "ਗਿਆ",
    "ਹੀ",
    "ਕੇ",
    "ਜਾਂ",
    "ਦੀਆਂ",
    "ਜਿਸ",
    "ਕਰਨ",
    "ਹੋ",
    "ਕਰ",
    "ਆਪਣੇ",
    "ਕੀਤੀ",
    "ਤੌਰ",
    "ਬਾਅਦ",
    "ਨਹੀਂ",
    "ਭਾਰਤੀ",
    "ਪਿੰਡ",
    "ਸਿੰਘ",
    "ਉੱਤੇ",
    "ਸਾਲ",
    "।",
    "ਪੰਜਾਬ",
    "ਸਭ",
    "ਭਾਰਤ",
    "ਉਨ੍ਹਾਂ",
    "ਹੁੰਦਾ",
    "ਤੱਕ",
    "ਇਕ",
    "ਹੋਇਆ",
    "ਜਨਮ",
    "ਬਹੁਤ",
    "ਪਰ",
    "ਦੁਆਰਾ",
    "ਰੂਪ",
    "ਹੋਰ",
    "ਕੰਮ",
    "ਆਪਣੀ",
    "ਤਾਂ",
    "ਸਮੇਂ",
    "ਪੰਜਾਬੀ",
    "ਗਈ",
    "ਦਿੱਤਾ",
    "ਦੋ",
    "ਕਿਸੇ",
    "ਕਈ",
    "ਜਾ",
    "ਵਾਲੇ",
    "ਸ਼ੁਰੂ",
    "ਉਸਨੇ",
    "ਕਿਹਾ",
    "ਹੋਣ",
    "ਲੋਕ",
    "ਜਾਂਦੀ",
    "ਵਿੱਚੋਂ",
    "ਨਾਮ",
    "ਜਦੋਂ",
    "ਪਹਿਲਾਂ",
    "ਕਰਦਾ",
    "ਹੁੰਦੀ",
    "ਹੋਏ",
    "ਸਨ",
    "ਵਜੋਂ",
    "ਰਾਜ",
    "ਮੁੱਖ",
    "ਕਰਦੇ",
    "ਕੁਝ",
    "ਸਾਰੇ",
    "ਹੁੰਦੇ",
    "ਸ਼ਹਿਰ",
    "ਭਾਸ਼ਾ",
    "ਹੋਈ",
    "ਅਨੁਸਾਰ",
    "ਸਕਦਾ",
    "ਆਮ",
    "ਵੱਖ",
    "ਕੋਈ",
    "ਵਾਰ",
    "ਗਏ",
    "ਖੇਤਰ",
    "ਜੀ",
    "ਕਾਰਨ",
    "ਕਰਕੇ",
    "ਜਿਵੇਂ",
    "ਜ਼ਿਲ੍ਹੇ",
    "ਲੋਕਾਂ",
    "ਚ",
    "ਸਾਹਿਤ",
    "ਸਦੀ",
    "ਬਾਰੇ",
    "ਜਾਂਦੇ",
    "ਵਾਲਾ",
    "ਜਾਣ",
    "ਪਹਿਲੀ",
    "ਪ੍ਰਾਪਤ",
    "ਰਿਹਾ",
    "ਵਾਲੀ",
    "ਨਾਂ",
    "ਦੌਰਾਨ",
    "ਤਰ੍ਹਾਂ",
    "ਯੂਨੀਵਰਸਿਟੀ",
    "ਨਾ",
    "ਏ",
    "ਤਿੰਨ",
    "ਇਨ੍ਹਾਂ",
    "ਗੁਰੂ",
    "ਇਸਨੂੰ",
    "ਇਹਨਾਂ",
    "ਪਿਤਾ",
    "ਲਿਆ",
    "ਸ਼ਾਮਲ",
    "ਸ਼ਬਦ",
    "ਅੰਗਰੇਜ਼ੀ",
    "ਉਸਨੂੰ",
    "ਉਹਨਾਂ",
    "ਸਥਿਤ",
    "ਫਿਰ",
    "ਜੀਵਨ",
    "ਸਕੂਲ",
    "ਹੁਣ",
    "ਦਿਨ",
    "ਕੀਤੇ",
    "ਆਦਿ",
    "ਵੱਧ",
    "ਲੈ",
    "ਘਰ",
    "ਵੱਲ",
    "ਦੇਸ਼",
    "ਵਲੋਂ",
    "ਬਣ",
    "ਵੀਂ",
    "ਫਿਲਮ",
    "ਉਮਰ",
    "ਬਲਾਕ",
    "ਰਹੇ",
    "ਸਾਹਿਬ",
    "ਕਰਦੀ",
    "ਹਰ",
    "ਪੈਦਾ",
    "ਘੱਟ",
    "ਲੇਖਕ",
    "ਹਿੱਸਾ",
    "ਫ਼ਿਲਮ",
    "ਮੌਤ",
    "ਜਿੱਥੇ",
    "ਵੱਡਾ",
    "ਵਿਖੇ",
    "ਆਪਣਾ",
    "ਪਹਿਲਾ",
    "ਵਰਤੋਂ",
    "ਆਪ",
    "ਕਰਨਾ",
    "ਵਿਆਹ",
    "ਰਹੀ",
    "ਰਾਹੀਂ",
    "ਦਿੱਤੀ",
    "ਉਸਦੇ",
    "ਪਰਿਵਾਰ",
    "ਆ",
    "ਦੂਜੇ",
    "ਅਮਰੀਕਾ",
    "ਮੰਨਿਆ",
    "ਇਸਦੇ",
    "ਈ",
    "ਕਾਲਜ",
    "ਸਰਕਾਰ",
    "ਇੱਥੇ",
    "ਪਾਕਿਸਤਾਨ",
    "ਸ਼ਾਮਿਲ",
    "ਵਿਗਿਆਨ",
    "ਉਸਦੀ",
    "ਪੇਸ਼",
    "ਕਿਉਂਕਿ",
    "ਪਹਿਲੇ",
    "ਧਰਮ",
    "ਮਸ਼ਹੂਰ",
    "ਅੰਦਰ",
    "ਵਿਚੋਂ",
    "ਜਿਨ੍ਹਾਂ",
    "ਜਾਣਿਆ",
    "ਪਾਣੀ",
    "ਇਲਾਵਾ",
    "ਅਰਥ",
    "ਚਾਰ",
    "ਪ੍ਰਸਿੱਧ",
    "ਨਾਵਲ",
    "ਵੱਡੇ",
    "ਵੱਲੋਂ",
    "ਕਹਾਣੀ",
    "ਵਿਸ਼ਵ",
    "ਮੂਲ",
    "ਅਮਰੀਕੀ",
    "ਸਥਾਨ",
    "ਇਤਿਹਾਸ",
    "ਕੁੱਝ",
    "ਵਿਕਾਸ",
    "ਉੱਤਰ",
    "ਸਿੱਖਿਆ",
    "ਹਿੰਦੀ",
    "ਪ੍ਰਮੁੱਖ",
    "ਰਚਨਾ",
    "ਬਣਾਇਆ",
    "ਵਿਸ਼ੇਸ਼",
    "ਡਾ",
    "ਉੱਪਰ",
    "ਪੱਛਮੀ",
    "ਦੇਣ",
    "ਇਸਦਾ",
    "ਸਕਦੇ",
    "ਰੱਖਿਆ",
    "ਕਵੀ",
    "ਦਿੱਲੀ",
    "ਵੱਡੀ",
    "ਭੂਮਿਕਾ",
    "ਸਮਾਜ",
    "ਕਾਵਿ",
    "ਕੀ",
    "ਕੋਲ",
    "ਦ",
    "ਗੱਲ",
    "ਸੰਸਾਰ",
    "ਭਾਗ",
    "ਆਈ",
    "ਦੱਖਣ",
    "ਅੱਜ",
    "ਸਿੱਖ",
    "ਕਹਿੰਦੇ",
    "ਸੰਗੀਤ",
    "ਕਿਲੋਮੀਟਰ",
    "ਜਿਹਨਾਂ",
    "ਸਭਾ",
    "ਜਿਸਦਾ",
    "ਜਨਵਰੀ",
    "ਕਵਿਤਾ",
    "ਮੈਂਬਰ",
    "ਲਿਖਿਆ",
    "ਮਾਂ",
    "ਕਲਾ",
    "ਪੰਜ",
    "ਥਾਂ",
    "ਹੇਠ",
    "ਜਿਆਦਾ",
    "ਵਰਤਿਆ",
    "ਮਾਰਚ",
    "ਡੀ",
    "ਅਕਤੂਬਰ",
    "ਤਕ",
    "ਨਾਟਕ",
    "ਬੀ",
    "ਖਾਸ",
    "ਇਸੇ",
    "ਆਧੁਨਿਕ",
    "ਅਗਸਤ",
    "ਤਿਆਰ",
    "ਮਾਤਾ",
    "ਬਣਾਉਣ",
    "ਨਵੰਬਰ",
    "ਵਿਅਕਤੀ",
    "ਦੱਖਣੀ",
    "ਦਸੰਬਰ",
    "ਆਫ",
    "ਗੀਤ",
    "ਗਿਣਤੀ",
    "ਕਾਲ",
    "ਖੋਜ",
    "ਸਾਲਾਂ",
    "ਪੂਰੀ",
    "ਸਮਾਂ",
    "ਜ਼ਿਆਦਾ",
    "ਇਸਦੀ",
    "ਸਕਦੀ",
    "ਵਿਚਕਾਰ",
    "ਰਾਜਧਾਨੀ",
    "ਉਸਦਾ",
    "ਜੁਲਾਈ",
    "ਜੂਨ",
    "ਅਧੀਨ",
    "ਸਥਾਪਨਾ",
    "ਸੇਵਾ",
    "ਭਾਵ",
    "ਵਰਗ",
    "ਛੋਟੇ",
    "ਦਿੰਦਾ",
    "ਸਮਾਜਿਕ",
    "ਹੁੰਦੀਆਂ",
    "ਟੀਮ",
    "ਔਰਤਾਂ",
    "ਅਕਸਰ",
    "ਪ੍ਰਕਾਸ਼ਿਤ",
    "ਉਰਦੂ",
    "ਰੰਗ",
    "ਪਾਰਟੀ",
    "ਬਣਾ",
    "ਪ੍ਰਭਾਵ",
    "ਸ਼ੁਰੂਆਤ",
    "ਲਗਭਗ",
    "ਮਈ",
    "ਸਿਰਫ",
    "ਨੇੜੇ",
    "ਜਿਸਨੂੰ",
    "ਹਾਲਾਂਕਿ",
    "ਦੂਰ",
    "ਸਤੰਬਰ",
    "ਕਿਤਾਬ",
    "ਕਦੇ",
    "ਉੱਤਰੀ",
    "ਪ੍ਰਕਾਰ",
    "ਇਸਨੇ",
    "ਪ੍ਰਦੇਸ਼",
    "ਅੱਗੇ",
    "ਸੰਯੁਕਤ",
    "ਪੜ੍ਹਾਈ",
    "ਵਧੇਰੇ",
    "ਨਾਲ਼",
    "ਮਨੁੱਖ",
    "ਬਾਕੀ",
    "ਪ੍ਰਧਾਨ",
    "ਦੂਜੀ",
    "ਕੁੱਲ",
    "ਆਫ਼",
    "ਅਧਿਐਨ",
    "ਰਾਸ਼ਟਰੀ",
    "ਪੁੱਤਰ",
    "ਅੰਤਰਰਾਸ਼ਟਰੀ",
    "ਧਰਤੀ",
    "ਕੇਂਦਰ",
    "ਦੇਸ਼ਾਂ",
    "ਮੱਧ",
    "ਜ਼ਿਲ੍ਹਾ",
    "ਸਾਰੀਆਂ",
    "ਪੱਧਰ",
    "ਹੋਵੇ",
    "ਜੇ",
    "ਭਾਈ",
    "ਰਹਿਣ",
    "ਪੁਰਸਕਾਰ",
    "ਸਭਿਆਚਾਰ",
    "ਪਤਾ",
    "ਪਾਸੇ",
    "ਨਵੇਂ",
    "ਕੰਪਨੀ",
    "ਬਾਹਰ",
    "ਵੇਲੇ",
    "ਸੰਨ",
    "ਪੂਰਬੀ",
    "ਵਿਚਾਰ",
    "ਕਾਰਜ",
    "ਪੀ",
    "ਮਹੱਤਵਪੂਰਨ",
    "ਦੁਨੀਆਂ",
    "ਧਾਰਮਿਕ",
    "ਮਨੁੱਖੀ",
    "ਸਮੂਹ",
    "ਅਜਿਹੇ",
    "ਲਾਲ",
    "ਦੂਜਾ",
    "ਭਰਾ",
    "ਸ੍ਰੀ",
    "ਅੰਤ",
    "ਜਾਂਦੀਆਂ",
    "ਸ਼ਾਹ",
    "ਰਹਿੰਦੇ",
    "ਮਹਾਨ",
    "ਚੀਨ",
    "ਮੀਟਰ",
    "ਵਰਗੇ",
    "ਨਾਲੋਂ",
    "ਹਾਸਲ",
    "ਕਿਸਮ",
    "ਅਜਿਹਾ",
    "ਬਣਿਆ",
    "ਭਰ",
    "ਛੱਡ",
    "ਲੈਣ",
    "ਹਿੱਸੇ",
    "ਟੀ",
    "ਲਿਖੇ",
    "ਮਿਲ",
    "ਮੌਜੂਦ",
    "ਦਿੱਤੇ",
    "ਵਾਸਤੇ",
    "ਵਾਲੀਆਂ",
    "ਵਧੀਆ",
    "ਰੂਸੀ",
    "ਜਾਰੀ",
    "ਸਰਕਾਰੀ",
    "ਡਿਗਰੀ",
    "ਪੱਛਮ",
    "ਲੜਾਈ",
    "ਭਾਸ਼ਾਵਾਂ",
    "ਰਾਜਾ",
    "ਜਲੰਧਰ",
    "ਹਿੰਦੂ",
    "ਔਰਤ",
    "ਜੰਗ",
    "ਬਾਬਾ",
    "ਬੱਚਿਆਂ",
    "ਮੰਤਰੀ",
    "ਪਟਿਆਲਾ",
    "ਵਾਂਗ",
    "ਆਉਣ",
    "ਭਾਵੇਂ",
    "ਕੇਵਲ",
    "ਐਸ",
    "ਪ੍ਰਾਚੀਨ",
    "ਰਹਿੰਦਾ",
    "ਬੋਲੀ",
    "ਅਵਾਰਡ",
    "ਨਗਰ",
    "ਖੇਡਾਂ",
    "ਫਿਲਮਾਂ",
    "ਬੱਚੇ",
    "ਕੌਰ",
    "ਤੋ",
    "ਪ੍ਰਤੀ",
    "ਕੁਆਂਟਮ",
    "ਅਬਾਦੀ",
    "ਪੁਸਤਕ",
    "ਐਮ",
    "ਰਾਮ",
    "ਖੇਤਰਾਂ",
    "ਫਰਵਰੀ",
    "ਕ੍ਰਿਕਟ",
    "ਪੈਂਦਾ",
    "ਇਤਿਹਾਸਕ",
    "ਲੱਗ",
    "ਬ੍ਰਿਟਿਸ਼",
    "ਆਇਆ",
    "ਮਿਲਦਾ"
  ];
  const fas = [
    "از",
    "با",
    "به",
    "برای",
    "و",
    "باید",
    "شاید",
    "اکنون",
    "اگر",
    "اگرچه",
    "الا",
    "اما",
    "اندر",
    "اینکه",
    "باری",
    "بالعکس",
    "بدون",
    "بر",
    "بلکه",
    "بنابراین",
    "بی",
    "پس",
    "تا",
    "جز",
    "چنانچه",
    "چه",
    "چون",
    "در",
    "را",
    "روی",
    "زیرا",
    "سپس",
    "غیر",
    "که",
    "لیکن",
    "مانند",
    "مثل",
    "مگر",
    "نه",
    "نیز",
    "هرچند",
    "هم",
    "همان",
    "وانگهی",
    "ولی",
    "ولو",
    "همانند",
    "همچو"
  ];
  const pol = [
    "a",
    "aby",
    "ach",
    "acz",
    "aczkolwiek",
    "aj",
    "albo",
    "ale",
    "ależ",
    "ani",
    "aż",
    "bardziej",
    "bardzo",
    "bo",
    "bowiem",
    "by",
    "byli",
    "bynajmniej",
    "być",
    "był",
    "była",
    "było",
    "były",
    "będzie",
    "będą",
    "cali",
    "cała",
    "cały",
    "ci",
    "cię",
    "ciebie",
    "co",
    "cokolwiek",
    "coś",
    "czasami",
    "czasem",
    "czemu",
    "czy",
    "czyli",
    "daleko",
    "dla",
    "dlaczego",
    "dlatego",
    "do",
    "dobrze",
    "dokąd",
    "dość",
    "dużo",
    "dwa",
    "dwaj",
    "dwie",
    "dwoje",
    "dziś",
    "dzisiaj",
    "gdy",
    "gdyby",
    "gdyż",
    "gdzie",
    "gdziekolwiek",
    "gdzieś",
    "i",
    "ich",
    "ile",
    "im",
    "inna",
    "inne",
    "inny",
    "innych",
    "iż",
    "ja",
    "ją",
    "jak",
    "jakaś",
    "jakby",
    "jaki",
    "jakichś",
    "jakie",
    "jakiś",
    "jakiż",
    "jakkolwiek",
    "jako",
    "jakoś",
    "je",
    "jeden",
    "jedna",
    "jedno",
    "jednak",
    "jednakże",
    "jego",
    "jej",
    "jemu",
    "jest",
    "jestem",
    "jeszcze",
    "jeśli",
    "jeżeli",
    "już",
    "ją",
    "każdy",
    "kiedy",
    "kilka",
    "kimś",
    "kto",
    "ktokolwiek",
    "ktoś",
    "która",
    "które",
    "którego",
    "której",
    "który",
    "których",
    "którym",
    "którzy",
    "ku",
    "lat",
    "lecz",
    "lub",
    "ma",
    "mają",
    "mało",
    "mam",
    "mi",
    "mimo",
    "między",
    "mną",
    "mnie",
    "mogą",
    "moi",
    "moim",
    "moja",
    "moje",
    "może",
    "możliwe",
    "można",
    "mój",
    "mu",
    "musi",
    "my",
    "na",
    "nad",
    "nam",
    "nami",
    "nas",
    "nasi",
    "nasz",
    "nasza",
    "nasze",
    "naszego",
    "naszych",
    "natomiast",
    "natychmiast",
    "nawet",
    "nią",
    "nic",
    "nich",
    "nie",
    "niech",
    "niego",
    "niej",
    "niemu",
    "nigdy",
    "nim",
    "nimi",
    "niż",
    "no",
    "o",
    "obok",
    "od",
    "około",
    "on",
    "ona",
    "one",
    "oni",
    "ono",
    "oraz",
    "oto",
    "owszem",
    "pan",
    "pana",
    "pani",
    "po",
    "pod",
    "podczas",
    "pomimo",
    "ponad",
    "ponieważ",
    "powinien",
    "powinna",
    "powinni",
    "powinno",
    "poza",
    "prawie",
    "przecież",
    "przed",
    "przede",
    "przedtem",
    "przez",
    "przy",
    "roku",
    "również",
    "sam",
    "sama",
    "są",
    "się",
    "skąd",
    "sobie",
    "sobą",
    "sposób",
    "swoje",
    "ta",
    "tak",
    "taka",
    "taki",
    "takie",
    "także",
    "tam",
    "te",
    "tego",
    "tej",
    "temu",
    "ten",
    "teraz",
    "też",
    "to",
    "tobą",
    "tobie",
    "toteż",
    "trzeba",
    "tu",
    "tutaj",
    "twoi",
    "twoim",
    "twoja",
    "twoje",
    "twym",
    "twój",
    "ty",
    "tych",
    "tylko",
    "tym",
    "u",
    "w",
    "wam",
    "wami",
    "was",
    "wasz",
    "zaś",
    "wasza",
    "wasze",
    "we",
    "według",
    "wiele",
    "wielu",
    "więc",
    "więcej",
    "tę",
    "wszyscy",
    "wszystkich",
    "wszystkie",
    "wszystkim",
    "wszystko",
    "wtedy",
    "wy",
    "właśnie",
    "z",
    "za",
    "zapewne",
    "zawsze",
    "ze",
    "zł",
    "znowu",
    "znów",
    "został",
    "żaden",
    "żadna",
    "żadne",
    "żadnych",
    "że",
    "żeby"
  ];
  const por = [
    "a",
    "à",
    "ao",
    "aos",
    "aquela",
    "aquelas",
    "aquele",
    "aqueles",
    "aquilo",
    "as",
    "às",
    "até",
    "com",
    "como",
    "da",
    "das",
    "de",
    "dela",
    "delas",
    "dele",
    "deles",
    "depois",
    "do",
    "dos",
    "e",
    "ela",
    "elas",
    "ele",
    "eles",
    "em",
    "entre",
    "essa",
    "essas",
    "esse",
    "esses",
    "esta",
    "estas",
    "este",
    "estes",
    "eu",
    "isso",
    "isto",
    "já",
    "lhe",
    "lhes",
    "mais",
    "mas",
    "me",
    "mesmo",
    "meu",
    "meus",
    "minha",
    "minhas",
    "muito",
    "muitos",
    "na",
    "não",
    "nas",
    "nem",
    "no",
    "nos",
    "nós",
    "nossa",
    "nossas",
    "nosso",
    "nossos",
    "num",
    "nuns",
    "numa",
    "numas",
    "o",
    "os",
    "ou",
    "para",
    "pela",
    "pelas",
    "pelo",
    "pelos",
    "por",
    "quais",
    "qual",
    "quando",
    "que",
    "quem",
    "se",
    "sem",
    "seu",
    "seus",
    "só",
    "sua",
    "suas",
    "também",
    "te",
    "teu",
    "teus",
    "tu",
    "tua",
    "tuas",
    "um",
    "uma",
    "umas",
    "você",
    "vocês",
    "vos",
    "vosso",
    "vossos"
  ];
  const porBr = [
    "a",
    "à",
    "adeus",
    "agora",
    "aí",
    "ainda",
    "além",
    "algo",
    "alguém",
    "algum",
    "alguma",
    "algumas",
    "alguns",
    "ali",
    "ampla",
    "amplas",
    "amplo",
    "amplos",
    "ano",
    "anos",
    "ante",
    "antes",
    "ao",
    "aos",
    "apenas",
    "apoio",
    "após",
    "aquela",
    "aquelas",
    "aquele",
    "aqueles",
    "aqui",
    "aquilo",
    "área",
    "as",
    "às",
    "assim",
    "até",
    "atrás",
    "através",
    "baixo",
    "bastante",
    "bem",
    "boa",
    "boas",
    "bom",
    "bons",
    "breve",
    "cá",
    "cada",
    "catorze",
    "cedo",
    "cento",
    "certamente",
    "certeza",
    "cima",
    "cinco",
    "coisa",
    "coisas",
    "com",
    "como",
    "conselho",
    "contra",
    "contudo",
    "custa",
    "da",
    "dá",
    "dão",
    "daquela",
    "daquelas",
    "daquele",
    "daqueles",
    "dar",
    "das",
    "de",
    "debaixo",
    "dela",
    "delas",
    "dele",
    "deles",
    "demais",
    "dentro",
    "depois",
    "desde",
    "dessa",
    "dessas",
    "desse",
    "desses",
    "desta",
    "destas",
    "deste",
    "destes",
    "deve",
    "devem",
    "devendo",
    "dever",
    "deverá",
    "deverão",
    "deveria",
    "deveriam",
    "devia",
    "deviam",
    "dez",
    "dezenove",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dia",
    "diante",
    "disse",
    "disso",
    "disto",
    "dito",
    "diz",
    "dizem",
    "dizer",
    "do",
    "dois",
    "dos",
    "doze",
    "duas",
    "dúvida",
    "e",
    "é",
    "ela",
    "elas",
    "ele",
    "eles",
    "em",
    "embora",
    "enquanto",
    "entre",
    "era",
    "eram",
    "éramos",
    "és",
    "essa",
    "essas",
    "esse",
    "esses",
    "esta",
    "está",
    "estamos",
    "estão",
    "estar",
    "estas",
    "estás",
    "estava",
    "estavam",
    "estávamos",
    "este",
    "esteja",
    "estejam",
    "estejamos",
    "estes",
    "esteve",
    "estive",
    "estivemos",
    "estiver",
    "estivera",
    "estiveram",
    "estivéramos",
    "estiverem",
    "estivermos",
    "estivesse",
    "estivessem",
    "estivéssemos",
    "estiveste",
    "estivestes",
    "estou",
    "etc",
    "eu",
    "exemplo",
    "faço",
    "falta",
    "favor",
    "faz",
    "fazeis",
    "fazem",
    "fazemos",
    "fazendo",
    "fazer",
    "fazes",
    "feita",
    "feitas",
    "feito",
    "feitos",
    "fez",
    "fim",
    "final",
    "foi",
    "fomos",
    "for",
    "fora",
    "foram",
    "fôramos",
    "forem",
    "forma",
    "formos",
    "fosse",
    "fossem",
    "fôssemos",
    "foste",
    "fostes",
    "fui",
    "geral",
    "grande",
    "grandes",
    "grupo",
    "há",
    "haja",
    "hajam",
    "hajamos",
    "hão",
    "havemos",
    "havia",
    "hei",
    "hoje",
    "hora",
    "horas",
    "houve",
    "houvemos",
    "houver",
    "houvera",
    "houverá",
    "houveram",
    "houvéramos",
    "houverão",
    "houverei",
    "houverem",
    "houveremos",
    "houveria",
    "houveriam",
    "houveríamos",
    "houvermos",
    "houvesse",
    "houvessem",
    "houvéssemos",
    "isso",
    "isto",
    "já",
    "la",
    "lá",
    "lado",
    "lhe",
    "lhes",
    "lo",
    "local",
    "logo",
    "longe",
    "lugar",
    "maior",
    "maioria",
    "mais",
    "mal",
    "mas",
    "máximo",
    "me",
    "meio",
    "menor",
    "menos",
    "mês",
    "meses",
    "mesma",
    "mesmas",
    "mesmo",
    "mesmos",
    "meu",
    "meus",
    "mil",
    "minha",
    "minhas",
    "momento",
    "muita",
    "muitas",
    "muito",
    "muitos",
    "na",
    "nada",
    "não",
    "naquela",
    "naquelas",
    "naquele",
    "naqueles",
    "nas",
    "nem",
    "nenhum",
    "nenhuma",
    "nessa",
    "nessas",
    "nesse",
    "nesses",
    "nesta",
    "nestas",
    "neste",
    "nestes",
    "ninguém",
    "nível",
    "no",
    "noite",
    "nome",
    "nos",
    "nós",
    "nossa",
    "nossas",
    "nosso",
    "nossos",
    "nova",
    "novas",
    "nove",
    "novo",
    "novos",
    "num",
    "numa",
    "número",
    "nunca",
    "o",
    "obra",
    "obrigada",
    "obrigado",
    "oitava",
    "oitavo",
    "oito",
    "onde",
    "ontem",
    "onze",
    "os",
    "ou",
    "outra",
    "outras",
    "outro",
    "outros",
    "para",
    "parece",
    "parte",
    "partir",
    "paucas",
    "pela",
    "pelas",
    "pelo",
    "pelos",
    "pequena",
    "pequenas",
    "pequeno",
    "pequenos",
    "per",
    "perante",
    "perto",
    "pode",
    "pude",
    "pôde",
    "podem",
    "podendo",
    "poder",
    "poderia",
    "poderiam",
    "podia",
    "podiam",
    "põe",
    "põem",
    "pois",
    "ponto",
    "pontos",
    "por",
    "porém",
    "porque",
    "porquê",
    "posição",
    "possível",
    "possivelmente",
    "posso",
    "pouca",
    "poucas",
    "pouco",
    "poucos",
    "primeira",
    "primeiras",
    "primeiro",
    "primeiros",
    "própria",
    "próprias",
    "próprio",
    "próprios",
    "próxima",
    "próximas",
    "próximo",
    "próximos",
    "pude",
    "puderam",
    "quais",
    "quáis",
    "qual",
    "quando",
    "quanto",
    "quantos",
    "quarta",
    "quarto",
    "quatro",
    "que",
    "quê",
    "quem",
    "quer",
    "quereis",
    "querem",
    "queremas",
    "queres",
    "quero",
    "questão",
    "quinta",
    "quinto",
    "quinze",
    "relação",
    "sabe",
    "sabem",
    "são",
    "se",
    "segunda",
    "segundo",
    "sei",
    "seis",
    "seja",
    "sejam",
    "sejamos",
    "sem",
    "sempre",
    "sendo",
    "ser",
    "será",
    "serão",
    "serei",
    "seremos",
    "seria",
    "seriam",
    "seríamos",
    "sete",
    "sétima",
    "sétimo",
    "seu",
    "seus",
    "sexta",
    "sexto",
    "si",
    "sido",
    "sim",
    "sistema",
    "só",
    "sob",
    "sobre",
    "sois",
    "somos",
    "sou",
    "sua",
    "suas",
    "tal",
    "talvez",
    "também",
    "tampouco",
    "tanta",
    "tantas",
    "tanto",
    "tão",
    "tarde",
    "te",
    "tem",
    "tém",
    "têm",
    "temos",
    "tendes",
    "tendo",
    "tenha",
    "tenham",
    "tenhamos",
    "tenho",
    "tens",
    "ter",
    "terá",
    "terão",
    "terceira",
    "terceiro",
    "terei",
    "teremos",
    "teria",
    "teriam",
    "teríamos",
    "teu",
    "teus",
    "teve",
    "ti",
    "tido",
    "tinha",
    "tinham",
    "tínhamos",
    "tive",
    "tivemos",
    "tiver",
    "tivera",
    "tiveram",
    "tivéramos",
    "tiverem",
    "tivermos",
    "tivesse",
    "tivessem",
    "tivéssemos",
    "tiveste",
    "tivestes",
    "toda",
    "todas",
    "todavia",
    "todo",
    "todos",
    "trabalho",
    "três",
    "treze",
    "tu",
    "tua",
    "tuas",
    "tudo",
    "última",
    "últimas",
    "último",
    "últimos",
    "um",
    "uma",
    "umas",
    "uns",
    "vai",
    "vais",
    "vão",
    "vários",
    "vem",
    "vêm",
    "vendo",
    "vens",
    "ver",
    "vez",
    "vezes",
    "viagem",
    "vindo",
    "vinte",
    "vir",
    "você",
    "vocês",
    "vos",
    "vós",
    "vossa",
    "vossas",
    "vosso",
    "vossos",
    "zero"
  ];
  const ron = [
    "acea",
    "aceasta",
    "această",
    "aceea",
    "acei",
    "aceia",
    "acel",
    "acela",
    "acele",
    "acelea",
    "acest",
    "acesta",
    "aceste",
    "acestea",
    "aceşti",
    "aceştia",
    "acolo",
    "acord",
    "acum",
    "ai",
    "aia",
    "aibă",
    "aici",
    "al",
    "ale",
    "alea",
    "altceva",
    "altcineva",
    "am",
    "ar",
    "are",
    "asemenea",
    "asta",
    "astea",
    "astăzi",
    "asupra",
    "au",
    "avea",
    "avem",
    "aveţi",
    "azi",
    "aş",
    "aşadar",
    "aţi",
    "bine",
    "bucur",
    "bună",
    "ca",
    "care",
    "caut",
    "ce",
    "cel",
    "ceva",
    "chiar",
    "cinci",
    "cine",
    "cineva",
    "contra",
    "cu",
    "cum",
    "cumva",
    "curând",
    "curînd",
    "când",
    "cât",
    "câte",
    "câtva",
    "câţi",
    "cînd",
    "cît",
    "cîte",
    "cîtva",
    "cîţi",
    "că",
    "căci",
    "cărei",
    "căror",
    "cărui",
    "către",
    "da",
    "dacă",
    "dar",
    "datorită",
    "dată",
    "dau",
    "de",
    "deci",
    "deja",
    "deoarece",
    "departe",
    "deşi",
    "din",
    "dinaintea",
    "dintr-",
    "dintre",
    "doi",
    "doilea",
    "două",
    "drept",
    "după",
    "dă",
    "ea",
    "ei",
    "el",
    "ele",
    "eram",
    "este",
    "eu",
    "eşti",
    "face",
    "fata",
    "fi",
    "fie",
    "fiecare",
    "fii",
    "fim",
    "fiu",
    "fiţi",
    "frumos",
    "fără",
    "graţie",
    "halbă",
    "iar",
    "ieri",
    "la",
    "le",
    "li",
    "lor",
    "lui",
    "lângă",
    "lîngă",
    "mai",
    "mea",
    "mei",
    "mele",
    "mereu",
    "meu",
    "mi",
    "mie",
    "mine",
    "mult",
    "multă",
    "mulţi",
    "mulţumesc",
    "mâine",
    "mîine",
    "mă",
    "ne",
    "nevoie",
    "nici",
    "nicăieri",
    "nimeni",
    "nimeri",
    "nimic",
    "nişte",
    "noastre",
    "noastră",
    "noi",
    "noroc",
    "nostru",
    "nouă",
    "noştri",
    "nu",
    "opt",
    "ori",
    "oricare",
    "orice",
    "oricine",
    "oricum",
    "oricând",
    "oricât",
    "oricînd",
    "oricît",
    "oriunde",
    "patra",
    "patru",
    "patrulea",
    "pe",
    "pentru",
    "peste",
    "pic",
    "poate",
    "pot",
    "prea",
    "prima",
    "primul",
    "prin",
    "printr-",
    "puţin",
    "puţina",
    "puţină",
    "până",
    "pînă",
    "rog",
    "sa",
    "sale",
    "sau",
    "se",
    "spate",
    "spre",
    "sub",
    "sunt",
    "suntem",
    "sunteţi",
    "sută",
    "sînt",
    "sîntem",
    "sînteţi",
    "să",
    "săi",
    "său",
    "ta",
    "tale",
    "te",
    "timp",
    "tine",
    "toate",
    "toată",
    "tot",
    "totuşi",
    "toţi",
    "trei",
    "treia",
    "treilea",
    "tu",
    "tăi",
    "tău",
    "un",
    "una",
    "unde",
    "undeva",
    "unei",
    "uneia",
    "unele",
    "uneori",
    "unii",
    "unor",
    "unora",
    "unu",
    "unui",
    "unuia",
    "unul",
    "vi",
    "voastre",
    "voastră",
    "voi",
    "vostru",
    "vouă",
    "voştri",
    "vreme",
    "vreo",
    "vreun",
    "vă",
    "zece",
    "zero",
    "zi",
    "zice",
    "îi",
    "îl",
    "îmi",
    "împotriva",
    "în",
    "înainte",
    "înaintea",
    "încotro",
    "încât",
    "încît",
    "între",
    "întrucât",
    "întrucît",
    "îţi",
    "ăla",
    "ălea",
    "ăsta",
    "ăstea",
    "ăştia",
    "şapte",
    "şase",
    "şi",
    "ştiu",
    "ţi",
    "ţie"
  ];
  const rus = [
    "и",
    "в",
    "во",
    "не",
    "что",
    "он",
    "на",
    "я",
    "с",
    "со",
    "как",
    "а",
    "то",
    "все",
    "она",
    "так",
    "его",
    "но",
    "да",
    "ты",
    "к",
    "у",
    "же",
    "вы",
    "за",
    "бы",
    "по",
    "только",
    "ее",
    "мне",
    "было",
    "вот",
    "от",
    "меня",
    "еще",
    "нет",
    "о",
    "из",
    "ему",
    "теперь",
    "когда",
    "даже",
    "ну",
    "ли",
    "если",
    "уже",
    "или",
    "ни",
    "быть",
    "был",
    "него",
    "до",
    "вас",
    "нибудь",
    "уж",
    "вам",
    "сказал",
    "ведь",
    "там",
    "потом",
    "себя",
    "ничего",
    "ей",
    "может",
    "они",
    "тут",
    "где",
    "есть",
    "надо",
    "ней",
    "для",
    "мы",
    "тебя",
    "их",
    "чем",
    "была",
    "сам",
    "чтоб",
    "без",
    "будто",
    "чего",
    "раз",
    "тоже",
    "себе",
    "под",
    "будет",
    "ж",
    "тогда",
    "кто",
    "этот",
    "того",
    "потому",
    "этого",
    "какой",
    "совсем",
    "ним",
    "этом",
    "почти",
    "мой",
    "тем",
    "чтобы",
    "нее",
    "были",
    "куда",
    "всех",
    "никогда",
    "сегодня",
    "можно",
    "при",
    "об",
    "другой",
    "хоть",
    "после",
    "над",
    "больше",
    "тот",
    "через",
    "эти",
    "нас",
    "про",
    "всего",
    "них",
    "какая",
    "много",
    "разве",
    "эту",
    "моя",
    "свою",
    "этой",
    "перед",
    "иногда",
    "лучше",
    "чуть",
    "том",
    "нельзя",
    "такой",
    "им",
    "более",
    "всегда",
    "конечно",
    "всю",
    "между",
    "это",
    "лишь"
  ];
  const slk = [
    "a",
    "aby",
    "aj",
    "ako",
    "aký",
    "ale",
    "alebo",
    "ani",
    "avšak",
    "ba",
    "bez",
    "buï",
    "cez",
    "do",
    "ho",
    "hoci",
    "i",
    "ich",
    "im",
    "ja",
    "jeho",
    "jej",
    "jemu",
    "ju",
    "k",
    "kam",
    "kde",
    "kedže",
    "keï",
    "kto",
    "ktorý",
    "ku",
    "lebo",
    "ma",
    "mi",
    "mne",
    "mnou",
    "mu",
    "my",
    "mòa",
    "môj",
    "na",
    "nad",
    "nami",
    "neho",
    "nej",
    "nemu",
    "nich",
    "nielen",
    "nim",
    "no",
    "nám",
    "nás",
    "náš",
    "ním",
    "o",
    "od",
    "on",
    "ona",
    "oni",
    "ono",
    "ony",
    "po",
    "pod",
    "pre",
    "pred",
    "pri",
    "s",
    "sa",
    "seba",
    "sem",
    "so",
    "svoj",
    "taký",
    "tam",
    "teba",
    "tebe",
    "tebou",
    "tej",
    "ten",
    "ti",
    "tie",
    "to",
    "toho",
    "tomu",
    "tou",
    "tvoj",
    "ty",
    "tá",
    "tým",
    "v",
    "vami",
    "veï",
    "vo",
    "vy",
    "vám",
    "vás",
    "váš",
    "však",
    "z",
    "za",
    "zo",
    "a",
    "èi",
    "èo",
    "èí",
    "òom",
    "òou",
    "òu",
    "že"
  ];
  const slv = [
    "a",
    "ali",
    "april",
    "avgust",
    "b",
    "bi",
    "bil",
    "bila",
    "bile",
    "bili",
    "bilo",
    "biti",
    "blizu",
    "bo",
    "bodo",
    "bojo",
    "bolj",
    "bom",
    "bomo",
    "boste",
    "bova",
    "boš",
    "brez",
    "c",
    "cel",
    "cela",
    "celi",
    "celo",
    "d",
    "da",
    "daleč",
    "dan",
    "danes",
    "datum",
    "december",
    "deset",
    "deseta",
    "deseti",
    "deseto",
    "devet",
    "deveta",
    "deveti",
    "deveto",
    "do",
    "dober",
    "dobra",
    "dobri",
    "dobro",
    "dokler",
    "dol",
    "dolg",
    "dolga",
    "dolgi",
    "dovolj",
    "drug",
    "druga",
    "drugi",
    "drugo",
    "dva",
    "dve",
    "e",
    "eden",
    "en",
    "ena",
    "ene",
    "eni",
    "enkrat",
    "eno",
    "etc.",
    "f",
    "februar",
    "g",
    "g.",
    "ga",
    "ga.",
    "gor",
    "gospa",
    "gospod",
    "h",
    "halo",
    "i",
    "idr.",
    "ii",
    "iii",
    "in",
    "iv",
    "ix",
    "iz",
    "j",
    "januar",
    "jaz",
    "je",
    "ji",
    "jih",
    "jim",
    "jo",
    "julij",
    "junij",
    "jutri",
    "k",
    "kadarkoli",
    "kaj",
    "kajti",
    "kako",
    "kakor",
    "kamor",
    "kamorkoli",
    "kar",
    "karkoli",
    "katerikoli",
    "kdaj",
    "kdo",
    "kdorkoli",
    "ker",
    "ki",
    "kje",
    "kjer",
    "kjerkoli",
    "ko",
    "koder",
    "koderkoli",
    "koga",
    "komu",
    "kot",
    "kratek",
    "kratka",
    "kratke",
    "kratki",
    "l",
    "lahka",
    "lahke",
    "lahki",
    "lahko",
    "le",
    "lep",
    "lepa",
    "lepe",
    "lepi",
    "lepo",
    "leto",
    "m",
    "maj",
    "majhen",
    "majhna",
    "majhni",
    "malce",
    "malo",
    "manj",
    "marec",
    "me",
    "med",
    "medtem",
    "mene",
    "mesec",
    "mi",
    "midva",
    "midve",
    "mnogo",
    "moj",
    "moja",
    "moje",
    "mora",
    "morajo",
    "moram",
    "moramo",
    "morate",
    "moraš",
    "morem",
    "mu",
    "n",
    "na",
    "nad",
    "naj",
    "najina",
    "najino",
    "najmanj",
    "naju",
    "največ",
    "nam",
    "narobe",
    "nas",
    "nato",
    "nazaj",
    "naš",
    "naša",
    "naše",
    "ne",
    "nedavno",
    "nedelja",
    "nek",
    "neka",
    "nekaj",
    "nekatere",
    "nekateri",
    "nekatero",
    "nekdo",
    "neke",
    "nekega",
    "neki",
    "nekje",
    "neko",
    "nekoga",
    "nekoč",
    "ni",
    "nikamor",
    "nikdar",
    "nikjer",
    "nikoli",
    "nič",
    "nje",
    "njega",
    "njegov",
    "njegova",
    "njegovo",
    "njej",
    "njemu",
    "njen",
    "njena",
    "njeno",
    "nji",
    "njih",
    "njihov",
    "njihova",
    "njihovo",
    "njiju",
    "njim",
    "njo",
    "njun",
    "njuna",
    "njuno",
    "no",
    "nocoj",
    "november",
    "npr.",
    "o",
    "ob",
    "oba",
    "obe",
    "oboje",
    "od",
    "odprt",
    "odprta",
    "odprti",
    "okoli",
    "oktober",
    "on",
    "onadva",
    "one",
    "oni",
    "onidve",
    "osem",
    "osma",
    "osmi",
    "osmo",
    "oz.",
    "p",
    "pa",
    "pet",
    "peta",
    "petek",
    "peti",
    "peto",
    "po",
    "pod",
    "pogosto",
    "poleg",
    "poln",
    "polna",
    "polni",
    "polno",
    "ponavadi",
    "ponedeljek",
    "ponovno",
    "potem",
    "povsod",
    "pozdravljen",
    "pozdravljeni",
    "prav",
    "prava",
    "prave",
    "pravi",
    "pravo",
    "prazen",
    "prazna",
    "prazno",
    "prbl.",
    "precej",
    "pred",
    "prej",
    "preko",
    "pri",
    "pribl.",
    "približno",
    "primer",
    "pripravljen",
    "pripravljena",
    "pripravljeni",
    "proti",
    "prva",
    "prvi",
    "prvo",
    "r",
    "ravno",
    "redko",
    "res",
    "reč",
    "s",
    "saj",
    "sam",
    "sama",
    "same",
    "sami",
    "samo",
    "se",
    "sebe",
    "sebi",
    "sedaj",
    "sedem",
    "sedma",
    "sedmi",
    "sedmo",
    "sem",
    "september",
    "seveda",
    "si",
    "sicer",
    "skoraj",
    "skozi",
    "slab",
    "smo",
    "so",
    "sobota",
    "spet",
    "sreda",
    "srednja",
    "srednji",
    "sta",
    "ste",
    "stran",
    "stvar",
    "sva",
    "t",
    "ta",
    "tak",
    "taka",
    "take",
    "taki",
    "tako",
    "takoj",
    "tam",
    "te",
    "tebe",
    "tebi",
    "tega",
    "težak",
    "težka",
    "težki",
    "težko",
    "ti",
    "tista",
    "tiste",
    "tisti",
    "tisto",
    "tj.",
    "tja",
    "to",
    "toda",
    "torek",
    "tretja",
    "tretje",
    "tretji",
    "tri",
    "tu",
    "tudi",
    "tukaj",
    "tvoj",
    "tvoja",
    "tvoje",
    "u",
    "v",
    "vaju",
    "vam",
    "vas",
    "vaš",
    "vaša",
    "vaše",
    "ve",
    "vedno",
    "velik",
    "velika",
    "veliki",
    "veliko",
    "vendar",
    "ves",
    "več",
    "vi",
    "vidva",
    "vii",
    "viii",
    "visok",
    "visoka",
    "visoke",
    "visoki",
    "vsa",
    "vsaj",
    "vsak",
    "vsaka",
    "vsakdo",
    "vsake",
    "vsaki",
    "vsakomur",
    "vse",
    "vsega",
    "vsi",
    "vso",
    "včasih",
    "včeraj",
    "x",
    "z",
    "za",
    "zadaj",
    "zadnji",
    "zakaj",
    "zaprta",
    "zaprti",
    "zaprto",
    "zdaj",
    "zelo",
    "zunaj",
    "č",
    "če",
    "često",
    "četrta",
    "četrtek",
    "četrti",
    "četrto",
    "čez",
    "čigav",
    "š",
    "šest",
    "šesta",
    "šesti",
    "šesto",
    "štiri",
    "ž",
    "že"
  ];
  const som = [
    "oo",
    "atabo",
    "ay",
    "ku",
    "waxeey",
    "uu",
    "lakin",
    "si",
    "ayuu",
    "soo",
    "waa",
    "ka",
    "kasoo",
    "kale",
    "waxuu",
    "ayee",
    "ayaa",
    "kuu",
    "isku",
    "ugu",
    "jiray",
    "dhan",
    "dambeestii",
    "inuu",
    "in",
    "jirtay",
    "uheestay",
    "aad",
    "uga",
    "hadana",
    "timaado",
    "timaaday"
  ];
  const sot = [
    "a",
    "le",
    "o",
    "ba",
    "ho",
    "oa",
    "ea",
    "ka",
    "hae",
    "tselane",
    "eaba",
    "ke",
    "hore",
    "ha",
    "e",
    "ne",
    "re",
    "bona",
    "me",
    "limo",
    "tsa",
    "haholo",
    "la",
    "empa",
    "ngoanake",
    "se",
    "moo",
    "m'e",
    "bane",
    "mo",
    "tse",
    "sa",
    "li",
    "ena",
    "bina",
    "pina",
    "hape"
  ];
  const spa = [
    "a",
    "un",
    "el",
    "ella",
    "y",
    "sobre",
    "de",
    "la",
    "que",
    "en",
    "los",
    "del",
    "se",
    "las",
    "por",
    "un",
    "para",
    "con",
    "no",
    "una",
    "su",
    "al",
    "lo",
    "como",
    "más",
    "pero",
    "sus",
    "le",
    "ya",
    "o",
    "porque",
    "cuando",
    "muy",
    "sin",
    "sobre",
    "también",
    "me",
    "hasta",
    "donde",
    "quien",
    "desde",
    "nos",
    "durante",
    "uno",
    "ni",
    "contra",
    "ese",
    "eso",
    "mí",
    "qué",
    "otro",
    "él",
    "cual",
    "poco",
    "mi",
    "tú",
    "te",
    "ti",
    "sí"
  ];
  const swa = [
    "na",
    "ya",
    "wa",
    "kwa",
    "ni",
    "za",
    "katika",
    "la",
    "kuwa",
    "kama",
    "kwamba",
    "cha",
    "hiyo",
    "lakini",
    "yake",
    "hata",
    "wakati",
    "hivyo",
    "sasa",
    "wake",
    "au",
    "watu",
    "hii",
    "zaidi",
    "vya",
    "huo",
    "tu",
    "kwenye",
    "si",
    "pia",
    "ili",
    "moja",
    "kila",
    "baada",
    "ambao",
    "ambayo",
    "yao",
    "wao",
    "kuna",
    "hilo",
    "kutoka",
    "kubwa",
    "pamoja",
    "bila",
    "huu",
    "hayo",
    "sana",
    "ndani",
    "mkuu",
    "hizo",
    "kufanya",
    "wengi",
    "hadi",
    "mmoja",
    "hili",
    "juu",
    "kwanza",
    "wetu",
    "kuhusu",
    "baadhi",
    "wote",
    "yetu",
    "hivi",
    "kweli",
    "mara",
    "wengine",
    "nini",
    "ndiyo",
    "zao",
    "kati",
    "hao",
    "hapa",
    "kutokana",
    "muda",
    "habari",
    "ambaye",
    "wenye",
    "nyingine",
    "hakuna",
    "tena",
    "hatua",
    "bado",
    "nafasi",
    "basi",
    "kabisa",
    "hicho",
    "nje",
    "huyo",
    "vile",
    "yote",
    "mkubwa",
    "alikuwa",
    "zote",
    "leo",
    "haya",
    "huko",
    "kutoa",
    "mwa",
    "kiasi",
    "hasa",
    "nyingi",
    "kabla",
    "wale",
    "chini",
    "gani",
    "hapo",
    "lazima",
    "mwingine",
    "bali",
    "huku",
    "zake",
    "ilikuwa",
    "tofauti",
    "kupata",
    "mbalimbali",
    "pale",
    "kusema",
    "badala",
    "wazi",
    "yeye",
    "alisema",
    "hawa",
    "ndio",
    "hizi",
    "tayari",
    "wala",
    "muhimu",
    "ile",
    "mpya",
    "ambazo",
    "dhidi",
    "kwenda",
    "sisi",
    "kwani",
    "jinsi",
    "binafsi",
    "kutumia",
    "mbili",
    "mbali",
    "kuu",
    "mengine",
    "mbele",
    "namna",
    "mengi",
    "upande"
  ];
  const swe = [
    "aderton",
    "adertonde",
    "adjö",
    "aldrig",
    "alla",
    "allas",
    "allt",
    "alltid",
    "alltså",
    "andra",
    "andras",
    "annan",
    "annat",
    "artonde",
    "artonn",
    "att",
    "av",
    "bakom",
    "bara",
    "behöva",
    "behövas",
    "behövde",
    "behövt",
    "beslut",
    "beslutat",
    "beslutit",
    "bland",
    "blev",
    "bli",
    "blir",
    "blivit",
    "bort",
    "borta",
    "bra",
    "bäst",
    "bättre",
    "båda",
    "bådas",
    "dag",
    "dagar",
    "dagarna",
    "dagen",
    "de",
    "del",
    "delen",
    "dem",
    "den",
    "denna",
    "deras",
    "dess",
    "dessa",
    "det",
    "detta",
    "dig",
    "din",
    "dina",
    "dit",
    "ditt",
    "dock",
    "dom",
    "du",
    "där",
    "därför",
    "då",
    "e",
    "efter",
    "eftersom",
    "ej",
    "elfte",
    "eller",
    "elva",
    "emot",
    "en",
    "enkel",
    "enkelt",
    "enkla",
    "enligt",
    "ens",
    "er",
    "era",
    "ers",
    "ert",
    "ett",
    "ettusen",
    "fanns",
    "fem",
    "femte",
    "femtio",
    "femtionde",
    "femton",
    "femtonde",
    "fick",
    "fin",
    "finnas",
    "finns",
    "fjorton",
    "fjortonde",
    "fjärde",
    "fler",
    "flera",
    "flesta",
    "fram",
    "framför",
    "från",
    "fyra",
    "fyrtio",
    "fyrtionde",
    "få",
    "får",
    "fått",
    "följande",
    "för",
    "före",
    "förlåt",
    "förra",
    "första",
    "genast",
    "genom",
    "gick",
    "gjorde",
    "gjort",
    "god",
    "goda",
    "godare",
    "godast",
    "gott",
    "gälla",
    "gäller",
    "gällt",
    "gärna",
    "gå",
    "går",
    "gått",
    "gör",
    "göra",
    "ha",
    "hade",
    "haft",
    "han",
    "hans",
    "har",
    "heller",
    "hellre",
    "helst",
    "helt",
    "henne",
    "hennes",
    "hit",
    "hon",
    "honom",
    "hundra",
    "hundraen",
    "hundraett",
    "hur",
    "här",
    "hög",
    "höger",
    "högre",
    "högst",
    "i",
    "ibland",
    "icke",
    "idag",
    "igen",
    "igår",
    "imorgon",
    "in",
    "inför",
    "inga",
    "ingen",
    "ingenting",
    "inget",
    "innan",
    "inne",
    "inom",
    "inte",
    "inuti",
    "ja",
    "jag",
    "jo",
    "ju",
    "just",
    "jämfört",
    "kan",
    "kanske",
    "knappast",
    "kom",
    "komma",
    "kommer",
    "kommit",
    "kr",
    "kunde",
    "kunna",
    "kunnat",
    "kvar",
    "legat",
    "ligga",
    "ligger",
    "lika",
    "likställd",
    "likställda",
    "lilla",
    "lite",
    "liten",
    "litet",
    "länge",
    "längre",
    "längst",
    "lätt",
    "lättare",
    "lättast",
    "långsam",
    "långsammare",
    "långsammast",
    "långsamt",
    "långt",
    "låt",
    "man",
    "med",
    "mej",
    "mellan",
    "men",
    "mer",
    "mera",
    "mest",
    "mig",
    "min",
    "mina",
    "mindre",
    "minst",
    "mitt",
    "mittemot",
    "mot",
    "mycket",
    "många",
    "måste",
    "möjlig",
    "möjligen",
    "möjligt",
    "möjligtvis",
    "ned",
    "nederst",
    "nedersta",
    "nedre",
    "nej",
    "ner",
    "ni",
    "nio",
    "nionde",
    "nittio",
    "nittionde",
    "nitton",
    "nittonde",
    "nog",
    "noll",
    "nr",
    "nu",
    "nummer",
    "när",
    "nästa",
    "någon",
    "någonting",
    "något",
    "några",
    "nån",
    "nånting",
    "nåt",
    "nödvändig",
    "nödvändiga",
    "nödvändigt",
    "nödvändigtvis",
    "och",
    "också",
    "ofta",
    "oftast",
    "olika",
    "olikt",
    "om",
    "oss",
    "på",
    "rakt",
    "redan",
    "rätt",
    "sa",
    "sade",
    "sagt",
    "samma",
    "sedan",
    "senare",
    "senast",
    "sent",
    "sex",
    "sextio",
    "sextionde",
    "sexton",
    "sextonde",
    "sig",
    "sin",
    "sina",
    "sist",
    "sista",
    "siste",
    "sitt",
    "sitta",
    "sju",
    "sjunde",
    "sjuttio",
    "sjuttionde",
    "sjutton",
    "sjuttonde",
    "själv",
    "sjätte",
    "ska",
    "skall",
    "skulle",
    "slutligen",
    "små",
    "smått",
    "snart",
    "som",
    "stor",
    "stora",
    "stort",
    "större",
    "störst",
    "säga",
    "säger",
    "sämre",
    "sämst",
    "så",
    "sådan",
    "sådana",
    "sådant",
    "ta",
    "tack",
    "tar",
    "tidig",
    "tidigare",
    "tidigast",
    "tidigt",
    "till",
    "tills",
    "tillsammans",
    "tio",
    "tionde",
    "tjugo",
    "tjugoen",
    "tjugoett",
    "tjugonde",
    "tjugotre",
    "tjugotvå",
    "tjungo",
    "tolfte",
    "tolv",
    "tre",
    "tredje",
    "trettio",
    "trettionde",
    "tretton",
    "trettonde",
    "två",
    "tvåhundra",
    "under",
    "upp",
    "ur",
    "ursäkt",
    "ut",
    "utan",
    "utanför",
    "ute",
    "va",
    "vad",
    "var",
    "vara",
    "varför",
    "varifrån",
    "varit",
    "varje",
    "varken",
    "vars",
    "varsågod",
    "vart",
    "vem",
    "vems",
    "verkligen",
    "vi",
    "vid",
    "vidare",
    "viktig",
    "viktigare",
    "viktigast",
    "viktigt",
    "vilka",
    "vilkas",
    "vilken",
    "vilket",
    "vill",
    "väl",
    "vänster",
    "vänstra",
    "värre",
    "vår",
    "våra",
    "vårt",
    "än",
    "ännu",
    "är",
    "även",
    "åt",
    "åtminstone",
    "åtta",
    "åttio",
    "åttionde",
    "åttonde",
    "över",
    "övermorgon",
    "överst",
    "övre"
  ];
  const tha = [
    "กล่าว",
    "กว่า",
    "กัน",
    "กับ",
    "การ",
    "ก็",
    "ก่อน",
    "ขณะ",
    "ขอ",
    "ของ",
    "ขึ้น",
    "คง",
    "ครั้ง",
    "ความ",
    "คือ",
    "จะ",
    "จัด",
    "จาก",
    "จึง",
    "ช่วง",
    "ซึ่ง",
    "ดัง",
    "ด้วย",
    "ด้าน",
    "ตั้ง",
    "ตั้งแต่",
    "ตาม",
    "ต่อ",
    "ต่าง",
    "ต่างๆ",
    "ต้อง",
    "ถึง",
    "ถูก",
    "ถ้า",
    "ทั้ง",
    "ทั้งนี้",
    "ทาง",
    "ที่",
    "ที่สุด",
    "ทุก",
    "ทํา",
    "ทําให้",
    "นอกจาก",
    "นัก",
    "นั้น",
    "นี้",
    "น่า",
    "นํา",
    "บาง",
    "ผล",
    "ผ่าน",
    "พบ",
    "พร้อม",
    "มา",
    "มาก",
    "มี",
    "ยัง",
    "รวม",
    "ระหว่าง",
    "รับ",
    "ราย",
    "ร่วม",
    "ลง",
    "วัน",
    "ว่า",
    "สุด",
    "ส่ง",
    "ส่วน",
    "สําหรับ",
    "หนึ่ง",
    "หรือ",
    "หลัง",
    "หลังจาก",
    "หลาย",
    "หาก",
    "อยาก",
    "อยู่",
    "อย่าง",
    "ออก",
    "อะไร",
    "อาจ",
    "อีก",
    "เขา",
    "เข้า",
    "เคย",
    "เฉพาะ",
    "เช่น",
    "เดียว",
    "เดียวกัน",
    "เนื่องจาก",
    "เปิด",
    "เปิดเผย",
    "เป็น",
    "เป็นการ",
    "เพราะ",
    "เพื่อ",
    "เมื่อ",
    "เรา",
    "เริ่ม",
    "เลย",
    "เห็น",
    "เอง",
    "แต่",
    "แบบ",
    "แรก",
    "และ",
    "แล้ว",
    "แห่ง",
    "โดย",
    "ใน",
    "ให้",
    "ได้",
    "ไป",
    "ไม่",
    "ไว้"
  ];
  const tgl = [
    "akin",
    "aking",
    "ako",
    "alin",
    "am",
    "amin",
    "aming",
    "ang",
    "ano",
    "anumang",
    "apat",
    "at",
    "atin",
    "ating",
    "ay",
    "bababa",
    "bago",
    "bakit",
    "bawat",
    "bilang",
    "dahil",
    "dalawa",
    "dapat",
    "din",
    "dito",
    "doon",
    "gagawin",
    "gayunman",
    "ginagawa",
    "ginawa",
    "ginawang",
    "gumawa",
    "gusto",
    "habang",
    "hanggang",
    "hindi",
    "huwag",
    "iba",
    "ibaba",
    "ibabaw",
    "ibig",
    "ikaw",
    "ilagay",
    "ilalim",
    "ilan",
    "inyong",
    "isa",
    "isang",
    "itaas",
    "ito",
    "iyo",
    "iyon",
    "iyong",
    "ka",
    "kahit",
    "kailangan",
    "kailanman",
    "kami",
    "kanila",
    "kanilang",
    "kanino",
    "kanya",
    "kanyang",
    "kapag",
    "kapwa",
    "karamihan",
    "katiyakan",
    "katulad",
    "kaya",
    "kaysa",
    "ko",
    "kong",
    "kulang",
    "kumuha",
    "kung",
    "laban",
    "lahat",
    "lamang",
    "likod",
    "lima",
    "maaari",
    "maaaring",
    "maging",
    "mahusay",
    "makita",
    "marami",
    "marapat",
    "masyado",
    "may",
    "mayroon",
    "mga",
    "minsan",
    "mismo",
    "mula",
    "muli",
    "na",
    "nabanggit",
    "naging",
    "nagkaroon",
    "nais",
    "nakita",
    "namin",
    "napaka",
    "narito",
    "nasaan",
    "ng",
    "ngayon",
    "ni",
    "nila",
    "nilang",
    "nito",
    "niya",
    "niyang",
    "noon",
    "o",
    "pa",
    "paano",
    "pababa",
    "paggawa",
    "pagitan",
    "pagkakaroon",
    "pagkatapos",
    "palabas",
    "pamamagitan",
    "panahon",
    "pangalawa",
    "para",
    "paraan",
    "pareho",
    "pataas",
    "pero",
    "pumunta",
    "pumupunta",
    "sa",
    "saan",
    "sabi",
    "sabihin",
    "sarili",
    "sila",
    "sino",
    "siya",
    "tatlo",
    "tayo",
    "tulad",
    "tungkol",
    "una",
    "walang"
  ];
  const tur = [
    "acaba",
    "acep",
    "adeta",
    "altmış",
    "altmış",
    "altı",
    "altı",
    "ama",
    "ancak",
    "arada",
    "artık",
    "aslında",
    "aynen",
    "ayrıca",
    "az",
    "bana",
    "bari",
    "bazen",
    "bazı",
    "bazı",
    "başka",
    "belki",
    "ben",
    "benden",
    "beni",
    "benim",
    "beri",
    "beş",
    "beş",
    "beş",
    "bile",
    "bin",
    "bir",
    "biraz",
    "biri",
    "birkaç",
    "birkez",
    "birçok",
    "birşey",
    "birşeyi",
    "birşey",
    "birşeyi",
    "birşey",
    "biz",
    "bizden",
    "bize",
    "bizi",
    "bizim",
    "bu",
    "buna",
    "bunda",
    "bundan",
    "bunlar",
    "bunları",
    "bunların",
    "bunu",
    "bunun",
    "burada",
    "böyle",
    "böylece",
    "bütün",
    "da",
    "daha",
    "dahi",
    "dahil",
    "daima",
    "dair",
    "dayanarak",
    "de",
    "defa",
    "deđil",
    "değil",
    "diye",
    "diđer",
    "diğer",
    "doksan",
    "dokuz",
    "dolayı",
    "dolayısıyla",
    "dört",
    "edecek",
    "eden",
    "ederek",
    "edilecek",
    "ediliyor",
    "edilmesi",
    "ediyor",
    "elli",
    "en",
    "etmesi",
    "etti",
    "ettiği",
    "ettiğini",
    "eđer",
    "eğer",
    "fakat",
    "gibi",
    "göre",
    "halbuki",
    "halen",
    "hangi",
    "hani",
    "hariç",
    "hatta",
    "hele",
    "hem",
    "henüz",
    "hep",
    "hepsi",
    "her",
    "herhangi",
    "herkes",
    "herkesin",
    "hiç",
    "hiçbir",
    "iken",
    "iki",
    "ila",
    "ile",
    "ilgili",
    "ilk",
    "illa",
    "ise",
    "itibaren",
    "itibariyle",
    "iyi",
    "iyice",
    "için",
    "işte",
    "işte",
    "kadar",
    "kanımca",
    "karşın",
    "katrilyon",
    "kendi",
    "kendilerine",
    "kendini",
    "kendisi",
    "kendisine",
    "kendisini",
    "kere",
    "kez",
    "keşke",
    "ki",
    "kim",
    "kimden",
    "kime",
    "kimi",
    "kimse",
    "kırk",
    "kısaca",
    "kırk",
    "lakin",
    "madem",
    "međer",
    "milyar",
    "milyon",
    "mu",
    "mü",
    "mı",
    "mı",
    "nasıl",
    "nasıl",
    "ne",
    "neden",
    "nedenle",
    "nerde",
    "nere",
    "nerede",
    "nereye",
    "nitekim",
    "niye",
    "niçin",
    "o",
    "olan",
    "olarak",
    "oldu",
    "olduklarını",
    "olduğu",
    "olduğunu",
    "olmadı",
    "olmadığı",
    "olmak",
    "olması",
    "olmayan",
    "olmaz",
    "olsa",
    "olsun",
    "olup",
    "olur",
    "olursa",
    "oluyor",
    "on",
    "ona",
    "ondan",
    "onlar",
    "onlardan",
    "onlari",
    "onların",
    "onları",
    "onların",
    "onu",
    "onun",
    "otuz",
    "oysa",
    "pek",
    "rağmen",
    "sadece",
    "sanki",
    "sekiz",
    "seksen",
    "sen",
    "senden",
    "seni",
    "senin",
    "siz",
    "sizden",
    "sizi",
    "sizin",
    "sonra",
    "tarafından",
    "trilyon",
    "tüm",
    "var",
    "vardı",
    "ve",
    "veya",
    "veyahut",
    "ya",
    "yahut",
    "yani",
    "yapacak",
    "yapmak",
    "yaptı",
    "yaptıkları",
    "yaptığı",
    "yaptığını",
    "yapılan",
    "yapılması",
    "yapıyor",
    "yedi",
    "yerine",
    "yetmiş",
    "yetmiş",
    "yetmiş",
    "yine",
    "yirmi",
    "yoksa",
    "yüz",
    "zaten",
    "çok",
    "çünkü",
    "öyle",
    "üzere",
    "üç",
    "şey",
    "şeyden",
    "şeyi",
    "şeyler",
    "şu",
    "şuna",
    "şunda",
    "şundan",
    "şunu",
    "şey",
    "şeyden",
    "şeyi",
    "şeyler",
    "şu",
    "şuna",
    "şunda",
    "şundan",
    "şunları",
    "şunu",
    "şöyle",
    "şayet",
    "şimdi",
    "şu",
    "şöyle"
  ];
  const ukr = [
    "а",
    "або",
    "авжеж",
    "адже",
    "аж",
    "але",
    "ані",
    "б",
    "без",
    "би",
    "бо",
    "був",
    "була",
    "були",
    "було",
    "бути",
    "більш",
    "в",
    "вам",
    "вами",
    "вас",
    "весь",
    "вже",
    "вздовж",
    "ви",
    "від",
    "вниз",
    "внизу",
    "вона",
    "вони",
    "воно",
    "все",
    "всередині",
    "всіх",
    "вся",
    "від",
    "він",
    "да",
    "давай",
    "давати",
    "де",
    "десь",
    "дещо",
    "для",
    "до",
    "є",
    "ж",
    "же",
    "з",
    "за",
    "завжди",
    "замість",
    "зі",
    "і",
    "із",
    "інших",
    "її",
    "їй",
    "їм",
    "їх",
    "й",
    "його",
    "йому",
    "коли",
    "ледве",
    "лиш",
    "майже",
    "мене",
    "мені",
    "ми",
    "між",
    "мій",
    "мною",
    "мов",
    "мого",
    "моєї",
    "моє",
    "може",
    "мої",
    "моїх",
    "моя",
    "на",
    "над",
    "навколо",
    "навіть",
    "нам",
    "нами",
    "нас",
    "наче",
    "наш",
    "не",
    "нє",
    "неї",
    "нема",
    "немов",
    "неначе",
    "нею",
    "ним",
    "ними",
    "них",
    "ні",
    "ніби",
    "ніщо",
    "нього",
    "о",
    "ось",
    "от",
    "отже",
    "отож",
    "під",
    "по",
    "поза",
    "про",
    "під",
    "сам",
    "сама",
    "свій",
    "свої",
    "своя",
    "свою",
    "себе",
    "собі",
    "та",
    "там",
    "так",
    "така",
    "такий",
    "також",
    "твій",
    "твого",
    "твоєї",
    "твої",
    "твоя",
    "те",
    "тебе",
    "ти",
    "ті",
    "тільки",
    "то",
    "тобі",
    "тобою",
    "тобто",
    "тоді",
    "тож",
    "той",
    "тощо",
    "тут",
    "у",
    "хіба",
    "хоч",
    "хоча",
    "це",
    "цей",
    "ці",
    "ця",
    "чи",
    "чого",
    "ще",
    "що",
    "щоб",
    "щось",
    "я",
    "як",
    "яка",
    "який",
    "якої"
  ];
  const urd = [
    "آئی",
    "آئے",
    "آج",
    "آخر",
    "آخرکبر",
    "آدهی",
    "آًب",
    "آٹھ",
    "آیب",
    "اة",
    "اخبزت",
    "اختتبم",
    "ادھر",
    "ارد",
    "اردگرد",
    "ارکبى",
    "اش",
    "اضتعوبل",
    "اضتعوبلات",
    "اضطرذ",
    "اضکب",
    "اضکی",
    "اضکے",
    "اطراف",
    "اغیب",
    "افراد",
    "الگ",
    "اور",
    "اوًچب",
    "اوًچبئی",
    "اوًچی",
    "اوًچے",
    "اى",
    "اً",
    "اًذر",
    "اًہیں",
    "اٹھبًب",
    "اپٌب",
    "اپٌے",
    "اچھب",
    "اچھی",
    "اچھے",
    "اکثر",
    "اکٹھب",
    "اکٹھی",
    "اکٹھے",
    "اکیلا",
    "اکیلی",
    "اکیلے",
    "اگرچہ",
    "اہن",
    "ایطے",
    "ایک",
    "ب",
    "ت",
    "تبزٍ",
    "تت",
    "تر",
    "ترتیت",
    "تریي",
    "تعذاد",
    "تن",
    "تو",
    "توبم",
    "توہی",
    "توہیں",
    "تٌہب",
    "تک",
    "تھب",
    "تھوڑا",
    "تھوڑی",
    "تھوڑے",
    "تھی",
    "تھے",
    "تیي",
    "ثب",
    "ثبئیں",
    "ثبترتیت",
    "ثبری",
    "ثبرے",
    "ثبعث",
    "ثبلا",
    "ثبلترتیت",
    "ثبہر",
    "ثدبئے",
    "ثرآں",
    "ثراں",
    "ثرش",
    "ثعذ",
    "ثغیر",
    "ثلٌذ",
    "ثلٌذوثبلا",
    "ثلکہ",
    "ثي",
    "ثٌب",
    "ثٌبرہب",
    "ثٌبرہی",
    "ثٌبرہے",
    "ثٌبًب",
    "ثٌذ",
    "ثٌذکرو",
    "ثٌذکرًب",
    "ثٌذی",
    "ثڑا",
    "ثڑوں",
    "ثڑی",
    "ثڑے",
    "ثھر",
    "ثھرا",
    "ثھراہوا",
    "ثھرپور",
    "ثھی",
    "ثہت",
    "ثہتر",
    "ثہتری",
    "ثہتریي",
    "ثیچ",
    "ج",
    "خب",
    "خبرہب",
    "خبرہی",
    "خبرہے",
    "خبهوظ",
    "خبًب",
    "خبًتب",
    "خبًتی",
    "خبًتے",
    "خبًٌب",
    "خت",
    "ختن",
    "خجکہ",
    "خص",
    "خططرذ",
    "خلذی",
    "خو",
    "خواى",
    "خوًہی",
    "خوکہ",
    "خٌبة",
    "خگہ",
    "خگہوں",
    "خگہیں",
    "خیطب",
    "خیطبکہ",
    "در",
    "درخبت",
    "درخہ",
    "درخے",
    "درزقیقت",
    "درضت",
    "دش",
    "دفعہ",
    "دلچطپ",
    "دلچطپی",
    "دلچطپیبں",
    "دو",
    "دور",
    "دوراى",
    "دوضرا",
    "دوضروں",
    "دوضری",
    "دوضرے",
    "دوًوں",
    "دکھبئیں",
    "دکھبتب",
    "دکھبتی",
    "دکھبتے",
    "دکھبو",
    "دکھبًب",
    "دکھبیب",
    "دی",
    "دیب",
    "دیتب",
    "دیتی",
    "دیتے",
    "دیر",
    "دیٌب",
    "دیکھو",
    "دیکھٌب",
    "دیکھی",
    "دیکھیں",
    "دے",
    "ر",
    "راضتوں",
    "راضتہ",
    "راضتے",
    "رریعہ",
    "رریعے",
    "رکي",
    "رکھ",
    "رکھب",
    "رکھتب",
    "رکھتبہوں",
    "رکھتی",
    "رکھتے",
    "رکھی",
    "رکھے",
    "رہب",
    "رہی",
    "رہے",
    "ز",
    "زبصل",
    "زبضر",
    "زبل",
    "زبلات",
    "زبلیہ",
    "زصوں",
    "زصہ",
    "زصے",
    "زقبئق",
    "زقیتیں",
    "زقیقت",
    "زکن",
    "زکویہ",
    "زیبدٍ",
    "صبف",
    "صسیر",
    "صفر",
    "صورت",
    "صورتسبل",
    "صورتوں",
    "صورتیں",
    "ض",
    "ضبت",
    "ضبتھ",
    "ضبدٍ",
    "ضبرا",
    "ضبرے",
    "ضبل",
    "ضبلوں",
    "ضت",
    "ضرور",
    "ضرورت",
    "ضروری",
    "ضلطلہ",
    "ضوچ",
    "ضوچب",
    "ضوچتب",
    "ضوچتی",
    "ضوچتے",
    "ضوچو",
    "ضوچٌب",
    "ضوچی",
    "ضوچیں",
    "ضکب",
    "ضکتب",
    "ضکتی",
    "ضکتے",
    "ضکٌب",
    "ضکی",
    "ضکے",
    "ضیذھب",
    "ضیذھی",
    "ضیذھے",
    "ضیکٌڈ",
    "ضے",
    "طرف",
    "طریق",
    "طریقوں",
    "طریقہ",
    "طریقے",
    "طور",
    "طورپر",
    "ظبہر",
    "ع",
    "عذد",
    "عظین",
    "علاقوں",
    "علاقہ",
    "علاقے",
    "علاوٍ",
    "عووهی",
    "غبیذ",
    "غخص",
    "غذ",
    "غروع",
    "غروعبت",
    "غے",
    "فرد",
    "فی",
    "ق",
    "قجل",
    "قجیلہ",
    "قطن",
    "لئے",
    "لا",
    "لازهی",
    "لو",
    "لوجب",
    "لوجی",
    "لوجے",
    "لوسبت",
    "لوسہ",
    "لوگ",
    "لوگوں",
    "لڑکپي",
    "لگتب",
    "لگتی",
    "لگتے",
    "لگٌب",
    "لگی",
    "لگیں",
    "لگے",
    "لی",
    "لیب",
    "لیٌب",
    "لیں",
    "لے",
    "ه",
    "هتعلق",
    "هختلف",
    "هسترم",
    "هسترهہ",
    "هسطوش",
    "هسیذ",
    "هطئلہ",
    "هطئلے",
    "هطبئل",
    "هطتعول",
    "هطلق",
    "هعلوم",
    "هػتول",
    "هلا",
    "هوکي",
    "هوکٌبت",
    "هوکٌہ",
    "هٌبضت",
    "هڑا",
    "هڑًب",
    "هڑے",
    "هکول",
    "هگر",
    "هہرثبى",
    "هیرا",
    "هیری",
    "هیرے",
    "هیں",
    "و",
    "وار",
    "والے",
    "وٍ",
    "ًئی",
    "ًئے",
    "ًب",
    "ًبپطٌذ",
    "ًبگسیر",
    "ًطجت",
    "ًقطہ",
    "ًو",
    "ًوخواى",
    "ًکبلٌب",
    "ًکتہ",
    "ًہ",
    "ًہیں",
    "ًیب",
    "ًے",
    "ٓ آش",
    "ٹھیک",
    "پبئے",
    "پبش",
    "پبًب",
    "پبًچ",
    "پر",
    "پراًب",
    "پطٌذ",
    "پل",
    "پورا",
    "پوچھب",
    "پوچھتب",
    "پوچھتی",
    "پوچھتے",
    "پوچھو",
    "پوچھوں",
    "پوچھٌب",
    "پوچھیں",
    "پچھلا",
    "پھر",
    "پہلا",
    "پہلی",
    "پہلےضی",
    "پہلےضے",
    "پہلےضےہی",
    "پیع",
    "چبر",
    "چبہب",
    "چبہٌب",
    "چبہے",
    "چلا",
    "چلو",
    "چلیں",
    "چلے",
    "چکب",
    "چکی",
    "چکیں",
    "چکے",
    "چھوٹب",
    "چھوٹوں",
    "چھوٹی",
    "چھوٹے",
    "چھہ",
    "چیسیں",
    "ڈھوًڈا",
    "ڈھوًڈلیب",
    "ڈھوًڈو",
    "ڈھوًڈًب",
    "ڈھوًڈی",
    "ڈھوًڈیں",
    "ک",
    "کئی",
    "کئے",
    "کب",
    "کبفی",
    "کبم",
    "کت",
    "کجھی",
    "کرا",
    "کرتب",
    "کرتبہوں",
    "کرتی",
    "کرتے",
    "کرتےہو",
    "کررہب",
    "کررہی",
    "کررہے",
    "کرو",
    "کرًب",
    "کریں",
    "کرے",
    "کطی",
    "کل",
    "کن",
    "کوئی",
    "کوتر",
    "کورا",
    "کوروں",
    "کورٍ",
    "کورے",
    "کوطي",
    "کوى",
    "کوًطب",
    "کوًطی",
    "کوًطے",
    "کھولا",
    "کھولو",
    "کھولٌب",
    "کھولی",
    "کھولیں",
    "کھولے",
    "کہ",
    "کہب",
    "کہتب",
    "کہتی",
    "کہتے",
    "کہو",
    "کہوں",
    "کہٌب",
    "کہی",
    "کہیں",
    "کہے",
    "کی",
    "کیب",
    "کیطب",
    "کیطرف",
    "کیطے",
    "کیلئے",
    "کیوًکہ",
    "کیوں",
    "کیے",
    "کے",
    "کےثعذ",
    "کےرریعے",
    "گئی",
    "گئے",
    "گب",
    "گرد",
    "گروٍ",
    "گروپ",
    "گروہوں",
    "گٌتی",
    "گی",
    "گیب",
    "گے",
    "ہر",
    "ہن",
    "ہو",
    "ہوئی",
    "ہوئے",
    "ہوا",
    "ہوبرا",
    "ہوبری",
    "ہوبرے",
    "ہوتب",
    "ہوتی",
    "ہوتے",
    "ہورہب",
    "ہورہی",
    "ہورہے",
    "ہوضکتب",
    "ہوضکتی",
    "ہوضکتے",
    "ہوًب",
    "ہوًی",
    "ہوًے",
    "ہوچکب",
    "ہوچکی",
    "ہوچکے",
    "ہوگئی",
    "ہوگئے",
    "ہوگیب",
    "ہوں",
    "ہی",
    "ہیں",
    "ہے",
    "ی",
    "یقیٌی",
    "یہ",
    "یہبں"
  ];
  const vie = [
    "bị",
    "bởi",
    "cả",
    "các",
    "cái",
    "cần",
    "càng",
    "chỉ",
    "chiếc",
    "cho",
    "chứ",
    "chưa",
    "chuyện",
    "có",
    "có thể",
    "cứ",
    "của",
    "cùng",
    "cũng",
    "đã",
    "đang",
    "để",
    "đến nỗi",
    "đều",
    "điều",
    "do",
    "đó",
    "được",
    "dưới",
    "gì",
    "khi",
    "không",
    "là",
    "lại",
    "lên",
    "lúc",
    "mà",
    "mỗi",
    "một cách",
    "này",
    "nên",
    "nếu",
    "ngay",
    "nhiều",
    "như",
    "nhưng",
    "những",
    "nơi",
    "nữa",
    "phải",
    "qua",
    "ra",
    "rằng",
    "rất",
    "rồi",
    "sau",
    "sẽ",
    "so",
    "sự",
    "tại",
    "theo",
    "thì",
    "trên",
    "trước",
    "từ",
    "từng",
    "và",
    "vẫn",
    "vào",
    "vậy",
    "vì",
    "việc",
    "với",
    "vừa",
    "vâng",
    "à",
    "ừ",
    "từ"
  ];
  const yor = [
    "ó",
    "ní",
    "ìjàpá",
    "ṣe",
    "rẹ̀",
    "tí",
    "àwọn",
    "sí",
    "ni",
    "náà",
    "anansi",
    "láti",
    "kan",
    "ti",
    "ń",
    "lọ",
    "o",
    "bí",
    "padà",
    "sì",
    "wá",
    "wangari",
    "lè",
    "wà",
    "kí",
    "púpọ̀",
    "odò",
    "mi",
    "wọ́n",
    "pẹ̀lú",
    "a",
    "ṣùgbọ́n",
    "fún",
    "jẹ́",
    "fẹ́",
    "oúnjẹ",
    "rí",
    "igi",
    "kò",
    "ilé",
    "jù",
    "olóńgbò",
    "pé",
    "é",
    "gbogbo",
    "iṣu",
    "inú",
    "bẹ̀rẹ̀",
    "jẹ",
    "fi",
    "dúró",
    "alẹ́",
    "ọjọ́",
    "nítorí",
    "nǹkan",
    "ọ̀rẹ́",
    "àkókò",
    "sínú",
    "ṣ",
    "yìí"
  ];
  const zul = [
    "ukuthi",
    "kodwa",
    "futhi",
    "kakhulu",
    "wakhe",
    "kusho",
    "uma",
    "wathi",
    "umama",
    "kanye",
    "phansi",
    "ngesikhathi",
    "lapho",
    "u",
    "zakhe",
    "khona",
    "ukuba",
    "nje",
    "phezulu",
    "yakhe",
    "kungani",
    "wase",
    "la",
    "mina",
    "wami",
    "ukuze",
    "unonkungu",
    "wabona",
    "wahamba",
    "lakhe",
    "yami",
    "kanjani",
    "kwakukhona",
    "ngelinye"
  ];
  const removeStopwords = (tokens, stopwords = eng) => {
    if (!Array.isArray(tokens) || !Array.isArray(stopwords)) {
      throw new Error("expected Arrays try: removeStopwords(Array[, Array])");
    }
    return tokens.filter((x) => !stopwords.includes(x.toLowerCase()));
  };
  const sw = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    _123,
    afr,
    ara,
    ben,
    bre,
    bul,
    cat,
    ces,
    dan,
    deu,
    ell,
    eng,
    epo,
    est,
    eus,
    fas,
    fin,
    fra,
    gle,
    glg,
    guj,
    hau,
    heb,
    hin,
    hrv,
    hun,
    hye,
    ind,
    ita,
    jpn,
    kor,
    kur,
    lat,
    lav,
    lgg,
    lggNd,
    lit,
    mar,
    msa,
    mya,
    nld,
    nob,
    panGu,
    pol,
    por,
    porBr,
    removeStopwords,
    ron,
    rus,
    slk,
    slv,
    som,
    sot,
    spa,
    swa,
    swe,
    tgl,
    tha,
    tur,
    ukr,
    urd,
    vie,
    yor,
    zho,
    zul
  }, Symbol.toStringTag, { value: "Module" }));
  class StringBuilder {
    constructor(limit) {
      this.length = 0;
      this.buffer = [];
      this.limit = limit;
    }
    append(str) {
      if (this.length + str.length > this.limit) {
        return true;
      } else {
        this.buffer.push(str);
        this.length += str.length;
        if (this.length > this.limit) {
          return true;
        }
        return false;
      }
    }
    toString() {
      return this.buffer.join(" ");
    }
  }
  const extractText = (data, acc, indexableNodeTypes) => {
    var _a, _b;
    if (data) {
      if (indexableNodeTypes.indexOf(data.type) !== -1 && (data.text || data.value)) {
        const tokens = tokenizeString(data.text || data.value);
        for (const token of tokens) {
          if (acc.append(token)) {
            return;
          }
        }
      }
      (_b = (_a = data.children) == null ? void 0 : _a.forEach) == null ? void 0 : _b.call(
        _a,
        (child) => extractText(child, acc, indexableNodeTypes)
      );
    }
  };
  const relativePath = (path, collection) => {
    return path.replace(/\\/g, "/").replace(collection.path, "").replace(/^\/|\/$/g, "");
  };
  const tokenizeString = (str) => {
    return str.split(/[\s\.,]+/).map((s) => s.toLowerCase()).filter((s) => s);
  };
  const processTextFieldValue = (value, maxLen) => {
    const tokens = tokenizeString(value);
    const builder = new StringBuilder(maxLen);
    for (const part of tokens) {
      if (builder.append(part)) {
        break;
      }
    }
    return builder.toString();
  };
  const processDocumentForIndexing = (data, path, collection, textIndexLength, field) => {
    if (!field) {
      const relPath = relativePath(path, collection);
      data["_id"] = `${collection.name}:${relPath}`;
      data["_relativePath"] = relPath;
    }
    for (const f of (field == null ? void 0 : field.fields) || collection.fields || []) {
      if (!f.searchable) {
        delete data[f.name];
        continue;
      }
      const isList = f.list;
      if (data[f.name]) {
        if (f.type === "object") {
          if (isList) {
            data[f.name] = data[f.name].map(
              (obj) => processDocumentForIndexing(
                obj,
                path,
                collection,
                textIndexLength,
                f
              )
            );
          } else {
            data[f.name] = processDocumentForIndexing(
              data[f.name],
              path,
              collection,
              textIndexLength,
              f
            );
          }
        } else if (f.type === "string") {
          const fieldTextIndexLength = f.maxSearchIndexFieldLength || textIndexLength;
          if (isList) {
            data[f.name] = data[f.name].map(
              (value) => processTextFieldValue(value, fieldTextIndexLength)
            );
          } else {
            data[f.name] = processTextFieldValue(
              data[f.name],
              fieldTextIndexLength
            );
          }
        } else if (f.type === "rich-text") {
          const fieldTextIndexLength = f.maxSearchIndexFieldLength || textIndexLength;
          if (isList) {
            data[f.name] = data[f.name].map((value) => {
              const acc = new StringBuilder(fieldTextIndexLength);
              extractText(value, acc, ["text", "code_block", "html"]);
              return acc.toString();
            });
          } else {
            const acc = new StringBuilder(fieldTextIndexLength);
            extractText(data[f.name], acc, ["text", "code_block", "html"]);
            data[f.name] = acc.toString();
          }
        }
      }
    }
    return data;
  };
  const memo = {};
  const lookupStopwords = (keys, defaultStopWords = eng) => {
    let stopwords = defaultStopWords;
    if (keys) {
      if (memo[keys.join(",")]) {
        return memo[keys.join(",")];
      }
      stopwords = [];
      for (const key of keys) {
        stopwords.push(...sw[key]);
      }
      memo[keys.join(",")] = stopwords;
    }
    return stopwords;
  };
  const queryToSearchIndexQuery = (query, stopwordLanguages) => {
    let q;
    const parts = query.split(" ");
    const stopwords = lookupStopwords(stopwordLanguages);
    if (parts.length === 1) {
      q = { AND: [parts[0]] };
    } else {
      q = {
        AND: parts.filter(
          (part) => part.toLowerCase() !== "and" && stopwords.indexOf(part.toLowerCase()) === -1
        )
      };
    }
    return q;
  };
  const optionsToSearchIndexOptions = (options) => {
    const opt = {};
    if (options == null ? void 0 : options.limit) {
      opt["PAGE"] = {
        SIZE: options.limit,
        NUMBER: (options == null ? void 0 : options.cursor) ? parseInt(options.cursor) : 0
      };
    }
    return opt;
  };
  const parseSearchIndexResponse = (data, options) => {
    const results = data["RESULT"];
    const total = data["RESULT_LENGTH"];
    if ((options == null ? void 0 : options.cursor) && (options == null ? void 0 : options.limit)) {
      const prevCursor = options.cursor === "0" ? null : (parseInt(options.cursor) - 1).toString();
      const nextCursor = total <= (parseInt(options.cursor) + 1) * options.limit ? null : (parseInt(options.cursor) + 1).toString();
      return {
        results,
        total,
        prevCursor,
        nextCursor
      };
    } else if (!(options == null ? void 0 : options.cursor) && (options == null ? void 0 : options.limit)) {
      const prevCursor = null;
      const nextCursor = total <= options.limit ? null : "1";
      return {
        results,
        total,
        prevCursor,
        nextCursor
      };
    } else {
      return {
        results,
        total,
        prevCursor: null,
        nextCursor: null
      };
    }
  };
  function asyncPoll(fn, pollInterval = 5 * 1e3, pollTimeout = 30 * 1e3) {
    const endTime = (/* @__PURE__ */ new Date()).getTime() + pollTimeout;
    let stop = false;
    const cancel = () => {
      stop = true;
    };
    const checkCondition = (resolve, reject) => {
      Promise.resolve(fn()).then((result) => {
        const now = (/* @__PURE__ */ new Date()).getTime();
        if (stop) {
          reject(new Error("AsyncPoller: cancelled"));
        } else if (result.done) {
          resolve(result.data);
        } else if (now < endTime) {
          setTimeout(checkCondition, pollInterval, resolve, reject);
        } else {
          reject(new Error("AsyncPoller: reached timeout"));
        }
      }).catch((err) => {
        reject(err);
      });
    };
    return [new Promise(checkCondition), cancel];
  }
  function popupWindow(url, title, window2, w, h) {
    const y = window2.top.outerHeight / 2 + window2.top.screenY - h / 2;
    const x = window2.top.outerWidth / 2 + window2.top.screenX - w / 2;
    return window2.open(
      url,
      title,
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=" + w + ", height=" + h + ", top=" + y + ", left=" + x
    );
  }
  const TINA_LOGIN_EVENT = "tinaCloudLogin";
  const AUTH_TOKEN_KEY = "tinacms-auth";
  const authenticate = (clientId, frontendUrl) => {
    return new Promise((resolve) => {
      const origin = `${window.location.protocol}//${window.location.host}`;
      const authTab = popupWindow(
        `${frontendUrl}/signin?clientId=${clientId}&origin=${origin}`,
        "_blank",
        window,
        1e3,
        700
      );
      window.addEventListener("message", function(e) {
        if (e.data.source === TINA_LOGIN_EVENT) {
          if (authTab) {
            authTab.close();
          }
          resolve({
            id_token: e.data.id_token,
            access_token: e.data.access_token,
            refresh_token: e.data.refresh_token
          });
        }
      });
    });
  };
  const DefaultSessionProvider = ({
    children
  }) => /* @__PURE__ */ React.createElement(React.Fragment, null, children);
  class AbstractAuthProvider {
    /**
     * Wraps the normal fetch function with same API but adds the authorization header token.
     *
     * @example
     * const test = await tinaCloudClient.fetchWithToken(`/mycustomAPI/thing/one`) // the token will be passed in the authorization header
     *
     * @param input fetch function input
     * @param init fetch function init
     */
    async fetchWithToken(input, init) {
      const headers = (init == null ? void 0 : init.headers) || {};
      const token = await this.getToken();
      if (token == null ? void 0 : token.id_token) {
        headers["Authorization"] = "Bearer " + (token == null ? void 0 : token.id_token);
      }
      return await fetch(input, {
        ...init || {},
        headers: new Headers(headers)
      });
    }
    async authorize(context) {
      return this.getToken();
    }
    async isAuthorized(context) {
      return !!await this.authorize(context);
    }
    async isAuthenticated() {
      return !!await this.getUser();
    }
    getLoginStrategy() {
      return "Redirect";
    }
    /**
     * A React component that renders the custom UI for the login screen.
     * Set the LoginStrategy to LoginScreen when providing this function.
     */
    getLoginScreen() {
      return null;
    }
    getSessionProvider() {
      return DefaultSessionProvider;
    }
  }
  class TinaCloudAuthProvider extends AbstractAuthProvider {
    constructor({
      clientId,
      identityApiUrl,
      tokenStorage = "MEMORY",
      frontendUrl,
      ...options
    }) {
      super();
      this.frontendUrl = frontendUrl;
      this.clientId = clientId;
      this.identityApiUrl = identityApiUrl;
      switch (tokenStorage) {
        case "LOCAL_STORAGE":
          this.getToken = async function() {
            const tokens = localStorage.getItem(AUTH_TOKEN_KEY) || null;
            if (tokens) {
              return await this.getRefreshedToken(tokens);
            } else {
              return {
                access_token: null,
                id_token: null,
                refresh_token: null
              };
            }
          };
          this.setToken = function(token) {
            localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token, null, 2));
          };
          break;
        case "MEMORY":
          this.getToken = async () => {
            if (this.token) {
              return await this.getRefreshedToken(this.token);
            } else {
              return {
                access_token: null,
                id_token: null,
                refresh_token: null
              };
            }
          };
          this.setToken = (token) => {
            this.token = JSON.stringify(token, null, 2);
          };
          break;
        case "CUSTOM":
          if (!options.getTokenFn) {
            throw new Error(
              "When CUSTOM token storage is selected, a getTokenFn must be provided"
            );
          }
          this.getToken = options.getTokenFn;
          break;
      }
    }
    async authenticate() {
      const token = await authenticate(this.clientId, this.frontendUrl);
      this.setToken(token);
      return token;
    }
    async getUser() {
      if (!this.clientId) {
        return null;
      }
      const url = `${this.identityApiUrl}/v2/apps/${this.clientId}/currentUser`;
      try {
        const res = await this.fetchWithToken(url, {
          method: "GET"
        });
        const val = await res.json();
        if (!res.status.toString().startsWith("2")) {
          console.error(val.error);
          return null;
        }
        return val;
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    async logout() {
      this.setToken(null);
    }
    async getRefreshedToken(tokens) {
      const { access_token, id_token, refresh_token } = JSON.parse(tokens);
      const { exp, iss, client_id } = this.parseJwt(access_token);
      if (Date.now() / 1e3 >= exp - 120) {
        const refreshResponse = await fetch(iss, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "x-amz-target": "AWSCognitoIdentityProviderService.InitiateAuth"
          },
          body: JSON.stringify({
            ClientId: client_id,
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: {
              REFRESH_TOKEN: refresh_token,
              DEVICE_KEY: null
            }
          })
        });
        if (refreshResponse.status !== 200) {
          throw new Error("Unable to refresh auth tokens");
        }
        const responseJson = await refreshResponse.json();
        const newToken = {
          access_token: responseJson.AuthenticationResult.AccessToken,
          id_token: responseJson.AuthenticationResult.IdToken,
          refresh_token
        };
        this.setToken(newToken);
        return Promise.resolve(newToken);
      }
      return Promise.resolve({ access_token, id_token, refresh_token });
    }
    parseJwt(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map(function(c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join("")
      );
      return JSON.parse(jsonPayload);
    }
  }
  const LOCAL_CLIENT_KEY = "tina.local.isLogedIn";
  class LocalAuthProvider extends AbstractAuthProvider {
    constructor() {
      super();
    }
    async authenticate() {
      localStorage.setItem(LOCAL_CLIENT_KEY, "true");
      return { access_token: "LOCAL", id_token: "LOCAL", refresh_token: "LOCAL" };
    }
    async getUser() {
      return localStorage.getItem(LOCAL_CLIENT_KEY) === "true";
    }
    async getToken() {
      return Promise.resolve({ id_token: "" });
    }
    async logout() {
      localStorage.removeItem(LOCAL_CLIENT_KEY);
    }
  }
  const captureBranchName = /^refs\/heads\/(.*)/;
  const parseRefForBranchName = (ref) => {
    const matches = ref.match(captureBranchName);
    return matches[1];
  };
  const ListBranchResponse = zod.z.object({
    name: zod.z.string(),
    protected: zod.z.boolean().optional().default(false),
    githubPullRequestUrl: zod.z.string().optional()
  }).array().nonempty();
  const IndexStatusResponse = zod.z.object({
    status: zod.z.union([
      zod.z.literal("complete"),
      zod.z.literal("unknown"),
      zod.z.literal("failed"),
      zod.z.literal("inprogress")
    ]).optional(),
    timestamp: zod.z.number().optional()
  });
  class Client {
    constructor({ tokenStorage = "MEMORY", ...options }) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
      this.events = new EventBus();
      this.protectedBranches = [];
      this.usingEditorialWorkflow = false;
      this.addPendingContent = async (props) => {
        const mutation = `#graphql
mutation addPendingDocumentMutation(
  $relativePath: String!
  $collection: String!
  $template: String
) {
  addPendingDocument(
    relativePath: $relativePath
    template: $template
    collection: $collection
  ) {
    ... on Document {
      _sys {
        relativePath
        path
        breadcrumbs
        collection {
          slug
        }
      }
    }
  }
}`;
        const result = await this.request(mutation, {
          variables: props
        });
        return result;
      };
      this.getSchema = async () => {
        if (!this.gqlSchema) {
          const data = await this.request(graphql.getIntrospectionQuery(), {
            variables: {}
          });
          this.gqlSchema = graphql.buildClientSchema(data);
        }
        return this.gqlSchema;
      };
      this.getOptimizedQuery = async (documentNode) => {
        const data = await this.request(
          `query GetOptimizedQuery($queryString: String!) {
        getOptimizedQuery(queryString: $queryString)
      }`,
          {
            variables: { queryString: graphql.print(documentNode) }
          }
        );
        return graphql.parse(data.getOptimizedQuery);
      };
      this.tinaGraphQLVersion = options.tinaGraphQLVersion;
      this.onLogin = ((_d = (_c = (_b = (_a = options.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.admin) == null ? void 0 : _c.authHooks) == null ? void 0 : _d.onLogin) || ((_h = (_g = (_f = (_e = options.schema) == null ? void 0 : _e.config) == null ? void 0 : _f.admin) == null ? void 0 : _g.auth) == null ? void 0 : _h.onLogin);
      this.onLogout = ((_l = (_k = (_j = (_i = options.schema) == null ? void 0 : _i.config) == null ? void 0 : _j.admin) == null ? void 0 : _k.authHooks) == null ? void 0 : _l.onLogout) || ((_p = (_o = (_n = (_m = options.schema) == null ? void 0 : _m.config) == null ? void 0 : _n.admin) == null ? void 0 : _o.auth) == null ? void 0 : _p.onLogout);
      if (options.schema) {
        const enrichedSchema = new schemaTools.TinaSchema({
          version: { fullVersion: "", major: "", minor: "", patch: "" },
          meta: { flags: [] },
          ...schemaTools.addNamespaceToSchema({ ...options.schema }, [])
        });
        this.schema = enrichedSchema;
      }
      this.options = options;
      if ((_r = (_q = options.schema) == null ? void 0 : _q.config) == null ? void 0 : _r.contentApiUrlOverride) {
        this.options.customContentApiUrl = options.schema.config.contentApiUrlOverride;
      }
      this.setBranch(options.branch);
      this.events.subscribe(
        "branch:change",
        ({ branchName }) => {
          this.setBranch(branchName);
        }
      );
      this.clientId = options.clientId;
      this.authProvider = ((_u = (_t = (_s = this.schema) == null ? void 0 : _s.config) == null ? void 0 : _t.config) == null ? void 0 : _u.authProvider) || new TinaCloudAuthProvider({
        clientId: options.clientId,
        identityApiUrl: this.identityApiUrl,
        getTokenFn: options.getTokenFn,
        tokenStorage,
        frontendUrl: this.frontendUrl
      });
    }
    get isLocalMode() {
      return false;
    }
    get isCustomContentApi() {
      return !!this.options.customContentApiUrl;
    }
    setBranch(branchName) {
      var _a, _b, _c, _d;
      const encodedBranch = encodeURIComponent(branchName);
      document.cookie = `x-branch=${encodedBranch}; path=/; max-age=3600`;
      this.branch = encodedBranch;
      this.assetsApiUrl = ((_a = this.options.tinaioConfig) == null ? void 0 : _a.assetsApiUrlOverride) || "https://assets.tinajs.io";
      this.frontendUrl = ((_b = this.options.tinaioConfig) == null ? void 0 : _b.frontendUrlOverride) || "https://app.tina.io";
      this.identityApiUrl = ((_c = this.options.tinaioConfig) == null ? void 0 : _c.identityApiUrlOverride) || "https://identity.tinajs.io";
      this.contentApiBase = ((_d = this.options.tinaioConfig) == null ? void 0 : _d.contentApiUrlOverride) || `https://content.tinajs.io`;
      this.contentApiUrl = this.options.customContentApiUrl || `${this.contentApiBase}/${this.tinaGraphQLVersion}/content/${this.options.clientId}/github/${encodedBranch}`;
      if (this.authProvider instanceof TinaCloudAuthProvider) {
        this.authProvider.identityApiUrl = this.identityApiUrl;
        this.authProvider.frontendUrl = this.frontendUrl;
      }
    }
    getBranch() {
      return this.branch;
    }
    async request(query, { variables }) {
      const token = await this.authProvider.getToken();
      const headers = {
        "Content-Type": "application/json"
      };
      if (token == null ? void 0 : token.id_token) {
        headers["Authorization"] = "Bearer " + (token == null ? void 0 : token.id_token);
      }
      const res = await fetch(this.contentApiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: typeof query === "function" ? graphql.print(query(gql)) : query,
          variables
        })
      });
      if (res.status !== 200) {
        let errorMessage = `Unable to complete request, ${res.statusText}`;
        const resBody = await res.json();
        if (resBody.message) {
          errorMessage = `${errorMessage}, Response: ${resBody.message}`;
        }
        if (!this.isCustomContentApi) {
          errorMessage = `${errorMessage}, Please check that the following information is correct: 
	clientId: ${this.options.clientId}
	branch: ${this.branch}.`;
          if (this.branch !== "main") {
            errorMessage = `${errorMessage}
	Note: This error can occur if the branch does not exist on GitHub or on TinaCloud`;
          }
        }
        throw new Error(errorMessage);
      }
      const json = await res.json();
      if (json.errors) {
        throw new Error(
          `Unable to fetch, errors: 
	${json.errors.map((error) => error.message).join("\n")}`
        );
      }
      return json.data;
    }
    get appDashboardLink() {
      return `${this.frontendUrl}/projects/${this.clientId}`;
    }
    async checkSyncStatus({
      assetsSyncing
    }) {
      const res = await this.authProvider.fetchWithToken(
        `${this.assetsApiUrl}/v1/${this.clientId}/syncStatus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ assetsSyncing })
        }
      );
      const jsonRes = await res.json();
      return jsonRes;
    }
    async getProject() {
      const res = await this.authProvider.fetchWithToken(
        `${this.identityApiUrl}/v2/apps/${this.clientId}`,
        {
          method: "GET"
        }
      );
      const val = await res.json();
      return val;
    }
    async getRequestStatus(requestId) {
      const res = await this.authProvider.fetchWithToken(
        `${this.contentApiBase}/request-status/${this.clientId}/${requestId}`,
        {
          method: "GET"
        }
      );
      const val = await res.json();
      return val;
    }
    async createPullRequest({
      baseBranch,
      branch,
      title
    }) {
      const url = `${this.contentApiBase}/github/${this.clientId}/create_pull_request`;
      try {
        const res = await this.authProvider.fetchWithToken(url, {
          method: "POST",
          body: JSON.stringify({
            baseBranch,
            branch,
            title
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!res.ok) {
          throw new Error(
            `There was an error creating a new branch. ${res.statusText}`
          );
        }
        const values = await res.json();
        return values;
      } catch (error) {
        console.error("There was an error creating a new branch.", error);
        throw error;
      }
    }
    async fetchEvents(limit, cursor) {
      if (this.isLocalMode) {
        return {
          events: []
        };
      } else {
        return (await this.authProvider.fetchWithToken(
          `${this.contentApiBase}/events/${this.clientId}/${this.branch}?limit=${limit || 1}${cursor ? `&cursor=${cursor}` : ""}`,
          { method: "GET" }
        )).json();
      }
    }
    async getBillingState() {
      if (!this.clientId) {
        return null;
      }
      const url = `${this.identityApiUrl}/v2/apps/${this.clientId}/billing/state`;
      try {
        const res = await this.authProvider.fetchWithToken(url, {
          method: "GET"
        });
        const val = await res.json();
        if (!res.status.toString().startsWith("2")) {
          console.error(val.error);
          return null;
        }
        return {
          clientId: val.clientId || this.clientId,
          delinquencyDate: val.delinquencyDate,
          billingState: val.billingState
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    waitForIndexStatus({ ref }) {
      let unknownCount = 0;
      try {
        const [prom, cancel] = asyncPoll(
          async () => {
            try {
              const result = await this.getIndexStatus({ ref });
              if (!(result.status === "inprogress" || result.status === "unknown")) {
                return Promise.resolve({
                  done: true,
                  data: result
                });
              } else {
                if (result.status === "unknown") {
                  unknownCount++;
                  if (unknownCount > 5) {
                    throw new Error(
                      "AsyncPoller: status unknown for too long, please check indexing progress the TinaCloud dashboard"
                    );
                  }
                }
                return Promise.resolve({
                  done: false
                });
              }
            } catch (err) {
              return Promise.reject(err);
            }
          },
          // interval is 5s
          5e3,
          // interval
          //  timeout is 15 min
          9e5
          // timeout
        );
        return [prom, cancel];
      } catch (error) {
        if (error.message === "AsyncPoller: reached timeout") {
          console.warn(error);
          return [Promise.resolve({ status: "timeout" }), () => {
          }];
        }
        throw error;
      }
    }
    async getIndexStatus({ ref }) {
      const url = `${this.contentApiBase}/db/${this.clientId}/status/${ref}`;
      const res = await this.authProvider.fetchWithToken(url);
      const result = await res.json();
      const parsedResult = IndexStatusResponse.parse(result);
      return parsedResult;
    }
    async listBranches(args) {
      try {
        const url = `${this.contentApiBase}/github/${this.clientId}/list_branches`;
        const res = await this.authProvider.fetchWithToken(url, {
          method: "GET"
        });
        const branches = await res.json();
        const parsedBranches = await ListBranchResponse.parseAsync(branches);
        if ((args == null ? void 0 : args.includeIndexStatus) === false) {
          return parsedBranches;
        }
        const indexStatusPromises = parsedBranches.map(async (branch) => {
          const indexStatus2 = await this.getIndexStatus({ ref: branch.name });
          return {
            ...branch,
            indexStatus: indexStatus2
          };
        });
        this.protectedBranches = parsedBranches.filter((x) => x.protected).map((x) => x.name);
        const indexStatus = await Promise.all(indexStatusPromises);
        return indexStatus;
      } catch (error) {
        console.error("There was an error listing branches.", error);
        throw error;
      }
    }
    usingProtectedBranch() {
      var _a;
      return this.usingEditorialWorkflow && ((_a = this.protectedBranches) == null ? void 0 : _a.includes(this.branch));
    }
    async createBranch({ baseBranch, branchName }) {
      const url = `${this.contentApiBase}/github/${this.clientId}/create_branch`;
      try {
        const res = await this.authProvider.fetchWithToken(url, {
          method: "POST",
          body: JSON.stringify({
            baseBranch,
            branchName
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!res.ok) {
          console.error("There was an error creating a new branch.");
          const error = await res.json();
          throw new Error(error == null ? void 0 : error.message);
        }
        const values = await res.json();
        return parseRefForBranchName(values.data.ref);
      } catch (error) {
        console.error("There was an error creating a new branch.", error);
        throw error;
      }
    }
  }
  const DEFAULT_LOCAL_TINA_GQL_SERVER_URL = "http://localhost:4001/graphql";
  class LocalClient extends Client {
    constructor(props) {
      var _a, _b, _c;
      const clientProps = {
        ...props,
        clientId: "",
        branch: "",
        tinaGraphQLVersion: "",
        customContentApiUrl: props && props.customContentApiUrl ? props.customContentApiUrl : DEFAULT_LOCAL_TINA_GQL_SERVER_URL
      };
      super(clientProps);
      this.authProvider = ((_c = (_b = (_a = this.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.config) == null ? void 0 : _c.authProvider) || new LocalAuthProvider();
    }
    get isLocalMode() {
      return true;
    }
  }
  class TinaCMSSearchClient {
    constructor(client, tinaSearchConfig) {
      this.client = client;
      this.tinaSearchConfig = tinaSearchConfig;
    }
    async query(query, options) {
      var _a;
      const q = queryToSearchIndexQuery(
        query,
        (_a = this.tinaSearchConfig) == null ? void 0 : _a.stopwordLanguages
      );
      const opt = optionsToSearchIndexOptions(options);
      const optionsParam = opt["PAGE"] ? `&options=${JSON.stringify(opt)}` : "";
      const res = await this.client.authProvider.fetchWithToken(
        `${this.client.contentApiBase}/searchIndex/${this.client.clientId}/${this.client.getBranch()}?q=${JSON.stringify(q)}${optionsParam}`
      );
      return parseSearchIndexResponse(await res.json(), options);
    }
    async del(ids) {
      const res = await this.client.authProvider.fetchWithToken(
        `${this.client.contentApiBase}/searchIndex/${this.client.clientId}/${this.client.getBranch()}?ids=${ids.join(",")}`,
        {
          method: "DELETE"
        }
      );
      if (res.status !== 200) {
        throw new Error("Failed to update search index");
      }
    }
    async put(docs) {
      const res = await this.client.authProvider.fetchWithToken(
        `${this.client.contentApiBase}/searchIndex/${this.client.clientId}/${this.client.getBranch()}`,
        {
          method: "POST",
          body: JSON.stringify({ docs }),
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      if (res.status !== 200) {
        throw new Error("Failed to update search index");
      }
    }
    supportsClientSideIndexing() {
      return true;
    }
  }
  class LocalSearchClient {
    constructor(client) {
      this.client = client;
    }
    async query(query, options) {
      const q = queryToSearchIndexQuery(query);
      const opt = optionsToSearchIndexOptions(options);
      const optionsParam = opt["PAGE"] ? `&options=${JSON.stringify(opt)}` : "";
      const res = await this.client.authProvider.fetchWithToken(
        `http://localhost:4001/searchIndex?q=${JSON.stringify(q)}${optionsParam}`
      );
      return parseSearchIndexResponse(await res.json(), options);
    }
    del(ids) {
      return Promise.resolve(void 0);
    }
    put(docs) {
      return Promise.resolve(void 0);
    }
    supportsClientSideIndexing() {
      return false;
    }
  }
  function ModalBuilder(modalProps) {
    return /* @__PURE__ */ React.createElement(Modal, null, /* @__PURE__ */ React.createElement(ModalPopup, null, /* @__PURE__ */ React.createElement(ModalHeader, null, modalProps.title), /* @__PURE__ */ React.createElement(ModalBody, { padded: true }, modalProps.message && /* @__PURE__ */ React.createElement("p", null, modalProps.message), modalProps.error && /* @__PURE__ */ React.createElement(ErrorLabel, null, modalProps.error), modalProps.children), /* @__PURE__ */ React.createElement(ModalActions, null, modalProps.actions.map((action) => /* @__PURE__ */ React.createElement(AsyncButton, { key: action.name, ...action })))));
  }
  const ErrorLabel = ({ style = {}, ...props }) => /* @__PURE__ */ React.createElement("p", { style: { ...style, color: "var(--tina-color-error)" }, ...props });
  const AsyncButton = ({ name, primary, action }) => {
    const [submitting, setSubmitting] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);
    const onClick = React.useCallback(async () => {
      if (!mounted)
        return;
      setSubmitting(true);
      try {
        await action();
        setSubmitting(false);
      } catch (e) {
        setSubmitting(false);
        throw e;
      }
    }, [action, setSubmitting, mounted]);
    return /* @__PURE__ */ React.createElement(
      Button$1,
      {
        "data-test": name.replace(/\s/g, "-").toLowerCase(),
        variant: primary ? "primary" : "secondary",
        onClick,
        busy: submitting,
        disabled: submitting
      },
      submitting && /* @__PURE__ */ React.createElement(LoadingDots, null),
      !submitting && name
    );
  };
  class TinaAdminApi {
    constructor(cms) {
      var _a, _b, _c, _d;
      this.maxSearchIndexFieldLength = 100;
      this.api = cms.api.tina;
      this.schema = cms.api.tina.schema;
      if (cms.api.search && ((_a = cms.api.search) == null ? void 0 : _a.supportsClientSideIndexing())) {
        this.searchClient = cms.api.searchClient;
        this.maxSearchIndexFieldLength = ((_d = (_c = (_b = this.schema.config) == null ? void 0 : _b.config) == null ? void 0 : _c.search) == null ? void 0 : _d.maxSearchIndexFieldLength) || 100;
      }
    }
    async isAuthenticated() {
      return await this.api.authProvider.isAuthenticated();
    }
    async checkGraphqlSchema({ localSchema }) {
      const schemaFromCloud = await this.api.getSchema();
      const schema1 = schemaFromCloud;
      const schema2 = graphql.buildSchema(graphql.print(localSchema));
      const diffOutput = await core.diff(schema1, schema2);
      if (diffOutput.length > 0) {
        return false;
      } else {
        return true;
      }
    }
    fetchCollections() {
      return this.schema.getCollections();
    }
    async renameDocument({ collection, relativePath: relativePath2, newRelativePath }) {
      await this.api.request(
        `#graphql
              mutation RenameDocument($collection: String!, $relativePath: String! $newRelativePath: String!) {
                updateDocument(collection: $collection, relativePath: $relativePath, params: {relativePath: $newRelativePath}){
    __typename
  }
              }
            `,
        { variables: { collection, relativePath: relativePath2, newRelativePath } }
      );
      if (this.searchClient) {
        const { document: doc } = await this.fetchDocument(
          collection.name,
          newRelativePath
        );
        const processed = processDocumentForIndexing(
          doc["_values"],
          `${collection.path}/${newRelativePath}`,
          collection,
          this.maxSearchIndexFieldLength
        );
        await this.searchClient.put([processed]);
        await this.searchClient.del([`${collection.name}:${relativePath2}`]);
      }
    }
    async deleteDocument({
      collection,
      relativePath: relativePath2
    }) {
      var _a;
      await this.api.request(
        `#graphql
      mutation DeleteDocument($collection: String!, $relativePath: String!  ){
  deleteDocument(collection: $collection, relativePath: $relativePath){
    __typename
  }
}`,
        { variables: { collection, relativePath: relativePath2 } }
      );
      await ((_a = this.searchClient) == null ? void 0 : _a.del([`${collection}:${relativePath2}`]));
    }
    async fetchCollection(collectionName, includeDocuments, folder = "", after, sortKey, order, filterArgs) {
      let filter = null;
      const filterField = filterArgs == null ? void 0 : filterArgs.filterField;
      if (filterField) {
        filter = {
          [collectionName]: {
            [filterField]: {}
          }
        };
      }
      if (filterField && (filterArgs == null ? void 0 : filterArgs.startsWith)) {
        filter[collectionName][filterField] = {
          ...filter[collectionName][filterField] || {},
          startsWith: filterArgs.startsWith
        };
      }
      if (filterField && (filterArgs == null ? void 0 : filterArgs.before)) {
        filter[collectionName][filterField] = {
          ...filter[collectionName][filterField] || {},
          before: filterArgs.before
        };
      }
      if (filterField && (filterArgs == null ? void 0 : filterArgs.after)) {
        filter[collectionName][filterField] = {
          ...filter[collectionName][filterField] || {},
          after: filterArgs.after
        };
      }
      if (filterField && (filterArgs == null ? void 0 : filterArgs.booleanEquals) !== null && (filterArgs == null ? void 0 : filterArgs.booleanEquals) !== void 0) {
        filter[collectionName][filterField] = {
          ...filter[collectionName][filterField] || {},
          eq: filterArgs.booleanEquals
        };
      }
      if (includeDocuments === true) {
        const sort = sortKey || this.schema.getIsTitleFieldName(collectionName);
        const response = order === "asc" ? await this.api.request(
          `#graphql
      query($collection: String!, $includeDocuments: Boolean!, $sort: String,  $limit: Float, $after: String, $filter: DocumentFilter, $folder: String){
        collection(collection: $collection){
          name
          label
          format
          templates
          documents(sort: $sort, after: $after, first: $limit, filter: $filter, folder: $folder) @include(if: $includeDocuments) {
            totalCount
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
            edges {
              node {
                __typename
                ... on Folder {
                    name
                    path
                }
                ... on Document {
                  _sys {
                    title
                    template
                    breadcrumbs
                    path
                    basename
                    relativePath
                    filename
                    extension
                    hasReferences
                  }
                }
              }
            }
          }
        }
      }`,
          {
            variables: {
              collection: collectionName,
              includeDocuments,
              folder,
              sort,
              limit: 50,
              after,
              filter
            }
          }
        ) : await this.api.request(
          `#graphql
      query($collection: String!, $includeDocuments: Boolean!, $sort: String,  $limit: Float, $after: String, $filter: DocumentFilter, $folder: String) {
        collection(collection: $collection){
          name
          label
          format
          templates
          documents(sort: $sort, before: $after, last: $limit, filter: $filter, folder: $folder) @include(if: $includeDocuments) {
            totalCount
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
            edges {
              node {
                __typename
                ... on Folder {
                    name
                    path
                }
                ... on Document {
                  _sys {
                    title
                    template
                    breadcrumbs
                    path
                    basename
                    relativePath
                    filename
                    extension
                  }
                }
              }
            }
          }
        }
      }`,
          {
            variables: {
              collection: collectionName,
              includeDocuments,
              folder,
              sort,
              limit: 50,
              after,
              filter
            }
          }
        );
        return response.collection;
      } else {
        try {
          const collection = this.schema.getCollection(collectionName);
          return collection;
        } catch (e) {
          console.error(
            `[TinaAdminAPI] Unable to fetchCollection(): ${e.message}`
          );
          return void 0;
        }
      }
    }
    async fetchDocument(collectionName, relativePath2, values = true) {
      let query;
      if (values) {
        query = `#graphql
        query($collection: String!, $relativePath: String!) {
          document(collection:$collection, relativePath:$relativePath) {
            ... on Document {
              _values
              _sys {
                hasReferences
              }
            }
          }
        }`;
      } else {
        query = `#graphql
        query($collection: String!, $relativePath: String!) {
          document(collection:$collection, relativePath:$relativePath) {
            __typename
            ... on Document {
              _sys {
                title
                template
                breadcrumbs
                path
                basename
                relativePath
                filename
                extension
              }
            }
          }
        }`;
      }
      const response = await this.api.request(query, {
        variables: { collection: collectionName, relativePath: relativePath2 }
      });
      return response;
    }
    async createDocument(collection, relativePath2, params) {
      const response = await this.api.request(
        `#graphql
      mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
        createDocument(
          collection: $collection,
          relativePath: $relativePath,
          params: $params
        ){__typename}
      }`,
        {
          variables: {
            collection: collection.name,
            relativePath: relativePath2,
            params
          }
        }
      );
      if (this.searchClient) {
        const { document: doc } = await this.fetchDocument(
          collection.name,
          relativePath2
        );
        const processed = processDocumentForIndexing(
          doc["_values"],
          `${collection.path}/${relativePath2}`,
          collection,
          this.maxSearchIndexFieldLength
        );
        await this.searchClient.put([processed]);
      }
      return response;
    }
    async updateDocument(collection, relativePath2, params) {
      const response = await this.api.request(
        `#graphql
      mutation($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
        updateDocument(
          collection: $collection,
          relativePath: $relativePath,
          params: $params
        ){__typename}
      }`,
        {
          variables: {
            collection: collection.name,
            relativePath: relativePath2,
            params
          }
        }
      );
      if (this.searchClient) {
        const { document: doc } = await this.fetchDocument(
          collection.name,
          relativePath2
        );
        const processed = processDocumentForIndexing(
          doc["_values"],
          `${collection.path}/${relativePath2}`,
          collection,
          this.maxSearchIndexFieldLength
        );
        await this.searchClient.put([processed]);
      }
      return response;
    }
    async createFolder(collection, folderName) {
      return this.api.request(
        `#graphql
      mutation($collection: String!, $folderName: String!) {
        createFolder(
          collection: $collection,
          relativePath: $folderName
        ){__typename}
      }`,
        {
          variables: {
            collection,
            folderName
          }
        }
      );
    }
  }
  const createClient = ({
    clientId,
    isLocalClient = true,
    branch,
    tinaioConfig,
    schema,
    apiUrl,
    tinaGraphQLVersion
  }) => {
    return isLocalClient ? new LocalClient({ customContentApiUrl: apiUrl, schema }) : new Client({
      clientId: clientId || "",
      branch: branch || "main",
      tokenStorage: "LOCAL_STORAGE",
      tinaioConfig,
      schema,
      tinaGraphQLVersion
    });
  };
  function assertShape(value, yupSchema, errorMessage) {
    const shape = yupSchema(yup__namespace);
    try {
      shape.validateSync(value);
    } catch (e) {
      const message = errorMessage || `Failed to assertShape - ${e.message}`;
      throw new Error(message);
    }
  }
  function safeAssertShape(value, yupSchema) {
    try {
      assertShape(value, yupSchema);
      return true;
    } catch (e) {
      return false;
    }
  }
  const TINA_AUTH_CONFIG = "tina_auth_config";
  const useTinaAuthRedirect = () => {
    React.useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const config = {
        code: urlParams.get("code") || "",
        scope: urlParams.get("scope") || "email",
        state: urlParams.get("state")
      };
      if (!config.code) {
        return;
      }
      localStorage[TINA_AUTH_CONFIG] = JSON.stringify(config);
    }, []);
  };
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const AuthWallInner = ({
    children,
    cms,
    getModalActions
  }) => {
    var _a, _b, _c, _d;
    const client = cms.api.tina;
    const isTinaCloud = !client.isLocalMode && !((_c = (_b = (_a = client.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.config) == null ? void 0 : _c.contentApiUrlOverride);
    const loginStrategy = client.authProvider.getLoginStrategy();
    const loginScreen = client.authProvider.getLoginScreen();
    if (loginStrategy === "LoginScreen" && !loginScreen) {
      throw new Error(
        "LoginScreen is set as the login strategy but no login screen component was provided"
      );
    }
    const [activeModal, setActiveModal] = React.useState(null);
    const [errorMessage, setErrorMessage] = React.useState();
    const [showChildren, setShowChildren] = React.useState(false);
    const [authProps, setAuthProps] = React.useState({ username: "", password: "" });
    const [authenticated, setAuthenticated] = React.useState(false);
    React.useEffect(() => {
      let mounted = true;
      client.authProvider.isAuthenticated().then((isAuthenticated) => {
        if (!mounted)
          return;
        if (isAuthenticated) {
          client.authProvider.isAuthorized().then(async (isAuthorized) => {
            if (!mounted)
              return;
            if (isAuthorized) {
              const user = await client.authProvider.getUser();
              if (user.passwordChangeRequired) {
                window.location.hash = "#/screens/change_password";
              }
              setShowChildren(true);
              cms.enable();
            } else {
              setErrorMessage({
                title: "Access Denied:",
                message: "Not Authorized To Edit"
              });
              setActiveModal("error");
            }
          }).catch((e) => {
            if (!mounted)
              return;
            console.error(e);
            setErrorMessage({ title: "Unexpected Error:", message: `${e}` });
            setActiveModal("error");
          });
        } else {
          sleep(500).then(() => {
            setActiveModal("authenticate");
          });
        }
      }).catch((e) => {
        if (!mounted)
          return;
        console.error(e);
        setErrorMessage({ title: "Unexpected Error:", message: `${e}` });
        setActiveModal("error");
      });
      return () => {
        mounted = false;
      };
    }, [authenticated]);
    const onAuthenticated = async () => {
      setAuthenticated(true);
      setActiveModal(null);
      cms.events.dispatch({ type: "cms:login" });
    };
    const otherModalActions = getModalActions ? getModalActions({
      closeModal: () => {
        setActiveModal(null);
      }
    }) : [];
    const handleAuthenticate = async (loginScreenProps) => {
      try {
        setAuthenticated(false);
        const token = await client.authProvider.authenticate(
          loginScreenProps || authProps
        );
        if (typeof (client == null ? void 0 : client.onLogin) === "function") {
          await (client == null ? void 0 : client.onLogin({ token }));
        }
        return onAuthenticated();
      } catch (e) {
        console.error(e);
        setActiveModal("error");
        setErrorMessage({
          title: "Authentication Error",
          message: `${e}`
        });
      }
    };
    let modalTitle = "TinaCloud";
    if (activeModal === "authenticate" && loginStrategy === "Redirect" && !isTinaCloud) {
      modalTitle = "Enter into edit mode";
    } else if (activeModal === "authenticate" && loginStrategy === "UsernamePassword") {
      modalTitle = "Sign in to Tina";
    } else if (activeModal === "error") {
      if (loginStrategy === "Redirect" && !isTinaCloud) {
        modalTitle = "Enter into edit mode";
      } else if (loginStrategy === "UsernamePassword") {
        modalTitle = "Sign in to Tina";
      }
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, activeModal === "authenticate" && loginStrategy === "Redirect" && /* @__PURE__ */ React.createElement(
      ModalBuilder,
      {
        title: modalTitle,
        message: isTinaCloud ? "Your site uses TinaCloud to track changes. To make edits, you must log in." : "To save edits, enter into edit mode. On save, changes will saved to the local filesystem.",
        close,
        actions: [
          ...otherModalActions,
          {
            name: isTinaCloud ? "Log in" : "Enter Edit Mode",
            action: handleAuthenticate,
            primary: true
          }
        ]
      }
    ), activeModal === "authenticate" && loginStrategy === "UsernamePassword" && /* @__PURE__ */ React.createElement(
      ModalBuilder,
      {
        title: modalTitle,
        message: "",
        close,
        actions: [
          ...otherModalActions,
          {
            name: "Login",
            action: handleAuthenticate,
            primary: true
          }
        ]
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-md w-full space-y-6" }, /* @__PURE__ */ React.createElement("label", { className: "block" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-700" }, "Username"), /* @__PURE__ */ React.createElement(
        BaseTextField,
        {
          id: "username",
          name: "username",
          type: "text",
          autoComplete: "username",
          required: true,
          placeholder: "Username",
          value: authProps.username,
          onChange: (e) => setAuthProps((prevState) => ({
            ...prevState,
            username: e.target.value
          }))
        }
      )), /* @__PURE__ */ React.createElement("label", { className: "block" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-700" }, "Password"), /* @__PURE__ */ React.createElement(
        BaseTextField,
        {
          id: "password",
          name: "password",
          type: "password",
          autoComplete: "current-password",
          required: true,
          placeholder: "Password",
          value: authProps.password,
          onChange: (e) => setAuthProps((prevState) => ({
            ...prevState,
            password: e.target.value
          }))
        }
      ))))
    ), activeModal === "error" && errorMessage && /* @__PURE__ */ React.createElement(
      ModalBuilder,
      {
        title: modalTitle,
        message: errorMessage.title,
        error: errorMessage.message,
        close,
        actions: [
          ...otherModalActions,
          {
            name: "Retry",
            action: async () => {
              try {
                setActiveModal(null);
                setErrorMessage(void 0);
                const { authProvider } = client;
                await authProvider.logout();
                if (typeof (client == null ? void 0 : client.onLogout) === "function") {
                  await client.onLogout();
                  await new Promise((resolve) => setTimeout(resolve, 500));
                }
                window.location.href = new URL(window.location.href).pathname;
              } catch (e) {
                console.error(e);
                setActiveModal("error");
                setErrorMessage({
                  title: "Unexpected Error:",
                  message: `${e}`
                });
              }
            },
            primary: true
          }
        ]
      }
    ), showChildren ? children : ((_d = client.authProvider) == null ? void 0 : _d.getLoginStrategy()) === "LoginScreen" && loginScreen ? loginScreen({
      handleAuthenticate: async (props) => handleAuthenticate(props)
    }) : null);
  };
  const TinaCloudProvider = (props) => {
    var _a, _b, _c;
    const baseBranch = props.branch || "main";
    const [currentBranch, setCurrentBranch] = useLocalStorage(
      "tinacms-current-branch",
      baseBranch
    );
    useTinaAuthRedirect();
    const cms = React.useMemo(
      () => props.cms || new TinaCMS({
        enabled: true,
        sidebar: true,
        isLocalClient: props.isLocalClient,
        isSelfHosted: props.isSelfHosted,
        clientId: props.clientId
      }),
      [props.cms]
    );
    if (!cms.api.tina) {
      cms.registerApi("tina", createClient({ ...props, branch: currentBranch }));
    } else {
      cms.api.tina.setBranch(currentBranch);
    }
    React.useEffect(() => {
      var _a2, _b2, _c2, _d, _e, _f;
      let searchClient;
      if (props.isLocalClient) {
        searchClient = new LocalSearchClient(cms.api.tina);
      } else {
        const hasTinaSearch = Boolean((_b2 = (_a2 = props.schema.config) == null ? void 0 : _a2.search) == null ? void 0 : _b2.tina);
        if (hasTinaSearch) {
          searchClient = new TinaCMSSearchClient(
            cms.api.tina,
            (_d = (_c2 = props.schema.config) == null ? void 0 : _c2.search) == null ? void 0 : _d.tina
          );
        } else {
          searchClient = (_f = (_e = props.schema.config) == null ? void 0 : _e.search) == null ? void 0 : _f.searchClient;
        }
      }
      if (searchClient) {
        cms.registerApi("search", searchClient);
      }
    }, [props]);
    if (!cms.api.admin) {
      cms.registerApi("admin", new TinaAdminApi(cms));
    }
    const setupMedia = async (staticMedia) => {
      var _a2, _b2, _c2, _d, _e, _f, _g;
      const hasTinaMedia = Boolean((_b2 = (_a2 = props.schema.config) == null ? void 0 : _a2.media) == null ? void 0 : _b2.tina);
      if (hasTinaMedia) {
        cms.media.store = new TinaMediaStore(cms, staticMedia);
      } else if (
        /*
        Has tina custom media (set up in the schema or define schema)
         */
        ((_d = (_c2 = props.schema.config) == null ? void 0 : _c2.media) == null ? void 0 : _d.loadCustomStore) || props.mediaStore
      ) {
        const mediaStoreFromProps = ((_f = (_e = props.schema.config) == null ? void 0 : _e.media) == null ? void 0 : _f.loadCustomStore) || props.mediaStore;
        if ((_g = mediaStoreFromProps.prototype) == null ? void 0 : _g.persist) {
          cms.media.store = new mediaStoreFromProps(cms.api.tina);
        } else {
          const MediaClass = await mediaStoreFromProps();
          cms.media.store = new MediaClass(cms.api.tina);
        }
      } else {
        cms.media.store = new DummyMediaStore();
      }
    };
    const client = cms.api.tina;
    const isTinaCloud = !client.isLocalMode && !((_c = (_b = (_a = client.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.config) == null ? void 0 : _c.contentApiUrlOverride);
    const SessionProvider = client.authProvider.getSessionProvider();
    const handleListBranches = async () => {
      const branches = await cms.api.tina.listBranches({
        includeIndexStatus: true
      });
      if (!Array.isArray(branches)) {
        return [];
      }
      return branches;
    };
    const handleCreateBranch = async (data) => {
      const newBranch = await cms.api.tina.createBranch(data);
      return newBranch;
    };
    setupMedia(props.staticMedia).catch((e) => {
      console.error(e);
    });
    const [branchingEnabled, setBranchingEnabled] = React.useState(
      () => cms.flags.get("branch-switcher")
    );
    React.useEffect(() => {
      cms.events.subscribe("flag:set", ({ key, value }) => {
        if (key === "branch-switcher") {
          setBranchingEnabled(value);
        }
      });
    }, [cms.events]);
    React.useEffect(() => {
      let branchSwitcher;
      if (branchingEnabled) {
        branchSwitcher = new BranchSwitcherPlugin({
          listBranches: handleListBranches,
          createBranch: handleCreateBranch,
          chooseBranch: setCurrentBranch
        });
        cms.plugins.add(branchSwitcher);
      }
      return () => {
        if (branchingEnabled && branchSwitcher) {
          cms.plugins.remove(branchSwitcher);
        }
      };
    }, [branchingEnabled, props.branch]);
    React.useEffect(() => {
      if (props.cmsCallback) {
        props.cmsCallback(cms);
      }
    }, []);
    React.useEffect(() => {
      const setupEditorialWorkflow = () => {
        client.getProject().then((project) => {
          var _a2;
          if ((_a2 = project == null ? void 0 : project.features) == null ? void 0 : _a2.includes("editorial-workflow")) {
            cms.flags.set("branch-switcher", true);
            client.usingEditorialWorkflow = true;
            client.protectedBranches = project.protectedBranches;
            if (!project.metadata[currentBranch]) {
              setCurrentBranch(project.defaultBranch || "main");
            }
          }
        });
      };
      if (isTinaCloud) {
        setupEditorialWorkflow();
      }
      const unsubscribe = cms.events.subscribe("cms:login", () => {
        if (isTinaCloud) {
          setupEditorialWorkflow();
        }
      });
      return unsubscribe;
    }, [currentBranch, isTinaCloud, cms]);
    return /* @__PURE__ */ React.createElement(SessionProvider, { basePath: "/api/tina/auth" }, /* @__PURE__ */ React.createElement(
      BranchDataProvider,
      {
        currentBranch,
        setCurrentBranch: (b) => {
          setCurrentBranch(b);
        }
      },
      /* @__PURE__ */ React.createElement(TinaProvider, { cms }, /* @__PURE__ */ React.createElement(AuthWallInner, { ...props, cms }))
    ));
  };
  const TinaCloudAuthWall = TinaCloudProvider;
  class ContentCreatorPlugin {
    constructor(options) {
      this.__type = "content-creator";
      this.fields = options.fields;
      this.name = options.label;
      this.onNewDocument = options.onNewDocument;
      this.collections = options.collections;
      this.onChange = options.onChange;
      this.initialValues = options.initialValues;
    }
    async onSubmit({ collection, template, relativePath: relativePath2 }, cms) {
      try {
        const selectedCollection = this.collections.find(
          (collectionItem) => collectionItem.slug === collection
        );
        const collectionFormat = selectedCollection.format;
        const extensionLength = -1 * (collectionFormat.length + 1);
        let relativePathWithExt = relativePath2;
        if (relativePath2.slice(extensionLength).toLocaleLowerCase() === `.${collectionFormat}`) {
          relativePathWithExt = `${relativePath2.slice(0, -3)}.${collectionFormat}`;
        } else {
          relativePathWithExt = `${relativePath2}.${collectionFormat}`;
        }
        const payload = {
          relativePath: relativePathWithExt,
          collection,
          template
        };
        try {
          const res = await cms.api.tina.addPendingContent(payload);
          if (res.errors) {
            res.errors.map((e) => {
              cms.alerts.error(e.message);
            });
          } else {
            cms.alerts.info("Document created!");
            if (typeof this.onNewDocument === "function") {
              this.onNewDocument(res.addPendingDocument._sys);
            }
          }
        } catch (e) {
          cms.alerts.error(e.message);
        }
      } catch (e) {
        cms.alerts.error(e.message);
      }
    }
  }
  const useDocumentCreatorPlugin = (args) => {
    const cms = useCMS$1();
    const [values, setValues] = React.useState({});
    const [plugin, setPlugin] = React.useState(null);
    React.useEffect(() => {
      const run = async () => {
        var _a;
        const res = await cms.api.tina.request(
          (gql2) => gql2`
          {
            collections {
              label
              slug
              format
              templates
            }
          }
        `,
          { variables: {} }
        );
        const allCollectionOptions = [];
        res.collections.forEach((collection) => {
          const value = collection.slug;
          const label = `${collection.label}`;
          allCollectionOptions.push({ value, label });
        });
        let collectionOptions;
        if (args && args.filterCollections && typeof args.filterCollections === "function") {
          const filtered = args.filterCollections(allCollectionOptions);
          collectionOptions = [
            { value: "", label: "Choose Collection" },
            ...filtered
          ];
        } else {
          collectionOptions = [
            { value: "", label: "Choose Collection" },
            ...allCollectionOptions
          ];
        }
        const templateOptions = [
          { value: "", label: "Choose Template" }
        ];
        if (values.collection) {
          const filteredCollection = res.collections.find(
            (c) => c.slug === values.collection
          );
          (_a = filteredCollection == null ? void 0 : filteredCollection.templates) == null ? void 0 : _a.forEach((template) => {
            templateOptions.push({ value: template.name, label: template.label });
          });
        }
        setPlugin(
          new ContentCreatorPlugin({
            label: "Add Document",
            onNewDocument: args && args.onNewDocument,
            // @ts-ignore
            collections: res.collections,
            onChange: async ({ values: values2 }) => {
              setValues(values2);
            },
            initialValues: values,
            fields: [
              {
                component: "select",
                name: "collection",
                label: "Collection",
                description: "Select the collection.",
                options: collectionOptions,
                validate: async (value, allValues, meta) => {
                  if (!value) {
                    return true;
                  }
                }
              },
              {
                component: "select",
                name: "template",
                label: "Template",
                description: "Select the template.",
                options: templateOptions,
                validate: async (value, allValues, meta) => {
                  if (!value && templateOptions.length > 1) {
                    if (meta.dirty) {
                      return "Required";
                    }
                    return true;
                  }
                }
              },
              {
                component: "text",
                name: "relativePath",
                label: "Name",
                description: `A unique name for the content. Example: "newPost" or "blog_022021`,
                placeholder: "newPost",
                validate: (value, allValues, meta) => {
                  if (!value) {
                    if (meta.dirty) {
                      return "Required";
                    }
                    return true;
                  }
                  const isValid = /^[_a-zA-Z0-9][\-_a-zA-Z0-9]*$/.test(value);
                  if (value && !isValid) {
                    return "Must begin with a-z, A-Z, 0-9, or _ and contain only a-z, A-Z, 0-9, - or _";
                  }
                }
              }
            ]
          })
        );
      };
      run();
    }, [cms]);
    React.useEffect(() => {
      if (plugin) {
        cms.plugins.add(plugin);
      }
      return () => {
        if (plugin) {
          cms.plugins.remove(plugin);
        }
      };
    }, [plugin]);
  };
  const errorButtonStyles = {
    background: "#eb6337",
    padding: "12px 18px",
    cursor: "pointer",
    borderRadius: "50px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontWeight: "bold",
    border: "none",
    color: "white",
    margin: "1rem 0"
  };
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: props.hasError,
        message: "",
        pageRefresh: false
      };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, message: error.message };
    }
    /**
     * Ideally we can track the last valid state and provide a button to go back, which
     * would just reset the form to that state. This isn't ideal for many cases though,
     * in general you'd probably want to push through the invalid state until you arrive at
     * a new state which you are happy with. So we should offer the opportunity to try rendering
     * again in the new, hopefully valid, state.
     */
    render() {
      if (this.state.hasError && !this.state.pageRefresh) {
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            style: {
              background: "#efefef",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }
          },
          /* @__PURE__ */ React.createElement("style", null, "            body {              margin: 0;            }          "),
          /* @__PURE__ */ React.createElement(
            "div",
            {
              style: {
                background: "#fff",
                maxWidth: "400px",
                padding: "20px",
                fontFamily: "'Inter', sans-serif",
                borderRadius: "5px",
                boxShadow: "0 6px 24px rgb(0 37 91 / 5%), 0 2px 4px rgb(0 37 91 / 3%)"
              }
            },
            /* @__PURE__ */ React.createElement("h3", { style: { color: "#eb6337" } }, "TinaCMS Render Error"),
            /* @__PURE__ */ React.createElement("p", null, "Tina caught an error while updating the page:"),
            /* @__PURE__ */ React.createElement("pre", { style: { marginTop: "1rem", overflowX: "auto" } }, this.state.message),
            /* @__PURE__ */ React.createElement("br", null),
            /* @__PURE__ */ React.createElement("p", null, `If you've just updated the form, undo your most recent changes and click "refresh". If after a few refreshes, you're still encountering this error. There is a bigger issue with the site. Please reach out to your site admin.`),
            /* @__PURE__ */ React.createElement("p", null, "See our", " ", /* @__PURE__ */ React.createElement(
              "a",
              {
                className: "text-gray-600",
                style: { textDecoration: "underline" },
                href: "https://tina.io/docs/errors/faq/",
                target: "_blank"
              },
              " ",
              "Error FAQ",
              " "
            ), " ", "for more information."),
            /* @__PURE__ */ React.createElement(
              "button",
              {
                type: "button",
                style: errorButtonStyles,
                onClick: () => {
                  this.setState({ pageRefresh: true });
                  setTimeout(
                    () => this.setState({ hasError: false, pageRefresh: false }),
                    3e3
                  );
                }
              },
              "Refresh"
            )
          )
        );
      }
      if (this.state.pageRefresh) {
        return /* @__PURE__ */ React.createElement(Loader, null, "Let's try that again.");
      }
      return this.props.children;
    }
  }
  const TinaCMSProvider2 = ({
    query,
    documentCreatorCallback,
    formifyCallback,
    schema,
    ...props
  }) => {
    var _a, _b, _c;
    if (props == null ? void 0 : props.apiURL) {
      console.warn(
        "The apiURL prop is deprecated. Please see https://tina.io/blog/tina-v-0.68.14 for information on how to upgrade to the new API"
      );
    }
    const apiURL = ((_a = props == null ? void 0 : props.client) == null ? void 0 : _a.apiUrl) || (props == null ? void 0 : props.apiURL);
    const { branch, clientId, isLocalClient } = apiURL ? schemaTools.parseURL(apiURL) : {
      branch: props.branch,
      clientId: props.clientId,
      // @ts-expect-error this is for backwards compatibility
      isLocalClient: props == null ? void 0 : props.isLocalClient
    };
    if (
      // Check if local client is defined
      typeof isLocalClient === "undefined" || // If in not in localMode check if clientId and branch are defined
      !isLocalClient && (!branch || !clientId) && // if they pass a custom apiURL, we don't need to throw an error
      !schema.config.contentApiUrlOverride
    ) {
      throw new Error(
        "Invalid setup. See https://tina.io/docs/tina-cloud/overview for more information."
      );
    }
    if (!schema) {
      throw new Error(
        "`schema` is required to be passed as a property to `TinaProvider`.  You can learn more about this change here: https://github.com/tinacms/tinacms/pull/2823"
      );
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      TinaCloudProvider,
      {
        branch,
        clientId: clientId || ((_b = schema == null ? void 0 : schema.config) == null ? void 0 : _b.clientId),
        tinaioConfig: props.tinaioConfig,
        isLocalClient,
        isSelfHosted: !!((_c = schema == null ? void 0 : schema.config) == null ? void 0 : _c.contentApiUrlOverride),
        cmsCallback: props.cmsCallback,
        mediaStore: props.mediaStore,
        apiUrl: apiURL,
        staticMedia: props.staticMedia,
        schema: { ...schema, config: { ...schema.config, ...props } },
        tinaGraphQLVersion: props.tinaGraphQLVersion
      },
      /* @__PURE__ */ React.createElement(ErrorBoundary, null, props.children)
    ));
  };
  const Loader = (props) => {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          background: "rgba(0, 0, 0, 0.5)",
          inset: 0,
          zIndex: 200,
          opacity: "0.8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px"
        }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            background: "#f6f6f9",
            boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
            padding: "40px 32px",
            width: "460px",
            maxWidth: "90%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
          }
        },
        /* @__PURE__ */ React.createElement(
          "svg",
          {
            style: {
              width: "64px",
              color: "#2296fe",
              marginTop: "-8px",
              marginBottom: "16px"
            },
            version: "1.1",
            id: "L5",
            xmlns: "http://www.w3.org/2000/svg",
            xmlnsXlink: "http://www.w3.org/1999/xlink",
            x: "0px",
            y: "0px",
            viewBox: "0 0 100 64",
            enableBackground: "new 0 0 0 0",
            xmlSpace: "preserve"
          },
          /* @__PURE__ */ React.createElement("circle", { fill: "currentColor", stroke: "none", cx: 6, cy: 32, r: 6 }, /* @__PURE__ */ React.createElement(
            "animateTransform",
            {
              attributeName: "transform",
              dur: "1s",
              type: "translate",
              values: "0 15 ; 0 -15; 0 15",
              calcMode: "spline",
              keySplines: "0.8 0 0.4 1; 0.4 0 0.2 1",
              repeatCount: "indefinite",
              begin: "0.1"
            }
          )),
          /* @__PURE__ */ React.createElement("circle", { fill: "currentColor", stroke: "none", cx: 30, cy: 32, r: 6 }, /* @__PURE__ */ React.createElement(
            "animateTransform",
            {
              attributeName: "transform",
              dur: "1s",
              type: "translate",
              values: "0 15 ; 0 -10; 0 15",
              calcMode: "spline",
              keySplines: "0.8 0 0.4 1; 0.4 0 0.2 1",
              repeatCount: "indefinite",
              begin: "0.2"
            }
          )),
          /* @__PURE__ */ React.createElement("circle", { fill: "currentColor", stroke: "none", cx: 54, cy: 32, r: 6 }, /* @__PURE__ */ React.createElement(
            "animateTransform",
            {
              attributeName: "transform",
              dur: "1s",
              type: "translate",
              values: "0 15 ; 0 -5; 0 15",
              calcMode: "spline",
              keySplines: "0.8 0 0.4 1; 0.4 0 0.2 1",
              repeatCount: "indefinite",
              begin: "0.3"
            }
          ))
        ),
        /* @__PURE__ */ React.createElement(
          "p",
          {
            style: {
              fontSize: "18px",
              color: "#252336",
              textAlign: "center",
              lineHeight: "1.3",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "normal"
            }
          },
          "Please wait, Tina is loading data..."
        )
      )
    ), props.children);
  };
  const getStaticPropsForTina = async ({
    query,
    variables
  }) => {
    try {
      const data = await staticRequest({ query, variables });
      return JSON.parse(
        JSON.stringify({
          data,
          query,
          variables
        })
      );
    } catch (e) {
      return JSON.parse(
        JSON.stringify({
          data: {},
          query,
          variables
        })
      );
    }
  };
  function is_server() {
    return !(typeof window != "undefined" && window.document);
  }
  const staticRequest = async ({
    query,
    variables
  }) => {
    const client = new LocalClient();
    if (!is_server()) {
      console.warn(`Whoops! Looks like you are using \`staticRequest\` in the browser to fetch data.

The local server is not available outside of \`getStaticProps\` or \`getStaticPaths\` functions.
This function should only be called on the server at build time.

This will work when developing locally but NOT when deployed to production.
`);
    }
    return client.request(query, { variables });
  };
  const GetCMS = ({ children }) => {
    const cms = useCMS$1();
    try {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, children(cms));
    } catch (e) {
      return null;
    }
  };
  const Layout = ({ children }) => {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "auto",
          background: "#F6F6F9",
          fontFamily: "'Inter', sans-serif",
          zIndex: 9999
        }
      },
      children
    ));
  };
  const useGetCollections = (cms) => {
    const api = new TinaAdminApi(cms);
    return { collections: api.fetchCollections() };
  };
  const slugify = (text) => {
    return text.toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "_").replace(/^-+|-+$/g, "");
  };
  const Sidebar = ({ cms }) => {
    var _a, _b;
    const collectionsInfo = useGetCollections(cms);
    const screens = cms.plugins.getType("screen").all();
    const cloudConfigs = cms.plugins.getType("cloud-config").all();
    const [menuIsOpen, setMenuIsOpen] = React.useState(false);
    const isLocalMode = (_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isLocalMode;
    const navBreakpoint2 = 1279;
    const windowWidth = windowSize.useWindowWidth();
    const renderDesktopNav = windowWidth > navBreakpoint2;
    const activeScreens = screens.filter(
      (screen) => {
        var _a2;
        return screen.navCategory !== "Account" || ((_a2 = cms.api.tina.authProvider) == null ? void 0 : _a2.getLoginStrategy()) === "UsernamePassword";
      }
    );
    return /* @__PURE__ */ React.createElement(React.Fragment, null, renderDesktopNav && /* @__PURE__ */ React.createElement(
      Nav,
      {
        isLocalMode,
        sidebarWidth: 360,
        showCollections: true,
        collectionsInfo,
        screens: activeScreens,
        cloudConfigs,
        contentCreators: [],
        RenderNavSite: ({ view }) => /* @__PURE__ */ React.createElement(
          SidebarLink,
          {
            label: view.name,
            to: `/screens/${slugify(view.name)}`,
            Icon: view.Icon ? view.Icon : ImFilesEmpty
          }
        ),
        RenderNavCloud: ({ config }) => /* @__PURE__ */ React.createElement(SidebarCloudLink, { config }),
        RenderNavCollection: ({ collection }) => /* @__PURE__ */ React.createElement(
          SidebarLink,
          {
            label: collection.label ? collection.label : collection.name,
            to: `/collections/${collection.name}/~`,
            Icon: ImFilesEmpty
          }
        ),
        AuthRenderNavCollection: ({ collection }) => /* @__PURE__ */ React.createElement(
          SidebarLink,
          {
            label: collection.label ? collection.label : collection.name,
            to: `/collections/${collection.name}/~`,
            Icon: ImUsers
          }
        )
      }
    ), !renderDesktopNav && /* @__PURE__ */ React.createElement(react.Transition, { show: menuIsOpen }, /* @__PURE__ */ React.createElement(
      react.TransitionChild,
      {
        enter: "transform transition-all ease-out duration-300",
        enterFrom: "opacity-0 -translate-x-full",
        enterTo: "opacity-100 translate-x-0",
        leave: "transform transition-all ease-in duration-200",
        leaveFrom: "opacity-100 translate-x-0",
        leaveTo: "opacity-0 -translate-x-full"
      },
      /* @__PURE__ */ React.createElement("div", { className: "fixed left-0 top-0 z-overlay h-full transform" }, /* @__PURE__ */ React.createElement(
        Nav,
        {
          isLocalMode,
          className: "rounded-r-md",
          sidebarWidth: 360,
          showCollections: true,
          collectionsInfo,
          screens: activeScreens,
          cloudConfigs,
          contentCreators: [],
          RenderNavSite: ({ view }) => /* @__PURE__ */ React.createElement(
            SidebarLink,
            {
              label: view.name,
              to: `/screens/${slugify(view.name)}`,
              Icon: view.Icon ? view.Icon : ImFilesEmpty,
              onClick: () => {
                setMenuIsOpen(false);
              }
            }
          ),
          RenderNavCloud: ({ config }) => /* @__PURE__ */ React.createElement(SidebarCloudLink, { config }),
          RenderNavCollection: ({ collection }) => /* @__PURE__ */ React.createElement(
            SidebarLink,
            {
              label: collection.label ? collection.label : collection.name,
              to: `/collections/${collection.name}/~`,
              Icon: ImFilesEmpty,
              onClick: () => {
                setMenuIsOpen(false);
              }
            }
          ),
          AuthRenderNavCollection: ({ collection }) => /* @__PURE__ */ React.createElement(
            SidebarLink,
            {
              label: collection.label ? collection.label : collection.name,
              to: `/collections/${collection.name}/~`,
              Icon: ImUsers,
              onClick: () => {
                setMenuIsOpen(false);
              }
            }
          )
        },
        /* @__PURE__ */ React.createElement("div", { className: "absolute top-8 right-0 transform translate-x-full overflow-hidden" }, /* @__PURE__ */ React.createElement(
          Button$1,
          {
            rounded: "right",
            variant: "secondary",
            onClick: () => {
              setMenuIsOpen(false);
            },
            className: `transition-opacity duration-150 ease-out`
          },
          /* @__PURE__ */ React.createElement(IoMdClose, { className: "h-6 w-auto" })
        ))
      ))
    ), /* @__PURE__ */ React.createElement(
      react.TransitionChild,
      {
        enter: "ease-out duration-300",
        enterFrom: "opacity-0",
        enterTo: "opacity-80",
        entered: "opacity-80",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-80",
        leaveTo: "opacity-0"
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          onClick: () => {
            setMenuIsOpen(false);
          },
          className: "fixed z-menu inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
        }
      )
    )), !renderDesktopNav && /* @__PURE__ */ React.createElement(
      Button$1,
      {
        rounded: "right",
        variant: "secondary",
        onClick: () => {
          setMenuIsOpen(true);
        },
        className: `pointer-events-auto -ml-px absolute left-0 z-50 ${isLocalMode ? "top-10" : "top-4"}`
      },
      /* @__PURE__ */ React.createElement(BiMenu, { className: "h-7 w-auto" })
    ));
  };
  const SidebarLink = (props) => {
    const { to, label, Icon } = props;
    return /* @__PURE__ */ React.createElement(
      reactRouterDom.NavLink,
      {
        className: ({ isActive }) => {
          return `text-base tracking-wide ${isActive ? "text-blue-600" : "text-gray-500"} hover:text-blue-600 flex items-center opacity-90 hover:opacity-100`;
        },
        onClick: props.onClick ? props.onClick : () => {
        },
        to
      },
      /* @__PURE__ */ React.createElement(Icon, { className: "mr-2 h-6 opacity-80 w-auto" }),
      " ",
      label
    );
  };
  const SidebarCloudLink = ({ config }) => {
    if (config.text) {
      return /* @__PURE__ */ React.createElement("span", { className: "text-base tracking-wide text-gray-500 flex items-center opacity-90" }, config.text, " ", /* @__PURE__ */ React.createElement(
        "a",
        {
          target: "_blank",
          className: "ml-1 text-blue-600 hover:opacity-60",
          href: config.link.href
        },
        config.link.text
      ));
    }
    return /* @__PURE__ */ React.createElement("span", { className: "text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100" }, /* @__PURE__ */ React.createElement(config.Icon, { className: "mr-2 h-6 opacity-80 w-auto" }), /* @__PURE__ */ React.createElement("a", { target: "_blank", href: config.link.href }, config.link.text));
  };
  const LoadingPage = () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 200,
        opacity: "0.8",
        display: "flex",
        alignItems: "start",
        justifyContent: "center",
        padding: "120px 40px 40px 40px"
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          background: "#FFF",
          border: "1px solid #EDECF3",
          boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          padding: "32px 24px",
          width: "460px",
          maxWidth: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column"
        }
      },
      /* @__PURE__ */ React.createElement(
        "svg",
        {
          style: {
            width: "64px",
            color: "#2296fe",
            marginTop: "-8px",
            marginBottom: "16px"
          },
          version: "1.1",
          id: "L5",
          xmlns: "http://www.w3.org/2000/svg",
          xmlnsXlink: "http://www.w3.org/1999/xlink",
          x: "0px",
          y: "0px",
          viewBox: "0 0 100 64",
          enableBackground: "new 0 0 0 0",
          xmlSpace: "preserve"
        },
        /* @__PURE__ */ React.createElement("circle", { fill: "currentColor", stroke: "none", cx: 6, cy: 32, r: 6 }, /* @__PURE__ */ React.createElement(
          "animateTransform",
          {
            attributeName: "transform",
            dur: "1s",
            type: "translate",
            values: "0 15 ; 0 -15; 0 15",
            calcMode: "spline",
            keySplines: "0.8 0 0.4 1; 0.4 0 0.2 1",
            repeatCount: "indefinite",
            begin: "0.1"
          }
        )),
        /* @__PURE__ */ React.createElement("circle", { fill: "currentColor", stroke: "none", cx: 30, cy: 32, r: 6 }, /* @__PURE__ */ React.createElement(
          "animateTransform",
          {
            attributeName: "transform",
            dur: "1s",
            type: "translate",
            values: "0 15 ; 0 -10; 0 15",
            calcMode: "spline",
            keySplines: "0.8 0 0.4 1; 0.4 0 0.2 1",
            repeatCount: "indefinite",
            begin: "0.2"
          }
        )),
        /* @__PURE__ */ React.createElement("circle", { fill: "currentColor", stroke: "none", cx: 54, cy: 32, r: 6 }, /* @__PURE__ */ React.createElement(
          "animateTransform",
          {
            attributeName: "transform",
            dur: "1s",
            type: "translate",
            values: "0 15 ; 0 -5; 0 15",
            calcMode: "spline",
            keySplines: "0.8 0 0.4 1; 0.4 0 0.2 1",
            repeatCount: "indefinite",
            begin: "0.3"
          }
        ))
      ),
      /* @__PURE__ */ React.createElement(
        "p",
        {
          style: {
            fontSize: "16px",
            color: "#716c7f",
            textAlign: "center",
            lineHeight: "1.3",
            fontFamily: "'Inter', sans-serif",
            fontWeight: "normal"
          }
        },
        "Please wait, Tina is loading data..."
      )
    )
  ));
  function RiHome2Line(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM6 19H18V9.15745L12 3.7029L6 9.15745V19Z" }, "child": [] }] })(props);
  }
  const PageWrapper = ({ children }) => {
    var _a, _b;
    const cms = useCMS$1();
    const isLocalMode = (_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isLocalMode;
    const [branchingEnabled, setBranchingEnabled] = React.useState(
      () => cms.flags.get("branch-switcher")
    );
    React.useEffect(() => {
      cms.events.subscribe("flag:set", ({ key, value }) => {
        if (key === "branch-switcher") {
          setBranchingEnabled(value);
        }
      });
    }, [cms.events]);
    return /* @__PURE__ */ React.createElement("div", { className: "relative left-0 w-full h-full bg-gradient-to-b from-gray-50/50 to-gray-50 shadow-2xl overflow-y-auto transition-opacity duration-300 ease-out flex flex-col opacity-100" }, branchingEnabled && !isLocalMode && /* @__PURE__ */ React.createElement(BranchBanner, null), children);
  };
  const PageHeader = ({
    isLocalMode,
    children
  }) => {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, isLocalMode && /* @__PURE__ */ React.createElement(LocalWarning, null), !isLocalMode && /* @__PURE__ */ React.createElement(BillingWarning, null), /* @__PURE__ */ React.createElement("div", { className: "pt-16 xl:pt-12 px-6 xl:px-12" }, /* @__PURE__ */ React.createElement("div", { className: "w-full mx-auto max-w-screen-xl" }, /* @__PURE__ */ React.createElement("div", { className: "w-full flex justify-between items-end" }, children))));
  };
  const PageBody = ({ children }) => /* @__PURE__ */ React.createElement("div", { className: "py-8 px-6 xl:px-12" }, children);
  const PageBodyNarrow = ({ children }) => /* @__PURE__ */ React.createElement("div", { className: "py-10 px-6 xl:px-12" }, /* @__PURE__ */ React.createElement("div", { className: "w-full mx-auto max-w-screen-xl" }, children));
  const TooltipProvider = TooltipPrimitive__namespace.Provider;
  const Tooltip = TooltipPrimitive__namespace.Root;
  const TooltipTrigger = TooltipPrimitive__namespace.Trigger;
  const TooltipContent = React__namespace.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ React__namespace.createElement(TooltipPrimitive__namespace.Portal, null, /* @__PURE__ */ React__namespace.createElement(
    TooltipPrimitive__namespace.Content,
    {
      ref,
      sideOffset,
      className: cn(
        "z-[10000] overflow-hidden rounded-md bg-[#FFF] px-3 py-1.5 text-xs text-[#504E5E] shadow-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      ),
      ...props
    }
  )));
  TooltipContent.displayName = TooltipPrimitive__namespace.Content.displayName;
  const folderRegex = /^.*\/~\/*(.*)$/;
  const parentFolder = (folder) => {
    return {
      ...folder,
      name: folder.name.split("/").slice(0, -1).join("/"),
      fullyQualifiedName: folder.fullyQualifiedName.split("/").slice(0, -1).join("/"),
      parentName: folder.parentName.split("/").slice(0, -1).join("/")
    };
  };
  const useCollectionFolder = () => {
    const [folder, setFolder] = React.useState({
      loading: true,
      name: "",
      fullyQualifiedName: "",
      parentName: ""
    });
    const loc = reactRouterDom.useLocation();
    React.useEffect(() => {
      const match = loc.pathname.match(folderRegex);
      const folderName = match ? decodeURIComponent(match[1]) : "";
      const update = {
        name: folderName,
        fullyQualifiedName: match ? folderName ? `~/${folderName}` : "~" : "",
        loading: false,
        parentName: ""
      };
      if (update.fullyQualifiedName) {
        const pathParts = update.fullyQualifiedName.split("/");
        update.parentName = `/${pathParts.slice(0, pathParts.length - 1).join("/")}`;
      }
      setFolder({
        ...folder,
        ...update
      });
    }, [loc]);
    return folder;
  };
  const LOCAL_STORAGE_KEY = "tinacms.admin.collection.list.page";
  const isSSR = typeof window === "undefined";
  const TemplateMenu = ({
    templates,
    folder,
    collectionName
  }) => {
    return /* @__PURE__ */ React.createElement(react.Menu, { as: "div", className: "relative inline-block text-left" }, () => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(react.MenuButton, { className: "icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded-full justify-center transition-all duration-150 ease-out  shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-sm h-10 px-6" }, "Create New ", /* @__PURE__ */ React.createElement(BiPlus, { className: "w-5 h-full ml-1 opacity-70" }))), /* @__PURE__ */ React.createElement(
      react.Transition,
      {
        enter: "transition ease-out duration-100",
        enterFrom: "transform opacity-0 scale-95",
        enterTo: "transform opacity-100 scale-100",
        leave: "transition ease-in duration-75",
        leaveFrom: "transform opacity-100 scale-100",
        leaveTo: "transform opacity-0 scale-95"
      },
      /* @__PURE__ */ React.createElement(react.MenuItems, { className: "origin-top-right absolute right-0 mt-2 z-menu w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" }, /* @__PURE__ */ React.createElement("div", { className: "py-1" }, templates.map((template) => /* @__PURE__ */ React.createElement(react.MenuItem, { key: `${template.label}-${template.name}` }, ({ focus }) => /* @__PURE__ */ React.createElement(
        reactRouterDom.Link,
        {
          to: `/${folder.fullyQualifiedName ? [
            "collections",
            "new",
            collectionName,
            template.name,
            "~",
            folder.name
          ].join("/") : [
            "collections",
            "new",
            collectionName,
            template.name
          ].join("/")}`,
          className: `w-full text-md px-4 py-2 tracking-wide flex items-center transition ease-out duration-100 ${focus ? "text-blue-600 opacity-100 bg-gray-50" : "opacity-80 text-gray-600"}`
        },
        template.label
      )))))
    )));
  };
  const handleNavigate = async (navigate, cms, collection, collectionDefinition, document2) => {
    var _a, _b;
    const plugins2 = cms.plugins.all("tina-admin");
    const routeMapping = plugins2.find(({ name }) => name === "route-mapping");
    const tinaPreview = cms.flags.get("tina-preview") || false;
    let routeOverride = ((_a = collectionDefinition.ui) == null ? void 0 : _a.router) ? await ((_b = collectionDefinition.ui) == null ? void 0 : _b.router({
      document: document2,
      collection: collectionDefinition
    })) : routeMapping ? routeMapping.mapper(collection, document2) : void 0;
    if (routeOverride) {
      if (routeOverride.startsWith("/")) {
        routeOverride = routeOverride.slice(1);
      }
      tinaPreview ? navigate(`/~/${routeOverride}`) : window.location.href = routeOverride;
      return null;
    } else {
      const pathToDoc = document2._sys.breadcrumbs;
      navigate(
        `/${["collections", "edit", collection.name, ...pathToDoc].join("/")}`,
        { replace: true }
      );
    }
  };
  function getUniqueTemplateFields(collection) {
    const fieldSet = [];
    collection.templates.forEach((template) => {
      template.fields.filter((f) => {
        return fieldSet.find((x) => x.name === f.name) === void 0;
      }).forEach((field) => {
        fieldSet.push(field);
      });
    });
    return [...fieldSet];
  }
  const CollectionListPage = () => {
    const navigate = reactRouterDom.useNavigate();
    const { collectionName } = reactRouterDom.useParams();
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [renameModalOpen, setRenameModalOpen] = React.useState(false);
    const [folderModalOpen, setFolderModalOpen] = React.useState(false);
    const [vars, setVars] = React.useState({
      collection: collectionName,
      relativePath: "",
      relativePathWithoutExtension: "",
      newRelativePath: "",
      filterField: "",
      folderName: "",
      startsWith: "",
      endsWith: "",
      before: "",
      after: "",
      booleanEquals: null
    });
    const [endCursor, setEndCursor] = React.useState("");
    const [prevCursors, setPrevCursors] = React.useState([]);
    const [sortKey, setSortKey] = React.useState(
      // set sort key to cached value if it exists
      isSSR ? "" : window.localStorage.getItem(`${LOCAL_STORAGE_KEY}.${collectionName}`) || JSON.stringify({
        order: "asc",
        name: ""
      })
    );
    const [search, setSearch] = React.useState("");
    const [searchInput, setSearchInput] = React.useState("");
    const { order = "asc", name: sortName } = JSON.parse(sortKey || "{}");
    const [sortOrder, setSortOrder] = React.useState(order);
    const loc = reactRouterDom.useLocation();
    const folder = useCollectionFolder();
    React.useEffect(() => {
      setSortKey(
        window.localStorage.getItem(`${LOCAL_STORAGE_KEY}.${collectionName}`) || JSON.stringify({
          order: "asc",
          name: ""
        })
      );
      setEndCursor("");
      setPrevCursors([]);
      setSearch("");
      setSearchInput("");
    }, [loc]);
    React.useEffect(() => {
      setVars((old) => ({
        ...old,
        collection: collectionName,
        relativePath: "",
        relativePathWithoutExtension: "",
        newRelativePath: "",
        filterField: "",
        startsWith: "",
        endsWith: "",
        before: "",
        after: "",
        booleanEquals: null
      }));
    }, [collectionName]);
    return /* @__PURE__ */ React.createElement(GetCMS, null, (cms) => {
      return /* @__PURE__ */ React.createElement(PageWrapper, null, /* @__PURE__ */ React.createElement(
        GetCollection,
        {
          cms,
          collectionName,
          includeDocuments: true,
          startCursor: endCursor,
          sortKey,
          folder,
          filterArgs: (
            // only pass filter args if the collection is the same as the current route
            // We need this hear because this runs before the useEffect above
            collectionName === vars.collection ? vars : {
              collection: collectionName,
              relativePath: "",
              relativePathWithoutExtension: "",
              newRelativePath: "",
              filterField: "",
              startsWith: "",
              endsWith: "",
              before: "",
              after: "",
              booleanEquals: null
            }
          ),
          search
        },
        (collection, _loading, reFetchCollection, collectionExtra) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
          const documents = collection.documents.edges;
          const admin = cms.api.admin;
          const pageInfo = collection.documents.pageInfo;
          const fields = (((_a = collectionExtra.templates) == null ? void 0 : _a.length) ? getUniqueTemplateFields(collectionExtra) : collectionExtra.fields).filter(
            (x) => (
              // only allow sortable fields
              ["string", "number", "datetime", "boolean"].includes(x.type)
            )
          );
          const sortField = fields == null ? void 0 : fields.find(
            (field) => field.name === sortName
          );
          const searchEnabled = !!((_d = (_c = (_b = cms.api.tina.schema) == null ? void 0 : _b.config) == null ? void 0 : _c.config) == null ? void 0 : _d.search);
          const collectionDefinition = cms.api.tina.schema.getCollection(
            collection.name
          );
          const allowCreate = ((_f = (_e = collectionDefinition == null ? void 0 : collectionDefinition.ui) == null ? void 0 : _e.allowedActions) == null ? void 0 : _f.create) ?? true;
          const allowDelete = ((_h = (_g = collectionDefinition == null ? void 0 : collectionDefinition.ui) == null ? void 0 : _g.allowedActions) == null ? void 0 : _h.delete) ?? true;
          const allowCreateNestedFolder = ((_j = (_i = collectionDefinition == null ? void 0 : collectionDefinition.ui) == null ? void 0 : _i.allowedActions) == null ? void 0 : _j.createNestedFolder) ?? true;
          const folderView = folder.fullyQualifiedName !== "";
          return /* @__PURE__ */ React.createElement(React.Fragment, null, deleteModalOpen && !cms.api.tina.usingProtectedBranch() && /* @__PURE__ */ React.createElement(
            DeleteModal,
            {
              filename: vars.relativePath,
              checkRefsFunc: async () => {
                var _a2, _b2;
                try {
                  const doc = await admin.fetchDocument(
                    collection.name,
                    vars.relativePath,
                    true
                  );
                  return (_b2 = (_a2 = doc == null ? void 0 : doc.document) == null ? void 0 : _a2._sys) == null ? void 0 : _b2.hasReferences;
                } catch (error) {
                  cms.alerts.error(
                    "Document was not found, ask a developer for help or check the console for an error message"
                  );
                  console.error(error);
                  throw error;
                }
              },
              deleteFunc: async () => {
                try {
                  await admin.deleteDocument(vars);
                  cms.alerts.info(
                    "Document was successfully deleted"
                  );
                  reFetchCollection();
                } catch (error) {
                  if (error.message.indexOf("has references")) {
                    cms.alerts.error(
                      error.message.split("\n	").filter(Boolean)[1]
                    );
                    return;
                  }
                  cms.alerts.warn(
                    "Document was not deleted, ask a developer for help or check the console for an error message"
                  );
                  console.error(error);
                  throw error;
                }
              },
              close: () => setDeleteModalOpen(false)
            }
          ), deleteModalOpen && cms.api.tina.usingProtectedBranch() && /* @__PURE__ */ React.createElement(
            CreateBranchModal,
            {
              crudType: "delete",
              path: `${collectionExtra.path}/${vars.relativePath}`,
              values: vars,
              close: () => setDeleteModalOpen(false),
              safeSubmit: async () => {
                try {
                  await admin.deleteDocument(vars);
                  cms.alerts.info(
                    "Document was successfully deleted"
                  );
                  reFetchCollection();
                } catch (error) {
                  cms.alerts.warn(
                    "Document was not deleted, ask a developer for help or check the console for an error message"
                  );
                  console.error(error);
                  throw error;
                }
              }
            }
          ), renameModalOpen && /* @__PURE__ */ React.createElement(
            RenameModal,
            {
              filename: vars.relativePathWithoutExtension,
              newRelativePath: vars.newRelativePath,
              setNewRelativePath: (newRelativePath) => {
                setVars((vars2) => {
                  return { ...vars2, newRelativePath };
                });
              },
              renameFunc: async () => {
                const newRelativePath = `${vars.newRelativePath}.${collection.format}`;
                try {
                  await admin.renameDocument({
                    collection: vars.collection,
                    relativePath: vars.relativePath,
                    newRelativePath
                  });
                  cms.alerts.info(
                    "Document was successfully renamed"
                  );
                  reFetchCollection();
                } catch (error) {
                  if (error.message.indexOf("has references")) {
                    cms.alerts.error(
                      error.message.split("\n	").filter(Boolean)[1]
                    );
                    return;
                  }
                  cms.alerts.warn(
                    "Document was not renamed, ask a developer for help or check the console for an error message"
                  );
                  console.error(error);
                  throw error;
                }
              },
              close: () => setRenameModalOpen(false)
            }
          ), folderModalOpen && /* @__PURE__ */ React.createElement(
            FolderModal,
            {
              folderName: vars.folderName,
              setFolderName: (folderName) => {
                setVars((vars2) => {
                  return { ...vars2, folderName };
                });
              },
              createFunc: async () => {
                try {
                  admin.createFolder(
                    vars.collection,
                    folder.name ? [folder.name, vars.folderName].join("/") : vars.folderName
                  ).then(() => {
                    reFetchCollection();
                    navigate(
                      `/${[
                        "collections",
                        collectionName,
                        "~",
                        ...folder.name ? [folder.name, vars.folderName] : [vars.folderName]
                      ].join("/")}`,
                      { replace: true }
                    );
                    cms.alerts.info(
                      "Folder was successfully created"
                    );
                  }).catch((error) => {
                    throw error;
                  });
                } catch (error) {
                  cms.alerts.warn(
                    "Folder was not created, ask a developer for help or check the console for an error message"
                  );
                  console.error(error);
                  throw error;
                }
              },
              close: () => setFolderModalOpen(false)
            }
          ), /* @__PURE__ */ React.createElement(PageHeader, { isLocalMode: (_l = (_k = cms == null ? void 0 : cms.api) == null ? void 0 : _k.tina) == null ? void 0 : _l.isLocalMode }, /* @__PURE__ */ React.createElement("div", { className: "w-full" }, /* @__PURE__ */ React.createElement("h3", { className: "font-sans text-2xl text-gray-700" }, collection.label ? collection.label : collection.name), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col lg:flex-row justify-between lg:items-end pt-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-2 md:gap-4 items-start" }, (fields == null ? void 0 : fields.length) > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, !search && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2 items-start w-full md:w-auto" }, /* @__PURE__ */ React.createElement(
            "label",
            {
              htmlFor: "sort",
              className: "block font-sans text-xs font-semibold text-gray-500 whitespace-normal"
            },
            "Sort by"
          ), /* @__PURE__ */ React.createElement(
            Select,
            {
              name: "sort",
              options: [
                {
                  label: "Default",
                  value: JSON.stringify({
                    order: "asc",
                    name: ""
                  })
                },
                ...fields.flatMap((x) => [
                  {
                    label: (x.label || x.name) + (x.type === "datetime" ? " (Oldest First)" : " (Ascending)"),
                    value: JSON.stringify({
                      name: x.name,
                      order: "asc"
                    })
                  },
                  {
                    label: (x.label || x.name) + (x.type === "datetime" ? " (Newest First)" : " (Descending)"),
                    value: JSON.stringify({
                      name: x.name,
                      order: "desc"
                    })
                  }
                ])
              ],
              input: {
                id: "sort",
                name: "sort",
                value: sortKey,
                onChange: (e) => {
                  const val = JSON.parse(
                    e.target.value
                  );
                  setEndCursor("");
                  setPrevCursors([]);
                  window == null ? void 0 : window.localStorage.setItem(
                    `${LOCAL_STORAGE_KEY}.${collectionName}`,
                    e.target.value
                  );
                  setSortKey(e.target.value);
                  setSortOrder(val.order);
                }
              }
            }
          ))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-1 flex-col gap-2 items-start w-full" }, searchEnabled ? /* @__PURE__ */ React.createElement(
            SearchInput,
            {
              loading: _loading,
              search,
              setSearch,
              searchInput,
              setSearchInput
            }
          ) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2 items-start w-full md:w-auto" }, /* @__PURE__ */ React.createElement("div", { className: "h-4" }), /* @__PURE__ */ React.createElement(
            Message,
            {
              link: "https://tina.io/docs/reference/search/overview",
              linkLabel: "Read The Docs",
              type: "info",
              size: "small"
            },
            "Search not configured."
          )))), allowCreate && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row items-start md:items-end gap-2 md:gap-0 pt-4 lg:pt-0" }, allowCreateNestedFolder && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(TooltipProvider, null, /* @__PURE__ */ React.createElement(Tooltip, null, /* @__PURE__ */ React.createElement(TooltipTrigger, { asChild: true }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(
            reactRouterDom.Link,
            {
              onMouseDown: (evt) => {
                if (collection.templates) {
                  evt.preventDefault();
                  return;
                }
                setVars((old) => ({
                  ...old,
                  collection: collectionName,
                  folderName: ""
                }));
                setFolderModalOpen(true);
                evt.stopPropagation();
              },
              to: "/collections/new-folder",
              className: cn(
                "icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded-full justify-center transition-all duration-150 ease-out whitespace-nowrap shadow text-blue-500 bg-white hover:bg-[#f1f5f9] focus:ring-white focus:ring-blue-500 w-full md:w-auto text-sm h-10 px-6 mr-4",
                collection.templates && "opacity-50 pointer-events-none cursor-not-allowed"
              ),
              "aria-disabled": !!collection.templates,
              tabIndex: collection.templates ? -1 : 0
            },
            /* @__PURE__ */ React.createElement(FaFolder, { className: "mr-2" }),
            "Add Folder"
          ))), collection.templates && /* @__PURE__ */ React.createElement(
            TooltipContent,
            {
              side: "top",
              align: "center"
            },
            /* @__PURE__ */ React.createElement("p", null, "Folders can’t be manually added when using templates.", /* @__PURE__ */ React.createElement("br", null), "See the docs -", " ", /* @__PURE__ */ React.createElement(
              "a",
              {
                href: "https://tina.io/docs/reference/templates",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "underline text-blue-500"
              },
              "https://tina.io/docs/reference/templates"
            ))
          )))), !collection.templates && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
            reactRouterDom.Link,
            {
              to: `/${folder.fullyQualifiedName ? [
                "collections",
                "new",
                collectionName,
                "~",
                folder.name
              ].join("/") : [
                "collections",
                "new",
                collectionName
              ].join("/")}`,
              className: "inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded-full justify-center transition-all duration-150 ease-out whitespace-nowrap shadow text-white bg-blue-500 hover:bg-blue-600 w-full md:w-auto text-sm h-10 px-6"
            },
            /* @__PURE__ */ React.createElement(FaFile, { className: "mr-2" }),
            "Add Files",
            " "
          )), collection.templates && /* @__PURE__ */ React.createElement(
            TemplateMenu,
            {
              collectionName,
              templates: collection.templates,
              folder
            }
          ))))), /* @__PURE__ */ React.createElement(PageBody, null, /* @__PURE__ */ React.createElement("div", { className: "w-full mx-auto max-w-screen-xl" }, sortField && !sortField.required && /* @__PURE__ */ React.createElement("p", { className: "mb-4 text-gray-500" }, /* @__PURE__ */ React.createElement("em", null, "Sorting on a non-required field. Some documents may be excluded (if they don't have a value for", " ", sortName, ")")), /* @__PURE__ */ React.createElement("div", { className: "w-full overflow-x-auto" }, (folder.name && !search || documents.length > 0) && /* @__PURE__ */ React.createElement("table", { className: "table-auto shadow bg-white border-b border-gray-200 w-full max-w-full rounded-lg" }, /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-gray-150" }, folder.name && !search ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 5 }, /* @__PURE__ */ React.createElement(
            Breadcrumb,
            {
              folder,
              navigate,
              collectionName
            }
          ))) : null, documents.length > 0 && documents.map((document2) => {
            var _a2;
            if (document2.node.__typename === "Folder") {
              return /* @__PURE__ */ React.createElement(
                "tr",
                {
                  key: `folder-${document2.node.path}`
                },
                /* @__PURE__ */ React.createElement("td", { className: "pl-5 pr-3 py-3" }, /* @__PURE__ */ React.createElement(
                  "a",
                  {
                    className: "text-blue-600 hover:text-blue-400 flex items-center gap-3 cursor-pointer truncate",
                    onClick: () => {
                      navigate(
                        `/${[
                          "collections",
                          collectionName,
                          document2.node.path
                        ].join("/")}`,
                        { replace: true }
                      );
                    }
                  },
                  /* @__PURE__ */ React.createElement(BiFolder, { className: "inline-block h-6 w-auto flex-shrink-0 opacity-70" }),
                  /* @__PURE__ */ React.createElement("span", { className: "truncate block" }, /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-gray-400 mb-1 uppercase" }, "Name"), /* @__PURE__ */ React.createElement("span", { className: "h-5 leading-5 block truncate" }, /* @__PURE__ */ React.createElement("span", null, document2.node.name)))
                )),
                /* @__PURE__ */ React.createElement("td", { className: "px-3 py-3", colSpan: 4 }, /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-gray-400 mb-1 uppercase" }, "Path"), /* @__PURE__ */ React.createElement("span", { className: "leading-5 block text-sm font-medium text-gray-900 truncate" }, document2.node.path.substring(2).split("/").map((node) => {
                  return /* @__PURE__ */ React.createElement("span", { key: node }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-300 pr-0.5" }, "/"), /* @__PURE__ */ React.createElement("span", { className: "pr-0.5" }, node));
                })))
              );
            }
            const hasTitle = Boolean(
              document2.node._sys.title
            );
            const subfolders = document2.node._sys.breadcrumbs.slice(0, -1).join("/");
            return /* @__PURE__ */ React.createElement(
              "tr",
              {
                key: `document-${document2.node._sys.relativePath}`
              },
              /* @__PURE__ */ React.createElement(
                "td",
                {
                  className: "pl-5 pr-3 py-3",
                  colSpan: hasTitle ? 1 : 2
                },
                /* @__PURE__ */ React.createElement(
                  "a",
                  {
                    className: "text-blue-600 hover:text-blue-400 flex items-center gap-3 cursor-pointer truncate",
                    onClick: () => {
                      handleNavigate(
                        navigate,
                        cms,
                        collection,
                        collectionDefinition,
                        document2.node
                      );
                    }
                  },
                  /* @__PURE__ */ React.createElement(BiFile, { className: "inline-block h-6 w-auto flex-shrink-0 opacity-70" }),
                  /* @__PURE__ */ React.createElement("span", { className: "truncate block" }, /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-gray-400 mb-1 uppercase" }, hasTitle ? "Title" : "Filename"), /* @__PURE__ */ React.createElement("span", { className: "h-5 leading-5 block truncate mb-1" }, !folderView && !hasTitle && subfolders && /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400" }, `${subfolders}/`), /* @__PURE__ */ React.createElement("span", null, hasTitle ? (_a2 = document2.node._sys) == null ? void 0 : _a2.title : document2.node._sys.filename)), /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-gray-400" }, document2.node._sys.path))
                )
              ),
              hasTitle && /* @__PURE__ */ React.createElement("td", { className: "px-3 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-gray-400 mb-1 uppercase" }, "Filename"), /* @__PURE__ */ React.createElement("span", { className: "h-5 leading-5 block text-sm font-medium text-gray-900 truncate" }, !folderView && subfolders && /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400" }, `${subfolders}/`), /* @__PURE__ */ React.createElement("span", null, document2.node._sys.filename))),
              /* @__PURE__ */ React.createElement("td", { className: "px-3 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-gray-400 mb-1 uppercase" }, "Extension"), /* @__PURE__ */ React.createElement("span", { className: "h-5 leading-5 block text-sm font-medium text-gray-900" }, document2.node._sys.extension)),
              /* @__PURE__ */ React.createElement("td", { className: "px-3 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-gray-400 mb-1 uppercase" }, "Template"), /* @__PURE__ */ React.createElement("span", { className: "h-5 leading-5 block text-sm font-medium text-gray-900" }, document2.node._sys.template)),
              /* @__PURE__ */ React.createElement("td", { className: "w-0" }, /* @__PURE__ */ React.createElement(
                OverflowMenu$1,
                {
                  toolbarItems: [
                    {
                      name: "edit",
                      label: "Edit in Admin",
                      Icon: /* @__PURE__ */ React.createElement(BiEdit, { size: "1.3rem" }),
                      onMouseDown: () => {
                        const pathToDoc = document2.node._sys.breadcrumbs;
                        if (folder.fullyQualifiedName) {
                          pathToDoc.unshift("~");
                        }
                        navigate(
                          `/${[
                            "collections",
                            "edit",
                            collectionName,
                            ...pathToDoc
                          ].join("/")}`,
                          { replace: true }
                        );
                      }
                    },
                    allowCreate && {
                      name: "duplicate",
                      label: "Duplicate",
                      Icon: /* @__PURE__ */ React.createElement(BiCopy, { size: "1.3rem" }),
                      onMouseDown: () => {
                        const pathToDoc = document2.node._sys.breadcrumbs;
                        if (folder.fullyQualifiedName) {
                          pathToDoc.unshift("~");
                        }
                        navigate(
                          `/${[
                            "collections",
                            "duplicate",
                            collectionName,
                            ...pathToDoc
                          ].join("/")}`,
                          { replace: true }
                        );
                      }
                    },
                    allowDelete && {
                      name: "delete",
                      label: "Delete",
                      Icon: /* @__PURE__ */ React.createElement(
                        BiTrash,
                        {
                          size: "1.3rem",
                          className: "text-red-500"
                        }
                      ),
                      onMouseDown: () => {
                        setVars((old) => ({
                          ...old,
                          collection: collectionName,
                          relativePathWithoutExtension: document2.node._sys.breadcrumbs.join(
                            "/"
                          ),
                          relativePath: document2.node._sys.breadcrumbs.join(
                            "/"
                          ) + document2.node._sys.extension,
                          newRelativePath: ""
                        }));
                        setDeleteModalOpen(true);
                      }
                    },
                    allowDelete && {
                      name: "rename",
                      label: "Rename",
                      Icon: /* @__PURE__ */ React.createElement(
                        BiRename,
                        {
                          size: "1.3rem",
                          className: "text-red-500"
                        }
                      ),
                      onMouseDown: () => {
                        setVars((old) => ({
                          ...old,
                          collection: collectionName,
                          relativePathWithoutExtension: document2.node._sys.breadcrumbs.join(
                            "/"
                          ),
                          relativePath: document2.node._sys.breadcrumbs.join(
                            "/"
                          ) + document2.node._sys.extension,
                          newRelativePath: ""
                        }));
                        setRenameModalOpen(true);
                      }
                    }
                  ].filter(Boolean)
                }
              ))
            );
          })))), documents.length === 0 && /* @__PURE__ */ React.createElement(NoDocumentsPlaceholder, null), /* @__PURE__ */ React.createElement("div", { className: "pt-4" }, /* @__PURE__ */ React.createElement(
            CursorPaginator,
            {
              variant: "white",
              hasNext: sortOrder === "asc" ? pageInfo == null ? void 0 : pageInfo.hasNextPage : pageInfo.hasPreviousPage,
              navigateNext: () => {
                const newState = [...prevCursors, endCursor];
                setPrevCursors(newState);
                setEndCursor(pageInfo == null ? void 0 : pageInfo.endCursor);
              },
              hasPrev: prevCursors.length > 0,
              navigatePrev: () => {
                const prev = prevCursors[prevCursors.length - 1];
                if (typeof prev === "string") {
                  const newState = prevCursors.slice(0, -1);
                  setPrevCursors(newState);
                  setEndCursor(prev);
                }
              }
            }
          )))));
        }
      ));
    });
  };
  const SearchInput = ({
    loading,
    search,
    setSearch,
    searchInput,
    setSearchInput
  }) => {
    const [searchLoaded, setSearchLoaded] = React.useState(false);
    React.useEffect(() => {
      if (loading) {
        setSearchLoaded(false);
      } else {
        setSearchLoaded(true);
      }
    }, [loading]);
    return /* @__PURE__ */ React.createElement("form", { className: "flex flex-1 flex-col gap-2 items-start w-full" }, /* @__PURE__ */ React.createElement("div", { className: "h-4" }), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row items-start md:items-center w-full md:w-auto gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-[200px] w-full md:w-auto relative" }, /* @__PURE__ */ React.createElement(BiSearch, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        name: "search",
        placeholder: "Search...",
        value: searchInput,
        onChange: (e) => {
          setSearchInput(e.target.value);
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (searchInput.trim()) {
              setSearch(searchInput);
              setSearchLoaded(false);
            }
          }
        },
        className: "shadow appearance-none bg-white block pl-10 pr-10 py-2 truncate w-full text-base border border-gray-200 focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md placeholder:text-gray-300 text-gray-600 focus:text-gray-900"
      }
    ), search && searchLoaded && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.preventDefault();
          setSearch("");
          setSearchInput("");
        },
        className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      },
      /* @__PURE__ */ React.createElement(BiX, { className: "w-5 h-5" })
    ))));
  };
  const Breadcrumb = ({ folder, navigate, collectionName }) => {
    const folderArray = folder.name.split("/");
    return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-gray-50/30 flex items-stretch" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          const folders = folder.fullyQualifiedName.split("/");
          navigate(
            `/${[
              "collections",
              collectionName,
              ...folders.slice(0, folders.length - 1)
            ].join("/")}`,
            { replace: true }
          );
        },
        className: "px-3 py-2 bg-white hover:bg-gray-50/50 transition ease-out duration-100 border-r border-gray-100 text-blue-500 hover:text-blue-600"
      },
      /* @__PURE__ */ React.createElement(BiArrowBack, { className: "w-6 h-full opacity-70" })
    ), /* @__PURE__ */ React.createElement("span", { className: "px-3 py-2 text-gray-600 flex flex-wrap items-center justify-start gap-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          navigate(`/collections/${collectionName}/~`, {
            replace: true
          });
        },
        className: "shrink-0 bg-transparent p-0 border-0 text-blue-400 hover:text-blue-500 transition-all ease-out duration-100 opacity-70 hover:opacity-100"
      },
      /* @__PURE__ */ React.createElement(RiHome2Line, { className: "w-5 h-auto" })
    ), folderArray.map((node, index) => {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "text-gray-200 shrink-0" }, "/"), index < folderArray.length - 1 ? /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "bg-transparent whitespace-nowrap truncate p-0 border-0 text-blue-500 hover:text-blue-600 transition-all ease-out duration-100 underline underline-offset-2 decoration-1	decoration-blue-200 hover:decoration-blue-400",
          onClick: () => {
            const folders = folder.fullyQualifiedName.split("/");
            navigate(
              `/${[
                "collections",
                collectionName,
                ...folders.slice(
                  0,
                  folders.length - (folders.length - (index + 2))
                )
              ].join("/")}`,
              { replace: true }
            );
          }
        },
        node
      ) : /* @__PURE__ */ React.createElement("span", { className: "whitespace-nowrap truncate" }, node));
    })));
  };
  const NoDocumentsPlaceholder = () => {
    return /* @__PURE__ */ React.createElement("div", { className: "text-center px-5 py-3 flex flex-col items-center justify-center shadow border border-gray-100 bg-gray-50 border-b border-gray-200 w-full max-w-full rounded-lg" }, /* @__PURE__ */ React.createElement("p", { className: "text-base italic font-medium text-gray-300" }, "No documents found."));
  };
  const DeleteModal = ({
    close: close2,
    deleteFunc,
    checkRefsFunc,
    filename
  }) => {
    const [hasRefs, setHasRefs] = React.useState();
    React.useEffect(() => {
      checkRefsFunc().then((result) => {
        setHasRefs(result);
      });
    }, [filename, checkRefsFunc]);
    return /* @__PURE__ */ React.createElement(Modal, null, /* @__PURE__ */ React.createElement(PopupModal, null, /* @__PURE__ */ React.createElement(ModalHeader, { close: close2 }, "Delete ", filename), /* @__PURE__ */ React.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React.createElement("p", null, `Are you sure you want to delete ${filename}?${hasRefs ? " References to this document will also be deleted." : ""}`)), /* @__PURE__ */ React.createElement(ModalActions, null, /* @__PURE__ */ React.createElement(Button$1, { style: { flexGrow: 2 }, onClick: close2 }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button$1,
      {
        style: { flexGrow: 3 },
        variant: "danger",
        onClick: async () => {
          await deleteFunc();
          close2();
        }
      },
      "Delete"
    ))));
  };
  const FolderModal = ({
    close: close2,
    createFunc,
    folderName,
    setFolderName
  }) => {
    return /* @__PURE__ */ React.createElement(Modal, null, /* @__PURE__ */ React.createElement(PopupModal, null, /* @__PURE__ */ React.createElement(ModalHeader, { close: close2 }, "Create Folder"), /* @__PURE__ */ React.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      BaseTextField,
      {
        placeholder: "Enter the name of the new folder",
        value: folderName,
        onChange: (event) => setFolderName(event.target.value)
      }
    ))), /* @__PURE__ */ React.createElement(ModalActions, null, /* @__PURE__ */ React.createElement(Button$1, { style: { flexGrow: 2 }, onClick: close2 }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button$1,
      {
        style: { flexGrow: 3 },
        variant: "primary",
        onClick: async () => {
          await createFunc();
          close2();
        }
      },
      "Create"
    ))));
  };
  const RenameModal = ({
    close: close2,
    renameFunc,
    filename,
    newRelativePath,
    setNewRelativePath
  }) => {
    return /* @__PURE__ */ React.createElement(Modal, null, /* @__PURE__ */ React.createElement(PopupModal, null, /* @__PURE__ */ React.createElement(ModalHeader, { close: close2 }, "Rename ", filename), /* @__PURE__ */ React.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "mb-4" }, "Are you sure you want to rename ", /* @__PURE__ */ React.createElement("strong", null, filename), "?"), /* @__PURE__ */ React.createElement(
      BaseTextField,
      {
        placeholder: "Enter a new name for the document's file",
        value: newRelativePath,
        onChange: (event) => setNewRelativePath(event.target.value)
      }
    ))), /* @__PURE__ */ React.createElement(ModalActions, null, /* @__PURE__ */ React.createElement(Button$1, { style: { flexGrow: 2 }, onClick: close2 }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button$1,
      {
        style: { flexGrow: 3 },
        variant: "primary",
        onClick: async () => {
          await renameFunc();
          close2();
        },
        disabled: !newRelativePath || newRelativePath === filename
      },
      "Rename"
    ))));
  };
  const FullscreenError = ({
    title = "Error",
    errorMessage = "It looks like something went wrong."
  }) => {
    return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col justify-center items-center h-screen bg-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "text-red-500 text-4xl mb-6 flex items-center" }, /* @__PURE__ */ React.createElement(BiError, { className: "w-12 h-auto fill-current text-red-400 opacity-70 mr-1" }), " ", title), /* @__PURE__ */ React.createElement("p", { className: "text-gray-700 text-xl mb-8" }, errorMessage), /* @__PURE__ */ React.createElement(Button$1, { variant: "danger", onClick: () => window.location.reload() }, /* @__PURE__ */ React.createElement(BiSync, { className: "w-7 h-auto fill-current opacity-70 mr-1" }), " Reload"));
  };
  const isValidSortKey = (sortKey, collection) => {
    if (collection.fields) {
      const sortKeys = collection.fields.map((x) => x.name);
      return sortKeys.includes(sortKey);
    } else if (collection.templates) {
      const collectionMap = {};
      const conflictedFields = /* @__PURE__ */ new Set();
      for (const template of collection.templates) {
        for (const field of template.fields) {
          if (collectionMap[field.name]) {
            if (collectionMap[field.name].type !== field.type) {
              conflictedFields.add(field.name);
            }
          } else {
            collectionMap[field.name] = field;
          }
        }
      }
      for (const key in conflictedFields) {
        delete collectionMap[key];
      }
      for (const key in collectionMap) {
        if (key === sortKey) {
          return true;
        }
      }
      return false;
    }
  };
  const useGetCollection = (cms, collectionName, includeDocuments = true, folder, after = "", sortKey, filterArgs) => {
    const api = new TinaAdminApi(cms);
    const schema = cms.api.tina.schema;
    const collectionExtra = schema.getCollection(collectionName);
    const [collection, setCollection] = React.useState(void 0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(void 0);
    const [resetState, setResetSate] = React.useState(0);
    React.useEffect(() => {
      let cancelled = false;
      const fetchCollection = async () => {
        if (await api.isAuthenticated() && !folder.loading && !cancelled) {
          const { name, order } = JSON.parse(sortKey || "{}");
          const validSortKey = isValidSortKey(name, collectionExtra) ? name : void 0;
          try {
            const collection2 = await api.fetchCollection(
              collectionName,
              includeDocuments,
              (filterArgs == null ? void 0 : filterArgs.filterField) ? "" : folder.fullyQualifiedName,
              after,
              validSortKey,
              order,
              filterArgs
            );
            setCollection(collection2);
          } catch (error2) {
            cms.alerts.error(
              `[${error2.name}] GetCollection failed: ${error2.message}`
            );
            console.error(error2);
            setCollection(void 0);
            setError(error2);
          }
          setLoading(false);
        }
      };
      if (cancelled)
        return;
      setLoading(true);
      fetchCollection();
      return () => {
        cancelled = true;
      };
    }, [
      cms,
      collectionName,
      folder.loading,
      folder.fullyQualifiedName,
      resetState,
      after,
      sortKey
    ]);
    const reFetchCollection = () => setResetSate((x) => x + 1);
    return { collection, loading, error, reFetchCollection, collectionExtra };
  };
  const useSearchCollection = (cms, collectionName, includeDocuments = true, folder, after = "", search) => {
    const api = new TinaAdminApi(cms);
    const schema = cms.api.tina.schema;
    const collectionExtra = schema.getCollection(collectionName);
    const [collection, setCollection] = React.useState(void 0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(void 0);
    const [resetState, setResetSate] = React.useState(0);
    React.useEffect(() => {
      let cancelled = false;
      const searchCollection = async () => {
        if (await api.isAuthenticated() && !folder.loading && !cancelled) {
          try {
            const response = await cms.api.search.query(
              `${search} AND _collection:${collectionName}`,
              {
                limit: 15,
                cursor: after
              }
            );
            const docs = await Promise.allSettled(
              response.results.map((result) => {
                const [collection2, relativePath2] = result._id.split(":");
                return api.fetchDocument(collection2, relativePath2, false);
              })
            );
            const edges = docs.filter((p) => {
              var _a;
              return p.status === "fulfilled" && !!((_a = p.value) == null ? void 0 : _a.document);
            }).map((result) => ({ node: result.value.document }));
            const c = await api.fetchCollection(collectionName, false, "");
            setCollection({
              format: collection.format,
              label: collection.label,
              name: collectionName,
              templates: collection.templates,
              documents: {
                pageInfo: {
                  hasNextPage: !!response.nextCursor,
                  hasPreviousPage: !!response.prevCursor,
                  startCursor: "",
                  endCursor: response.nextCursor || ""
                },
                edges
              }
            });
          } catch (error2) {
            cms.alerts.error(
              `[${error2.name}] GetCollection failed: ${error2.message}`
            );
            console.error(error2);
            setCollection(void 0);
            setError(error2);
          }
          setLoading(false);
        }
      };
      if (cancelled)
        return;
      setLoading(true);
      searchCollection();
      return () => {
        cancelled = true;
      };
    }, [
      cms,
      collectionName,
      folder.loading,
      folder.fullyQualifiedName,
      resetState,
      after,
      search
    ]);
    const reFetchCollection = () => setResetSate((x) => x + 1);
    return { collection, loading, error, reFetchCollection, collectionExtra };
  };
  const GetCollection = ({
    cms,
    collectionName,
    folder,
    includeDocuments = true,
    startCursor,
    sortKey,
    children,
    filterArgs,
    search
  }) => {
    const navigate = reactRouterDom.useNavigate();
    const { collection, loading, error, reFetchCollection, collectionExtra } = search ? (
      // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
      useSearchCollection(
        cms,
        collectionName,
        includeDocuments,
        folder,
        startCursor || "",
        search
      )
    ) : (
      // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
      useGetCollection(
        cms,
        collectionName,
        includeDocuments,
        folder,
        startCursor || "",
        sortKey,
        filterArgs
      ) || {}
    );
    React.useEffect(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      if (loading)
        return;
      const collectionDefinition = cms.api.tina.schema.getCollection(
        collection.name
      );
      const allowCreate = ((_b = (_a = collectionDefinition == null ? void 0 : collectionDefinition.ui) == null ? void 0 : _a.allowedActions) == null ? void 0 : _b.create) ?? true;
      const allowDelete = ((_d = (_c = collectionDefinition == null ? void 0 : collectionDefinition.ui) == null ? void 0 : _c.allowedActions) == null ? void 0 : _d.delete) ?? true;
      const collectionResponse = collection;
      if (!allowCreate && !allowDelete && // Check there is only one document
      ((_f = (_e = collectionResponse.documents) == null ? void 0 : _e.edges) == null ? void 0 : _f.length) === 1 && // Check to make sure the file is not a folder
      ((_i = (_h = (_g = collectionResponse.documents) == null ? void 0 : _g.edges[0]) == null ? void 0 : _h.node) == null ? void 0 : _i.__typename) !== "Folder") {
        const doc = collectionResponse.documents.edges[0].node;
        handleNavigate(
          navigate,
          cms,
          collectionResponse,
          collectionDefinition,
          doc
        );
      }
    }, [(collection == null ? void 0 : collection.name) || "", loading]);
    if (error) {
      return /* @__PURE__ */ React.createElement(FullscreenError, null);
    }
    if (loading) {
      return /* @__PURE__ */ React.createElement(LoadingPage, null);
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, children(collection, loading, reFetchCollection, collectionExtra));
  };
  const ErrorDialog = (props) => {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          background: "#efefef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      /* @__PURE__ */ React.createElement("style", null, "        body {          margin: 0;        }      "),
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            background: "#fff",
            maxWidth: "400px",
            padding: "20px",
            fontFamily: "'Inter', sans-serif",
            borderRadius: "5px",
            boxShadow: "0 6px 24px rgb(0 37 91 / 5%), 0 2px 4px rgb(0 37 91 / 3%)"
          }
        },
        /* @__PURE__ */ React.createElement("h3", { style: { color: "#eb6337" } }, props.title),
        /* @__PURE__ */ React.createElement("p", null, props.message, ":"),
        /* @__PURE__ */ React.createElement(
          "pre",
          {
            style: { marginTop: "1rem", overflowX: "auto" }
          },
          `${props.error}`
        ),
        /* @__PURE__ */ React.createElement("p", null, "See our", " ", /* @__PURE__ */ React.createElement(
          "a",
          {
            className: "text-gray-600",
            style: { textDecoration: "underline" },
            href: "https://tina.io/docs/errors/faq/",
            target: "_blank"
          },
          " ",
          "Error FAQ",
          " "
        ), " ", "for more information.")
      )
    );
  };
  const createDocument = async (cms, collection, template, mutationInfo, folder, values) => {
    const api = new TinaAdminApi(cms);
    const { filename, ...leftover } = values;
    if (typeof filename !== "string") {
      throw new Error("Filename must be a string");
    }
    const appendFolder = folder && !filename.startsWith("/") ? `/${folder}/` : "/";
    const relativePath2 = `${appendFolder}${filename}.${collection.format}`;
    const params = api.schema.transformPayload(collection.name, {
      _collection: collection.name,
      ...template && { _template: template.name },
      ...leftover
    });
    if (await api.isAuthenticated()) {
      await api.createDocument(collection, relativePath2, params);
    } else {
      const authMessage = `CreateDocument failed: User is no longer authenticated; please login and try again.`;
      cms.alerts.error(authMessage);
      console.error(authMessage);
      return false;
    }
  };
  const CollectionCreatePage = () => {
    const folder = useCollectionFolder();
    const { collectionName, templateName } = reactRouterDom.useParams();
    return /* @__PURE__ */ React.createElement(GetCMS, null, (cms) => /* @__PURE__ */ React.createElement(
      GetCollection,
      {
        cms,
        collectionName,
        folder,
        includeDocuments: false
      },
      (collection) => {
        const mutationInfo = {
          includeCollection: true,
          includeTemplate: !!collection.templates
        };
        return /* @__PURE__ */ React.createElement(
          RenderForm$1,
          {
            cms,
            collection,
            templateName,
            mutationInfo,
            folder
          }
        );
      }
    ));
  };
  const FilenameInput = (props) => {
    const [filenameTouched, setFilenameTouched] = React.useState(false);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "group relative block cursor-pointer",
        onClick: () => {
          setFilenameTouched(true);
        }
      },
      /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "text",
          className: `shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base pr-3 truncate py-2 w-full border transition-all ease-out duration-150 focus:text-gray-900 rounded-md ${props.readonly || !filenameTouched ? "bg-gray-50 text-gray-300  border-gray-150 pointer-events-none pl-8 group-hover:bg-white group-hover:text-gray-600  group-hover:border-gray-200" : "bg-white text-gray-600  border-gray-200 pl-3"}`,
          ...props,
          disabled: props.readonly || !filenameTouched
        }
      ),
      /* @__PURE__ */ React.createElement(
        FaLock,
        {
          className: `text-gray-400 absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none h-5 w-auto transition-opacity duration-150 ease-out ${!filenameTouched && !props.readonly ? "opacity-20 group-hover:opacity-0 group-active:opacity-0" : "opacity-0"}`
        }
      ),
      /* @__PURE__ */ React.createElement(
        FaUnlock,
        {
          className: `text-blue-500 absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none h-5 w-auto transition-opacity duration-150 ease-out ${!filenameTouched && !props.readonly ? "opacity-0 group-hover:opacity-80 group-active:opacity-80" : "opacity-0"}`
        }
      )
    );
  };
  const RenderForm$1 = ({
    cms,
    collection,
    folder,
    templateName,
    mutationInfo,
    customDefaults
  }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const navigate = reactRouterDom.useNavigate();
    const [formIsPristine, setFormIsPristine] = React.useState(true);
    const schema = cms.api.tina.schema;
    const schemaCollection = schema.getCollection(collection.name);
    const template = schema.getTemplateForData({
      collection: schemaCollection,
      data: { _template: templateName }
    });
    const formInfo = schemaTools.resolveForm({
      collection: schemaCollection,
      basename: schemaCollection.name,
      schema,
      template
    });
    let slugFunction = (_b = (_a = schemaCollection.ui) == null ? void 0 : _a.filename) == null ? void 0 : _b.slugify;
    if (!slugFunction) {
      const titleField = (_c = template == null ? void 0 : template.fields.find(
        (x) => x.required && x.type === "string" && x.isTitle
      )) == null ? void 0 : _c.name;
      if (titleField) {
        slugFunction = (values) => {
          var _a2;
          return (_a2 = values[titleField]) == null ? void 0 : _a2.replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
        };
      }
    }
    const defaultItem2 = customDefaults || // @ts-ignore internal types aren't up to date
    ((_d = template.ui) == null ? void 0 : _d.defaultItem) || // @ts-ignore
    (template == null ? void 0 : template.defaultItem) || {};
    const filenameField = {
      name: "filename",
      label: "Filename",
      component: slugFunction ? wrapFieldsWithMeta(({ field, input, meta }) => {
        var _a2, _b2;
        return /* @__PURE__ */ React.createElement(
          FilenameInput,
          {
            readOnly: (_b2 = (_a2 = schemaCollection == null ? void 0 : schemaCollection.ui) == null ? void 0 : _a2.filename) == null ? void 0 : _b2.readonly,
            ...input
          }
        );
      }) : "text",
      disabled: (_f = (_e = schemaCollection == null ? void 0 : schemaCollection.ui) == null ? void 0 : _e.filename) == null ? void 0 : _f.readonly,
      description: ((_h = (_g = collection.ui) == null ? void 0 : _g.filename) == null ? void 0 : _h.description) ? /* @__PURE__ */ React.createElement(
        "span",
        {
          dangerouslySetInnerHTML: { __html: collection.ui.filename.description }
        }
      ) : /* @__PURE__ */ React.createElement("span", null, "A unique filename for the content.", /* @__PURE__ */ React.createElement("br", null), "Examples: ", /* @__PURE__ */ React.createElement("code", null, "My_Document"), ", ", /* @__PURE__ */ React.createElement("code", null, "My_Document.en"), ",", " ", /* @__PURE__ */ React.createElement("code", null, "sub-folder/My_Document")),
      placeholder: "My_Document",
      validate: (value, allValues, meta) => {
        var _a2, _b2;
        if (!value) {
          if (meta.dirty) {
            return "Required";
          }
          return true;
        }
        const isValid = /[\.\-_\/a-zA-Z0-9]*$/.test(value);
        if (value && !isValid) {
          return "Must contain only a-z, A-Z, 0-9, -, _, ., or /.";
        }
        if (((_a2 = schemaCollection.match) == null ? void 0 : _a2.exclude) || ((_b2 = schemaCollection.match) == null ? void 0 : _b2.include)) {
          const filePath = `${schemaTools.normalizePath(schemaCollection.path)}/${value}.${schemaCollection.format || "md"}`;
          const match = schema == null ? void 0 : schema.matchFiles({
            files: [filePath],
            collection: schemaCollection
          });
          if ((match == null ? void 0 : match.length) === 0) {
            return `The filename "${value}" is not allowed for this collection.`;
          }
        }
      }
    };
    const form = React.useMemo(() => {
      var _a2, _b2, _c2, _d2;
      const folderName = folder.fullyQualifiedName ? folder.name : "";
      return new Form({
        crudType: "create",
        initialValues: typeof defaultItem2 === "function" ? { ...defaultItem2(), _template: templateName } : { ...defaultItem2, _template: templateName },
        extraSubscribeValues: { active: true, submitting: true, touched: true },
        onChange: (values) => {
          var _a3, _b3;
          if (!(values == null ? void 0 : values.submitting)) {
            const filename = (_a3 = values == null ? void 0 : values.values) == null ? void 0 : _a3.filename;
            const appendFolder = folderName && !(filename == null ? void 0 : filename.startsWith("/")) ? `/${folderName}/` : "/";
            form.relativePath = schemaCollection.path + appendFolder + `${filename}.${schemaCollection.format || "md"}`;
          }
          if (slugFunction && (values == null ? void 0 : values.active) !== "filename" && !(values == null ? void 0 : values.submitting) && !((_b3 = values.touched) == null ? void 0 : _b3.filename)) {
            const value = slugFunction(values.values, {
              template,
              collection: schemaCollection
            });
            form.finalForm.change("filename", value);
          }
        },
        id: schemaCollection.path + folderName + `/new-post.${schemaCollection.format || "md"}`,
        label: "form",
        fields: [
          ((_b2 = (_a2 = collection.ui) == null ? void 0 : _a2.filename) == null ? void 0 : _b2.showFirst) && filenameField,
          ...formInfo.fields,
          !((_d2 = (_c2 = collection.ui) == null ? void 0 : _c2.filename) == null ? void 0 : _d2.showFirst) && filenameField
        ].filter((x) => !!x),
        onSubmit: async (values) => {
          try {
            const folderName2 = folder.fullyQualifiedName ? folder.name : "";
            await createDocument(
              cms,
              collection,
              template,
              mutationInfo,
              folderName2,
              values
            );
            cms.alerts.success("Document created!");
            setTimeout(() => {
              navigate(
                `/collections/${collection.name}${folder.fullyQualifiedName ? `/${folder.fullyQualifiedName}` : ""}`
              );
            }, 10);
          } catch (error) {
            console.error(error);
            const defaultErrorText = "There was a problem saving your document.";
            if (error.message.includes("already exists")) {
              cms.alerts.error(
                `${defaultErrorText} The "Filename" is already used for another document, please modify it.`
              );
            } else {
              cms.alerts.error(
                () => ErrorDialog({
                  title: defaultErrorText,
                  message: "Tina caught an error while creating the page",
                  error
                })
              );
            }
            throw new Error(
              `[${error.name}] CreateDocument failed: ${error.message}`
            );
          }
        }
      });
    }, [cms, collection, mutationInfo]);
    React.useEffect(() => {
      cms.dispatch({ type: "forms:add", value: form });
      cms.dispatch({ type: "forms:set-active-form-id", value: form.id });
      return () => {
        cms.dispatch({ type: "forms:remove", value: form.id });
        cms.dispatch({ type: "forms:set-active-form-id", value: null });
      };
    }, [JSON.stringify(formInfo.fields)]);
    if (!cms.state.activeFormId) {
      return null;
    }
    const activeForm = cms.state.forms.find(
      ({ tinaForm }) => tinaForm.id === form.id
    );
    return /* @__PURE__ */ React.createElement(PageWrapper, null, /* @__PURE__ */ React.createElement(React.Fragment, null, ((_j = (_i = cms == null ? void 0 : cms.api) == null ? void 0 : _i.tina) == null ? void 0 : _j.isLocalMode) ? /* @__PURE__ */ React.createElement(LocalWarning, null) : /* @__PURE__ */ React.createElement(BillingWarning, null), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `pt-10 xl:pt-3 pb-10 xl:pb-4 px-20 xl:px-12 border-b border-gray-200 bg-white w-full grow-0 shrink basis-0 flex justify-center`
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-full flex gap-1.5 justify-between items-center" }, /* @__PURE__ */ React.createElement(
        reactRouterDom.Link,
        {
          to: `/collections/${collection.name}${folder.fullyQualifiedName ? `/${folder.fullyQualifiedName}` : ""}`,
          className: "flex-0 text-blue-500 hover:text-blue-400 hover:underline underline decoration-blue-200 hover:decoration-blue-400 text-sm leading-tight whitespace-nowrap truncate transition-all duration-150 ease-out"
        },
        collection.label ? collection.label : collection.name
      ), /* @__PURE__ */ React.createElement("span", { className: "opacity-30 text-sm leading-tight whitespace-nowrap flex-0" }, "/"), /* @__PURE__ */ React.createElement("span", { className: "flex-1 w-full text-sm leading-tight whitespace-nowrap truncate" }, "Create New"), /* @__PURE__ */ React.createElement(FormStatus, { pristine: formIsPristine }))
    ), activeForm && /* @__PURE__ */ React.createElement(FormBuilder, { form: activeForm, onPristineChange: setFormIsPristine })));
  };
  const useGetDocument = (cms, collectionName, relativePath2) => {
    const api = new TinaAdminApi(cms);
    const [document2, setDocument] = React.useState(void 0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(void 0);
    React.useEffect(() => {
      const fetchDocument = async () => {
        if (api.isAuthenticated()) {
          try {
            const response = await api.fetchDocument(
              collectionName,
              relativePath2
            );
            setDocument(response.document);
          } catch (error2) {
            cms.alerts.error(
              `[${error2.name}] GetDocument failed: ${error2.message}`
            );
            console.error(error2);
            setDocument(void 0);
            setError(error2);
          }
          setLoading(false);
        }
      };
      setLoading(true);
      fetchDocument();
    }, [cms, collectionName, relativePath2]);
    return { document: document2, loading, error };
  };
  const GetDocument = ({
    cms,
    collectionName,
    relativePath: relativePath2,
    children
  }) => {
    const { document: document2, loading, error } = useGetDocument(
      cms,
      collectionName,
      relativePath2
    );
    if (error) {
      return /* @__PURE__ */ React.createElement(FullscreenError, null);
    }
    if (loading) {
      return /* @__PURE__ */ React.createElement(LoadingPage, null);
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, children(document2, loading));
  };
  const CollectionDuplicatePage = () => {
    const folder = useCollectionFolder();
    const { collectionName, ...rest } = reactRouterDom.useParams();
    const { "*": filename } = rest;
    return /* @__PURE__ */ React.createElement(GetCMS, null, (cms) => /* @__PURE__ */ React.createElement(
      GetCollection,
      {
        cms,
        collectionName,
        folder,
        includeDocuments: false
      },
      (collection) => {
        const relativePath2 = `${filename.startsWith("~/") ? filename.substring(2) : filename}.${collection.format}`;
        const mutationInfo = {
          includeCollection: true,
          includeTemplate: !!collection.templates
        };
        return /* @__PURE__ */ React.createElement(
          GetDocument,
          {
            cms,
            collectionName: collection.name,
            relativePath: relativePath2
          },
          (document2) => {
            var _a;
            return /* @__PURE__ */ React.createElement(
              RenderForm$1,
              {
                cms,
                collection,
                templateName: (_a = document2._values) == null ? void 0 : _a._template,
                folder: parentFolder(folder),
                mutationInfo,
                customDefaults: document2._values
              }
            );
          }
        );
      }
    ));
  };
  const updateDocument = async (cms, relativePath2, collection, mutationInfo, values) => {
    const api = new TinaAdminApi(cms);
    const params = api.schema.transformPayload(collection.name, values);
    if (await api.isAuthenticated()) {
      await api.updateDocument(collection, relativePath2, params);
    } else {
      const authMessage = `UpdateDocument failed: User is no longer authenticated; please login and try again.`;
      cms.alerts.error(authMessage);
      console.error(authMessage);
      return false;
    }
  };
  const CollectionUpdatePage = () => {
    const { collectionName, ...rest } = reactRouterDom.useParams();
    const folder = useCollectionFolder();
    const { "*": filename } = rest;
    const resolvedFile = folder.fullyQualifiedName ? folder.name : filename;
    return /* @__PURE__ */ React.createElement(GetCMS, null, (cms) => /* @__PURE__ */ React.createElement(
      GetCollection,
      {
        cms,
        collectionName,
        folder,
        includeDocuments: false
      },
      (collection) => {
        const relativePath2 = `${resolvedFile}.${collection.format}`;
        const mutationInfo = {
          includeCollection: true,
          includeTemplate: !!collection.templates
        };
        return /* @__PURE__ */ React.createElement(PageWrapper, null, /* @__PURE__ */ React.createElement(
          GetDocument,
          {
            cms,
            collectionName: collection.name,
            relativePath: relativePath2
          },
          (document2) => /* @__PURE__ */ React.createElement(
            RenderForm,
            {
              cms,
              document: document2,
              filename: resolvedFile,
              relativePath: relativePath2,
              collection,
              mutationInfo
            }
          )
        ));
      }
    ));
  };
  const RenderForm = ({
    cms,
    document: document2,
    filename,
    relativePath: relativePath2,
    collection,
    mutationInfo
  }) => {
    var _a, _b;
    const [formIsPristine, setFormIsPristine] = React.useState(true);
    const schema = cms.api.tina.schema;
    const parentFolder2 = relativePath2.split("/").slice(0, -1).join("/");
    const schemaCollection = schema.getCollection(collection.name);
    const template = schema.getTemplateForData({
      collection: schemaCollection,
      data: document2._values
    });
    const formInfo = schemaTools.resolveForm({
      collection: schemaCollection,
      basename: schemaCollection.name,
      schema,
      template
    });
    const form = React.useMemo(() => {
      return new Form({
        // id is the full document path
        id: schemaTools.canonicalPath(`${schemaCollection.path}/${relativePath2}`),
        label: "form",
        fields: formInfo.fields,
        initialValues: document2._values,
        onSubmit: async (values) => {
          try {
            await updateDocument(
              cms,
              relativePath2,
              collection,
              mutationInfo,
              values
            );
            cms.alerts.success("Document updated!");
          } catch (error) {
            cms.alerts.error(
              () => ErrorDialog({
                title: "There was a problem saving your document",
                message: "Tina caught an error while updating the page",
                error
              })
            );
            console.error(error);
            throw new Error(
              `[${error.name}] UpdateDocument failed: ${error.message}`
            );
          }
        }
      });
    }, [cms, document2, relativePath2, collection, mutationInfo]);
    React.useEffect(() => {
      cms.dispatch({ type: "forms:add", value: form });
      cms.dispatch({ type: "forms:set-active-form-id", value: form.id });
      return () => {
        cms.dispatch({ type: "forms:remove", value: form.id });
        cms.dispatch({ type: "forms:set-active-form-id", value: null });
      };
    }, [JSON.stringify(document2._values)]);
    if (!cms.state.activeFormId) {
      return null;
    }
    const activeForm = cms.state.forms.find(
      ({ tinaForm }) => tinaForm.id === form.id
    );
    return /* @__PURE__ */ React.createElement(React.Fragment, null, ((_b = (_a = cms == null ? void 0 : cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isLocalMode) ? /* @__PURE__ */ React.createElement(LocalWarning, null) : /* @__PURE__ */ React.createElement(BillingWarning, null), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `pt-10 xl:pt-3 pb-10 xl:pb-4 px-20 xl:px-12 border-b border-gray-200 bg-white w-full grow-0 shrink basis-0 flex justify-center`
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-full flex gap-1.5 justify-between items-center" }, /* @__PURE__ */ React.createElement(
        reactRouterDom.Link,
        {
          to: `/collections/${collection.name}/~${parentFolder2}`,
          className: "flex-0 text-blue-500 hover:text-blue-400 hover:underline underline decoration-blue-200 hover:decoration-blue-400 text-sm leading-tight whitespace-nowrap truncate transition-all duration-150 ease-out"
        },
        collection.label ? collection.label : collection.name
      ), /* @__PURE__ */ React.createElement("span", { className: "opacity-30 text-sm leading-tight whitespace-nowrap flex-0" }, "/"), /* @__PURE__ */ React.createElement("span", { className: "flex-1 w-full text-sm leading-tight whitespace-nowrap truncate" }, `${filename}.${collection.format}`), /* @__PURE__ */ React.createElement(FormStatus, { pristine: formIsPristine }))
    ), activeForm && /* @__PURE__ */ React.createElement(FormBuilder, { form: activeForm, onPristineChange: setFormIsPristine }));
  };
  const DashboardPage = () => {
    return /* @__PURE__ */ React.createElement(GetCMS, null, (cms) => {
      var _a, _b;
      return /* @__PURE__ */ React.createElement(PageWrapper, null, /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(PageHeader, { isLocalMode: (_b = (_a = cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isLocalMode }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-sans text-gray-700" }, "Welcome to Tina!")), /* @__PURE__ */ React.createElement(PageBodyNarrow, null, "This is your dashboard for editing or creating content. Select a collection on the left to begin.")));
    });
  };
  const ScreenPage = () => {
    const { screenName } = reactRouterDom.useParams();
    return /* @__PURE__ */ React.createElement(GetCMS, null, (cms) => {
      var _a, _b;
      const screens = cms.plugins.getType("screen").all();
      const selectedScreen = screens.find(
        ({ name }) => slugify(name) === screenName
      );
      return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-full flex flex-col items-stretch justify-between" }, ((_b = (_a = cms == null ? void 0 : cms.api) == null ? void 0 : _a.tina) == null ? void 0 : _b.isLocalMode) ? /* @__PURE__ */ React.createElement(LocalWarning, null) : /* @__PURE__ */ React.createElement(BillingWarning, null), /* @__PURE__ */ React.createElement(
        "div",
        {
          className: `xl:hidden py-5 border-b border-gray-200 bg-white pl-18`
        },
        selectedScreen.name
      ), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto relative flex flex-col items-stretch justify-between" }, /* @__PURE__ */ React.createElement(selectedScreen.Component, { close: () => {
      } })));
    });
  };
  const IndexingPage = () => {
    const cms = useCMS$1();
    const tinaApi = cms.api.tina;
    const currentBranch = tinaApi.branch;
    const kind = localStorage == null ? void 0 : localStorage.getItem("tina.createBranchState.kind");
    const { setCurrentBranch } = useBranchData();
    const [state, setState] = React.useState(
      localStorage == null ? void 0 : localStorage.getItem("tina.createBranchState")
    );
    const [errorMessage, setErrorMessage] = React.useState("");
    const [baseBranch, setBaseBranch] = React.useState(
      localStorage == null ? void 0 : localStorage.getItem("tina.createBranchState.baseBranch")
    );
    const [searchParams] = reactRouterDom.useSearchParams();
    const back = localStorage == null ? void 0 : localStorage.getItem("tina.createBranchState.back");
    const fullPath = localStorage == null ? void 0 : localStorage.getItem("tina.createBranchState.fullPath");
    const values = JSON.parse(
      localStorage == null ? void 0 : localStorage.getItem("tina.createBranchState.values")
    );
    const [branch, setBranch] = React.useState(
      "tina/" + searchParams.get("branch")
    );
    React.useEffect(() => {
      const run = async () => {
        if (state === "starting") {
          try {
            console.log("starting", branch, formatBranchName(branch));
            const name = await tinaApi.createBranch({
              branchName: formatBranchName(branch),
              baseBranch: currentBranch
            });
            if (!name) {
              throw new Error("Branch creation failed.");
            }
            setBranch(name);
            localStorage.setItem("tina.createBranchState", "indexing");
            cms.alerts.success("Branch created.");
            setState("indexing");
          } catch (e) {
            console.error(e);
            cms.alerts.error("Branch creation failed: " + e.message);
            setErrorMessage(
              "Branch creation failed, please try again. By refreshing the page."
            );
            setState("error");
          }
        }
        if (state === "indexing") {
          try {
            const [
              // When this promise resolves, we know the index status is no longer 'inprogress' or 'unknown'
              waitForIndexStatusPromise,
              // Calling this function will cancel the polling
              _cancelWaitForIndexFunc
            ] = tinaApi.waitForIndexStatus({
              ref: branch
            });
            await waitForIndexStatusPromise;
            cms.alerts.success("Branch indexed.");
            localStorage.setItem("tina.createBranchState", "submitting");
            setState("submitting");
          } catch {
            cms.alerts.error("Branch indexing failed.");
            setErrorMessage(
              'Branch indexing failed, please check the TinaCloud dashboard for more information. To try again chick "re-index" on the branch in the dashboard.'
            );
            setState("error");
          }
        }
        if (state === "submitting") {
          try {
            setBaseBranch(tinaApi.branch);
            localStorage.setItem(
              "tina.createBranchState.baseBranch",
              tinaApi.branch
            );
            setCurrentBranch(branch);
            const collection = tinaApi.schema.getCollectionByFullPath(fullPath);
            const api = new TinaAdminApi(cms);
            const params = api.schema.transformPayload(collection.name, values);
            const relativePath2 = pathRelativeToCollection(
              collection.path,
              fullPath
            );
            if (await api.isAuthenticated()) {
              if (kind === "delete") {
                await api.deleteDocument(values);
              } else if (kind === "create") {
                await api.createDocument(collection, relativePath2, params);
              } else {
                await api.updateDocument(collection, relativePath2, params);
              }
            } else {
              const authMessage = `UpdateDocument failed: User is no longer authenticated; please login and try again.`;
              cms.alerts.error(authMessage);
              console.error(authMessage);
              return false;
            }
            localStorage.setItem("tina.createBranchState", "creatingPR");
            cms.alerts.success("Content saved.");
            setState("creatingPR");
          } catch (e) {
            console.error(e);
            cms.alerts.error("Content save failed.");
            setErrorMessage(
              "Content save failed, please try again. If the problem persists please contact support."
            );
            setState("error");
          }
        }
        if (state === "creatingPR") {
          try {
            const foo = await tinaApi.createPullRequest({
              baseBranch,
              branch,
              title: `${branch.replace("tina/", "").replace("-", " ")} (PR from TinaCMS)`
            });
            console.log("PR created", foo);
            cms.alerts.success("Pull request created.");
            localStorage.setItem("tina.createBranchState", "done");
            setState("done");
          } catch (e) {
            console.error(e);
            cms.alerts.error("Failed to create PR");
            setErrorMessage(
              "Failed to create PR, please try again. If the problem persists please contact support."
            );
            setState("error");
          }
        }
        if (state === "done") {
          window.location.href = back;
        }
      };
      if (fullPath && values && branch && back) {
        run();
      }
    }, [state]);
    if (!back || !fullPath || !values || !branch) {
      return /* @__PURE__ */ React.createElement(Wrapper, null, /* @__PURE__ */ React.createElement("p", null, "Missing params please try again."));
    }
    return /* @__PURE__ */ React.createElement(Wrapper, null, state !== "done" && state !== "error" && /* @__PURE__ */ React.createElement(
      BiLoaderAlt,
      {
        className: `opacity-70 text-blue-400 animate-spin w-10 h-auto`
      }
    ), (state === "starting" || state === "creatingBranch") && /* @__PURE__ */ React.createElement("p", null, "Creating branch…"), state === "indexing" && /* @__PURE__ */ React.createElement("p", null, "Indexing Content…"), state === "submitting" && /* @__PURE__ */ React.createElement("p", null, "Saving content…"), state === "creatingPR" && /* @__PURE__ */ React.createElement("p", null, "Creating Pull Request…"), state === "error" && /* @__PURE__ */ React.createElement("p", { className: "flex items-center gap-1 text-red-700" }, /* @__PURE__ */ React.createElement(BiError, { className: "w-7 h-auto text-red-400 flex-shrink-0" }), " ", /* @__PURE__ */ React.createElement("b", null, "Error:"), " ", errorMessage, " "));
  };
  const Wrapper = ({ children }) => /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col justify-center items-center gap-4 p-6 text-xl text-gray-700" }, children);
  const pathRelativeToCollection = (collectionPath, fullPath) => {
    const cleanCollectionPath = schemaTools.canonicalPath(collectionPath) + "/";
    const cleanFullPath = schemaTools.canonicalPath(fullPath);
    if (cleanFullPath.startsWith(cleanCollectionPath)) {
      return cleanFullPath.substring(cleanCollectionPath.length);
    }
    throw new Error(
      `Path ${fullPath} not within collection path ${collectionPath}`
    );
  };
  const Redirect = () => {
    React.useEffect(() => {
      if (window) {
        window.location.assign("/");
      }
    }, []);
    return null;
  };
  const MaybeRedirectToPreview = ({
    redirect,
    children
  }) => {
    const cms = useCMS$1();
    const navigate = reactRouterDom.useNavigate();
    React.useEffect(() => {
      const basePath = cms.flags.get("tina-basepath");
      if (redirect) {
        navigate(`/~${basePath ? `/${basePath}` : ""}`);
      }
    }, [redirect]);
    return children;
  };
  const SetPreviewFlag = ({
    preview,
    cms
  }) => {
    React.useEffect(() => {
      if (preview) {
        cms.flags.set("tina-iframe", true);
      }
    }, [preview]);
    return null;
  };
  const PreviewInner = ({ preview, config }) => {
    const params = reactRouterDom.useParams();
    const navigate = reactRouterDom.useNavigate();
    const [url, setURL] = React.useState(`/${params["*"]}`);
    const [reportedURL, setReportedURL] = React.useState(null);
    const ref = React.useRef(null);
    const paramURL = `/${params["*"]}`;
    React.useEffect(() => {
      if (reportedURL !== paramURL && paramURL) {
        setURL(paramURL);
      }
    }, [paramURL]);
    React.useEffect(() => {
      if ((reportedURL !== url || reportedURL !== paramURL) && reportedURL) {
        navigate(`/~${reportedURL}`);
      }
    }, [reportedURL]);
    React.useEffect(() => {
      setInterval(() => {
        var _a;
        if (ref.current) {
          const url2 = new URL(((_a = ref.current.contentWindow) == null ? void 0 : _a.location.href) || "");
          if (url2.origin === "null") {
            return;
          }
          const href = url2.href.replace(url2.origin, "");
          setReportedURL(href);
        }
      }, 100);
    }, [ref.current]);
    const Preview = preview;
    return /* @__PURE__ */ React.createElement(Preview, { url, iframeRef: ref, ...config });
  };
  const CheckSchema = ({
    schemaJson,
    children
  }) => {
    const cms = useCMS$1();
    const api = new TinaAdminApi(cms);
    const url = api.api.contentApiUrl;
    const [schemaMissingError, setSchemaMissingError] = React.useState(false);
    const currentBranch = decodeURIComponent(cms.api.tina.branch);
    React.useEffect(() => {
      if (schemaJson && cms) {
        api.checkGraphqlSchema({
          localSchema: schemaJson
        }).then((x) => {
          if (x === false) {
            cms.alerts.error(
              "GraphQL Schema Mismatch. Editing may not work. If you just switched branches, try going back to the previous branch"
            );
          }
        }).catch((e) => {
          if (e.message.includes("has not been indexed by TinaCloud")) {
            setSchemaMissingError(true);
          } else {
            cms.alerts.error(`Unexpected error checking schema: ${e}`);
            throw e;
          }
        });
      }
    }, [cms, JSON.stringify(schemaJson || {}), url]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, schemaMissingError ? /* @__PURE__ */ React.createElement(Modal, null, /* @__PURE__ */ React.createElement(PopupModal, null, /* @__PURE__ */ React.createElement(ModalHeader, null, "Branch Not Found"), /* @__PURE__ */ React.createElement(ModalBody, { padded: true }, /* @__PURE__ */ React.createElement("div", { className: "tina-prose" }, "The current branch (", /* @__PURE__ */ React.createElement("span", { className: "font-bold" }, currentBranch), ") has either been merged or deleted.")), /* @__PURE__ */ React.createElement(ModalActions, null, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }), /* @__PURE__ */ React.createElement(
      Button$1,
      {
        style: { flexGrow: 1 },
        className: "w-full",
        variant: "primary",
        onClick: () => {
          window.localStorage.removeItem("tinacms-current-branch");
          window.location.reload();
        }
      },
      "Switch back to default branch"
    )))) : children);
  };
  const TinaAdmin = ({
    preview,
    Playground,
    config,
    schemaJson
  }) => {
    const isSSR2 = typeof window === "undefined";
    if (isSSR2) {
      return null;
    }
    return /* @__PURE__ */ React.createElement(GetCMS, null, (cms) => {
      var _a, _b, _c;
      const isTinaAdminEnabled = cms.flags.get("tina-admin") === false ? false : true;
      if (isTinaAdminEnabled) {
        const tinaClient = (_a = cms.api) == null ? void 0 : _a.tina;
        const collectionWithRouter = (_c = (_b = tinaClient == null ? void 0 : tinaClient.schema) == null ? void 0 : _b.config) == null ? void 0 : _c.collections.find((x) => {
          var _a2;
          return typeof ((_a2 = x == null ? void 0 : x.ui) == null ? void 0 : _a2.router) === "function";
        });
        const hasRouter = Boolean(collectionWithRouter);
        return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(CheckSchema, { schemaJson }, /* @__PURE__ */ React.createElement(reactRouterDom.HashRouter, null, /* @__PURE__ */ React.createElement(SetPreviewFlag, { preview, cms }), /* @__PURE__ */ React.createElement(reactRouterDom.Routes, null, preview && /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "/~/*",
            element: /* @__PURE__ */ React.createElement(PreviewInner, { config, preview })
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "graphql",
            element: /* @__PURE__ */ React.createElement(PlainLayout, null, /* @__PURE__ */ React.createElement(Playground, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "branch/new",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(IndexingPage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "collections/new/:collectionName",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(CollectionCreatePage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "collections/duplicate/:collectionName/~/*",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(CollectionDuplicatePage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "collections/duplicate/:collectionName/*",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(CollectionDuplicatePage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "collections/new/:collectionName/:templateName",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(CollectionCreatePage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "collections/new/:collectionName/:templateName/~/*",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(CollectionCreatePage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "collections/new/:collectionName/~/*",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(CollectionCreatePage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "collections/edit/:collectionName/*",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(CollectionUpdatePage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "collections/:collectionName/*",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(CollectionListPage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "screens/:screenName",
            element: /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(ScreenPage, null))
          }
        ), /* @__PURE__ */ React.createElement(
          reactRouterDom.Route,
          {
            path: "/",
            element: /* @__PURE__ */ React.createElement(
              MaybeRedirectToPreview,
              {
                redirect: !!preview && hasRouter
              },
              /* @__PURE__ */ React.createElement(DefaultWrapper, { cms }, /* @__PURE__ */ React.createElement(DashboardPage, null))
            )
          }
        )))));
      } else {
        return /* @__PURE__ */ React.createElement(Layout, null, /* @__PURE__ */ React.createElement(reactRouterDom.HashRouter, null, /* @__PURE__ */ React.createElement(reactRouterDom.Routes, null, /* @__PURE__ */ React.createElement(reactRouterDom.Route, { path: "/", element: /* @__PURE__ */ React.createElement(Redirect, null) }))));
      }
    });
  };
  const DefaultWrapper = ({
    cms,
    children
  }) => {
    return /* @__PURE__ */ React.createElement(Layout, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-stretch h-dvh overflow-hidden" }, /* @__PURE__ */ React.createElement(Sidebar, { cms }), /* @__PURE__ */ React.createElement("div", { className: "w-full relative" }, children)));
  };
  const PlainLayout = ({ children }) => {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "auto",
          background: "#F6F6F9",
          fontFamily: "'Inter', sans-serif",
          zIndex: 9999
        }
      },
      children
    );
  };
  class RouteMappingPlugin {
    constructor(mapper) {
      this.__type = "tina-admin";
      this.name = "route-mapping";
      this.mapper = mapper;
    }
  }
  const tinaTableTemplate = {
    name: "table",
    label: "Table",
    fields: [
      {
        name: "firstRowHeader",
        label: "First row is a header",
        type: "boolean"
      },
      {
        name: "align",
        label: "Align",
        type: "string",
        list: true,
        description: 'Possible values: "left", "right", or "center".'
      },
      {
        name: "tableRows",
        label: "Rows",
        type: "object",
        list: true,
        ui: {
          itemProps: (value) => {
            if (value == null ? void 0 : value.tableCells) {
              if (Array.isArray(value.tableCells)) {
                return {
                  label: value.tableCells.map((cellItem) => {
                    var _a;
                    return (_a = stringifyCell(cellItem.value)) == null ? void 0 : _a.trim();
                  }).join(" | ")
                };
              }
            }
            return { label: "Row" };
          }
        },
        fields: [
          {
            name: "tableCells",
            label: "Table Cells",
            list: true,
            type: "object",
            ui: {
              itemProps: (cell) => {
                var _a;
                if (cell) {
                  if (cell.value) {
                    return {
                      label: (_a = stringifyCell(cell.value)) == null ? void 0 : _a.trim()
                    };
                  }
                }
                return { label: "Value" };
              }
            },
            fields: [
              {
                label: "Value",
                description: "Note: table cells do not support block-level elements like headers, code blocks, or lists. Any block-level items other than the first paragraph will be considered invalid.",
                name: "value",
                type: "rich-text",
                ui: {
                  validate(value) {
                    try {
                      tableCellSchema.parse(value);
                    } catch (e) {
                      if (e instanceof zod.z.ZodError) {
                        return e.errors[0].message;
                      }
                      return e.message;
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  };
  const tableCellSchema = zod.z.object({
    type: zod.z.literal("root"),
    children: zod.z.array(
      zod.z.object({
        type: zod.z.string(),
        children: zod.z.any().array()
      })
    ).refine(
      (value) => {
        const firstValue = value[0];
        return firstValue && firstValue.type === "p";
      },
      {
        message: `Table cell content cannot contain block elements like headers, blockquotes, or lists.`
      }
    ).refine(
      (value) => {
        var _a;
        if (value.length > 1) {
          const secondBlock = value[1];
          return secondBlock && secondBlock.children.length === 1 && !((_a = secondBlock.children[0]) == null ? void 0 : _a.text);
        }
        return true;
      },
      {
        message: `Table cells can only have 1 block level element.`
      }
    )
  });
  const stringifyCell = (cell) => {
    return mdx.stringifyMDX(cell, { name: "body", type: "rich-text" }, () => "");
  };
  const defineSchema = (config) => {
    schemaTools.validateSchema({ schema: config });
    return config;
  };
  const defineLegacyConfig = (config) => {
    schemaTools.validateSchema({ schema: config.schema });
    return config;
  };
  const defineStaticConfig = (config) => {
    if (!config.schema) {
      throw new Error("Static config must have a schema");
    }
    schemaTools.validateSchema({ schema: config.schema });
    return config;
  };
  const defineConfig = defineStaticConfig;
  Object.defineProperty(exports2, "NAMER", {
    enumerable: true,
    get: () => schemaTools.NAMER
  });
  Object.defineProperty(exports2, "resolveField", {
    enumerable: true,
    get: () => schemaTools.resolveField
  });
  exports2.AbstractAuthProvider = AbstractAuthProvider;
  exports2.ActionButton = ActionButton;
  exports2.AddIcon = AddIcon;
  exports2.AlertIcon = AlertIcon;
  exports2.Alerts = Alerts$1;
  exports2.AlignCenter = AlignCenter;
  exports2.AlignLeft = AlignLeft;
  exports2.AlignRight = AlignRight;
  exports2.AuthWallInner = AuthWallInner;
  exports2.BasePasswordField = BasePasswordField;
  exports2.BaseTextField = BaseTextField;
  exports2.BillingWarning = BillingWarning;
  exports2.BlocksField = BlocksField;
  exports2.BlocksFieldPlugin = BlocksFieldPlugin;
  exports2.BoldIcon = BoldIcon$1;
  exports2.BranchBanner = BranchBanner;
  exports2.BranchButton = BranchButton;
  exports2.BranchDataProvider = BranchDataProvider;
  exports2.BranchSwitcher = BranchSwitcher;
  exports2.BranchSwitcherPlugin = BranchSwitcherPlugin;
  exports2.Button = Button$1;
  exports2.ButtonToggle = ButtonToggle;
  exports2.ButtonToggleField = ButtonToggleField;
  exports2.ButtonToggleFieldPlugin = ButtonToggleFieldPlugin;
  exports2.CheckboxGroup = CheckboxGroup;
  exports2.CheckboxGroupField = CheckboxGroupField;
  exports2.CheckboxGroupFieldPlugin = CheckboxGroupFieldPlugin;
  exports2.ChevronDownIcon = ChevronDownIcon$2;
  exports2.ChevronLeftIcon = ChevronLeftIcon;
  exports2.ChevronRightIcon = ChevronRightIcon;
  exports2.ChevronUpIcon = ChevronUpIcon;
  exports2.Circle = Circle;
  exports2.CircleCheck = CircleCheck;
  exports2.Client = Client;
  exports2.CloseIcon = CloseIcon;
  exports2.CodeIcon = CodeIcon$1;
  exports2.ColorField = ColorField;
  exports2.ColorFieldPlugin = ColorFieldPlugin;
  exports2.ColorPicker = ColorPicker;
  exports2.CreateBranchModal = CreateBranchModal;
  exports2.CreateBranchModel = CreateBranchModel;
  exports2.CursorPaginator = CursorPaginator;
  exports2.DEFAULT_LOCAL_TINA_GQL_SERVER_URL = DEFAULT_LOCAL_TINA_GQL_SERVER_URL;
  exports2.DEFAULT_MEDIA_UPLOAD_TYPES = DEFAULT_MEDIA_UPLOAD_TYPES;
  exports2.DateField = DateField;
  exports2.DateFieldPlugin = DateFieldPlugin;
  exports2.DeleteImageButton = DeleteImageButton;
  exports2.Dismissible = Dismissible;
  exports2.DragHandle = DragHandle;
  exports2.DragIcon = DragIcon;
  exports2.DummyMediaStore = DummyMediaStore;
  exports2.DuplicateIcon = DuplicateIcon;
  exports2.EditIcon = EditIcon;
  exports2.EditoralBranchSwitcher = EditoralBranchSwitcher;
  exports2.EllipsisVerticalIcon = EllipsisVerticalIcon;
  exports2.ErrorDialog = ErrorDialog;
  exports2.ErrorIcon = ErrorIcon;
  exports2.EventBus = EventBus;
  exports2.ExitIcon = ExitIcon;
  exports2.FieldDescription = FieldDescription;
  exports2.FieldError = FieldError;
  exports2.FieldLabel = FieldLabel;
  exports2.FieldMeta = FieldMeta;
  exports2.FieldWrapper = FieldWrapper;
  exports2.FieldsBuilder = FieldsBuilder;
  exports2.FieldsGroup = FieldsGroup;
  exports2.File = File;
  exports2.Folder = Folder;
  exports2.FontLoader = FontLoader;
  exports2.Form = Form;
  exports2.FormActionMenu = FormActionMenu;
  exports2.FormBuilder = FormBuilder;
  exports2.FormLegacy = FormLegacy;
  exports2.FormMetaPlugin = FormMetaPlugin;
  exports2.FormPortalProvider = FormPortalProvider;
  exports2.FormStatus = FormStatus;
  exports2.FormWrapper = FormWrapper;
  exports2.FullscreenModal = FullscreenModal;
  exports2.GlobalFormPlugin = GlobalFormPlugin;
  exports2.Group = Group;
  exports2.GroupField = GroupField;
  exports2.GroupFieldPlugin = GroupFieldPlugin;
  exports2.GroupLabel = GroupLabel;
  exports2.GroupListField = GroupListField;
  exports2.GroupListFieldPlugin = GroupListFieldPlugin;
  exports2.GroupPanel = GroupPanel;
  exports2.HamburgerIcon = HamburgerIcon;
  exports2.HeadingIcon = HeadingIcon$1;
  exports2.HiddenField = HiddenField;
  exports2.HiddenFieldPlugin = HiddenFieldPlugin;
  exports2.IconButton = IconButton;
  exports2.ImageField = ImageField;
  exports2.ImageFieldPlugin = ImageFieldPlugin;
  exports2.ImageUpload = ImageUpload;
  exports2.InfoIcon = InfoIcon;
  exports2.Input = Input;
  exports2.ItalicIcon = ItalicIcon$1;
  exports2.ItemClickTarget = ItemClickTarget;
  exports2.ItemDeleteButton = ItemDeleteButton;
  exports2.ItemHeader = ItemHeader;
  exports2.LeftArrowIcon = LeftArrowIcon;
  exports2.LinkIcon = LinkIcon$1;
  exports2.ListField = ListField;
  exports2.ListFieldPlugin = ListFieldPlugin;
  exports2.LoadingDots = LoadingDots;
  exports2.LocalAuthProvider = LocalAuthProvider;
  exports2.LocalClient = LocalClient;
  exports2.LocalSearchClient = LocalSearchClient;
  exports2.LocalWarning = LocalWarning;
  exports2.LockIcon = LockIcon;
  exports2.MarkdownIcon = MarkdownIcon;
  exports2.MdxFieldPlugin = MdxFieldPlugin;
  exports2.MdxFieldPluginExtendible = MdxFieldPluginExtendible;
  exports2.MediaIcon = MediaIcon;
  exports2.MediaListError = MediaListError;
  exports2.MediaManager = MediaManager$1;
  exports2.Message = Message;
  exports2.Modal = Modal;
  exports2.ModalActions = ModalActions;
  exports2.ModalBody = ModalBody;
  exports2.ModalFullscreen = ModalFullscreen;
  exports2.ModalHeader = ModalHeader;
  exports2.ModalOverlay = ModalOverlay;
  exports2.ModalPopup = ModalPopup;
  exports2.ModalProvider = ModalProvider;
  exports2.Nav = Nav;
  exports2.NumberField = NumberField;
  exports2.NumberFieldPlugin = NumberFieldPlugin;
  exports2.NumberInput = NumberInput;
  exports2.OrderedListIcon = OrderedListIcon$1;
  exports2.OverflowMenu = OverflowMenu$1;
  exports2.PanelBody = PanelBody;
  exports2.PanelHeader = PanelHeader$1;
  exports2.PasswordFieldComponent = PasswordFieldComponent;
  exports2.PasswordFieldPlugin = PasswordFieldPlugin;
  exports2.PopupModal = PopupModal;
  exports2.PrefixedTextField = PrefixedTextField;
  exports2.PullRequestIcon = PullRequestIcon;
  exports2.QuoteIcon = QuoteIcon$1;
  exports2.RadioGroup = RadioGroup;
  exports2.RadioGroupField = RadioGroupField;
  exports2.RadioGroupFieldPlugin = RadioGroupFieldPlugin;
  exports2.ReactDateTimeWithStyles = ReactDateTimeWithStyles;
  exports2.RedoIcon = RedoIcon;
  exports2.Reference = Reference;
  exports2.ReferenceField = ReferenceField;
  exports2.ReferenceFieldPlugin = ReferenceFieldPlugin;
  exports2.ReorderIcon = ReorderIcon;
  exports2.ReorderRowIcon = ReorderRowIcon;
  exports2.ResetForm = ResetForm;
  exports2.ResetIcon = ResetIcon;
  exports2.RightArrowIcon = RightArrowIcon;
  exports2.RouteMappingPlugin = RouteMappingPlugin;
  exports2.Select = Select;
  exports2.SelectField = SelectField;
  exports2.SelectFieldPlugin = SelectFieldPlugin;
  exports2.SettingsIcon = SettingsIcon;
  exports2.StrikethroughIcon = StrikethroughIcon;
  exports2.StyledFile = StyledFile;
  exports2.StyledImage = StyledImage;
  exports2.SyncStatus = SyncStatus;
  exports2.TableIcon = TableIcon;
  exports2.TagsField = TagsField;
  exports2.TagsFieldPlugin = TagsFieldPlugin;
  exports2.TextArea = TextArea;
  exports2.TextField = TextField;
  exports2.TextFieldPlugin = TextFieldPlugin;
  exports2.TextareaFieldPlugin = TextareaFieldPlugin;
  exports2.Tina = Tina;
  exports2.TinaAdmin = TinaAdmin;
  exports2.TinaAdminApi = TinaAdminApi;
  exports2.TinaCMS = TinaCMS;
  exports2.TinaCMSProvider = TinaCMSProvider;
  exports2.TinaCMSProvider2 = TinaCMSProvider2;
  exports2.TinaCMSSearchClient = TinaCMSSearchClient;
  exports2.TinaCloudAuthProvider = TinaCloudAuthProvider;
  exports2.TinaCloudAuthWall = TinaCloudAuthWall;
  exports2.TinaCloudProvider = TinaCloudProvider;
  exports2.TinaField = TinaField;
  exports2.TinaForm = TinaForm;
  exports2.TinaIcon = TinaIcon;
  exports2.TinaMediaStore = TinaMediaStore;
  exports2.TinaProvider = TinaProvider;
  exports2.TinaUI = TinaUI;
  exports2.Toggle = Toggle;
  exports2.ToggleField = ToggleField;
  exports2.ToggleFieldPlugin = ToggleFieldPlugin;
  exports2.TrashIcon = TrashIcon;
  exports2.UnderlineIcon = UnderlineIcon;
  exports2.UndoIcon = UndoIcon;
  exports2.UnorderedListIcon = UnorderedListIcon$1;
  exports2.UploadIcon = UploadIcon;
  exports2.WarningIcon = WarningIcon;
  exports2.assertShape = assertShape;
  exports2.classNames = classNames;
  exports2.createClient = createClient;
  exports2.default = TinaCMSProvider2;
  exports2.defineConfig = defineConfig;
  exports2.defineLegacyConfig = defineLegacyConfig;
  exports2.defineSchema = defineSchema;
  exports2.defineStaticConfig = defineStaticConfig;
  exports2.formatBranchName = formatBranchName;
  exports2.getFilteredBranchList = getFilteredBranchList;
  exports2.getStaticPropsForTina = getStaticPropsForTina;
  exports2.passwordFieldClasses = passwordFieldClasses;
  exports2.safeAssertShape = safeAssertShape;
  exports2.selectFieldClasses = selectFieldClasses;
  exports2.staticRequest = staticRequest;
  exports2.textFieldClasses = textFieldClasses;
  exports2.tinaTableTemplate = tinaTableTemplate;
  exports2.useBranchData = useBranchData;
  exports2.useCMS = useCMS$1;
  exports2.useDismissible = useDismissible;
  exports2.useDocumentCreatorPlugin = useDocumentCreatorPlugin;
  exports2.useFormPortal = useFormPortal;
  exports2.useLocalStorage = useLocalStorage;
  exports2.useModalContainer = useModalContainer;
  exports2.useScreenPlugin = useScreenPlugin;
  exports2.useTinaAuthRedirect = useTinaAuthRedirect;
  exports2.wrapFieldWithError = wrapFieldWithError;
  exports2.wrapFieldWithNoHeader = wrapFieldWithNoHeader;
  exports2.wrapFieldsWithMeta = wrapFieldsWithMeta;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
