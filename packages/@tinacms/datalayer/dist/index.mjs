// src/index.ts
import {
  FilesystemBridge,
  AuditFileSystemBridge,
  IsomorphicBridge,
  TinaLevelClient,
  resolve,
  createDatabase,
  createLocalDatabase
} from "@tinacms/graphql";

// src/backend/index.ts
var LocalBackendAuthProvider = () => ({
  isAuthorized: async () => ({ isAuthorized: true })
});
function TinaNodeBackend({
  authProvider,
  databaseClient,
  options
}) {
  const { initialize, isAuthorized, extraRoutes } = authProvider;
  initialize?.().catch((e) => {
    console.error(e);
  });
  const basePath = options?.basePath ? `/${options.basePath.replace(/^\/?/, "").replace(/\/?$/, "")}/` : "/api/tina/";
  const opts = {
    basePath
  };
  const handler = MakeNodeApiHandler({
    isAuthorized,
    extraRoutes,
    databaseClient,
    opts
  });
  return handler;
}
function MakeNodeApiHandler({
  isAuthorized,
  extraRoutes,
  databaseClient,
  opts
}) {
  const tinaBackendHandler = async (req, res) => {
    const path = req.url?.startsWith("/") ? req.url.slice(1) : req.url;
    const url = new URL(path, `http://${req.headers?.host || "localhost"}`);
    const routes = url.pathname?.replace(opts.basePath, "")?.split("/");
    if (typeof routes === "string") {
      throw new Error(
        "Please name your next api route [...routes] not [route]"
      );
    }
    if (!routes?.length) {
      console.error(
        `A request was made to ${opts.basePath} but no route was found`
      );
      res.statusCode = 404;
      res.write(JSON.stringify({ error: "not found" }));
      res.end();
      return;
    }
    const allRoutes = {
      gql: {
        handler: async (req2, res2, _opts) => {
          if (req2.method !== "POST") {
            res2.statusCode = 405;
            res2.write(
              JSON.stringify({
                error: "Method not allowed. Only POST requests are supported by /gql"
              })
            );
            res2.end();
            return;
          }
          if (!req2.body) {
            console.error(
              "Please make sure that you have a body parser set up for your server and req.body is defined"
            );
            res2.statusCode = 400;
            res2.write(JSON.stringify({ error: "no body" }));
            res2.end();
            return;
          }
          if (!req2.body.query) {
            res2.statusCode = 400;
            res2.write(JSON.stringify({ error: "no query" }));
            res2.end();
            return;
          }
          if (!req2.body.variables) {
            res2.statusCode = 400;
            res2.write(JSON.stringify({ error: "no variables" }));
            res2.end();
            return;
          }
          const { query, variables } = req2.body;
          const result = await databaseClient.request({
            query,
            variables,
            // @ts-ignore
            user: req2?.session?.user
          });
          res2.statusCode = 200;
          res2.write(JSON.stringify(result));
          res2.end();
          return;
        },
        secure: true
      },
      ...extraRoutes || {}
    };
    const [action] = routes;
    const currentRoute = allRoutes[action];
    if (!currentRoute) {
      res.statusCode = 404;
      const errorMessage = `Error: ${action} not found in routes`;
      console.error(errorMessage);
      res.write(JSON.stringify({ error: errorMessage }));
      res.end();
      return;
    }
    const { handler, secure } = currentRoute;
    if (secure) {
      const isAuth = await isAuthorized(req, res);
      if (isAuth.isAuthorized === false) {
        res.statusCode = isAuth.errorCode;
        res.write(
          JSON.stringify({ error: isAuth.errorMessage || "not found" })
        );
        res.end();
        return;
      }
    }
    return handler(req, res, opts);
  };
  return tinaBackendHandler;
}
export {
  AuditFileSystemBridge,
  FilesystemBridge,
  IsomorphicBridge,
  LocalBackendAuthProvider,
  TinaLevelClient,
  TinaNodeBackend,
  createDatabase,
  createLocalDatabase,
  resolve
};
