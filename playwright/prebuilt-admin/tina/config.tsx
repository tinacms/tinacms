import React from 'react';
import { LocalAuthProvider, defineConfig } from 'tinacms';
import { UsernamePasswordAuthJSProvider } from 'tinacms-authjs/dist/tinacms';
import { post } from './collections/post';

/**
 * Runtime-selected auth provider.
 *
 * Both providers are referenced here so the bundler keeps `tinacms-authjs`
 * — and the ESM entry that drags in CJS `next-auth/react` — inside the
 * production build (the ingredient that guards the CJS-drag trap). Which one
 * is *active* is decided in the browser: `auth.spec` sets
 * `window.__TINA_FIXTURE_AUTHJS__` before boot to exercise the AuthJS login
 * screen; every other spec boots the local provider and enters edit mode.
 *
 * At build time (`typeof window === 'undefined'`) the local provider is used —
 * the value is irrelevant to the build, only the schema is.
 */
const selectAuthProvider = () => {
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { __TINA_FIXTURE_AUTHJS__?: boolean })
      .__TINA_FIXTURE_AUTHJS__
  ) {
    return new UsernamePasswordAuthJSProvider();
  }
  return new LocalAuthProvider();
};

const FixtureScreenIcon = () => <span aria-hidden='true'>★</span>;

export default defineConfig({
  branch: '',
  clientId: '',
  token: '',
  // Point the PRODUCTION admin bundle at the local GraphQL server that
  // `tinacms build --local` keeps alive on :4001. Without this override
  // `tinacms build` bakes the TinaCloud content URL into the SPA regardless
  // of `--local` (it builds from `codegen.productionUrl`), so the admin can
  // never reach the local API. See fixture README.
  contentApiUrlOverride: 'http://localhost:4001/graphql',
  authProvider: selectAuthProvider(),
  build: {
    publicFolder: 'public',
    outputFolder: 'admin',
    // Every URL bug the spike hit was basePath-shaped.
    basePath: 'my-site',
  },
  media: {
    // Real custom store behind a dynamic import (no `media.tina`).
    loadCustomStore: async () => {
      const pack = await import('./media/fixture-media-store');
      return pack.FixtureMediaStore;
    },
  },
  cmsCallback: (cms) => {
    // Registering a screen plugin exercises the admin's screen/react-router
    // path — it catches a second react-router-dom if the ABI misses it.
    cms.plugins.add({
      __type: 'screen',
      name: 'Fixture Screen',
      Icon: FixtureScreenIcon,
      layout: 'popup',
      Component: () => (
        <div data-testid='fixture-screen'>Prebuilt fixture screen</div>
      ),
    });
    return cms;
  },
  schema: {
    collections: [post],
  },
});
