import { withCn } from '@udecode/cn'
import { Toolbar } from './plate-ui/toolbar'

export const FixedToolbar = withCn(
  Toolbar,
  'supports-backdrop-blur:bg-white/80 sticky left-0 top-[4px] z-[999999] w-full justify-between overflow-x-auto rounded-t-lg border-b border-b-border bg-background/95 backdrop-blur'
)
