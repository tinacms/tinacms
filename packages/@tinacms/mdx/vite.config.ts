import { defineConfig } from 'vitest/config'

console.log('ime')
export default defineConfig({
  test: {
    // snapshotFormat: {
    //   printFunctionName: false,
    // },
    resolveSnapshotPath: (testPath, snapExtension) => {
      console.log(testPath, snapExtension)
      // return testPath + snapExtension
      return testPath + '.js'
    },
  },
})
