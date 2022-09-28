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
import { Form, FormBuilder } from 'tinacms'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import {
  FiMoreVertical,
  FiUsers,
  FiUser,
} from '../../../toolkit/node_modules/react-icons/fi'
import {
  ImFilesEmpty,
  ImFileEmpty,
} from '../../../toolkit/node_modules/react-icons/im'
import { MdOutlineRemoveRedEye } from '../../../toolkit/node_modules/react-icons/md'
import { BiSearch } from '../../../toolkit/node_modules/react-icons/bi'

const FakeForm = () => {
  const form = new Form({
    id: 'some-id',
    label: 'somelabel',
    fields: [
      { label: 'Title', name: 'title', component: 'text' },
      { label: 'Image', name: 'image', component: 'image' },
      { label: 'Body', name: 'body', component: 'rich-text', templates: [] },
    ],
    onSubmit: () => {},
  })

  return <FormBuilder form={form} />
}

const Preview = () => {
  return (
    <div className="flex justify-between h-screen items-stretch">
      <div className="flex-1 max-h-screen flex relative shadow-lg">
        <div className="border-r border-gray-100">
          <Nav />
        </div>
        <div className="flex-1 flex flex-col border-r border-gray-100">
          <Toolbar />
          <FormHeader />
          <FakeForm />
        </div>
        <ResizeHandle />
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe src="/" className="h-full" />
      </div>
    </div>
  )
}

