export const findElementOffsetTop = (element: HTMLElement) => {
  let target = element
  let offsetTop = target.offsetTop
  while (target.offsetParent) {
    target = target.offsetParent as HTMLElement
    offsetTop += target.offsetTop
  }
  return offsetTop
}

export const findElementOffsetLeft = (element: HTMLElement) => {
  let target = element
  let offsetLeft = target.offsetLeft
  while (target.offsetParent) {
    target = target.offsetParent as HTMLElement
    offsetLeft += target.offsetLeft
  }
  return offsetLeft
}
