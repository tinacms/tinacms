(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["@tinacms/auth"] = {}));
})(this, function(exports2) {
  "use strict";
  const isUserAuthorized = async (args) => {
    const clientID = args.clientID;
    const token = args.token;
    try {
      const tinaCloudRes = await fetch(
        `https://identity.tinajs.io/v2/apps/${clientID}/currentUser`,
        {
          headers: new Headers({
            "Content-Type": "application/json",
            authorization: token
          }),
          method: "GET"
        }
      );
      if (tinaCloudRes.ok) {
        const user = await tinaCloudRes.json();
        return user;
      }
      return;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
  const isAuthorized = async (req) => {
    const clientID = req.query.clientID;
    const token = req.headers.authorization;
    if (typeof clientID === "string" && typeof token === "string") {
      return await isUserAuthorized({ clientID, token });
    }
    const errorMessage = (queryParam) => {
      return `An ${queryParam} query param is required for isAuthorized function but not found please use cms.api.tina.fetchWithToken('/api/something?clientID=YourClientID')`;
    };
    !clientID && console.error(errorMessage("clientID"));
    !token && console.error(
      "A authorization header was not found. Please use the cms.api.tina.fetchWithToken function on the frontend"
    );
    return void 0;
  };
  const isAuthorizedNext = isAuthorized;
  const TinaCloudBackendAuthProvider = () => {
    const backendAuthProvider = {
      isAuthorized: async (req, _res) => {
        const user = await isAuthorized(req);
        if (user && user.verified) {
          return {
            isAuthorized: true
          };
        }
        return {
          isAuthorized: false,
          errorCode: 401,
          errorMessage: "Unauthorized"
        };
      }
    };
    return backendAuthProvider;
  };
  exports2.TinaCloudBackendAuthProvider = TinaCloudBackendAuthProvider;
  exports2.isAuthorized = isAuthorized;
  exports2.isAuthorizedNext = isAuthorizedNext;
  exports2.isUserAuthorized = isUserAuthorized;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
