import { logger } from '../../logger'
import chalk from 'chalk'

export interface AuditIssue {
  level: 'error' | 'warning'
  print: () => void
}

abstract class BaseAuditIssue implements AuditIssue {
  message: string
  level: 'error' | 'warning'
  constructor(message: string, level: 'error' | 'warning') {
    this.level = level
    this.message = message
  }

  print() {
    throw new Error('Not Implemented')
  }
}

export class AuditError extends BaseAuditIssue {
  constructor(message) {
    super(message, 'error')
  }
  public print() {
    logger.error(chalk.red(this.message))
  }
}

export class AuditWarning extends BaseAuditIssue {
  constructor(message) {
    super(message, 'warning')
  }
  public print() {
    logger.warn(chalk.yellowBright(this.message))
  }
}
