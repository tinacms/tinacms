/**

*/

import React from 'react'
import { NavLink } from 'react-router-dom'
import { ImFilesEmpty } from 'react-icons/im'
import type { IconType } from 'react-icons/lib'

import { Button, Nav } from '@tinacms/toolkit'
import type { TinaCMS, ScreenPlugin } from '@tinacms/toolkit'
import { Transition } from '@headlessui/react'
import { useWindowWidth } from '@react-hook/window-size'

import { useGetCollections } from './GetCollections'
import { IoMdClose } from 'react-icons/io'
import { BiMenu } from 'react-icons/bi'
import { CloudConfigPlugin } from '@tinacms/toolkit'

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, '_') // swap any length of whitespace, underscore, hyphen characters with a single _
    .replace(/^-+|-+$/g, '') // remove leading, trailing -
}

const Sidebar = ({ cms }: { cms: TinaCMS }) => {
  const collectionsInfo = useGetCollections(cms)
  const screens = cms.plugins.getType<ScreenPlugin>('screen').all()
  const cloudConfigs = cms.plugins
    .getType<CloudConfigPlugin>('cloud-config')
    .all()
  const [menuIsOpen, setMenuIsOpen] = React.useState(false)

  const isLocalMode = cms.api?.tina?.isLocalMode
  const navBreakpoint = 1000
  const windowWidth = useWindowWidth()
  const renderDesktopNav = windowWidth > navBreakpoint

  return (
    <>
      {renderDesktopNav && (
        <Nav
          isLocalMode={isLocalMode}
          sidebarWidth={360}
          showCollections={true}
          collectionsInfo={collectionsInfo}
          screens={screens}
          cloudConfigs={cloudConfigs}
          contentCreators={[]}
          RenderNavSite={({ view }) => (
            <SidebarLink
              label={view.name}
              to={`/screens/${slugify(view.name)}`}
              Icon={view.Icon ? view.Icon : ImFilesEmpty}
            />
          )}
          RenderNavCloud={({ config }) => <SidebarCloudLink config={config} />}
          RenderNavCollection={({ collection }) => (
            <SidebarLink
              label={collection.label ? collection.label : collection.name}
              to={`/collections/${collection.name}/~`}
              Icon={ImFilesEmpty}
            />
          )}
        />
      )}
      {!renderDesktopNav && (
        <Transition show={menuIsOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="transform transition-all ease-out duration-300"
            enterFrom="opacity-0 -translate-x-full"
            enterTo="opacity-100 translate-x-0"
            leave="transform transition-all ease-in duration-200"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo="opacity-0 -translate-x-full"
          >
            <div className="fixed left-0 top-0 z-overlay h-full transform">
              <Nav
                isLocalMode={isLocalMode}
                className="rounded-r-md"
                sidebarWidth={360}
                showCollections={true}
                collectionsInfo={collectionsInfo}
                screens={screens}
                cloudConfigs={cloudConfigs}
                contentCreators={[]}
                RenderNavSite={({ view }) => (
                  <SidebarLink
                    label={view.name}
                    to={`/screens/${slugify(view.name)}`}
                    Icon={view.Icon ? view.Icon : ImFilesEmpty}
                    onClick={() => {
                      setMenuIsOpen(false)
                    }}
                  />
                )}
                RenderNavCloud={({ config }) => (
                  <SidebarCloudLink config={config} />
                )}
                RenderNavCollection={({ collection }) => (
                  <SidebarLink
                    label={
                      collection.label ? collection.label : collection.name
                    }
                    to={`/collections/${collection.name}/~`}
                    Icon={ImFilesEmpty}
                    onClick={() => {
                      setMenuIsOpen(false)
                    }}
                  />
                )}
              >
                <div className="absolute top-8 right-0 transform translate-x-full overflow-hidden">
                  <Button
                    rounded="right"
                    variant="secondary"
                    onClick={() => {
                      setMenuIsOpen(false)
                    }}
                    className={`transition-opacity duration-150 ease-out`}
                  >
                    <IoMdClose className="h-6 w-auto" />
                  </Button>
                </div>
              </Nav>
            </div>
          </Transition.Child>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-80"
            entered="opacity-80"
            leave="ease-in duration-200"
            leaveFrom="opacity-80"
            leaveTo="opacity-0"
          >
            <div
              onClick={() => {
                setMenuIsOpen(false)
              }}
              className="fixed z-menu inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
            ></div>
          </Transition.Child>
        </Transition>
      )}
      {!renderDesktopNav && (
        <Button
          rounded="right"
          variant="secondary"
          onClick={() => {
            setMenuIsOpen(true)
          }}
          className={`pointer-events-auto -ml-px absolute left-0 z-50 ${
            isLocalMode ? `top-10` : `top-4`
          }`}
        >
          <BiMenu className="h-7 w-auto" />
        </Button>
      )}
    </>
  )
}

const SidebarLink = (props: {
  to: string
  label: string
  Icon: IconType
  onClick?: any
}): JSX.Element => {
  const { to, label, Icon } = props
  return (
    <NavLink
      className={({ isActive }) => {
        return `text-base tracking-wide ${
          isActive ? 'text-blue-600' : 'text-gray-500'
        } hover:text-blue-600 flex items-center opacity-90 hover:opacity-100`
      }}
      onClick={props.onClick ? props.onClick : () => {}}
      to={to}
    >
      <Icon className="mr-2 h-6 opacity-80 w-auto" /> {label}
    </NavLink>
  )
}

const SidebarCloudLink = ({ config }: { config: CloudConfigPlugin }) => {
  if (config.text) {
    return (
      <span className="text-base tracking-wide text-gray-500 flex items-center opacity-90">
        {config.text}{' '}
        <a
          target="_blank"
          className="ml-1 text-blue-600 hover:opacity-60"
          href={config.link.href}
        >
          {config.link.text}
        </a>
      </span>
    )
  }
  return (
    <span className="text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100">
      <config.Icon className="mr-2 h-6 opacity-80 w-auto" />
      <a target="_blank" href={config.link.href}>
        {config.link.text}
      </a>
    </span>
  )
}

export default Sidebar
