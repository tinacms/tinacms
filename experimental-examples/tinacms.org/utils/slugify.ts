export function slugify(str) {
  return (
    str
      .trim()
      .toLowerCase()
      //replace invalid chars
      .replace(/[^a-z0-9 -]/g, '')
      // Collapse whitespace and replace by -
      .replace(/\s+/g, '-')
      // Collapse dashes
      .replace(/-+/g, '-')
  )
}
