import prompts from 'prompts';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  isWriteable,
  setupProjectDirectory,
  updateProjectPackageName,
  updateProjectPackageVersion,
  updateThemeSettings,
} from './util/fileUtil';
import { install } from './util/install';
import { initializeGit, makeFirstCommit } from './util/git';
import { TEMPLATES, Template, downloadTemplate } from './templates';
import { preRunChecks } from './util/preRunChecks';
import { checkPackageExists } from './util/checkPkgManagers';
import { TextStyles, TextStylesBold } from './util/textstyles';
import { exit } from 'node:process';
import { extractOptions } from './util/options';
import { type PackageManager, PKG_MANAGERS } from './util/packageManagers';
import validate from './util/isNpm';
import * as ascii from './util/asciiArt';
import { THEMES } from './themes';
import { PostHog } from 'posthog-node';
import {
  CreateTinaAppFinishedEvent,
  CreateTinaAppStartedEvent,
  postHogCapture,
  postHogCaptureError,
  ERROR_CODES,
  TRACKING_STEPS,
  generateSessionId,
  getAnonymousUserId,
} from './util/posthog';
import fetchPostHogConfig from './util/fetchPosthogConfig';
import { osInfo as getOsSystemInfo } from 'systeminformation';

let posthogClient: PostHog | null = null;
async function initializePostHog(
  configEndpoint?: string,
  disableGeoip?: boolean
): Promise<PostHog | null> {
  let apiKey: string | undefined;
  let endpoint: string | undefined;

  if (configEndpoint) {
    const config = await fetchPostHogConfig(configEndpoint);
    apiKey = config.POSTHOG_API_KEY;
    endpoint = config.POSTHOG_ENDPOINT;
  }

  if (!apiKey) {
    console.warn(
      'PostHog API key not found. PostHog tracking will be disabled.'
    );
    return null;
  }

  return new PostHog(apiKey, {
    host: endpoint,
    disableGeoip: disableGeoip ?? true,
  });
}

// Formats a template into a prompts choice object with description and features
function formatTemplateChoice(template: Template) {
  let description = template.description || '';

  if (template.features && template.features.length > 0) {
    const featuresText = template.features
      .map((feature) => `  • ${feature.name}: ${feature.description}`)
      .join('\n');
    description = `${description}\n\nFeatures:\n${featuresText}`;
  }

  return {
    title: template.title,
    value: template.value,
    description: description,
  };
}

