import { Cli } from 'clipanion'
//@ts-ignore
import { version, name } from '../package.json'
import { DevCommand } from './next/commands/dev-command'
import { BuildCommand } from './next/commands/build-command'

export type {
  Schema,
  TinaSchema,
  Collection,
  TinaTemplate,
} from '@tinacms/graphql'

const cli = new Cli({
  binaryName: `tinacms`,
  binaryLabel: `TinaCMS`,
  binaryVersion: version,
})

cli.register(DevCommand)
cli.register(BuildCommand)

export default cli
