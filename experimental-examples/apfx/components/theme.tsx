import Head from 'next/head'
import React from 'react'
import type { TinaCollection } from 'tinacms'

export const themeTemplate: TinaCollection = {
  label: 'Theme',
  name: 'theme',
  path: 'content/theme',
  format: 'json',
  fields: [
    {
      label: 'Display Font',
      name: 'displayFont',
      type: 'string',
      options: [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'Ardent',
        'Article',
        'Pulse',
        'OpenSans',
      ],
    },
    {
      label: 'Color mode',
      name: 'colorMode',
      type: 'string',
      options: ['steel', 'black', 'indigo'],
    },
  ],
}

export const Theme = ({
  theme,
}: {
  theme: {
    displayFont?: 'a' | 'b' | 'c'
    colorMode?: 'steel' | 'black' | 'indigo'
  }
}) => {
  const displayFont = theme.displayFont || 'a'
  const colorMode = theme.colorMode || 'indigo'
  const cssName = `/${displayFont}-${colorMode}.css`

  return (
    <ThemeContext.Provider value={{ variant: 'modern' }}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,600;1,300;1,600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href={cssName} />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        {displayFont === 'a' && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="true"
            />
            <link
              href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700&display=swap"
              rel="stylesheet"
            ></link>
          </>
        )}
      </Head>
    </ThemeContext.Provider>
  )
}

const ThemeContext: React.Context<{ variant: string }> = React.createContext({
  variant: 'standard',
})

export const useTheme = () => {
  return React.useContext(ThemeContext)
}
