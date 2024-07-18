import * as React from 'react'
import { BiExit } from 'react-icons/bi'
import { FiMoreVertical, FiInfo } from 'react-icons/fi'
import { VscNewFile } from 'react-icons/vsc'
import { Menu, Transition } from '@headlessui/react'
import { updateBodyDisplacement } from './sidebar'
import { FormModal } from '@toolkit/react-forms'
import type { ScreenPlugin } from '@toolkit/react-screens'
import { SyncStatus, SyncErrorWidget, SyncStatusModal } from './sync-status'
import { useCMS } from '@toolkit/react-core'
import { CloudConfigPlugin } from '@toolkit/react-cloud-config'

interface NavCollection {
  label?: string
  name: string
  isAuthCollection?: boolean
}

interface NavProps {
  isLocalMode: boolean
  children?: any
  className?: string
  userName?: string
  showCollections: boolean
  collectionsInfo: {
    collections: NavCollection[]
  }
  contentCreators?: any
  screens?: ScreenPlugin[]
  cloudConfigs?: CloudConfigPlugin[]
  sidebarWidth?: number
  RenderNavSite: React.ComponentType<{ view: ScreenPlugin }>
  RenderNavCloud: React.ComponentType<{ config: CloudConfigPlugin }>
  RenderNavCollection: React.ComponentType<{
    collection: { label: string; name: string }
  }>
  AuthRenderNavCollection: React.ComponentType<{
    collection: { label: string; name: string }
  }>
}

