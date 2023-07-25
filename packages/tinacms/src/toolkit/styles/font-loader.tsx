import * as React from 'react'

export function FontLoader() {
  const [fontLoaded, setFontLoaded] = React.useState(false)

  const WebFontConfig = {
    google: {
      families: ['Inter:400,600'],
    },
    loading: () => {
      setFontLoaded(true)
    },
  }

  React.useEffect(() => {
    if (!fontLoaded) {
      import('webfontloader').then((WebFont) => {
        return WebFont.load(WebFontConfig)
      })
    }
  }, [])

  return null
}
