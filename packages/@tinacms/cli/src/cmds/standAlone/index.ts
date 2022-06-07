import { createServer, build as viteBuild } from 'vite'
import fs from 'fs-extra'
import react from '@vitejs/plugin-react'
import path from 'path'

export const createViteServer = async () => {
  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    configFile: false,
    root: __dirname,
    server: {
      port: 1337,
    },
  })
  await server.listen()

  server.printUrls()
}

export const buildStandAlone = async () => {
  const entry = path.resolve(process.cwd(), './test/')

  const packageDir = process.cwd()
  const packageJSON = JSON.parse(
    await fs.readFileSync(path.join(packageDir, 'package.json')).toString()
  )

  const deps = packageJSON.dependencies
  const peerDeps = packageJSON.peerDependencies
  const external = Object.keys({ ...deps, ...peerDeps })
  const globals = {}

  external.forEach((ext) => (globals[ext] = 'NOOP'))

  const defaultBuildConfig: Parameters<typeof viteBuild>[0] = {
    // plugins: [pnpPlugin(), dts()],
    build: {
      minify: false,
      assetsInlineLimit: 0,
      lib: {
        entry: path.resolve(process.cwd(), entry),
        name: packageJSON.name,
        fileName: (format) => {
          const base = path.basename(entry)
          const ext = path.extname(entry)
          const name = base.replace(ext, '')
          if (format === 'umd') {
            return `${name}.js`
          }
          return `${name}.${format}.js`
        },
      },
      emptyOutDir: false, // we build multiple files in to the dir
      sourcemap: false, // true | 'inline' (note: inline will go straight into your bundle size)
      rollupOptions: {
        // /**
        //  * FIXME: rollup-plugin-node-polyfills is only needed for node targets
        //  */
        plugins: [],
        /**
         * For some reason Rollup thinks it needs a global, though
         * I'm pretty sure it doesn't, since everything works
         *
         * By setting a global for each external dep we're silencing these warnings
         * No name was provided for external module 'react-beautiful-dnd' in output.globals – guessing 'reactBeautifulDnd'
         *
         * They don't occur for es builds, only UMD and I can't quite find
         * an authoritative response on wny they're needed or how they're
         * used in the UMD context.
         *
         * https://github.com/rollup/rollup/issues/1514#issuecomment-321877507
         * https://github.com/rollup/rollup/issues/1169#issuecomment-268815735
         */
        output: {
          globals,
        },
        external,
      },
    },
  }

  const out = await viteBuild({
    ...defaultBuildConfig,
    // Project root directory
    // root: path.resolve(process.cwd(), './'),

    // build: {
    //     lib: {

    //     }
    // },
    // output path
    // base: path.resolve(process.cwd(), './out/'),
    plugins: [react],
  })
  //   console.log({ out: JSON.stringify(out) })
}
