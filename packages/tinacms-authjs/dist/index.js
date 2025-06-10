var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AuthJsBackendAuthProvider: () => AuthJsBackendAuthProvider,
  TinaAuthJSOptions: () => TinaAuthJSOptions,
  TinaCredentialsProvider: () => TinaCredentialsProvider
});
module.exports = __toCommonJS(index_exports);
var import_next_auth = __toESM(require("next-auth"));
var import_credentials = __toESM(require("next-auth/providers/credentials"));
var import_next = require("next-auth/next");

// src/tinacms.ts
var import_react = require("next-auth/react");
var import_tinacms = require("tinacms");
var TINA_CREDENTIALS_PROVIDER_NAME = "TinaCredentials";

// src/index.ts
var authenticate = async (databaseClient, username, password) => {
  try {
    const result = await databaseClient.authenticate({ username, password });
    return result.data?.authenticate || null;
  } catch (e) {
    console.error(e);
  }
  return null;
};
var TinaAuthJSOptions = ({
  databaseClient,
  uidProp = "sub",
  debug = false,
  overrides,
  secret,
  providers
}) => ({
  callbacks: {
    jwt: async ({ token: jwt, account }) => {
      if (account) {
        if (debug) {
          console.table(jwt);
        }
        try {
          if (jwt?.[uidProp]) {
            const sub = jwt[uidProp];
            const result = await databaseClient.authorize({ sub });
            jwt.role = !!result.data?.authorize ? "user" : "guest";
            jwt.passwordChangeRequired = result.data?.authorize?._password?.passwordChangeRequired || false;
          } else if (debug) {
            console.log(`jwt missing specified uidProp: ${uidProp}`);
          }
        } catch (error) {
          console.log(error);
        }
        if (jwt.role === void 0) {
          jwt.role = "guest";
        }
      }
      return jwt;
    },
    session: async ({ session, token: jwt }) => {
      session.user.role = jwt.role;
      session.user.passwordChangeRequired = jwt.passwordChangeRequired;
      session.user[uidProp] = jwt[uidProp];
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret,
  providers: providers || [TinaCredentialsProvider({ databaseClient })],
  ...overrides
});
var TinaCredentialsProvider = ({
  databaseClient,
  name = TINA_CREDENTIALS_PROVIDER_NAME
}) => {
  const p = (0, import_credentials.default)({
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" }
    },
    authorize: async (credentials) => authenticate(databaseClient, credentials.username, credentials.password)
  });
  p.name = name;
  return p;
};
var AuthJsBackendAuthProvider = ({
  authOptions
}) => {
  const authProvider = {
    initialize: async () => {
      if (!authOptions.providers?.length) {
        throw new Error("No auth providers specified");
      }
      const [provider, ...rest] = authOptions.providers;
      if (rest.length > 0 || provider.type !== "credentials" || provider.name !== TINA_CREDENTIALS_PROVIDER_NAME) {
        console.warn(
          `WARNING: Catch-all api route ['/api/tina/*'] with specified Auth.js provider ['${provider.name}'] not supported. See https://tina.io/docs/self-hosted/overview/#customprovider for more information.`
        );
      }
    },
    isAuthorized: async (req, res) => {
      const session = await (0, import_next.getServerSession)(req, res, authOptions);
      if (!req.session) {
        Object.defineProperty(req, "session", {
          value: session,
          writable: false
        });
      }
      if (!session?.user) {
        return {
          errorCode: 401,
          errorMessage: "Unauthorized",
          isAuthorized: false
        };
      }
      if ((session?.user).role !== "user") {
        return {
          errorCode: 403,
          errorMessage: "Forbidden",
          isAuthorized: false
        };
      }
      return { isAuthorized: true };
    },
    extraRoutes: {
      auth: {
        secure: false,
        handler: async (req, res, opts) => {
          const url = new URL(
            req.url,
            `http://${req.headers?.host || "localhost"}`
          );
          const authSubRoutes = url.pathname?.replace(`${opts.basePath}auth/`, "")?.split("/");
          req.query.nextauth = authSubRoutes;
          await (0, import_next_auth.default)(authOptions)(req, res);
        }
      }
    }
  };
  return authProvider;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthJsBackendAuthProvider,
  TinaAuthJSOptions,
  TinaCredentialsProvider
});
