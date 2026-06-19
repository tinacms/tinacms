/**



*/

import {
  generateGqlScript,
  extendNextScripts,
  extendAstroScripts,
} from './script-helpers';

describe('generateGqlScript', () => {
  it('wraps original script correctly', () => {
    const newScript = generateGqlScript('next dev -p 3000');

    expect(newScript).toEqual('tinacms dev -c "next dev -p 3000"');
  });
});

describe('extendNextScripts', () => {
  describe('with all existing scrpts', () => {
    it('returns new scripts correctly', () => {
      const newScripts = extendNextScripts({
        foo: 'bar',
        dev: 'next dev -p 3000',
        build: 'next build -p 3000',
      });

      expect(newScripts).toEqual({
        foo: 'bar',
        dev: 'tinacms dev -c "next dev -p 3000"',
        build: 'tinacms build && next build -p 3000',
      });
    });
  });

  describe('with missing existing scrpts', () => {
    it('returns new scripts correctly', () => {
      const newScripts = extendNextScripts({
        foo: 'bar',
      });

      expect(newScripts).toEqual({
        foo: 'bar',
        dev: 'tinacms dev -c "next dev"',
        build: 'tinacms build && next build',
      });
    });
  });
});

describe('extendAstroScripts', () => {
  it('wraps existing dev/build scripts and preserves flags', () => {
    const newScripts = extendAstroScripts({
      foo: 'bar',
      dev: 'astro dev --port 4321',
      build: 'astro build',
    });

    expect(newScripts).toEqual({
      foo: 'bar',
      dev: 'tinacms dev -c "astro dev --port 4321"',
      build: 'tinacms build && astro build',
    });
  });

  it('fills in defaults when dev/build are missing', () => {
    const newScripts = extendAstroScripts({ foo: 'bar' });

    expect(newScripts).toEqual({
      foo: 'bar',
      dev: 'tinacms dev -c "astro dev"',
      build: 'tinacms build && astro build',
    });
  });

  it('is idempotent when scripts are already wrapped', () => {
    const already = {
      dev: 'tinacms dev -c "astro dev"',
      build: 'tinacms build && astro build',
    };

    expect(extendAstroScripts(already)).toEqual(already);
  });
});
