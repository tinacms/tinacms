/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import { NavLink } from 'react-router-dom'
import { ImFilesEmpty } from 'react-icons/im'
import type { IconType } from 'react-icons/lib'

import { Nav } from '@tinacms/toolkit'
import type { TinaCMS, ScreenPlugin } from '@tinacms/toolkit'

import { useGetCollections } from './GetCollections'

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
  return (
    <Nav
      sidebarWidth={360}
      showCollections={true}
      collectionsInfo={collectionsInfo}
      screens={screens}
      contentCreators={[]}
      RenderNavSite={({ view }) => (
        <SidebarLink
          label={view.name}
          to={`screens/${slugify(view.name)}`}
          Icon={view.Icon ? view.Icon : ImFilesEmpty}
        />
      )}
      RenderNavCollection={({ collection }) => (
        <SidebarLink
          label={collection.label ? collection.label : collection.name}
          to={`collections/${collection.name}`}
          Icon={ImFilesEmpty}
        />
      )}
    />
  )
}

const SidebarLink = (props: {
  to: string
  label: string
  Icon: IconType
}): JSX.Element => {
  const { to, label, Icon } = props
  return (
    <NavLink
      className={({ isActive }) => {
        return `text-base tracking-wide ${
          isActive ? 'text-blue-600' : 'text-gray-500'
        } hover:text-blue-600 flex items-center opacity-90 hover:opacity-100`
      }}
      to={to}
    >
      <Icon className="mr-2 h-6 opacity-80 w-auto" /> {label}
    </NavLink>
  )
}

export default Sidebar
