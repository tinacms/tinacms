import * as React from 'react'
import { CMSContext } from '@tinacms/react-tinacms'
import { ModalProvider } from './modalProvider'
import { SidebarProvider, useSidebar } from './sidebarProvider'
import { cms } from './index'
import styled from 'styled-components'

export const Tina: React.FC = ({ children }) => {
  return (
    <CMSContext.Provider value={cms}>
      <ModalProvider>
        <SidebarProvider>
          {children}
          <SidebarToggle />
        </SidebarProvider>
      </ModalProvider>
    </CMSContext.Provider>
  )
}

function SidebarToggle() {
  let sidebar = useSidebar()

  return (
    <EditorToggle
      open={sidebar.isOpen}
      onClick={() => sidebar.setIsOpen(!sidebar.isOpen)}
    />
  )
}

// TODO: insertt svg
const Open = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.3324 1.96875C17.754 2.42578 18 2.95312 18 3.58594C18 4.21875 17.754 4.74609 17.3324 5.16797L4.9634 17.543L0.852123 18C0.57101 18 0.360176 17.9297 0.219619 17.7188C0.0439239 17.543 -0.0263543 17.332 0.00878477 17.0508L0.465593 13.043L12.8346 0.667969C13.2562 0.246094 13.7833 0 14.4158 0C15.0483 0 15.5754 0.246094 16.0322 0.667969L17.3324 1.96875ZM4.19034 15.9258L13.3968 6.71484L11.2884 4.60547L2.08199 13.8164L1.80088 16.207L4.19034 15.9258ZM16.1376 3.97266C16.243 3.86719 16.3133 3.72656 16.3133 3.58594C16.3133 3.44531 16.243 3.30469 16.1376 3.16406L14.8375 1.86328C14.6969 1.75781 14.5564 1.6875 14.4158 1.6875C14.2753 1.6875 14.1347 1.75781 14.0293 1.86328L12.4832 3.41016L14.5915 5.51953L16.1376 3.97266Z"
      fill="white"
    />
  </svg>
)

const Close = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.7 8L15.9 14.2C15.95 14.3 16 14.4 16 14.5C16 14.6 15.95 14.7 15.9 14.75L14.75 15.9C14.65 16 14.55 16 14.45 16C14.35 16 14.25 16 14.2 15.9L8 9.7L1.8 15.9C1.7 16 1.6 16 1.5 16C1.4 16 1.3 16 1.25 15.9L0.1 14.75C0 14.7 0 14.6 0 14.5C0 14.4 0 14.3 0.1 14.2L6.3 8L0.1 1.8C0 1.75 0 1.65 0 1.55C0 1.45 0 1.35 0.1 1.25L1.25 0.1C1.3 0.05 1.4 0 1.5 0C1.6 0 1.7 0.05 1.8 0.1L8 6.3L14.2 0.1C14.25 0.05 14.35 0 14.45 0C14.55 0 14.65 0.05 14.75 0.1L15.9 1.25C15.95 1.35 16 1.45 16 1.55C16 1.65 15.95 1.75 15.9 1.8L14.85 2.85L9.7 8Z"
      fill="white"
    />
  </svg>
)

const EditorToggle = styled(props => {
  return <button {...props}>{props.open ? <Close /> : <Open />}</button>
})`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  height: 3rem;
  width: 3rem;
  border: 0;
  outline: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #0084ff;
  background-repeat: no-repeat;
  background-position: center;
  transition: background 0.35s ease;
  cursor: pointer;
  &:hover {
    background-color: #4ea9ff;
  }
  &:active {
    background-color: #0073df;
  }
`
