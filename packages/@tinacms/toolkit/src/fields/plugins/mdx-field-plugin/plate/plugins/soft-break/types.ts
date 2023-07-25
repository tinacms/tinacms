import { QueryNodeOptions } from '@udecode/plate-headless'

export interface SoftBreakRule {
  hotkey: string

  /**
   * Filter the block types where the rule applies.
   */
  query?: QueryNodeOptions
}

export interface SoftBreakPlugin {
  rules?: SoftBreakRule[]
}