export async function run() {
  // Dynamic import for ora to handle ES module compatibility
  const ora = (await import('ora')).default;
  let packageManagerInstallationHadError = false;

  // Generate telemetry identifiers for this session
  const sessionId = generateSessionId();
  const userId = await getAnonymousUserId();

  if (process.stdout.columns >= 60) {
    console.log(TextStyles.tinaOrange(`${ascii.llama}`));
    console.log(TextStyles.tinaOrange(`${ascii.tinaCms}`));
  } else {
    console.log(TextStyles.tinaOrange(`🦙 TinaCMS`));
  }
  const require = createRequire(import.meta.url);
  const version = require('../package.json').version;
  console.log(`Create Tina App v${version}`);
  const opts = extractOptions(process.argv);

  // check which package managers are installed
  const installedPkgManagers = [];
  for (const pkg_manager of PKG_MANAGERS) {
    if (await checkPackageExists(pkg_manager)) {
      installedPkgManagers.push(pkg_manager);
    }
  }

  const telemetryData = {};

  if (!opts.noTelemetry) {
    console.log(`\n${TextStylesBold.bold('Telemetry Notice')}`);
    console.log(
      'To help the TinaCMS team improve the developer experience, create-tina-app collects anonymous usage statistics. This data helps us understand which environments and features are most important to support. Usage analytics may include: Operating system and version, package manager name and version (local only), Node.js version (local only), and the selected TinaCMS starter template.\nNo personal or project-specific code is ever collected. You can opt out at any time by passing the --noTelemetry flag.\n'
    );

    posthogClient = await initializePostHog(
      'https://identity-v2.tinajs.io/v2/posthog-token',
      false
    );

    // add os info
    const osInfo = await getOsSystemInfo();
    telemetryData['os-platform'] = osInfo.platform;
    telemetryData['os-distro'] = osInfo.distro;
    telemetryData['os-release'] = osInfo.release;

    // add node version
    telemetryData['node-version'] = process.version;

    // add package manager versions
    for (const pkgManager of PKG_MANAGERS) {
      telemetryData[`${pkgManager}-installed`] =
        installedPkgManagers.includes(pkgManager);
    }

    // capture params as telemetry data
    if (opts.template) {
      telemetryData['template'] = opts.template;
    }
    if (opts.pkgManager) {
      telemetryData['package-manager'] = opts.pkgManager;
    }
  }

  const spinner = ora();
  preRunChecks(spinner);

  // posthog client should only be initialized once telemetry is confirmed to be enabled, if null then telemetry cannot be sent
  postHogCapture(
    posthogClient,
    userId,
    sessionId,
    CreateTinaAppStartedEvent,
    telemetryData
  );

  let template: Template = null;
  if (opts.template) {
    template = TEMPLATES.find((_template) => _template.value === opts.template);
    if (!template) {
      spinner.fail(
        `The provided template '${
          opts.template
        }' is invalid. Please provide one of the following: ${TEMPLATES.map(
          (x) => x.value
        )}`
      );
      postHogCaptureError(
        posthogClient,
        userId,
        sessionId,
        new Error(`Invalid template: ${opts.template}`),
        {
          errorCode: ERROR_CODES.ERR_VAL_INVALID_TEMPLATE,
          errorCategory: 'validation',
          step: TRACKING_STEPS.TEMPLATE_SELECT,
          fatal: true,
          additionalProperties: { ...telemetryData },
        }
      );
      if (posthogClient) await posthogClient.shutdown();
      exit(1);
    }
  }

  let pkgManager = opts.pkgManager;
  if (pkgManager) {
    if (!PKG_MANAGERS.find((_pkgManager) => _pkgManager === pkgManager)) {
      postHogCaptureError(
        posthogClient,
        userId,
        sessionId,
        new Error(`Invalid package manager: ${opts.pkgManager}`),
        {
          errorCode: ERROR_CODES.ERR_VAL_INVALID_PKG_MANAGER,
          errorCategory: 'validation',
          step: TRACKING_STEPS.PKG_MANAGER_SELECT,
          fatal: true,
          additionalProperties: { ...telemetryData },
        }
      );
      if (posthogClient) await posthogClient.shutdown();
      spinner.fail(
        `The provided package manager '${opts.pkgManager}' is not supported. Please provide one of the following: ${PKG_MANAGERS}`
      );
      exit(1);
    }
  }

  if (!pkgManager) {
    if (installedPkgManagers.length === 0) {
      spinner.fail(
        `You have no supported package managers installed. Please install one of the following: ${PKG_MANAGERS}`
      );
      postHogCaptureError(
        posthogClient,
        userId,
        sessionId,
        new Error('No supported package managers installed'),
        {
          errorCode: ERROR_CODES.ERR_VAL_NO_PKG_MANAGERS,
          errorCategory: 'validation',
          step: TRACKING_STEPS.PRE_RUN_CHECKS,
          fatal: true,
          additionalProperties: telemetryData,
        }
      );
      if (posthogClient) await posthogClient.shutdown();
      exit(1);
    }

    const res = await prompts({
      message: 'Which package manager would you like to use?',
      name: 'packageManager',
      type: 'select',
      choices: installedPkgManagers.map((manager) => {
        return { title: manager, value: manager };
      }),
    });
    if (!Object.hasOwn(res, 'packageManager')) {
      postHogCaptureError(
        posthogClient,
        userId,
        sessionId,
        new Error('User cancelled package manager selection'),
        {
          errorCode: ERROR_CODES.ERR_CANCEL_PKG_MANAGER_PROMPT,
          errorCategory: 'user-cancellation',
          step: TRACKING_STEPS.PKG_MANAGER_SELECT,
          fatal: true,
          additionalProperties: telemetryData,
        }
      );
      if (posthogClient) await posthogClient.shutdown();
      exit(1);
    }
    pkgManager = res.packageManager;
  }
  telemetryData['package-manager'] = pkgManager;

  let projectName = opts.projectName;
  if (!projectName) {
    const res = await prompts({
      name: 'name',
      type: 'text',
      message: 'What is your project named?',
      initial: 'my-tina-app',
      validate: (name) => {
        const { message, isError } = validate(
          path.basename(path.resolve(name))
        );
        if (isError) return `Invalid project name: ${message}`;
        return true;
      },
    });
    if (!Object.hasOwn(res, 'name')) {
      postHogCaptureError(
        posthogClient,
        userId,
        sessionId,
        new Error('User cancelled project name input'),
        {
          errorCode: ERROR_CODES.ERR_CANCEL_PROJECT_NAME_PROMPT,
          errorCategory: 'user-cancellation',
          step: TRACKING_STEPS.PROJECT_NAME_INPUT,
          fatal: true,
          additionalProperties: telemetryData,
        }
      );
      if (posthogClient) await posthogClient.shutdown();
      exit(1);
    }
    projectName = res.name;
  }

  if (!template) {
    const res = await prompts({
      name: 'template',
      type: 'select',
      message: 'What starter code would you like to use?',
      choices: TEMPLATES.map(formatTemplateChoice),
    });
    if (!Object.hasOwn(res, 'template')) {
      postHogCaptureError(
        posthogClient,
        userId,
        sessionId,
        new Error('User cancelled template selection'),
        {
          errorCode: ERROR_CODES.ERR_CANCEL_TEMPLATE_PROMPT,
          errorCategory: 'user-cancellation',
          step: TRACKING_STEPS.TEMPLATE_SELECT,
          fatal: true,
          additionalProperties: telemetryData,
        }
      );
      if (posthogClient) await posthogClient.shutdown();
      exit(1);
    }
    template = TEMPLATES.find((_template) => _template.value === res.template);
  }
  telemetryData['template'] = template.value;

  let themeChoice: string | undefined;
  if (template.value === 'tina-docs') {
    const res = await prompts({
      name: 'theme',
      type: 'select',
      message: 'What theme would you like to use?',
      choices: THEMES,
    });
    if (!Object.hasOwn(res, 'theme')) {
      postHogCaptureError(
        posthogClient,
        userId,
        sessionId,
        new Error('User cancelled theme selection'),
        {
          errorCode: ERROR_CODES.ERR_CANCEL_THEME_PROMPT,
          errorCategory: 'user-cancellation',
          step: TRACKING_STEPS.THEME_SELECT,
          fatal: true,
          additionalProperties: {
            ...telemetryData,
            template: template.value,
          },
        }
      );
      if (posthogClient) await posthogClient.shutdown();
      exit(1);
    }
    themeChoice = res.theme;
  }

  const rootDir = path.join(process.cwd(), projectName);
  if (!(await isWriteable(path.dirname(rootDir)))) {
    spinner.fail(
      'The application path is not writable, please check folder permissions and try again. It is likely you do not have write permissions for this folder.'
    );
    postHogCaptureError(
      posthogClient,
      userId,
      sessionId,
      new Error('Directory not writable'),
      {
        errorCode: ERROR_CODES.ERR_FS_NOT_WRITABLE,
        errorCategory: 'filesystem',
        step: TRACKING_STEPS.DIRECTORY_SETUP,
        fatal: true,
        additionalProperties: { ...telemetryData },
      }
    );
    if (posthogClient) await posthogClient.shutdown();
    process.exit(1);
  }

  let appName: string;
  try {
    appName = await setupProjectDirectory(rootDir);
    telemetryData['app-name'] = appName;
  } catch (err) {
    const error = err as Error;
    spinner.fail(error.message);
    postHogCaptureError(posthogClient, userId, sessionId, error, {
      errorCode: ERROR_CODES.ERR_FS_MKDIR_FAILED,
      errorCategory: 'filesystem',
      step: TRACKING_STEPS.DIRECTORY_SETUP,
      fatal: true,
      additionalProperties: { ...telemetryData },
    });
    if (posthogClient) await posthogClient.shutdown();
    exit(1);
  }

  try {
    if (themeChoice) {
      telemetryData['theme'] = themeChoice;
      // Add selected theme to content/settings/config.json
      await updateThemeSettings(rootDir, themeChoice);
    }

    spinner.start('Downloading template...');
    await downloadTemplate(template, rootDir, spinner);
    spinner.succeed();

    spinner.start('Updating project metadata...');
    updateProjectPackageName(rootDir, projectName);
    updateProjectPackageVersion(rootDir, '0.0.1');
    spinner.succeed();
  } catch (err) {
    const error = err as Error;
    spinner.fail(`Failed to download template: ${error.message}`);
    postHogCaptureError(posthogClient, userId, sessionId, error, {
      errorCode: ERROR_CODES.ERR_TPL_DOWNLOAD_FAILED,
      errorCategory: 'template',
      step: TRACKING_STEPS.DOWNLOADING_TEMPLATE,
      fatal: true,
      additionalProperties: { ...telemetryData },
    });
    if (posthogClient) await posthogClient.shutdown();
    exit(1);
  }

  spinner.start('Installing packages.');
  try {
    await install(pkgManager as PackageManager, opts.verbose);
    spinner.succeed();
  } catch (err) {
    const error = err as Error;
    spinner.fail(`Failed to install packages: ${error.message}`);
    packageManagerInstallationHadError = true;
    postHogCaptureError(posthogClient, userId, sessionId, error, {
      errorCode: ERROR_CODES.ERR_INSTALL_PKG_MANAGER_FAILED,
      errorCategory: 'installation',
      step: TRACKING_STEPS.INSTALLING_PACKAGES,
      fatal: false,
      additionalProperties: { ...telemetryData },
    });
  }

  spinner.start('Initializing git repository.');
  try {
    if (initializeGit(spinner)) {
      makeFirstCommit(rootDir);
      spinner.succeed();
    }
  } catch (err) {
    const error = err as Error;
    spinner.fail('Failed to initialize Git repository, skipping.');
    postHogCaptureError(posthogClient, userId, sessionId, error, {
      errorCode: ERROR_CODES.ERR_GIT_INIT_FAILED,
      errorCategory: 'git',
      step: TRACKING_STEPS.GIT_INIT,
      fatal: false,
      additionalProperties: { ...telemetryData },
    });
  }

  postHogCapture(
    posthogClient,
    userId,
    sessionId,
    CreateTinaAppFinishedEvent,
    telemetryData
  );
  spinner.succeed(`Created ${TextStyles.tinaOrange(appName)}\n`);

  if (template.value === 'tina-hugo-starter') {
    spinner.warn(
      `Hugo is required for this starter. Install it via ${TextStyles.link(
        'https://gohugo.io/installation/'
      )}\n`
    );
  }

  const padCommand = (cmd: string, width = 20) =>
    TextStyles.cmd(cmd) + ' '.repeat(Math.max(0, width - cmd.length));

  spinner.info(`${TextStyles.bold('To get started:')}

  ${padCommand(`cd ${appName}`)}# move into your project directory${
    packageManagerInstallationHadError
      ? `
  ${padCommand(`${pkgManager} install`)}# install dependencies`
      : ''
  }
  ${padCommand(
    `${pkgManager} run dev`
  )}# start the dev server ${TextStyles.link(template.devUrl)}
  ${padCommand(`${pkgManager} run build`)}# build the app for production
`);

  console.log('Next steps:');
  console.log(
    `  • 📝 Edit some content: ${TextStyles.link(
      'https://tina.io/docs/using-tina-editor'
    )}`
  );
  console.log(
    `  • 📖 Learn the basics: ${TextStyles.link(
      'https://tina.io/docs/schema/'
    )}`
  );
  console.log(
    `  • 🖌️ Extend Tina with custom field components: ${TextStyles.link(
      'https://tina.io/docs/advanced/extending-tina/'
    )}`
  );
  console.log(
    `  • 🚀 Deploy to Production: ${TextStyles.link(
      'https://tina.io/docs/tinacloud/'
    )}`
  );
}

run()
  .catch(async (error) => {
    if (process.stdout.columns >= 60) {
      console.log(TextStyles.tinaOrange(`${ascii.errorArt}`));
    }

    console.error('Error running create-tina-app:', error);

    // Generate identifiers for error tracking if not already available
    const sessionId = generateSessionId();
    const userId = await getAnonymousUserId();

    postHogCaptureError(posthogClient, userId, sessionId, error, {
      errorCode: ERROR_CODES.ERR_UNCAUGHT,
      errorCategory: 'uncategorized',
      step: 'unknown',
      fatal: true,
      additionalProperties: {},
    });

    if (posthogClient) {
      await posthogClient.shutdown();
    }

    process.exit(1);
  })
  .then(async () => {
    if (posthogClient) {
      await posthogClient.shutdown();
    }
  });
