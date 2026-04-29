import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import {
  checkTinaDependencies,
  classifyDependency,
  formatDoctorTable,
  getTinaDependencies,
  isTinaPackage,
  resolveInstalledVersions,
} from './doctor';

describe('doctor command helpers', () => {
  it('identifies Tina package names', () => {
    expect(isTinaPackage('tinacms')).toBe(true);
    expect(isTinaPackage('@tinacms/cli')).toBe(true);
    expect(isTinaPackage('tinacms-authjs')).toBe(true);
    expect(isTinaPackage('next-tinacms-s3')).toBe(true);
    expect(isTinaPackage('react')).toBe(false);
  });

  it('reads direct Tina dependencies from dependency sections', () => {
    expect(
      getTinaDependencies({
        dependencies: {
          react: '^19.0.0',
          tinacms: '^3.7.0',
        },
        devDependencies: {
          '@tinacms/cli': '^2.2.0',
        },
        optionalDependencies: {
          'tinacms-authjs': '^21.0.0',
        },
      })
    ).toEqual([
      {
        name: '@tinacms/cli',
        declared: '^2.2.0',
        dependencyType: 'devDependencies',
      },
      {
        name: 'tinacms',
        declared: '^3.7.0',
        dependencyType: 'dependencies',
      },
      {
        name: 'tinacms-authjs',
        declared: '^21.0.0',
        dependencyType: 'optionalDependencies',
      },
    ]);
  });

  it('compares installed version to latest', () => {
    expect(
      classifyDependency(
        {
          name: 'tinacms',
          declared: '^3.7.0',
          installed: '3.7.3',
          dependencyType: 'dependencies',
        },
        '3.7.3'
      ).status
    ).toBe('current');
    expect(
      classifyDependency(
        {
          name: 'tinacms',
          declared: '^3.7.0',
          installed: '3.7.2',
          dependencyType: 'dependencies',
        },
        '3.7.3'
      ).status
    ).toBe('outdated');
  });

  it('marks registry failures as unknown', async () => {
    const results = await checkTinaDependencies({
      dependencies: [
        {
          name: 'tinacms',
          declared: '^3.7.0',
          installed: '3.7.0',
          dependencyType: 'dependencies',
        },
      ],
      fetchLatest: async () => {
        throw new Error('offline');
      },
    });

    expect(results).toEqual([
      {
        name: 'tinacms',
        declared: '^3.7.0',
        dependencyType: 'dependencies',
        installed: '3.7.0',
        status: 'unknown',
        error: 'offline',
      },
    ]);
  });

  it('resolves installed versions from package-lock.json', async () => {
    const rootPath = await fs.mkdtemp(
      path.join(os.tmpdir(), 'tinacms-doctor-')
    );
    try {
      await fs.writeJSON(path.join(rootPath, 'package-lock.json'), {
        packages: {
          'node_modules/tinacms': {
            version: '3.7.5',
          },
        },
      });

      await expect(
        resolveInstalledVersions({
          rootPath,
          dependencies: [
            {
              name: 'tinacms',
              declared: '^3.7.0',
              dependencyType: 'dependencies',
            },
          ],
        })
      ).resolves.toEqual([
        {
          name: 'tinacms',
          declared: '^3.7.0',
          dependencyType: 'dependencies',
          installed: '3.7.5',
        },
      ]);
    } finally {
      await fs.remove(rootPath);
    }
  });

  it('formats a stable table', () => {
    expect(
      formatDoctorTable([
        {
          name: 'tinacms',
          declared: '^3.7.0',
          dependencyType: 'dependencies',
          installed: '3.7.3',
          latest: '3.7.3',
          status: 'current',
        },
      ])
    ).toContain('Package  Type          Declared  Installed  Latest  Status');
  });
});
