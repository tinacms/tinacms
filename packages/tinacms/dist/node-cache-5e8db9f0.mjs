const makeCacheDir = async (dir, fs, path, os) => {
  const pathParts = dir.split(path.sep).filter(Boolean);
  const cacheHash = pathParts[pathParts.length - 1];
  const rootUser = pathParts[0];
  let cacheDir = dir;
  if (!fs.existsSync(path.join(path.sep, rootUser))) {
    cacheDir = path.join(os.tmpdir(), cacheHash);
  }
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create cache directory: ${error.message}`);
  }
  return cacheDir;
};
const NodeCache = async (dir) => {
  const fs = require("node:fs");
  const path = require("node:path");
  const os = require("node:os");
  const { createHash } = require("node:crypto");
  const cacheDir = await makeCacheDir(dir, fs, path, os);
  return {
    makeKey: (key) => {
      const input = key && key instanceof Object ? JSON.stringify(key) : key || "";
      return createHash("sha256").update(input).digest("hex");
    },
    get: async (key) => {
      let readValue;
      const cacheFilename = `${cacheDir}/${key}`;
      try {
        const data = await fs.promises.readFile(cacheFilename, "utf-8");
        readValue = JSON.parse(data);
      } catch (e) {
        if (e.code !== "ENOENT") {
          console.error(
            `Failed to read cache file to ${cacheFilename}: ${e.message}`
          );
        }
      }
      return readValue;
    },
    set: async (key, value) => {
      const cacheFilename = `${cacheDir}/${key}`;
      try {
        await fs.promises.writeFile(cacheFilename, JSON.stringify(value), {
          encoding: "utf-8",
          flag: "wx"
          // Don't overwrite existing caches
        });
      } catch (e) {
        if (e.code !== "EEXIST") {
          console.error(
            `Failed to write cache file to ${cacheFilename}: ${e.message}`
          );
        }
      }
    }
  };
};
export {
  NodeCache,
  makeCacheDir
};
