(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("react")) : typeof define === "function" && define.amd ? define(["exports", "react"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.tinacms = {}, global.NOOP));
})(this, function(exports2, React) {
  "use strict";
  function useTina(props) {
    const stringifiedQuery = JSON.stringify({
      query: props.query,
      variables: props.variables
    });
    const id = React.useMemo(
      () => hashFromQuery(stringifiedQuery),
      [stringifiedQuery]
    );
    const [data, setData] = React.useState(props.data);
    const [isClient, setIsClient] = React.useState(false);
    const [quickEditEnabled, setQuickEditEnabled] = React.useState(false);
    const [isInTinaIframe, setIsInTinaIframe] = React.useState(false);
    React.useEffect(() => {
      setIsClient(true);
      setData(props.data);
      parent.postMessage({
        type: "url-changed"
      });
    }, [id]);
    React.useEffect(() => {
      if (quickEditEnabled) {
        let mouseDownHandler = function(e) {
          const attributeNames = e.target.getAttributeNames();
          const tinaAttribute = attributeNames.find(
            (name) => name.startsWith("data-tina-field")
          );
          let fieldName;
          if (tinaAttribute) {
            e.preventDefault();
            e.stopPropagation();
            fieldName = e.target.getAttribute(tinaAttribute);
          } else {
            const ancestor = e.target.closest(
              "[data-tina-field], [data-tina-field-overlay]"
            );
            if (ancestor) {
              const attributeNames2 = ancestor.getAttributeNames();
              const tinaAttribute2 = attributeNames2.find(
                (name) => name.startsWith("data-tina-field")
              );
              if (tinaAttribute2) {
                e.preventDefault();
                e.stopPropagation();
                fieldName = ancestor.getAttribute(tinaAttribute2);
              }
            }
          }
          if (fieldName) {
            if (isInTinaIframe) {
              parent.postMessage(
                { type: "field:selected", fieldName },
                window.location.origin
              );
            }
          }
        };
        const style = document.createElement("style");
        style.type = "text/css";
        style.textContent = `
        [data-tina-field] {
          outline: 2px dashed rgba(34,150,254,0.5);
          transition: box-shadow ease-out 150ms;
        }
        [data-tina-field]:hover {
          box-shadow: inset 100vi 100vh rgba(34,150,254,0.3);
          outline: 2px solid rgba(34,150,254,1);
          cursor: pointer;
        }
        [data-tina-field-overlay] {
          outline: 2px dashed rgba(34,150,254,0.5);
          position: relative;
        }
        [data-tina-field-overlay]:hover {
          cursor: pointer;
          outline: 2px solid rgba(34,150,254,1);
        }
        [data-tina-field-overlay]::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 20;
          transition: opacity ease-out 150ms;
          background-color: rgba(34,150,254,0.3);
          opacity: 0;
        }
        [data-tina-field-overlay]:hover::after {
          opacity: 1;
        }
      `;
        document.head.appendChild(style);
        document.body.classList.add("__tina-quick-editing-enabled");
        document.addEventListener("click", mouseDownHandler, true);
        return () => {
          document.removeEventListener("click", mouseDownHandler, true);
          document.body.classList.remove("__tina-quick-editing-enabled");
          style.remove();
        };
      }
    }, [quickEditEnabled, isInTinaIframe]);
    React.useEffect(() => {
      if (props == null ? void 0 : props.experimental___selectFormByFormId) {
        parent.postMessage({
          type: "user-select-form",
          formId: props.experimental___selectFormByFormId()
        });
      }
    }, [id]);
    React.useEffect(() => {
      const { experimental___selectFormByFormId, ...rest } = props;
      parent.postMessage({ type: "open", ...rest, id }, window.location.origin);
      window.addEventListener("message", (event) => {
        if (event.data.type === "quickEditEnabled") {
          setQuickEditEnabled(event.data.value);
        }
        if (event.data.id === id && event.data.type === "updateData") {
          setData(event.data.data);
          setIsInTinaIframe(true);
          const anyTinaField = document.querySelector("[data-tina-field]");
          if (anyTinaField) {
            parent.postMessage(
              { type: "quick-edit", value: true },
              window.location.origin
            );
          } else {
            parent.postMessage(
              { type: "quick-edit", value: false },
              window.location.origin
            );
          }
        }
      });
      return () => {
        parent.postMessage({ type: "close", id }, window.location.origin);
      };
    }, [id, setQuickEditEnabled]);
    return { data, isClient };
  }
  function useEditState() {
    const [edit, setEdit] = React.useState(false);
    React.useEffect(() => {
      if (typeof window !== "undefined") {
        parent.postMessage({ type: "isEditMode" }, window.location.origin);
        window.addEventListener("message", (event) => {
          var _a;
          if (((_a = event.data) == null ? void 0 : _a.type) === "tina:editMode") {
            setEdit(true);
          }
        });
      }
    }, []);
    return { edit };
  }
  const tinaField = (object, property, index) => {
    var _a, _b, _c;
    if (!object) {
      return "";
    }
    if (object._content_source) {
      if (!property) {
        return [
          (_a = object._content_source) == null ? void 0 : _a.queryId,
          object._content_source.path.join(".")
        ].join("---");
      }
      if (typeof index === "number") {
        return [
          (_b = object._content_source) == null ? void 0 : _b.queryId,
          [...object._content_source.path, property, index].join(".")
        ].join("---");
      }
      return [
        (_c = object._content_source) == null ? void 0 : _c.queryId,
        [...object._content_source.path, property].join(".")
      ].join("---");
    }
    return "";
  };
  const addMetadata = (id, object, path) => {
    Object.entries(object).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (isScalarOrUndefined(item)) {
            return;
          }
          if (Array.isArray(item)) {
            return;
          }
          const itemObject = item;
          addMetadata(id, itemObject, [...path, key, index]);
        });
      } else {
        if (isScalarOrUndefined(value)) {
          return;
        }
        const itemObject = value;
        addMetadata(id, itemObject, [...path, key]);
      }
    });
    if ((object == null ? void 0 : object.type) === "root") {
      return;
    }
    object._content_source = {
      queryId: id,
      path
    };
    return object;
  };
  function isScalarOrUndefined(value) {
    const type = typeof value;
    if (type === "string")
      return true;
    if (type === "number")
      return true;
    if (type === "boolean")
      return true;
    if (type === "undefined")
      return true;
    if (value == null)
      return true;
    if (value instanceof String)
      return true;
    if (value instanceof Number)
      return true;
    if (value instanceof Boolean)
      return true;
    return false;
  }
  const hashFromQuery = (input) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char & 4294967295;
    }
    const nonNegativeHash = Math.abs(hash);
    const alphanumericHash = nonNegativeHash.toString(36);
    return alphanumericHash;
  };
  exports2.addMetadata = addMetadata;
  exports2.hashFromQuery = hashFromQuery;
  exports2.tinaField = tinaField;
  exports2.useEditState = useEditState;
  exports2.useTina = useTina;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
