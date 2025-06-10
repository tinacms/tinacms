(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("@vercel/stega"), require("react")) : typeof define === "function" && define.amd ? define(["exports", "@vercel/stega", "react"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["@tinacms/vercel-previews"] = {}, global.NOOP, global.NOOP));
})(this, function(exports2, stega, React) {
  "use strict";
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
  const vercelEditInfo = (obj, field, index) => {
    const fieldName = tinaField(obj, field, index);
    return JSON.stringify({ origin: "tinacms", data: { fieldName } });
  };
  const useVisualEditing = ({
    data,
    query,
    variables,
    enabled,
    redirect,
    stringEncoding
  }) => {
    const stringifiedQuery = JSON.stringify({
      query,
      variables
    });
    const id = React.useMemo(
      () => hashFromQuery(stringifiedQuery),
      [stringifiedQuery]
    );
    const { edit } = useEditState();
    const handleOpenEvent = React.useCallback(
      (event) => {
        var _a, _b;
        if (edit) {
          parent.postMessage(
            { type: "field:selected", fieldName: (_b = (_a = event.detail) == null ? void 0 : _a.data) == null ? void 0 : _b.fieldName },
            window.location.origin
          );
        } else {
          const tinaAdminBasePath = redirect.startsWith("/") ? redirect : `/${redirect}`;
          const tinaAdminPath = `${tinaAdminBasePath}/index.html#/~${window.location.pathname}?active-field=${event.detail.data.fieldName}`;
          window.location.assign(tinaAdminPath);
        }
      },
      [edit]
    );
    React.useEffect(() => {
      window.addEventListener("edit:open", handleOpenEvent);
      return () => {
        window.removeEventListener("edit:open", handleOpenEvent);
      };
    }, [redirect, edit]);
    function appendMetadata(obj, path = [], id2) {
      if (typeof obj !== "object" || obj === null) {
        if (typeof obj === "string" && stringEncoding) {
          if (typeof stringEncoding === "boolean") {
            if (stringEncoding) {
              return encodeEditInfo(path, obj, id2);
            }
          } else if (stringEncoding.skipPaths) {
            if (!stringEncoding.skipPaths(path.join("."), obj)) {
              return encodeEditInfo(path, obj, id2);
            }
          }
        }
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(
          (item, index) => appendMetadata(item, [...path, index], id2)
        );
      }
      const transformedObj = {};
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];
        if ([
          "__typename",
          "_sys",
          "_internalSys",
          "_values",
          "_internalValues",
          "_content_source",
          "_tina_metadata"
        ].includes(key)) {
          transformedObj[key] = value;
        } else {
          transformedObj[key] = appendMetadata(value, currentPath, id2);
        }
      }
      return { ...transformedObj, _content_source: { queryId: id2, path } };
    }
    if (enabled) {
      return appendMetadata(data, [], id);
    }
    return data;
  };
  function encodeEditInfo(path, value, id) {
    return stega.vercelStegaCombine(value, {
      origin: "tina.io",
      data: { fieldName: `${id}---${path.join(".")}` }
    });
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
  exports2.hashFromQuery = hashFromQuery;
  exports2.useVisualEditing = useVisualEditing;
  exports2.vercelEditInfo = vercelEditInfo;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
