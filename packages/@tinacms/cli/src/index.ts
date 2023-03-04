import { Cli } from 'clipanion'
//@ts-ignore
import { version, name } from '../package.json'
import { DevCommand } from './next/commands/dev-command'
import { BuildCommand } from './next/commands/build-command'
import { AuditCommand } from './next/commands/audit-command'
import { InitCommand } from './next/commands/init-command'
// import { CodemodCommand } from './next/commands/codemod-command'

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
cli.register(AuditCommand)
cli.register(InitCommand)
// Uncomment when cloud supports /tina & tina-lock.json
// cli.register(CodemodCommand)

export default cli
