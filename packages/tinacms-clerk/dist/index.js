var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ClerkBackendAuthentication: () => ClerkBackendAuthentication
});
module.exports = __toCommonJS(index_exports);
var import_backend = require("@clerk/backend");
var ClerkBackendAuthentication = ({
  secretKey,
  allowList,
  orgId
}) => {
  const clerk = (0, import_backend.Clerk)({
    secretKey
  });
  return {
    isAuthorized: async (req, _res) => {
      const token = req.headers["authorization"];
      const tokenWithoutBearer = token?.replace("Bearer ", "").trim();
      const requestState = await clerk.authenticateRequest({
        headerToken: tokenWithoutBearer
      });
      if (requestState.status === "signed-in") {
        const user = await clerk.users.getUser(requestState.toAuth().userId);
        if (orgId) {
          const membershipList = (await clerk.organizations.getOrganizationMembershipList({
            organizationId: orgId
          })).map((x) => x.publicUserData?.userId);
          if (!membershipList.includes(user.id))
            return {
              isAuthorized: false,
              errorMessage: "User not authorized. Not a member of the provided organization.",
              errorCode: 401
            };
        }
        const primaryEmail = user.emailAddresses.find(
          ({ id }) => id === user.primaryEmailAddressId
        );
        if (primaryEmail && !allowList) {
          return { isAuthorized: true };
        }
        if (primaryEmail && allowList?.includes(primaryEmail.emailAddress)) {
          return { isAuthorized: true };
        }
      }
      if (requestState.reason === "unexpected-error") {
        console.error(requestState.message);
      }
      return {
        isAuthorized: false,
        errorMessage: "User not authorized",
        errorCode: 401
      };
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClerkBackendAuthentication
});
