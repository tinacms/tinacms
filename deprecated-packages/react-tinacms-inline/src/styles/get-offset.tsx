export function getOffset(
  offset: number | undefined | { x: number; y: number }
): number | { x: number; y: number } {
  const DEFAULT_OFFSET: number = 16
  let result: number | { x: number; y: number } = DEFAULT_OFFSET
  const axis = { x: DEFAULT_OFFSET, y: DEFAULT_OFFSET }

  if (typeof offset === 'number') {
    result = offset
  } else if (typeof offset === 'object') {
    axis.x = offset.x
    axis.y = offset.y
    result = axis
  }

  return result
}

export const getOffsetX = (offset: number | { x: number; y: number }): number =>
  typeof offset === 'object' ? offset.x : offset

export const getOffsetY = (offset: number | { x: number; y: number }): number =>
  typeof offset === 'object' ? offset.y : offset
