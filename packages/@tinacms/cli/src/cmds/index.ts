interface CommandHandler<Environment, Parameters> {
  setup(p: Parameters): Promise<void>
  detectEnvironment(p: Parameters): Promise<Environment>
  configure(e: Environment, p: Parameters): Promise<Record<any, any>>
  apply(Record, e: Environment, p: Parameters): Promise<void>
}

export class CLICommand<Environment, Parameters> {
  constructor(
    private readonly handler: CommandHandler<Environment, Parameters>
  ) {}

  async execute(params: Parameters): Promise<void> {
    await this.handler.setup(params)
    const environment = await this.handler.detectEnvironment(params)
    const config = await this.handler.configure(environment, params)
    await this.handler.apply(config, environment, params)
  }
}
