import { logger } from '../../logger'
import chalk from 'chalk'

export interface AuditIssue {
  level: 'error' | 'warning'
  docPath: string
  print: () => void
}

abstract class BaseAuditIssue implements AuditIssue {
  message: string
  level: 'error' | 'warning'
  docPath: string
  constructor(message: string, level: 'error' | 'warning', docPath: string) {
    this.docPath = docPath
    this.level = level
    this.message = message
  }

  print() {
    throw new Error('Not Implemented')
  }

  protected formatOutput() {
    return `${this.docPath}: ${this.message}`
  }
}

export class AuditError extends BaseAuditIssue {
  constructor(message: string, docPath: string) {
    super(message, 'error', docPath)
  }
  public print() {
    logger.error(chalk.red(this.formatOutput()))
  }
}

export class AuditWarning extends BaseAuditIssue {
  constructor(message: string, docPath: string) {
    super(message, 'warning', docPath)
  }
  public print() {
    logger.warn(chalk.yellowBright(this.formatOutput()))
  }
}
