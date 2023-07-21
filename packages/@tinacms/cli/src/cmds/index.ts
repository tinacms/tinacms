interface CommandHandler<T, U> {
  setup(U): Promise<void>
  detectEnvironment(U): Promise<T>
  configure(T, U): Promise<Record<any, any>>
  apply(Record, T, U): Promise<void>
}

export class CLICommand<T, U> {
  constructor(private readonly handler: CommandHandler<T, U>) {}

  async execute(params: U): Promise<void> {
    await this.handler.setup(params)
    const environment = await this.handler.detectEnvironment(params)
    const config = await this.handler.configure(environment, params)
    await this.handler.apply(config, environment, params)
  }
}