export const Nav = ({
  isLocalMode,
  className = '',
  children,
  showCollections,
  collectionsInfo,
  screens,
  cloudConfigs,
  contentCreators,
  sidebarWidth,
  RenderNavSite,
  RenderNavCloud,
  RenderNavCollection,
  AuthRenderNavCollection,
  ...props
}: NavProps) => {
  const cms = useCMS()
  const [eventsOpen, setEventsOpen] = React.useState(false)
  const { contentCollections, authCollection } =
    collectionsInfo.collections.reduce(
      (
        acc: {
          contentCollections: NavCollection[]
          authCollection?: NavCollection
        },
        collection: NavCollection
      ) => {
        if (collection.isAuthCollection) {
          acc.authCollection = collection
        } else {
          acc.contentCollections.push(collection)
        }
        return acc
      },
      {
        contentCollections: [],
      }
    )

  function closeEventsModal() {
    setEventsOpen(false)
  }

  const WrappedSyncStatus = React.forwardRef(
    (props: { cms; setEventsOpen }, ref) => <SyncStatus {...props} />
  )

  // partition screens by navCategory prop
  const screenCategories = screens.reduce(
    (acc, screen) => {
      const category = screen.navCategory || 'Site'
      acc[category] = acc[category] || []
      acc[category].push(screen)
      return acc
    },
    { Site: [] }
  )

  return (
    <div
      className={`relative z-30 flex flex-col bg-white border-r border-gray-200 w-96 h-full ${className}`}
      style={{ maxWidth: sidebarWidth + 'px' }}
      {...props}
    >
      <div className="border-b border-gray-200">
        <Menu as="div" className="relative block">
          {({ open }) => (
            <div>
              <Menu.Button
                className={`group w-full px-6 py-3 gap-2 flex justify-between items-center transition-colors duration-150 ease-out ${
                  open ? `bg-gray-50` : `bg-transparent`
                }`}
              >
                <span className="text-left inline-flex items-center text-xl tracking-wide text-gray-800 flex-1 gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-150 ease-out">
                  <svg
                    id="Layer_2"
                    data-name="Layer 2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 764.4 159.27"
                  >
                    <g id="Layer_1-2" data-name="Layer 1">
                      <g>
                        <g>
                          {/* Text paths */}
                          <path
                            d="M216.66,60.58c.1-.89.1-1.98.2-2.87.1-1.19.2-2.28.3-3.47l-.2-.69c-1.29-.59-4.65-2.38-10.59-2.38-14.25,0-15.54,10.99-15.54,14.65,0,7.92,4.75,11.19,9.6,14.55l3.56,2.28c4.26,2.97,7.23,5.45,7.23,10.29,0,4.56-2.87,9.11-9.31,9.11-2.18,0-6.53-.4-10-4.36l-.69.3c0,.99-.1,2.08-.2,3.17,0,1.19-.1,2.28-.3,3.37l.5.79c3.56,2.08,7.82,2.77,11.29,2.77,5.25,0,10-1.29,13.26-5.25,1.98-2.57,3.47-6.34,3.47-10.69,0-8.22-4.65-11.88-9.5-15.15-1.09-.79-2.38-1.49-3.46-2.28-5.15-3.46-7.33-5.54-7.33-9.6,0-4.55,2.97-8.02,8.32-8.02,5.05,0,7.62,2.57,8.81,3.76l.59-.3Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M255.37,106.61c-.59-14.16-.59-40.19-.59-48.41,4.26,0,7.23,0,12.17.2l.49-.5c.1-2.47.1-2.97.3-5.54l-.4-.49c-3.27.2-4.95.2-19.5.2h-13.46l-.4.49c-.1,2.57-.1,3.27-.3,5.54l.4.49c6.14-.3,6.43-.4,12.57-.4.1,3.66.1,5.44.1,9.9v25.14c0,6.93-.1,9.8-.1,13.46l.4.49c3.56-.2,4.35-.2,7.72-.2l.59-.4Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M299.92,87.9c1.78,3.96,4.26,9.21,5.84,12.77,1.48,2.87,1.88,4.06,2.67,6.14l.69.49c3.37-.2,4.95-.3,8.61-.3l.3-.49c-2.67-4.36-2.97-4.95-9.3-17.03l-3.96-7.72c2.18-.69,9.9-3.07,9.9-15.05,0-13.86-9.8-14.85-14.75-14.85v6.14c3.07.3,6.73,1.88,6.73,9.01,0,6.53-2.87,9.21-6.73,10.2v10.69h0ZM284.57,52.56l.4-.49h5.64c2.28,0,5.94-.2,8.22-.2h1.09v6.14c-.89-.1-1.68-.1-2.38-.1-1.48,0-2.97,0-4.46.1-.1,6.53-.1,13.07,0,19.6,2.38.1,4.75.1,6.83-.4v10.69c-.4-.69-.69-1.29-.99-1.88l-1.29-2.67c-1.98.1-2.48.1-4.56.1,0,5.64.1,15.54.5,23.26l-.4.4c-3.47,0-4.16,0-7.72.2l-.4-.49v-2.18c.1-5.05.1-10,.1-15.05,0-2.77,0-27.92-.59-37.02Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M348.23,81.47c5.15,0,7.82,0,11.58.1l.6-.5c.1-2.18.1-2.77.3-5.25l-.49-.49c-2.67.1-4.75.2-11.98.3h-5.25c-.1-7.62-.1-9.8-.1-17.42h3.96c5.74,0,6.53,0,14.25.2l.49-.5c0-2.18,0-3.17.3-5.44l-.49-.49c-6.04.2-10.79.2-26.53.1l-.4.49c.1,3.76.2,5.64.4,12.28,0,7.52.2,20.69.2,27.42,0,7.33-.1,11.68-.2,14.55l.39.4c3.37-.1,6.63-.2,14.06-.2h12.37l.49-.4c.2-2.87.2-3.07.39-5.74l-.49-.49c-4.26.2-7.62.3-13.96.4h-4.85c-.1-8.91-.1-9.01-.2-19.3h5.15Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M410.29,107.01c3.46,0,4.65,0,8.02-.2l.39-.4c-.3-1.19-1.78-6.04-2.08-7.03-.59-1.78-1.09-3.76-3.96-14.16l-4.55-16.13c-1.58-5.55-2.57-8.91-4.45-16.53l-.6-.49c-2.37.1-3.86.1-5.35.1v6.43-.2c1.29,4.95,1.59,6.14,3.37,13.46l3.27,12.28h-6.63v6.04h8.12c1.58,5.94,2.38,9.6,3.56,15.05.1.39.29.89.39,1.48l.49.3h0ZM397.72,52.16v6.43c-1.38,5.44-2.37,9.11-3.46,13.46l-3.27,12.17c1.48,0,4.06-.1,6.73-.1v6.04h-8.02l-.69,2.67c-2.18,8.51-2.47,9.8-3.27,13.76l-.6.4c-2.97,0-3.76,0-7.23.1l-.3-.4c2.57-8.71,3.37-11.58,4.95-17.03l5.54-19.7c.79-2.57,1.58-5.15,2.28-7.82.39-1.39,2.18-7.92,2.67-9.5l.39-.4c1.88,0,3.07-.1,4.26-.1Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M454.35,64.44c-.89-3.37-2.18-8.71-2.97-11.98l-.49-.49c-4.36.1-5.64.2-10.59.1l-.49.49c-.1,3.27-.1,4.55-.6,16.53l-.99,17.02c-.39,9.21-.49,10.39-1.19,20.59l.39.49c3.07-.2,3.47-.2,6.53-.2l.6-.4c-.1-5.54.3-19.3.4-22.87l.89-24.65,7.23,30.99c1.78,7.03,2.18,8.51,3.66,15.34l.3,1.29.59.49c3.07-.2,4.06-.2,7.33-.2l.6-.4c.2-1.09,2.18-8.71,4.26-17.03l7.92-30.99.49,28.41c.1,4.36.1,16.63.1,19.7l.49.49c3.56-.2,4.26-.2,7.62-.2l.49-.4c-.49-7.62-.89-15.25-1.19-22.87l-.39-12.47c-.4-9.8-.4-10.99-.6-18.81l-.49-.49c-4.85.1-5.84.1-10.29.1l-.49.49c-.6,2.38-.6,2.57-1.39,5.64-.69,2.77-1.48,5.54-2.18,8.32l-7.82,29.7-7.72-31.78Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M516.22,51.96c-3.47.1-4.36.1-7.92.1l-.49.49c.39,8.91.6,34.15.6,40.59,0,3.96,0,8.51-.1,13.56l.49.4c3.27-.1,4.46-.1,8.12-.1h10.69c3.07,0,4.45,0,6.24.1l.39-.4c.1-2.87.1-3.47.4-5.94l-.49-.49c-4.55.4-9.21.4-13.76.49h-3.56c-.2-2.47-.2-3.37-.2-7.72,0-3.86-.1-20.89-.1-24.35,0-5.44.1-10.79.2-16.24l-.49-.49Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M559.28,106.61c-.49-12.47-.6-24.85-.6-37.32,0-5.55.1-10.99.1-16.83l-.4-.39c-3.56.2-4.45.2-8.02.2l-.4.49c.1,3.27.2,6.44.4,11.88.1,8.32.1,25.05.1,27.03,0,5.05,0,10-.1,15.05l.39.49c3.47-.2,4.46-.2,8.02-.2l.49-.4Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M600.86,93.24c2.28,4.55,4.85,9.6,6.73,13.56l.69.4c3.27-.2,4.26-.2,8.42-.2l.49-.4c-.39-12.97-.6-30.1-.6-38.51,0-4.55,0-9.01.1-13.46,0-.69,0-1.39.1-2.18l-.5-.39c-2.87.1-3.27.2-6.24.2l-.49.49c.2,4.36.4,9.8.49,22.87l.49,20.49-11.68-23.46c-3.46-6.73-6.83-13.36-10.19-20.2l-.5-.39c-3.66.2-4.55.2-8.81.2l-.39.49c.39,13.27.59,27.03.59,40.29,0,3.86,0,7.52-.1,11.38,0,.79-.1,1.48-.1,2.28l.6.49c2.77-.2,3.27-.2,6.34-.2l.39-.4c-.3-6.04-.3-11.38-.59-24.35l-.4-19.6,15.15,30.59Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M653.13,81.47c5.05,0,7.72,0,11.58.1l.49-.5c.1-2.18.1-2.77.3-5.25l-.49-.49c-2.67.1-4.75.2-11.88.3h-5.35c-.1-7.62-.1-9.8-.1-17.42h3.96c5.74,0,6.53,0,14.26.2l.49-.5c.1-2.18.1-3.17.3-5.44l-.49-.49c-6.04.2-10.79.2-26.53.1l-.39.49c.1,3.76.2,5.64.39,12.28.1,7.52.2,20.69.2,27.42,0,7.33-.1,11.68-.2,14.55l.4.4c3.36-.1,6.63-.2,14.06-.2h12.37l.49-.4c.2-2.87.2-3.07.39-5.74l-.49-.49c-4.26.2-7.62.3-13.96.4h-4.85c-.1-8.91-.1-9.01-.2-19.3h5.25Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M701.84,88c1.88,3.96,4.26,9.11,5.94,12.67,1.39,2.87,1.88,4.06,2.67,6.14l.7.49c3.36-.2,4.85-.3,8.51-.3l.3-.49c-2.57-4.36-2.87-4.95-9.21-17.03l-3.96-7.72c2.18-.69,9.9-3.07,9.9-15.05,0-13.76-9.9-14.85-14.85-14.85v6.04c3.07.4,6.83,1.98,6.83,9.11,0,6.53-2.97,9.21-6.83,10.1v10.89h0ZM686.59,52.56l.39-.49h5.64c2.28,0,5.94-.2,8.12-.2.3,0,.69-.1,1.09,0v6.04h-2.28c-1.49,0-3.07,0-4.55.1v19.6c2.37.1,4.75.1,6.83-.49v10.89c-.4-.69-.7-1.39-.99-1.98l-1.19-2.67c-2.08.1-2.47.1-4.55.1,0,5.64.1,15.54.49,23.26l-.39.4c-3.47,0-4.16,0-7.82.2l-.3-.49v-2.18c.1-5.05.1-10,.1-15.05,0-2.77-.1-27.92-.59-37.02Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M761.83,60.58c0-.89,0-1.98.1-2.87.1-1.19.3-2.28.3-3.47l-.2-.69c-1.29-.59-4.65-2.38-10.6-2.38-14.16,0-15.54,10.99-15.54,14.65,0,7.92,4.75,11.19,9.7,14.55l3.46,2.28c4.26,2.97,7.23,5.45,7.23,10.29,0,4.56-2.77,9.11-9.2,9.11-2.18,0-6.53-.4-10.1-4.36l-.7.3c0,.99-.1,2.08-.1,3.17-.1,1.19-.2,2.28-.4,3.37l.49.79c3.56,2.08,7.82,2.77,11.29,2.77,5.25,0,10-1.29,13.26-5.25,2.08-2.57,3.56-6.34,3.56-10.69,0-8.22-4.65-11.88-9.6-15.15-1.09-.79-2.38-1.49-3.46-2.28-5.15-3.46-7.33-5.54-7.33-9.6,0-4.55,2.97-8.02,8.32-8.02,5.05,0,7.72,2.57,8.81,3.76l.69-.3Z"
                            style={{
                              fill: '#000',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          {/* Add other text paths here */}
                        </g>
                        <g>
                          <path
                            d="M0,79.63C0,35.65,35.59,0,79.49,0s79.49,35.65,79.49,79.63-35.59,79.63-79.49,79.63S0,123.61,0,79.63Z"
                            style={{
                              fill: '#231f20',
                              fillRule: 'evenodd',
                              strokeWidth: '0px',
                            }}
                          />
                          <path
                            d="M.63,72.88c.37-4.42,1.1-8.73,2.15-12.91,19.22,5.23,44.93,10.39,65.09,12.91,30.8,3.89,71.32,5.01,90.97,5.33,0,.43,0,.87,0,1.3,0,.49,0,.97-.01,1.45-18.19-.5-56.25-1.37-81.86-2.05-26.25-.56-55.88-3.61-76.35-6.03h0ZM158.69,84.55c-.04.57-.08,1.14-.13,1.71-19.69.32-60.03,1.44-90.69,5.33-19.65,2.46-44.61,7.44-63.63,12.53-1.25-3.84-2.21-7.81-2.87-11.88,20.27-2.91,49.6-6.52,75.61-7.09,32.93-.77,65.49-.7,81.71-.6h0ZM158.14,90.14c-18.55.63-44.52,2.58-86.21,11.06-22.71,4.64-43.88,12.89-59.71,20.1,2.22,3.58,4.71,6.96,7.45,10.13,28.58-19.28,65.25-27.82,81.56-31.31,21.37-4.45,43.11-6.34,56.47-7.08.16-.96.31-1.92.44-2.89h0ZM157.02,96.51c-13.84,1.23-38.71,4.22-69.95,15.86-21.55,7.95-39.58,21-52.48,32.42,2.62,1.81,5.35,3.47,8.19,4.95,23.49-23.03,53.33-35.58,67.36-41.04,15.56-5.9,33.77-8.96,46.51-10.58.13-.54.25-1.08.37-1.62h0ZM155.21,103.35c-13.41,2.74-34.33,8.45-59.42,22.99-13.78,7.9-24.94,19.18-33.55,30.56,5.6,1.25,11.43,1.92,17.42,1.92,35.47,0,65.47-23.29,75.56-55.46h0ZM9.78,42.02c16.05,7.51,38.24,16.37,62.15,21.26,42.08,8.63,68.21,10.51,86.75,11.05-.06-.94-.14-1.87-.23-2.8-13.24-.74-35.41-2.55-57.21-7.16-16.92-3.54-55.34-12.61-84.35-33.28-2.66,3.43-5.04,7.09-7.11,10.93h0ZM31.3,16.72c13.1,12.05,32.38,26.71,55.78,35.47,32,11.88,57.23,14.67,70.94,15.83-.08-.51-.16-1.03-.24-1.54-12.69-1.54-31.59-4.61-47.63-10.73-14.78-5.63-46.84-19.25-70.76-44.49-2.81,1.66-5.51,3.48-8.08,5.46h0ZM58.89,3.06c9.03,12.88,21.28,26.13,36.9,35.18,26.15,14.98,47.69,20.67,61.01,23.28C148.65,26.44,117.21.32,79.65.32c-7.19,0-14.14.96-20.76,2.74Z"
                            style={{
                              fill: '#40ae49',
                              fillRule: 'evenodd',
                              stroke: '#40ae49',
                              strokeMiterlimit: '22.93',
                              strokeWidth: '0.34px',
                            }}
                          />
                        </g>
                      </g>
                      <path
                        d="M192.73,43.22c.04.92.14,1.82.3,2.72"
                        style={{ fill: 'none', strokeWidth: '0px' }}
                      />
                    </g>
                  </svg>
                </span>
                <SyncErrorWidget cms={cms} />
                <FiMoreVertical
                  className={`flex-0 w-6 h-full inline-block group-hover:opacity-80 transition-all duration-300 ease-in-out transform ${
                    open
                      ? `opacity-100 text-blue-400`
                      : `text-gray-400 opacity-50 hover:opacity-70`
                  }`}
                />
              </Menu.Button>
              <div className="transform translate-y-full absolute bottom-3 right-5 z-50">
                <Transition
                  enter="transition duration-150 ease-out"
                  enterFrom="transform opacity-0 -translate-y-2"
                  enterTo="transform opacity-100 translate-y-0"
                  leave="transition duration-75 ease-in"
                  leaveFrom="transform opacity-100 translate-y-0"
                  leaveTo="transform opacity-0 -translate-y-2"
                >
                  <Menu.Items className="bg-white border border-gray-150 rounded-lg shadow-lg flex flex-col items-stretch overflow-hidden">
                    <Menu.Item>
                      <button
                        className={`text-lg px-4 py-2 first:pt-3 last:pb-3 tracking-wide whitespace-nowrap flex items-center opacity-80 text-gray-600 hover:text-blue-400 hover:bg-gray-50 hover:opacity-100`}
                        onClick={async () => {
                          updateBodyDisplacement({
                            displayState: 'closed',
                            sidebarWidth: null,
                            resizingSidebar: false,
                          })
                          try {
                            if (cms?.api?.tina?.authProvider?.logout) {
                              await cms.api.tina?.authProvider.logout()
                              if (cms?.api?.tina?.onLogout) {
                                await cms?.api?.tina?.onLogout()
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 500)
                                )
                              }
                              window.location.href = new URL(
                                window.location.href
                              ).pathname
                            }
                          } catch (e) {
                            cms.alerts.error(`Error logging out: ${e}`)
                            console.error('Unexpected error calling logout')
                            console.error(e)
                          }
                        }}
                      >
                        <BiExit className="w-6 h-auto mr-2 text-blue-400" /> Log
                        Out
                      </button>
                    </Menu.Item>
                    <Menu.Item>
                      <WrappedSyncStatus
                        cms={cms}
                        setEventsOpen={setEventsOpen}
                      />
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </div>
            </div>
          )}
        </Menu>
      </div>
      {eventsOpen && (
        <SyncStatusModal cms={cms} closeEventsModal={closeEventsModal} />
      )}
      {children}
      <div className="px-6 flex-1 overflow-auto">
        {showCollections && (
          <>
            <h4 className="flex space-x-1 justify-items-start uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700">
              <span>Collections</span>
              {isLocalMode && (
                <span className="flex items-center">
                  <a
                    href="https://tina.io/docs/schema/#defining-collections"
                    target="_blank"
                  >
                    <FiInfo />
                  </a>
                </span>
              )}
            </h4>
            <CollectionsList
              RenderNavCollection={RenderNavCollection}
              collections={contentCollections}
            />
          </>
        )}
        {(screenCategories.Site.length > 0 || contentCreators.length) > 0 && (
          <>
            <h4 className="uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700">
              Site
            </h4>
            <ul className="flex flex-col gap-4">
              {screenCategories.Site.map((view) => {
                return (
                  <li key={`nav-site-${view.name}`}>
                    <RenderNavSite view={view} />
                  </li>
                )
              })}

              {contentCreators.map((plugin, idx) => {
                return (
                  <CreateContentNavItem key={`plugin-${idx}`} plugin={plugin} />
                )
              })}
              {authCollection && (
                <CollectionsList
                  RenderNavCollection={AuthRenderNavCollection}
                  collections={[authCollection]}
                />
              )}
            </ul>
          </>
        )}
        {Object.entries(screenCategories).map(([category, screens]) => {
          if (category !== 'Site') {
            return (
              <div key={category}>
                <h4 className="uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700">
                  {category}
                </h4>
                <ul className="flex flex-col gap-4">
                  {screens.map((view) => {
                    return (
                      <li key={`nav-site-${view.name}`}>
                        <RenderNavSite view={view} />
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          }
        })}
        {!!cloudConfigs?.length && (
          <>
            <h4 className="uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700">
              Cloud
            </h4>
            <ul className="flex flex-col gap-4">
              {cloudConfigs.map((config) => {
                return (
                  <li key={`nav-site-${config.name}`}>
                    <RenderNavCloud config={config} />
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

const CollectionsList = ({
  collections,
  RenderNavCollection,
}: {
  collections: { label?: string; name: string }[]
  RenderNavCollection: React.ComponentType<{
    collection: { label?: string; name: string }
  }>
}) => {
  if (collections.length === 0) {
    return <div>No collections found</div>
  }

  return (
    <ul className="flex flex-col gap-4">
      {collections.map((collection) => {
        return (
          <li key={`nav-collection-${collection.name}`}>
            <RenderNavCollection collection={collection} />
          </li>
        )
      })}
    </ul>
  )
}

const CreateContentNavItem = ({ plugin }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <li key={plugin.name}>
      <button
        className="text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100"
        onClick={() => {
          setOpen(true)
        }}
      >
        <VscNewFile className="mr-3 h-6 opacity-80 w-auto" /> {plugin.name}
      </button>
      {open && <FormModal plugin={plugin} close={() => setOpen(false)} />}
    </li>
  )
}
