import { Config } from '@stencil/core'
import { reactOutputTarget } from '@stencil/react-output-target'

export const config: Config = {
  namespace: 'tinacms-ui',
  outputTargets: [
    reactOutputTarget({
      componentCorePackage: 'tinacms-ui',
      proxiesFile: '../@tinacms/styles/src/stencil-components.ts',
    }),
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
}
