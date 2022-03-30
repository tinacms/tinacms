import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import { useLocaleInfo } from './locale-info'
import { useRouter } from 'next/router'
import { CountrySelector, CountrySelector2 } from './footer'
import type { TinaTemplate, TinaCollection } from 'tinacms'
import { Selector } from '../zeus'
import { Response } from './util'

export const navTemplate = (): TinaCollection => {
  return {
    label: 'Navigation',
    name: 'navigation',
    path: 'content/navigation',
    fields: [
      {
        label: 'Items',
        name: 'items',
        // @ts-ignore
        required: true,
        type: 'object',
        list: true,
        ui: {
          itemProps: (item) => {
            if (item) {
              return { label: item.page }
            }
          },
        },
        fields: [
          {
            label: 'Page',
            name: 'page',
            type: 'reference',
            collections: ['page'],
          },
        ],
      },
    ],
  }
}

export const navQuery = Selector('Navigation')({
  items: {
    page: {
      '...on Page': {
        title: true,
        link: true,
      },
    },
  },
})

type NavProps = Response<'Navigation', typeof navQuery>

export const Nav = (props: NavProps) => {
  const localeInfo = useLocaleInfo()
  const { asPath } = useRouter()
  const signUpLink =
    asPath === '/personal'
      ? localeInfo.signUpLinkPersonal
        ? localeInfo.signUpLinkPersonal
        : localeInfo.signUpLink
      : localeInfo.signUpLink
  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      <div className="relative py-6 sm:py-8">
        <Popover>
          {({ open }) => (
            <>
              <nav
                className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
                aria-label="Global"
              >
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <Link href="/">
                      <a className="block">
                        <Logo variant="light" classNames="h-8 w-auto sm:h-10" />
                      </a>
                    </Link>
                    <div className="-mr-2 flex items-center md:hidden">
                      <Popover.Button className="bg-gray-800 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white">
                        <span className="sr-only">Open main menu</span>
                        <MenuIcon className="h-6 w-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                  <div className="hidden space-x-10 md:flex sm:ml-12 lg:ml-28">
                    {props.items?.map((item) => (
                      <Link href={item.page?.link} key={item?.page?.title}>
                        <a className="font-medium text-white hover:text-gray-300 whitespace-pre">
                          {item?.page?.title}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                  <div className="pr-4">
                    <CountrySelector2 />
                  </div>
                  <a
                    href={localeInfo.signInLink}
                    className="whitespace-nowrap text-base font-medium text-gray-100 hover:text-gray-200"
                  >
                    Sign in
                  </a>
                  <a
                    href={signUpLink}
                    className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign up
                  </a>
                </div>
              </nav>

              <Transition
                show={open}
                as={Fragment}
                enter="duration-150 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-100 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Popover.Panel
                  focus
                  static
                  className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-20"
                >
                  <div className="rounded-lg shadow-md bg-gray-800 ring-1 ring-white ring-opacity-5 overflow-hidden">
                    <div className="px-5 pt-4 flex items-center justify-between">
                      <Link href="/">
                        <a className="block">
                          <Logo classNames="h-8 w-auto" />
                        </a>
                      </Link>
                      <div className="-mr-2 flex items-center">
                        <div className="pr-2">
                          <CountrySelector2 />
                        </div>
                        <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                          <span className="sr-only">Close menu</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </Popover.Button>
                      </div>
                    </div>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                      {props.items?.map((item) => (
                        <Link key={item.page?.link} href={item.page?.link}>
                          <a
                            key={item.page?.title}
                            className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-gray-200 hover:bg-gray-700"
                          >
                            {item.page?.title}
                          </a>
                        </Link>
                      ))}
                    </div>
                    <div className="mb-8 px-4">
                      <a
                        href={signUpLink}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Sign up
                      </a>
                      <p className="mt-6 text-center text-base font-medium text-gray-100">
                        Existing customer?{' '}
                        <a
                          href={localeInfo.signInLink}
                          className="text-gray-200 hover:text-gray-300"
                        >
                          Sign in
                        </a>
                      </p>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export const Logo = (props: {
  variant?: 'light' | 'dark'
  classNames: string
}) => {
  const variant = props.variant || 'light'
  const gray = variant === 'light' ? 'currentColor' : '#293C76'
  const brand = variant === 'light' ? 'currentColor' : '#838383'
  return (
    <svg
      className={`${props.classNames} text-white w-24 lg:w-32`}
      viewBox="0 0 121 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.83 12.1842C18.9065 12.3343 18.9447 12.4844 18.9447 12.6345C18.9447 12.9097 18.83 13.1411 18.6006 13.3287C18.3712 13.5164 18.1036 13.6102 17.7977 13.6102C17.5938 13.6102 17.3963 13.5477 17.2051 13.4226C17.0139 13.2975 16.8674 13.1223 16.7654 12.8972L12.5857 3.13476L2.22435 26.2141C1.99494 26.6895 1.6381 26.9271 1.1538 26.9271C0.847924 26.9271 0.586662 26.8333 0.370002 26.6457C0.153342 26.458 0.0450134 26.2141 0.0450134 25.9139C0.0450134 25.7388 0.0705025 25.6012 0.121481 25.5011L11.2858 0.88311C11.5152 0.332705 11.9358 0.0575066 12.5475 0.0575066C12.8279 0.0575066 13.0892 0.132561 13.3313 0.282671C13.5735 0.432782 13.7455 0.632926 13.8475 0.88311L18.83 12.1842ZM22.6725 26.2805L18.6396 17.1069C18.5108 16.8718 18.4774 16.6201 18.5393 16.352C18.6012 16.0838 18.7678 15.8719 19.0392 15.7163C19.3106 15.5607 19.5829 15.5144 19.8561 15.5775C20.2038 15.6578 20.4556 15.8699 20.6116 16.2141L24.6072 25.3791C24.736 25.6142 24.7695 25.8659 24.7075 26.134C24.6456 26.4021 24.479 26.614 24.2076 26.7696C23.9362 26.9252 23.6639 26.9715 23.3908 26.9085C23.0927 26.8397 22.8533 26.6303 22.6725 26.2805Z"
        fill={gray}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M41.087 26.9271C40.7301 26.9271 40.4434 26.8208 40.2267 26.6082C40.0101 26.3955 39.9017 26.1015 39.9017 25.7263V1.44602C39.9017 1.12078 40.0228 0.845582 40.265 0.620416C40.5071 0.39525 40.8066 0.282669 41.1635 0.282669H50.1102C52.914 0.282669 55.087 0.945647 56.6291 2.27162C58.1712 3.5976 58.9422 5.47395 58.9422 7.90074C58.9422 10.3525 58.1648 12.2477 56.61 13.5861C55.0551 14.9246 52.8885 15.5939 50.1102 15.5939H42.2722V25.7263C42.2722 26.1015 42.1639 26.3955 41.9472 26.6082C41.7306 26.8208 41.4438 26.9271 41.087 26.9271ZM49.9573 13.6049C54.3669 13.6049 56.5717 11.7035 56.5717 7.90074C56.5717 4.14798 54.3669 2.27162 49.9573 2.27162H42.2722V13.6049H49.9573Z"
        fill={gray}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M73.3377 26.9271C72.9808 26.9271 72.6941 26.8146 72.4774 26.5894C72.2608 26.3642 72.1524 26.0765 72.1524 25.7263V1.44602C72.1524 1.12078 72.2735 0.845582 72.5157 0.620416C72.7578 0.39525 73.0573 0.282669 73.4142 0.282669H87.5607C87.8921 0.282669 88.1533 0.370232 88.3445 0.545361C88.5357 0.72049 88.6313 0.97067 88.6313 1.29591C88.6313 1.62115 88.5357 1.86508 88.3445 2.02769C88.1533 2.19031 87.8921 2.27162 87.5607 2.27162H74.5229V12.2914H86.796C87.1274 12.2914 87.3887 12.379 87.5798 12.5541C87.771 12.7293 87.8666 12.9794 87.8666 13.3047C87.8666 13.6299 87.771 13.8801 87.5798 14.0552C87.3887 14.2304 87.1274 14.3179 86.796 14.3179H74.5229V25.7263C74.5229 26.1015 74.421 26.3955 74.2171 26.6082C74.0132 26.8208 73.72 26.9271 73.3377 26.9271Z"
        fill={brand}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M120.729 25.1258C120.907 25.326 120.997 25.5636 120.997 25.8388C120.997 26.1141 120.888 26.358 120.672 26.5706C120.455 26.7833 120.194 26.8896 119.888 26.8896C119.531 26.8896 119.238 26.7395 119.009 26.4393L109.871 14.8808L100.656 26.4393C100.401 26.7395 100.121 26.8896 99.8151 26.8896C99.5347 26.8896 99.2798 26.7833 99.0504 26.5706C98.821 26.358 98.7063 26.1141 98.7063 25.8388C98.7063 25.5636 98.7955 25.326 98.9739 25.1258L108.494 13.1921L99.471 1.89635C99.2925 1.69621 99.2033 1.45853 99.2033 1.18333C99.2033 0.90813 99.3117 0.664204 99.5283 0.451548C99.745 0.238891 99.9935 0.132565 100.274 0.132565C100.631 0.132565 100.924 0.282673 101.153 0.582894L109.871 11.5034L118.55 0.582894C118.779 0.282673 119.072 0.132565 119.429 0.132565C119.709 0.132565 119.964 0.238891 120.194 0.451548C120.423 0.664204 120.538 0.90813 120.538 1.18333C120.538 1.45853 120.449 1.69621 120.27 1.89635L111.247 13.1921L120.729 25.1258Z"
        fill={brand}
      />
    </svg>
  )
}

export const LogoJumbo = (props: { variant?: string; classNames?: string }) => {
  const variant = props.variant === 'dark' ? 'dark' : 'light'
  const gray = variant === 'light' ? 'currentColor' : '#293C76'
  const brand = variant === 'light' ? 'currentColor' : '#1e293b'
  return (
    <svg
      className={`${props.classNames} w-96 text-white`}
      viewBox="0 0 56 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.785 12.1267C18.8615 12.2768 18.8997 12.4269 18.8997 12.577C18.8997 12.8522 18.785 13.0836 18.5556 13.2712C18.3262 13.4589 18.0586 13.5527 17.7527 13.5527C17.5488 13.5527 17.3513 13.4902 17.1601 13.3651C16.9689 13.24 16.8224 13.0648 16.7204 12.8397L12.5407 3.07725L2.17933 26.1566C1.94993 26.632 1.59308 26.8696 1.10878 26.8696C0.802911 26.8696 0.541648 26.7758 0.324988 26.5882C0.108328 26.4005 0 26.1566 0 25.8564C0 25.6813 0.025489 25.5437 0.0764679 25.4436L11.2408 0.825603C11.4702 0.275198 11.8907 0 12.5025 0C12.7829 0 13.0441 0.0750541 13.2863 0.225165C13.5284 0.375275 13.7005 0.575419 13.8024 0.825603L18.785 12.1267ZM22.6275 26.223L18.5946 17.0494C18.4658 16.8142 18.4323 16.5626 18.4943 16.2945C18.5562 16.0263 18.7228 15.8144 18.9942 15.6588C19.2656 15.5032 19.5378 15.4569 19.811 15.52C20.1587 15.6002 20.4106 15.8124 20.5666 16.1566L24.5622 25.3216C24.691 25.5567 24.7244 25.8083 24.6625 26.0765C24.6006 26.3446 24.434 26.5565 24.1626 26.7121C23.8912 26.8677 23.6189 26.914 23.3457 26.851C23.0477 26.7822 22.8083 26.5728 22.6275 26.223Z"
        fill={gray}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M38.0419 26.8696C37.6851 26.8696 37.3983 26.7633 37.1817 26.5507C36.965 26.338 36.8567 26.044 36.8567 25.6688V1.38851C36.8567 1.06327 36.9778 0.788071 37.2199 0.562906C37.4621 0.33774 37.7616 0.225159 38.1184 0.225159H47.0652C49.869 0.225159 52.0419 0.888137 53.584 2.21411C55.1261 3.54009 55.8972 5.41644 55.8972 7.84323C55.8972 10.295 55.1198 12.1901 53.5649 13.5286C52.0101 14.8671 49.8435 15.5363 47.0652 15.5363H39.2272V25.6688C39.2272 26.044 39.1189 26.338 38.9022 26.5507C38.6855 26.7633 38.3988 26.8696 38.0419 26.8696ZM46.9122 13.5474C51.3219 13.5474 53.5267 11.646 53.5267 7.84323C53.5267 4.09047 51.3219 2.21411 46.9122 2.21411H39.2272V13.5474H46.9122Z"
        fill={gray}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.18525 61.7946C0.828399 61.7946 0.54165 61.682 0.32499 61.4568C0.10833 61.2317 0 60.944 0 60.5937V36.3135C0 35.9882 0.121076 35.713 0.363226 35.4878C0.605375 35.2627 0.904871 35.1501 1.26172 35.1501H15.4083C15.7396 35.1501 16.0009 35.2377 16.1921 35.4128C16.3832 35.5879 16.4788 35.8381 16.4788 36.1633C16.4788 36.4886 16.3832 36.7325 16.1921 36.8951C16.0009 37.0577 15.7396 37.1391 15.4083 37.1391H2.37051V47.1589H14.6436C14.975 47.1589 15.2362 47.2464 15.4274 47.4216C15.6186 47.5967 15.7142 47.8469 15.7142 48.1721C15.7142 48.4974 15.6186 48.7475 15.4274 48.9227C15.2362 49.0978 14.975 49.1854 14.6436 49.1854H2.37051V60.5937C2.37051 60.969 2.26855 61.2629 2.06463 61.4756C1.86072 61.6883 1.56759 61.7946 1.18525 61.7946Z"
        fill={brand}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M53.5766 59.9933C53.755 60.1934 53.8442 60.4311 53.8442 60.7063C53.8442 60.9815 53.7359 61.2254 53.5192 61.4381C53.3026 61.6507 53.0413 61.7571 52.7354 61.7571C52.3786 61.7571 52.0855 61.6069 51.8561 61.3067L42.7181 49.7483L33.5038 61.3067C33.2489 61.6069 32.9685 61.7571 32.6626 61.7571C32.3822 61.7571 32.1273 61.6507 31.8979 61.4381C31.6685 61.2254 31.5538 60.9815 31.5538 60.7063C31.5538 60.4311 31.643 60.1934 31.8215 59.9933L41.3417 48.0595L32.3185 36.7638C32.1401 36.5636 32.0509 36.326 32.0509 36.0508C32.0509 35.7756 32.1592 35.5316 32.3759 35.319C32.5925 35.1063 32.841 35 33.1214 35C33.4783 35 33.7714 35.1501 34.0008 35.4503L42.7181 46.3708L51.3972 35.4503C51.6267 35.1501 51.9198 35 52.2766 35C52.557 35 52.8119 35.1063 53.0413 35.319C53.2707 35.5316 53.3854 35.7756 53.3854 36.0508C53.3854 36.326 53.2962 36.5636 53.1178 36.7638L44.0946 48.0595L53.5766 59.9933Z"
        fill={brand}
      />
    </svg>
  )
}
