import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  astroNodeAdapterDep,
  findExistingPaths,
  isDefaultAstroConfig,
  parseAstroMajor,
} from './astro-config-detect';
import { astroHelloWorldPost } from './templates/content';

describe('isDefaultAstroConfig', () => {
  it('matches the scaffold default', () => {
    expect(
      isDefaultAstroConfig(
        `import { defineConfig } from 'astro/config';\nexport default defineConfig({});\n`
      )
    ).toBe(true);
  });

  it('matches the default with @ts-check and comments', () => {
    expect(
      isDefaultAstroConfig(
        `// @ts-check\nimport { defineConfig } from 'astro/config';\n\n// https://astro.build/config\nexport default defineConfig({});\n`
      )
    ).toBe(true);
  });

  it('matches a multi-line empty config with double quotes', () => {
    expect(
      isDefaultAstroConfig(
        `import { defineConfig } from "astro/config";\nexport default defineConfig({\n});`
      )
    ).toBe(true);
  });

  it('does NOT match a config with real content', () => {
    expect(
      isDefaultAstroConfig(
        `import { defineConfig } from 'astro/config';\nexport default defineConfig({ output: 'server' });`
      )
    ).toBe(false);
  });

  it('does NOT match when defineConfig({}) only appears in a comment', () => {
    expect(
      isDefaultAstroConfig(
        `// example: defineConfig({})\nimport { defineConfig } from 'astro/config';\nexport default defineConfig({ site: 'https://x.com' });`
      )
    ).toBe(false);
  });

  it('does NOT match an empty config that has extra imports', () => {
    expect(
      isDefaultAstroConfig(
        `import { defineConfig } from 'astro/config';\nimport mdx from '@astrojs/mdx';\nexport default defineConfig({});`
      )
    ).toBe(false);
  });

  it('does NOT match defineConfig from a different package', () => {
    expect(
      isDefaultAstroConfig(
        `import { defineConfig } from 'vite';\nexport default defineConfig({});`
      )
    ).toBe(false);
  });
});

describe('findExistingPaths', () => {
  it('returns only the paths that already exist under baseDir', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tina-astro-'));
    fs.mkdirSync(path.join(dir, 'src/lib/tina'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'src/lib/tina/data.ts'),
      'export const MINE = 42;'
    );
    expect(
      findExistingPaths(dir, [
        'src/lib/tina/data.ts',
        'src/pages/tina-demo.astro',
      ])
    ).toEqual(['src/lib/tina/data.ts']);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns an empty array when none of the paths exist', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tina-astro-'));
    expect(findExistingPaths(dir, ['a.ts', 'b/c.astro'])).toEqual([]);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('parseAstroMajor', () => {
  it('reads the major from common version ranges', () => {
    expect(parseAstroMajor('^6.4.5')).toBe(6);
    expect(parseAstroMajor('~5.17.3')).toBe(5);
    expect(parseAstroMajor('6.0.0')).toBe(6);
    expect(parseAstroMajor('^5.0.0 || ^6.0.0')).toBe(5);
  });

  it('returns undefined when there is no parseable number', () => {
    expect(parseAstroMajor(undefined)).toBeUndefined();
    expect(parseAstroMajor('workspace:*')).toBeUndefined();
    expect(parseAstroMajor('latest')).toBeUndefined();
  });
});

describe('astroNodeAdapterDep', () => {
  it('pins the adapter to the project Astro major', () => {
    expect(astroNodeAdapterDep(5)).toBe('@astrojs/node@^9');
    expect(astroNodeAdapterDep(6)).toBe('@astrojs/node@^10');
  });

  it('falls back to the unversioned dep for unknown/future majors', () => {
    expect(astroNodeAdapterDep(undefined)).toBe('@astrojs/node');
    expect(astroNodeAdapterDep(7)).toBe('@astrojs/node');
  });
});

describe('astroHelloWorldPost (editable hero seed)', () => {
  it('seeds every editable field the schema + PostBody expect', () => {
    for (const field of [
      'title:',
      'eyebrow:',
      'ctaPrimary:',
      'ctaSecondary:',
      'label:',
      'href:',
    ]) {
      expect(astroHelloWorldPost).toContain(field);
    }
  });
});
