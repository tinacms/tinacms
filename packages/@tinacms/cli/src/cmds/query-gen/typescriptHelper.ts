import * as ts from 'typescript'

export function compile(
  fileNames: string[],
  options: ts.CompilerOptions
): void {
  // Create a Program with an in-memory emit
  //   const createdFiles = {}
  const host = ts.createCompilerHost(options)
  //   host.writeFile = (fileName: string, contents: string) =>
  //     (createdFiles[fileName] = contents)

  // Prepare and emit the d.ts files
  const program = ts.createProgram(fileNames, options, host)
  program.emit()

  // Loop through all the input files
  //   fileNames.forEach((file) => {
  //     console.log('### JavaScript\n')
  //     console.log(host.readFile(file))

  //     console.log('### Type Definition\n')
  //     const dts = file.replace('.js', '.d.ts')
  //     console.log(createdFiles[dts])
  //   })
}
