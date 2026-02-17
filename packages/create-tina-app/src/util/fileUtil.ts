import fs from 'fs-extra';
import path from 'path';
import { TextStyles } from './textstyles';

export async function isWriteable(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    await fs.promises.access(directory, (fs.constants || fs).W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export function folderContainsInstallConflicts(root: string): string[] {
  const validFiles = [
    '.DS_Store',
    '.git',
    '.gitattributes',
    '.gitignore',
    '.gitlab-ci.yml',
    '.hg',
    '.hgcheck',
    '.hgignore',
    '.idea',
    '.npmignore',
    '.travis.yml',
    'LICENSE',
    'Thumbs.db',
    'docs',
    'mkdocs.yml',
    'npm-debug.log',
    'yarn-debug.log',
    'yarn-error.log',
  ];

  const conflicts = fs
    .readdirSync(root)
    .filter((file) => !validFiles.includes(file))
    // Support IntelliJ IDEA-based editors
    .filter((file) => !/\.iml$/.test(file));

  return conflicts;
}

export async function setupProjectDirectory(dir: string): Promise<string> {
  const appName = path.basename(dir);

  await fs.mkdirp(dir);
  process.chdir(dir);

  const conflicts = folderContainsInstallConflicts(dir);
  if (conflicts.length > 0) {
    const errorMessageLines = [
      `The directory '${TextStyles.bold(appName)}' contains files that could conflict. Below is a list of conflicts, please remove them and try again.`,
    ];
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(dir, file));
        if (stats.isDirectory()) {
          errorMessageLines.push(`  -  ${TextStyles.info(file)}/`);
        } else {
          errorMessageLines.push(`  -  ${file}`);
        }
      } catch {
        errorMessageLines.push(`  -  ${file}`);
      }
    }

    throw new Error(errorMessageLines.join('\n'));
  }

  return appName;
}

export function updateProjectPackageName(dir: string, name: string) {
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = name;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

export function updateProjectPackageVersion(dir: string, version: string) {
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

export async function updateThemeSettings(dir: string, selectedTheme: string) {
  const settingsDir = path.join(dir, 'content', 'settings');
  const configPath = path.join(settingsDir, 'config.json');

  // Create settings directory if it doesn't exist
  await fs.mkdirp(settingsDir);

  // Read existing config or create new one
  let config: any = {};
  try {
    const existingConfig = await fs.readFile(configPath, 'utf8');
    config = JSON.parse(existingConfig);
  } catch (error) {
    // File doesn't exist or is invalid JSON, start with empty object
  }

  // Always overwrite selectedTheme with the new choice, preserve all other existing fields
  config.selectedTheme = selectedTheme;

  // Write the updated config
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Updates the tina config file to set the telemetry mode.
 * This modifies the TypeScript/JavaScript config file by inserting the telemetry setting.
 */
export async function updateTelemetryConfig(
  dir: string,
  mode: 'anonymous' | 'disabled'
) {
  const configPaths = [
    path.join(dir, 'tina', 'config.ts'),
    path.join(dir, 'tina', 'config.tsx'),
    path.join(dir, 'tina', 'config.js'),
  ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(configPath)) {
      let content = await fs.readFile(configPath, 'utf8');

      // Check if telemetry is already defined
      if (/telemetry\s*:/.test(content)) {
        // Replace existing telemetry value
        content = content.replace(
          /telemetry\s*:\s*['"][^'"]*['"]/,
          `telemetry: '${mode}'`
        );
      } else {
        // Insert telemetry config after defineConfig({
        content = content.replace(
          /defineConfig\(\s*\{/,
          `defineConfig({\n  telemetry: '${mode}',`
        );
      }

      await fs.writeFile(configPath, content);
      return;
    }
  }
}
