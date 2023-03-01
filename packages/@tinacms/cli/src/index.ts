import { Cli } from 'clipanion'
//@ts-ignore
import { version, name } from '../package.json'
import { DevCommand } from './next/dev'

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

export default cli
