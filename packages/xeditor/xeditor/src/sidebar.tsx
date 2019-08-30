import * as React from 'react'
import { useCMS, useSubscribable } from '@forestryio/cms-react'
import { useState } from 'react'
import { StyledFrame } from './styled-frame'
import styled, { createGlobalStyle } from 'styled-components'
import { FormsView } from './components/FormView'
import { ScreenPlugin } from '@forestryio/cms'
import { Modal } from './modalProvider'

export const Sidebar = ({
  title = 'XEditor',
  logo = ForestryLogo,
}: {
  title?: string
  logo?: string
}) => {
  const cms = useCMS()
  useSubscribable(cms.screens)
  const [menuIsVisible, setMenuVisibility] = useState(true)
  const [ActiveView, setActiveView] = useState<ScreenPlugin | null>(null)

  return (
    <StyledFrame
      frameStyles={{
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        border: '0',
        borderRight: '1px solid #efefef',
        zIndex: 1,
        backgroundColor: 'white',
      }}
    >
      <>
        <RootElement />
        <SidebarHeader>
          <ActionsToggle onClick={() => setMenuVisibility(true)} />
        </SidebarHeader>

        <FieldsWrapper>
          <FormsView />
        </FieldsWrapper>
        <MenuPanel visible={menuIsVisible}>
          <button onClick={() => setMenuVisibility(false)}>Close</button>
          <ul>
            {cms.screens.all().map(view => (
              <li
                value={view.name}
                onClick={() => {
                  setActiveView(view)
                  setMenuVisibility(false)
                }}
              >
                {view.name}
              </li>
            ))}
          </ul>
        </MenuPanel>
        {ActiveView && (
          <Modal>
            <button onClick={() => setActiveView(null)}>Close Modal</button>
            <ActiveView.Component />
          </Modal>
        )}
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

const MenuPanel = styled.div<{ visible: boolean }>`
  background: pink;
  z-index: 1000;
  position: absolute;
  top: 0;
  width: 100vw;
  left: ${p => (p.visible ? '0' : '100vw')};
  height: 100vh;
  overflow: hidden;
  padding: 1rem;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`
