import React from 'react'
import styled from 'styled-components'
import { DefaultSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { Overlay } from '../ui'
import { DocumentationNavigation } from 'components/DocumentationNavigation'
import { Footer } from './Footer'
import { DocsTextWrapper } from './DocsTextWrapper'

interface DocsLayoutProps {
  navItems: any
  children: any
}

export const DocsLayout = React.memo(
  ({ children, navItems }: DocsLayoutProps) => {
    const router = useRouter()
    return (
      <>
        <DefaultSeo
          openGraph={{
            url: 'https://tinacms.org' + router.asPath,
          }}
        />
        <DocsLayoutGrid>
          <DocumentationNavigation navItems={navItems} />
          <DocsMain>
            <DocsTextWrapper>{children}</DocsTextWrapper>
          </DocsMain>
          <Footer light />
        </DocsLayoutGrid>
      </>
    )
  }
)

const DocsLayoutGrid = styled.div`
  @media (min-width: 840px) {
    width: 100%;
    display: grid;
    grid-template-columns: min(33vw, 20rem) minmax(0, 1fr);
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      'sidebar header'
      'sidebar main'
      'sidebar footer';

    ${Overlay} {
      display: none;
    }
  }

  @media (min-width: 1200px) {
    grid-template-columns: 20rem minmax(0, 1fr);
  }

  @media (min-width: 1600px) {
    grid-template-columns: 22rem minmax(0, 1fr);
  }
`

const DocsMain = styled.div`
  grid-area: main;
  place-self: stretch;
`
