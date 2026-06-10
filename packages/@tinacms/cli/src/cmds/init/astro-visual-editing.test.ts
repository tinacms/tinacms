import { isDefaultAstroConfig } from './astro-config-detect';

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
