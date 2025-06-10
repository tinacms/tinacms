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
  Telemetry: () => Telemetry
});
module.exports = __toCommonJS(index_exports);

// src/telemetry/telemetry.ts
var import_crypto = require("crypto");

// src/telemetry/getId.ts
var import_child_process = require("child_process");
function _getProjectIdByGit() {
  try {
    const originBuffer = (0, import_child_process.execSync)(
      `git config --local --get remote.origin.url`,
      {
        timeout: 1e3,
        stdio: `pipe`
      }
    );
    return String(originBuffer).trim();
  } catch (_) {
    return null;
  }
}
function getID() {
  return _getProjectIdByGit() || process.env.REPOSITORY_URL || process.cwd();
}

// src/telemetry/telemetry.ts
var import_isomorphic_fetch = __toESM(require("isomorphic-fetch"));

// src/telemetry/getVersion.ts
var import_fs_extra = require("fs-extra");
var import_child_process2 = require("child_process");
var import_path = require("path");
function _executeCommand(cmd) {
  try {
    const originBuffer = (0, import_child_process2.execSync)(cmd, {
      timeout: 1e3,
      stdio: `pipe`
    });
    return String(originBuffer).trim();
  } catch (_) {
    return null;
  }
}
var _getPack = (rootDir) => {
  let pack = {};
  try {
    const rawJSON = (0, import_fs_extra.readFileSync)(
      (0, import_path.join)(rootDir, "package.json")
    ).toString();
    pack = JSON.parse(rawJSON);
  } catch (_e) {
  }
  return pack;
};
var getTinaVersion = () => {
  const pack = _getPack(process.cwd());
  const version = pack?.dependencies?.tinacms;
  return version || "";
};
var getTinaCliVersion = () => {
  const pack = _getPack(process.cwd());
  const version = pack?.devDependencies?.["@tinacms/cli"] || pack?.dependencies?.["@tinacms/cli"];
  return version || "";
};
var getYarnVersion = () => {
  return _executeCommand("yarn -v") || "";
};
var getNpmVersion = () => {
  return _executeCommand("npm -v") || "";
};

// src/telemetry/telemetry.ts
var TINA_METRICS_ENDPOINT = "https://metrics.tina.io/record";
var Telemetry = class {
  constructor({ disabled }) {
    this.oneWayHash = (payload) => {
      const hash = (0, import_crypto.createHash)("sha256");
      hash.update(payload);
      return hash.digest("hex");
    };
    this.submitRecord = async ({ event }) => {
      if (this.isDisabled) {
        return;
      }
      try {
        const id = this.projectId;
        const body = {
          partitionKey: id,
          data: {
            anonymousId: id,
            event: event.name,
            properties: {
              ...event,
              nodeVersion: process.version,
              tinaCliVersion: getTinaCliVersion(),
              tinaVersion: getTinaVersion(),
              yarnVersion: getYarnVersion(),
              npmVersion: getNpmVersion(),
              CI: Boolean(process.env.CI)
            }
          }
        };
        await (0, import_isomorphic_fetch.default)(TINA_METRICS_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" }
        });
      } catch (_e) {
      }
    };
    this.projectIDRaw = getID();
    const { NO_TELEMETRY } = process.env;
    this._disabled = NO_TELEMETRY === "1" || NO_TELEMETRY === "true" || Boolean(disabled);
  }
  get projectId() {
    return this.oneWayHash(this.projectIDRaw);
  }
  get isDisabled() {
    return this._disabled;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Telemetry
});
