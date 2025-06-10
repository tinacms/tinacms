var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
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
  run: () => run
});
module.exports = __toCommonJS(index_exports);
var import_metrics = require("@tinacms/metrics");
var import_commander = require("commander");
var import_prompts = __toESM(require("prompts"));
var import_node_path = __toESM(require("node:path"));

// package.json
var name = "create-tina-app";
var version = "1.3.4";

// src/util/fileUtil.ts
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));

// src/util/logger.ts
var import_chalk = __toESM(require("chalk"));
var TextStyles = {
  link: import_chalk.default.bold.cyan,
  cmd: import_chalk.default.inverse,
  info: import_chalk.default.blue,
  success: import_chalk.default.green,
  warn: import_chalk.default.yellow,
  err: import_chalk.default.red,
  bold: import_chalk.default.bold
};
var Logger = class {
  log(message) {
    console.info(message);
  }
  debug(message) {
    console.debug(TextStyles.info(`[DEBUG] ${message}`));
  }
  info(message) {
    console.info(TextStyles.info(`[INFO] ${message}`));
  }
  success(message) {
    console.log(TextStyles.success(`[SUCCESS] ${message}`));
  }
  cmd(message) {
    console.log(TextStyles.cmd(message));
  }
  warn(message) {
    console.warn(TextStyles.warn(`[WARNING] ${message}`));
  }
  err(message) {
    console.error(TextStyles.err(`[ERROR] ${message}`));
  }
};
var log = new Logger();

// src/util/fileUtil.ts
async function isWriteable(directory) {
  try {
    await import_fs_extra.default.promises.access(directory, (import_fs_extra.default.constants || import_fs_extra.default).W_OK);
    return true;
  } catch (err) {
    return false;
  }
}
function folderContainsInstallConflicts(root) {
  const validFiles = [
    ".DS_Store",
    ".git",
    ".gitattributes",
    ".gitignore",
    ".gitlab-ci.yml",
    ".hg",
    ".hgcheck",
    ".hgignore",
    ".idea",
    ".npmignore",
    ".travis.yml",
    "LICENSE",
    "Thumbs.db",
    "docs",
    "mkdocs.yml",
    "npm-debug.log",
    "yarn-debug.log",
    "yarn-error.log"
  ];
  const conflicts = import_fs_extra.default.readdirSync(root).filter((file) => !validFiles.includes(file)).filter((file) => !/\.iml$/.test(file));
  return conflicts;
}
async function setupProjectDirectory(dir) {
  const appName = import_path.default.basename(dir);
  await import_fs_extra.default.mkdirp(dir);
  process.chdir(dir);
  const conflicts = folderContainsInstallConflicts(dir);
  if (conflicts.length > 0) {
    log.err(
      `The directory '${TextStyles.bold(
        appName
      )}' contains files that could conflict. Below is a list of conflicts, please remove them and try again.`
    );
    for (const file of conflicts) {
      try {
        const stats = import_fs_extra.default.lstatSync(import_path.default.join(dir, file));
        if (stats.isDirectory()) {
          log.log(`-  ${TextStyles.info(file)}/`);
        } else {
          log.log(`-  ${file}`);
        }
      } catch {
        log.log(`-  ${file}`);
      }
    }
    process.exit(1);
  }
  return appName;
}
function updateProjectPackageName(dir, name2) {
  const packageJsonPath = import_path.default.join(dir, "package.json");
  const packageJson = JSON.parse(import_fs_extra.default.readFileSync(packageJsonPath, "utf8"));
  packageJson.name = name2;
  import_fs_extra.default.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
function updateProjectPackageVersion(dir, version2) {
  const packageJsonPath = import_path.default.join(dir, "package.json");
  const packageJson = JSON.parse(import_fs_extra.default.readFileSync(packageJsonPath, "utf8"));
  packageJson.version = version2;
  import_fs_extra.default.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// src/util/install.ts
var import_cross_spawn = __toESM(require("cross-spawn"));
function install(packageManager) {
  return new Promise((resolve, reject) => {
    const child = (0, import_cross_spawn.default)(packageManager, ["install"], {
      stdio: "inherit",
      env: { ...process.env, ADBLOCK: "1", DISABLE_OPENCOLLECTIVE: "1" }
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command: `${packageManager} install` });
        return;
      }
      resolve();
    });
  });
}

