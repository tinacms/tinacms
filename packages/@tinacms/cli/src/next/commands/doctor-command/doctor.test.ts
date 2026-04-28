import {
  checkTinaDependencies,
  classifyDependency,
  formatDoctorTable,
  getTinaDependencies,
  isTinaPackage,
} from './doctor';

describe('doctor command helpers', () => {
  it('identifies Tina package names', () => {
    expect(isTinaPackage('tinacms')).toBe(true);
    expect(isTinaPackage('@tinacms/cli')).toBe(true);
    expect(isTinaPackage('tinacms-authjs')).toBe(true);
    expect(isTinaPackage('next-tinacms-s3')).toBe(true);
    expect(isTinaPackage('react')).toBe(false);
  });

  it('reads only direct dependencies', () => {
    expect(
      getTinaDependencies({
        dependencies: {
          react: '^19.0.0',
          tinacms: '^3.7.0',
        },
        devDependencies: {
          '@tinacms/cli': '^2.2.0',
        },
      } as any)
    ).toEqual([{ name: 'tinacms', declared: '^3.7.0' }]);
  });

  it('treats compatible caret and tilde ranges as current', () => {
    expect(
      classifyDependency({ name: 'tinacms', declared: '^3.7.0' }, '3.7.3')
        .status
    ).toBe('current');
    expect(
      classifyDependency({ name: 'tinacms', declared: '~3.7.0' }, '3.7.3')
        .status
    ).toBe('current');
    expect(
      classifyDependency({ name: 'tinacms', declared: '~3.7.0' }, '3.8.0')
        .status
    ).toBe('outdated');
  });

  it('marks registry failures as unknown', async () => {
    const results = await checkTinaDependencies({
      dependencies: [{ name: 'tinacms', declared: '^3.7.0' }],
      fetchLatest: async () => {
        throw new Error('offline');
      },
    });

    expect(results).toEqual([
      {
        name: 'tinacms',
        declared: '^3.7.0',
        status: 'unknown',
        error: 'offline',
      },
    ]);
  });

  it('formats a stable table', () => {
    expect(
      formatDoctorTable([
        {
          name: 'tinacms',
          declared: '^3.7.0',
          latest: '3.7.3',
          status: 'current',
        },
      ])
    ).toContain('Package  Declared  Latest  Status');
  });
});
