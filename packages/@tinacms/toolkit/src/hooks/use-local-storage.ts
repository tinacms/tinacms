import * as React from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(initialValue)
  React.useEffect(() => {
    // localStorage may be intentionally disabled for site visitors,
    // in that case Tina can't be used so just bail out of value storing
    const valueFromStorage =
      window.localStorage && window.localStorage.getItem(key)
    if (valueFromStorage != null && valueFromStorage != undefined) {
      setStoredValue(JSON.parse(valueFromStorage))
    }
  }, [key])

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue, setValue]
}