// src/util/git.ts
var import_child_process = require("child_process");
var import_path2 = __toESM(require("path"));
var import_fs_extra2 = __toESM(require("fs-extra"));
function isInGitRepository() {
  try {
    (0, import_child_process.execSync)("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch (_) {
  }
  return false;
}
function isInMercurialRepository() {
  try {
    (0, import_child_process.execSync)("hg --cwd . root", { stdio: "ignore" });
    return true;
  } catch (_) {
  }
  return false;
}
function makeFirstCommit(root) {
  try {
    (0, import_child_process.execSync)("git checkout -b main", { stdio: "ignore" });
    (0, import_child_process.execSync)("git add -A", { stdio: "ignore" });
    (0, import_child_process.execSync)('git commit -m "Initial commit from Create Tina App"', {
      stdio: "ignore"
    });
  } catch (err) {
    import_fs_extra2.default.removeSync(import_path2.default.join(root, ".git"));
    throw err;
  }
}
function initializeGit() {
  (0, import_child_process.execSync)("git --version", { stdio: "ignore" });
  if (isInGitRepository() || isInMercurialRepository()) {
    log.warn("Already in a Git repository, skipping.");
    return false;
  }
  if (!import_fs_extra2.default.existsSync(".gitignore")) {
    log.warn("There is no .gitignore file in this repository, creating one...");
    import_fs_extra2.default.writeFileSync(
      ".gitignore",
      `node_modules
.yarn/*
.DS_Store
.cache
.next/
`
    );
  }
  (0, import_child_process.execSync)("git init", { stdio: "ignore" });
  return true;
}

// src/util/examples.ts
var import_node_stream = require("node:stream");
var import_promises = require("node:stream/promises");
var import_tar = require("tar");
async function getRepoInfo(url, examplePath) {
  const [, username, name2, t, _branch, ...file] = url.pathname.split("/");
  const filePath = examplePath ? examplePath.replace(/^\//, "") : file.join("/");
  if (
    // Support repos whose entire purpose is to be a Next.js example, e.g.
    // https://github.com/:username/:my-cool-nextjs-example-repo-name.
    t === void 0 || // Support GitHub URL that ends with a trailing slash, e.g.
    // https://github.com/:username/:my-cool-nextjs-example-repo-name/
    // In this case "t" will be an empty string while the next part "_branch" will be undefined
    t === "" && _branch === void 0
  ) {
    try {
      const infoResponse = await fetch(
        `https://api.github.com/repos/${username}/${name2}`
      );
      if (infoResponse.status !== 200) {
        return;
      }
      const info = await infoResponse.json();
      return { username, name: name2, branch: info.default_branch, filePath };
    } catch {
      return;
    }
  }
  const branch = examplePath ? `${_branch}/${file.join("/")}`.replace(new RegExp(`/${filePath}|/$`), "") : _branch;
  if (username && name2 && branch && t === "tree") {
    return { username, name: name2, branch, filePath };
  }
}
async function downloadTarStream(url) {
  const res = await fetch(url);
  if (!res.body) {
    throw new Error(`Failed to download: ${url}`);
  }
  return import_node_stream.Readable.fromWeb(res.body);
}
async function downloadAndExtractRepo(root, { username, name: name2, branch, filePath }) {
  await (0, import_promises.pipeline)(
    await downloadTarStream(
      `https://codeload.github.com/${username}/${name2}/tar.gz/${branch}`
    ),
    (0, import_tar.x)({
      cwd: root,
      strip: filePath ? filePath.split("/").length + 1 : 1,
      filter: (p) => p.startsWith(
        `${name2}-${branch.replace(/\//g, "-")}${filePath ? `/${filePath}/` : "/"}`
      )
    })
  );
}

// src/templates.ts
var import_fs_extra3 = require("fs-extra");
var import_path3 = __toESM(require("path"));
var TEMPLATES = [
  {
    title: "\u2B50 NextJS starter",
    description: "Kickstart your project with NextJS \u2013 our top recommendation for a seamless, performant, and versatile web experience.",
    value: "tina-cloud-starter",
    isInternal: false,
    gitURL: "https://github.com/tinacms/tina-cloud-starter"
  },
  {
    title: "Astro Starter",
    description: "Get started with Astro - a modern static site generator designed for fast, lightweight, and flexible web projects.",
    value: "tina-astro-starter",
    isInternal: false,
    gitURL: "https://github.com/tinacms/tina-astro-starter"
  },
  {
    title: "Hugo Starter",
    description: "With Hugo, you wield the power of lightning-fast site generation, crafting web experiences at the speed of thought.",
    value: "tina-hugo-starter",
    isInternal: false,
    gitURL: "https://github.com/tinacms/tina-hugo-starter"
  },
  {
    title: "Remix Starter",
    description: "Dive into Remix to orchestrate seamless, interactive user journeys like a maestro of the web.",
    value: "tina-remix-starter",
    isInternal: false,
    gitURL: "https://github.com/tinacms/tina-remix-starter"
  },
  {
    title: "Docusaurus Starter",
    description: "Docusaurus empowers you to build and evolve documentation like crafting a living, breathing knowledge repository.",
    value: "tinasaurus",
    isInternal: false,
    gitURL: "https://github.com/tinacms/tinasaurus"
  },
  {
    title: "Bare bones starter",
    description: "Stripped down to essentials, this starter is the canvas for pure, unadulterated code creativity.",
    value: "basic",
    isInternal: false,
    gitURL: "https://github.com/tinacms/tina-barebones-starter"
  }
];
async function downloadTemplate(template, root) {
  if (template.isInternal === false) {
    const repoURL = new URL(template.gitURL);
    const repoInfo = await getRepoInfo(repoURL);
    if (!repoInfo) {
      throw new Error("Repository information not found.");
    }
    log.info(
      `Downloading files from repo ${TextStyles.link(
        `${repoInfo?.username}/${repoInfo?.name}`
      )}.`
    );
    await downloadAndExtractRepo(root, repoInfo);
  } else {
    const templateFile = import_path3.default.join(__dirname, "..", "examples", template.value);
    await (0, import_fs_extra3.copy)(`${templateFile}/`, "./");
  }
}

// src/util/preRunChecks.ts
var SUPPORTED_NODE_VERSION_BOUNDS = { oldest: 18, latest: 22 };
var SUPPORTED_NODE_VERSION_RANGE = [
  ...Array(SUPPORTED_NODE_VERSION_BOUNDS.latest).keys()
].map((i) => i + SUPPORTED_NODE_VERSION_BOUNDS.oldest);
var isSupported = SUPPORTED_NODE_VERSION_RANGE.some(
  (version2) => process.version.startsWith(`v${version2}`)
);
function preRunChecks() {
  checkSupportedNodeVersion();
}
function checkSupportedNodeVersion() {
  if (!isSupported) {
    log.warn(
      `Node ${process.version} is not supported by create-tina-app. Please update to be within v${SUPPORTED_NODE_VERSION_BOUNDS.oldest}-v${SUPPORTED_NODE_VERSION_BOUNDS.latest}. See https://nodejs.org/en/download/ for more details.`
    );
  }
}

// src/util/checkPkgManagers.ts
var import_child_process2 = require("child_process");
async function checkPackageExists(name2) {
  try {
    await new Promise((resolve, reject) => {
      (0, import_child_process2.exec)(`${name2} -v`, (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        }
        resolve(stdout);
      });
    });
    return true;
  } catch (_) {
    return false;
  }
}

// src/index.ts
var import_node_process = require("node:process");
var import_validate_npm_package_name = __toESM(require("validate-npm-package-name"));
var PKG_MANAGERS = ["npm", "yarn", "pnpm", "bun"];
async function run() {
  preRunChecks();
  let projectName = "";
  const program = new import_commander.Command(name);
  program.version(version).option(
    "-t, --template <template>",
    `Choose which template to start from. Valid templates are: ${TEMPLATES.map(
      (x2) => x2.value
    )}`
  ).option(
    "-p, --pkg-manager <pkg-manager>",
    `Choose which package manager to use. Valid package managers are: ${PKG_MANAGERS}`
  ).option(
    "-d, --dir <dir>",
    "Choose which directory to run this script from."
  ).option("--noTelemetry", "Disable anonymous telemetry that is collected.").arguments("[project-directory]").usage(`${TextStyles.success("<project-directory>")} [options]`).action((name2) => {
    projectName = name2;
  });
  program.parse(process.argv);
  const opts = program.opts();
  if (opts.dir) {
    process.chdir(opts.dir);
  }
  const telemetry = new import_metrics.Telemetry({ disabled: opts?.noTelemetry });
  let template = opts.template;
  if (template) {
    template = TEMPLATES.find((_template) => _template.value === template);
    if (!template) {
      log.err(
        `The provided template '${opts.template}' is invalid. Please provide one of the following: ${TEMPLATES.map(
          (x2) => x2.value
        )}`
      );
      (0, import_node_process.exit)(1);
    }
  }
  let pkgManager = opts.pkgManager;
  if (pkgManager) {
    if (!PKG_MANAGERS.find((_pkgManager) => _pkgManager === pkgManager)) {
      log.err(
        `The provided package manager '${opts.pkgManager}' is not supported. Please provide one of the following: ${PKG_MANAGERS}`
      );
      (0, import_node_process.exit)(1);
    }
  }
  if (!pkgManager) {
    const installedPkgManagers = [];
    for (const pkg_manager of PKG_MANAGERS) {
      if (await checkPackageExists(pkg_manager)) {
        installedPkgManagers.push(pkg_manager);
      }
    }
    if (installedPkgManagers.length === 0) {
      log.err(
        `You have no supported package managers installed. Please install one of the following: ${PKG_MANAGERS}`
      );
      (0, import_node_process.exit)(1);
    }
    const res = await (0, import_prompts.default)({
      message: "Which package manager would you like to use?",
      name: "packageManager",
      type: "select",
      choices: installedPkgManagers.map((manager) => {
        return { title: manager, value: manager };
      })
    });
    if (!Object.hasOwn(res, "packageManager")) (0, import_node_process.exit)(1);
    pkgManager = res.packageManager;
  }
  if (!projectName) {
    const res = await (0, import_prompts.default)({
      name: "name",
      type: "text",
      message: "What is your project named?",
      initial: "my-tina-app",
      validate: (name2) => {
        const { validForNewPackages, errors } = (0, import_validate_npm_package_name.default)(
          import_node_path.default.basename(import_node_path.default.resolve(name2))
        );
        if (validForNewPackages) return true;
        return `Invalid project name: ${errors[0]}`;
      }
    });
    if (!Object.hasOwn(res, "name")) (0, import_node_process.exit)(1);
    projectName = res.name;
  }
  if (!template) {
    const res = await (0, import_prompts.default)({
      name: "template",
      type: "select",
      message: "What starter code would you like to use?",
      choices: TEMPLATES
    });
    if (!Object.hasOwn(res, "template")) (0, import_node_process.exit)(1);
    template = TEMPLATES.find((_template) => _template.value === res.template);
  }
  await telemetry.submitRecord({
    event: {
      name: "create-tina-app:invoke",
      template,
      pkgManager
    }
  });
  const rootDir = import_node_path.default.join(process.cwd(), projectName);
  if (!await isWriteable(import_node_path.default.dirname(rootDir))) {
    log.err(
      "The application path is not writable, please check folder permissions and try again. It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }
  const appName = await setupProjectDirectory(rootDir);
  try {
    await downloadTemplate(template, rootDir);
    updateProjectPackageName(rootDir, projectName);
    updateProjectPackageVersion(rootDir, "0.0.1");
  } catch (err) {
    log.err(`Failed to download template: ${err.message}`);
    (0, import_node_process.exit)(1);
  }
  log.info("Installing packages.");
  await install(pkgManager);
  log.info("Initializing git repository.");
  try {
    if (initializeGit()) {
      makeFirstCommit(rootDir);
      log.info("Initialized git repository.");
    }
  } catch (err) {
    log.err("Failed to initialize Git repository, skipping.");
  }
  log.success("Starter successfully created!");
  if (template.value === "tina-hugo-starter")
    log.warn(
      `Hugo is required for this starter. Install it via ${TextStyles.link("https://gohugo.io/installation/")}.`
    );
  log.log(TextStyles.bold("\nTo launch your app, run:\n"));
  log.cmd(`cd ${appName}
${pkgManager} run dev`);
  log.log(`
Next steps:
    \u2022 \u{1F4DD} Edit some content on ${TextStyles.link(
    "http://localhost:3000"
  )} (See ${TextStyles.link("https://tina.io/docs/using-tina-editor")})
    \u2022 \u{1F4D6} Learn the basics: ${TextStyles.link("https://tina.io/docs/schema/")}
    \u2022 \u{1F58C}\uFE0F Extend Tina with custom field components: ${TextStyles.link(
    "https://tina.io/docs/advanced/extending-tina/"
  )}
    \u2022 \u{1F680} Deploy to Production: ${TextStyles.link(
    "https://tina.io/docs/tina-cloud/"
  )}
  `);
}
run();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  run
});
