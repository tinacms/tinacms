export const getCachedFormData = (id: string) => {
  if (typeof localStorage === 'undefined') {
    return {}
  }
  return JSON.parse(localStorage.getItem(id) || '{}')
}

export const setCachedFormData = (id: string, data: { sha: string }) => {
  if (typeof localStorage === 'undefined') {
    return
  }
  localStorage.setItem(id, JSON.stringify(data))
}
