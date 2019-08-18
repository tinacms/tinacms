import * as React from 'react'
import { useCMS, useSubscribable } from '@forestryio/cms-react'
import { useState } from 'react'
import { StyledFrame } from './styled-frame'
import styled, { createGlobalStyle } from 'styled-components'
import { ViewPlugin } from './views/FormView'

export const Sidebar = ({
  title = 'XEditor',
  logo = ForestryLogo,
}: {
  title?: string
  logo?: string
}) => {
  const cms = useCMS()
  useSubscribable(cms.plugins)

  let [ActiveView, setActiveView] = useState(() => {
    let firstView = cms.plugins.all<ViewPlugin>('view')[0]
    if (firstView) return firstView
    return {
      Component: (): any => null,
    }
  })

  return (
    <StyledFrame
      frameStyles={{
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        border: '0',
        borderRight: '1px solid #efefef',
      }}
    >
      <>
        <RootElement />
        <SidebarHeader>
          <ForestryLogo url={logo} />
          <SiteName>{title}</SiteName>
          {/* <select style={{ zIndex: 10000 }}>
            {cms.plugins.all<ViewPlugin>('view').map(view => (
              <option value={view.name} onClick={() => setActiveView(view)}>
                {view.name}
              </option>
            ))}
          </select> */}
          {/* <ActionsToggle /> */}
        </SidebarHeader>

        <FieldsWrapper>
          <ActiveView.Component />
        </FieldsWrapper>
      </>
    </StyledFrame>
  )
}

const EllipsisVertical = require('../assets/ellipsis-v.svg')
const HeaderHeight = 5

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: ${HeaderHeight}rem;
  padding: 1rem 1rem 0 1rem;
  /* border-bottom: 1px solid #efefef; */
`

const ForestryLogo = styled.div<{ url: string }>`
  height: ${HeaderHeight}rem;
  width: 2rem;
  /* border-right: 1px solid #efefef; */
  background-image: url(${props => props.url});
  background-size: 2rem;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 1rem;
`

const SiteName = styled.h3`
  font-size: 0.8rem;
  font-weight: 500;
`

const ActionsToggle = styled.button`
  background: transparent;
  outline: none;
  border: 0;
  width: 2rem;
  height: ${HeaderHeight}rem;
  margin-left: auto;
  background-image: url(${EllipsisVertical});
  background-position: center;
  background-repeat: no-repeat;
  background-size: 0.3rem;
  transition: opacity 0.15s;
  &:hover {
    opacity: 0.6;
  }
`
const RootElement = createGlobalStyle`
  @import url('https://rsms.me/inter/inter.css');
  html {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    box-sizing: border-box;
  }
  @supports (font-variation-settings: normal) {
    html { font-family: 'Inter var', sans-serif; }
  }
  body {
    margin: 0;
    padding: 0;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`

const FieldsWrapper = styled.div`
  position: absolute;
  left: 0;
  top: ${HeaderHeight}rem;
  height: calc(100vh - (${HeaderHeight}rem));
  width: 100%;
  overflow: hidden;
  padding: 1rem;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`