const Nav = () => {
  return (
    <div className="bg-white w-[18rem] max-h-screen flex flex-col">
      <button className="flex-shrink-0 bg-white hover:bg-gray-50 transition-all duration-150 ease-out group border-b border-gray-100 px-5 h-[3.75rem] w-full flex justify-between items-center">
        <span className="text-left inline-flex items-center text-lg font-medium tracking-wide text-gray-800 flex-1 gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity duration-150 ease-out">
          <TinaSVG />
          <span className="">Tina</span>
        </span>
        <FiMoreVertical
          className={`flex-0 w-6 h-full inline-block group-hover:opacity-80 transition-all duration-300 ease-in-out transform text-gray-400 opacity-50`}
        />
      </button>
      <div className="py-6 flex-1 overflow-auto">
        <div className="px-6 pt-2 pb-4">
          <NavList
            title="Page Documents"
            items={[
              {
                label: 'Just Another Blog Post',
                Icon: ImFileEmpty,
                items: [
                  { label: 'Scott Byrne', Icon: FiUser },
                  { label: 'Some Reference', Icon: ImFileEmpty },
                ],
              },
              { label: 'Page Nav', Icon: ImFileEmpty },
            ]}
          />
        </div>
        <div className="px-6 pt-2 pb-4">
          <NavList
            title="Collections"
            items={[
              { label: 'Blog Posts', Icon: ImFilesEmpty },
              { label: 'Authors', Icon: FiUsers },
              { label: 'Pages', Icon: ImFilesEmpty },
            ]}
          />
        </div>
        <div className="px-6 pt-2 pb-4">
          <NavList
            title="Global"
            items={[
              { label: 'Theme', Icon: ImFileEmpty },
              { label: 'Navigation', Icon: ImFileEmpty },
              { label: 'Footer', Icon: ImFileEmpty },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

const NavList = ({
  title = '',
  items = [{ label: '', Icon: ImFilesEmpty, items: [] }],
}) => {
  if (!items.length) return null

  return (
    <>
      {title && (
        <h4 className="text-xs uppercase text-gray-800 font-bold tracking-wide mb-3">
          {title}
        </h4>
      )}
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => {
          const { label, Icon } = item

          if (!label) return null

          return (
            <li className="">
              <a className="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 text-lg font-medium text-gray-500">
                {Icon ? (
                  <Icon className="w-5 h-auto opacity-70 group-hover:opacity-90 transition-all ease-out duration-150 flex-shrink-0" />
                ) : (
                  <ImFilesEmpty className="w-5 h-auto fill-current opacity-70 group-hover:opacity-90 transition-all ease-out duration-150 flex-shrink-0" />
                )}
                <span className="truncate">{item.label}</span>
              </a>
              {item.items && (
                <div className="pl-4 py-2">
                  <NavList items={item.items} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

const Dashboard = () => {
  return <div>Dashboard</div>
}

export const Admin = () => {
  return (
    <Router>
      <Routes>
        <Route path="preview" element={<Preview />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

const FormHeader = () => {
  return (
    <div className="bg-white px-6 py-3 border-b border-gray-100">
      <p className="text-sm font-bold text-gray-400">Blog Post</p>
      <h3 className="text-lg font-normal text-gray-800 mb-1 truncate">
        Just Another Blog Post
      </h3>
      <FormStatus />
    </div>
  )
}

const Toolbar = () => {
  return (
    <div className="bg-gray-50 overflow-hidden shadow-sm border-b border-gray-100 pl-3 h-[3.75rem] flex items-center gap-2 relative z-50">
      <div className="relative flex-1 group">
        <input
          className="text-base w-full pl-5 pr-8 py-2 bg-white border border-gray-100 rounded-full shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none"
          value="tina.io/blog/"
          type="text"
        />
        <BiSearch className="text-blue-500 fill-current w-5 h-auto absolute top-1/2 right-4 -translate-y-1/2 transition-all ease-out duration-159 group-hover:opacity-70 group-focus-within:opacity-70 opacity-0" />
      </div>
      <div className="flex items-center gap-2 pointer-events-auto transition-opacity duration-150 ease-in-out -mr-px">
        <button className="icon-parent border-0 inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center justify-center transition-all duration-150 ease-out  text-gray-500 hover:text-blue-500 hover:shadow border-transparent hover:border-gray-200 bg-transparent text-sm h-10 px-4  rounded-full pointer-events-auto opacity-50 hover:opacity-100 focus:opacity-80">
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 16 16"
            className="h-5 w-auto -mx-1"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"
            ></path>
          </svg>
        </button>
        <button
          className="icon-parent border border-gray-50 inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center justify-center transition-all duration-150 ease-out  shadow text-gray-400 hover:text-blue-500 bg-white text-sm h-10 px-4  rounded-l-full "
          aria-label="closes cms sidebar"
        >
          <MdOutlineRemoveRedEye className="w-6 h-auto" />
        </button>
      </div>
    </div>
  )
}

const ResizeHandle = () => {
  return (
    <div
      onMouseDown={() => {}}
      className={`z-100 absolute top-1/2 right-0 w-[10px] h-32 bg-white rounded-l-md border border-gray-100  transition-all duration-150 ease-out transform -translate-y-1/2 group hover:bg-blue-50 hover:border-blue-100`}
      style={{ cursor: 'grab' }}
    >
      <span className="absolute top-1/2 left-1/2 h-4/6 w-px bg-gray-200 transform -translate-y-1/2 -translate-x-1/2 opacity-50 transition-opacity duration-150 ease-out group-hover:opacity-100 group-hover:bg-blue-200"></span>
    </div>
  )
}

const FormStatus = () => {
  return (
    <div className="flex items-center gap-1.5">
      <StatusLight /> <p className="text-sm text-gray-400 m-0">No Changes</p>
    </div>
  )
}

const StatusLight = () => {
  return (
    <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500"></div>
  )
}

const TinaSVG = () => {
  return (
    <svg
      viewBox="0 0 257 358"
      fill="#EC4815"
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-auto"
    >
      <path
        d="M165.012 159.034C182.329 144.643 190.001 59.6008 197.497 29.0318C204.993 -1.53729 235.994 0.0131504 235.994 0.0131504C235.994 0.0131504 227.946 14.0862 231.229 24.5882C234.511 35.0901 257 44.4776 257 44.4776L252.15 57.3254C252.15 57.3254 242.021 56.0237 235.994 68.137C229.967 80.2503 243.544 198.96 243.544 198.96C243.544 198.96 203.644 271.979 203.644 302.288C203.644 332.598 217.923 357.999 217.923 357.999H197.886C197.886 357.999 168.493 322.855 162.465 305.29C156.437 287.726 158.848 270.162 158.848 270.162C158.848 270.162 126.898 268.345 98.5677 270.162C70.2371 271.979 51.3434 296.448 47.9335 310.136C44.5236 323.823 43.1111 357.999 43.1111 357.999H27.2685C17.6259 328.101 9.96754 317.385 14.1221 302.288C25.63 260.471 23.3695 236.754 20.705 226.19C18.0406 215.626 0 206.406 0 206.406C8.83723 188.317 17.8578 179.624 56.66 178.717C95.4622 177.811 147.696 173.424 165.012 159.034Z"
        fill="#EC4815"
      />
      <path
        d="M61.2705 300.537C61.2705 300.537 65.3644 338.602 87.1135 358H105.752C87.1135 336.785 85.081 281.487 85.081 281.487C75.6009 284.588 63.7214 294.881 61.2705 300.537Z"
        fill="#EC4815"
      />
    </svg>
  )
}
