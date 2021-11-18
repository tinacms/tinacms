import * as React from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(initialValue)
  React.useEffect(() => {
    const valueFromStorage = window.localStorage.getItem(key)
    if (valueFromStorage != null) {
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
