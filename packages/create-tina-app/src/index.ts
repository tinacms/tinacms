import { Telemetry } from '@tinacms/metrics';
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
import { PackageManager, PKG_MANAGERS } from './util/packageManagers';
import validate from './util/isNpm';
import * as ascii from './util/asciiArt';
import { THEMES } from './themes';
import { PostHog } from 'posthog-node';
import {
  CreateTinaAppFinishedEvent,
  CreateTinaAppStartedEvent,
  postHogCapture,
} from './util/posthog';
import fetchPostHogConfig from './util/fetchPosthogConfig';
import * as sys from 'systeminformation';

let posthogClient: PostHog | null = null;

async function initializePostHog(
  configEndpoint?: string
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
  const osInfo = await sys.osInfo();

  if (!opts.noTelemetry) {
    console.log(`\n${TextStylesBold.bold('Telemetry Notice')}`);
    console.log(
      `To help the TinaCMS team improve the developer experience, create-tina-app collects anonymous usage statistics. This data helps us understand which environments and features are most important to support. Usage analytics may include: Operating system and version, package manager name and version (local only), Node.js version (local only), and the selected TinaCMS starter template.\nNo personal or project-specific code is ever collected. You can opt out at any time by passing the --noTelemetry flag.\n`
    );
  }

  if (!opts.noTelemetry) {
    posthogClient = await initializePostHog(
      'https://identity-v2.tinajs.io/v2/posthog-token'
    );
  }

  const spinner = ora();
  preRunChecks(spinner);

  if (!opts.noTelemetry && posthogClient) {
    postHogCapture(posthogClient, CreateTinaAppStartedEvent, {
      'node-version': process.version,
      'os-distro': osInfo.distro,
      'os-release': osInfo.release,
    });
  }

  const telemetry = new Telemetry({ disabled: opts?.noTelemetry });

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
      exit(1);
    }
  }

  let pkgManager = opts.pkgManager;
  if (pkgManager) {
    if (!PKG_MANAGERS.find((_pkgManager) => _pkgManager === pkgManager)) {
      spinner.fail(
        `The provided package manager '${opts.pkgManager}' is not supported. Please provide one of the following: ${PKG_MANAGERS}`
      );
      exit(1);
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
      spinner.fail(
        `You have no supported package managers installed. Please install one of the following: ${PKG_MANAGERS}`
      );
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
    if (!Object.hasOwn(res, 'packageManager')) exit(1); // User most likely sent SIGINT.
    pkgManager = res.packageManager;
  }

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
    if (!Object.hasOwn(res, 'name')) exit(1); // User most likely sent SIGINT.
    projectName = res.name;
  }

  if (!template) {
    const res = await prompts({
      name: 'template',
      type: 'select',
      message: 'What starter code would you like to use?',
      choices: TEMPLATES.map(formatTemplateChoice),
    });
    if (!Object.hasOwn(res, 'template')) exit(1); // User most likely sent SIGINT.
    template = TEMPLATES.find((_template) => _template.value === res.template);
  }

  let themeChoice: string | undefined;
  if (template.value === 'tina-docs') {
    const res = await prompts({
      name: 'theme',
      type: 'select',
      message: 'What theme would you like to use?',
      choices: THEMES,
    });
    if (!Object.hasOwn(res, 'theme')) exit(1); // User most likely sent SIGINT.
    themeChoice = res.theme;
  }
  await telemetry.submitRecord({
    event: {
      name: 'create-tina-app:invoke',
      template: template.value,
      pkgManager: pkgManager,
    },
  });

  const rootDir = path.join(process.cwd(), projectName);
  if (!(await isWriteable(path.dirname(rootDir)))) {
    spinner.fail(
      'The application path is not writable, please check folder permissions and try again. It is likely you do not have write permissions for this folder.'
    );
    process.exit(1);
  }

  let appName: string;
  try {
    appName = await setupProjectDirectory(rootDir);
  } catch (err) {
    spinner.fail((err as Error).message);
    exit(1);
  }

  try {
    if (themeChoice) {
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
    spinner.fail(`Failed to download template: ${(err as Error).message}`);
    exit(1);
  }

  spinner.start('Installing packages.');
  try {
    await install(pkgManager as PackageManager, opts.verbose);
    spinner.succeed();
  } catch (err) {
    spinner.fail(`Failed to install packages: ${(err as Error).message}`);
    packageManagerInstallationHadError = true;
  }

  spinner.start('Initializing git repository.');
  try {
    if (initializeGit(spinner)) {
      makeFirstCommit(rootDir);
      spinner.succeed();
    }
  } catch (err) {
    spinner.fail('Failed to initialize Git repository, skipping.');
  }

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

  if (!opts.noTelemetry && posthogClient) {
    postHogCapture(posthogClient, CreateTinaAppFinishedEvent, {
      template: template.value,
      'package-manager': pkgManager,
      'node-version': process.version,
      'app-name': appName,
      'os-distro': osInfo.distro,
      'os-release': osInfo.release,
    });
  }
}

run()
  .catch((error) => {
    if (process.stdout.columns >= 60) {
      console.log(TextStyles.tinaOrange(`${ascii.errorArt}`));
    }

    console.error('Error running create-tina-app:', error);
    process.exit(1);
  })
  .then(async () => {
    if (posthogClient) {
      await posthogClient.shutdown();
    }
  });
