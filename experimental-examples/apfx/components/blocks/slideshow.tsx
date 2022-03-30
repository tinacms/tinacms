import React from 'react'
import { FullScreenHeaderWithBackground, overlayField } from './header'
import type { TinaTemplate } from 'tinacms'
import { Selector } from '../../zeus'
import { Response } from '../util'
import { action } from './hero'

export const slideshowTemplate = (textFields): TinaTemplate => {
  return {
    label: 'Slideshow',
    name: 'slideshow',
    ui: {
      defaultItem: {
        items: [
          {
            title: 'What we do',
            description:
              "We work as your trusted business partner to help you more effectively operate your business globally. Ebury's global payment solutions enable you to efficiently and securely send payments across the world in over 140 currencies. Offering a sophisticated suite of products and an advanced technology platform, as well as a panel of the biggest, global banks to ensure the most competitive pricing in the industry.",
            image:
              'https://images.ctfassets.net/fn5fbjfhb3z0/1GQRbVRTQ9OJmignvZxPTd/43b7e889507f8801aa8268aef9d95083/opera-house-2.jpg?w=1600&h=1066&q=50',
          },
        ],
      },
    },
    fields: [
      {
        label: 'Items',
        name: 'items',
        type: 'object',
        list: true,
        ui: {
          itemProps: (item) => {
            if (item) {
              return { label: item.title }
            }
          },
          defaultItem: {
            title: 'What we do',
            description:
              "We work as your trusted business partner to help you more effectively operate your business globally. Ebury's global payment solutions enable you to efficiently and securely send payments across the world in over 140 currencies. Offering a sophisticated suite of products and an advanced technology platform, as well as a panel of the biggest, global banks to ensure the most competitive pricing in the industry.",
            image:
              'https://images.ctfassets.net/fn5fbjfhb3z0/1GQRbVRTQ9OJmignvZxPTd/43b7e889507f8801aa8268aef9d95083/opera-house-2.jpg?w=1600&h=1066&q=50',
          },
        },
        fields: [...textFields, action, overlayField],
      },
    ],
  }
}

export const blockSlideshowQuery = Selector('PageBlocksSlideshow')({
  items: {
    title: true,
    description: true,
    action: {
      link: true,
      linkText: true,
      secondaryLink: true,
      secondaryText: true,
    },
    overlay: {
      image: true,
      overlayColor: true,
      overlayOpacity: true,
    },
  },
})

type SlideshowProps = Response<
  'PageBlocksSlideshow',
  typeof blockSlideshowQuery
>

type SlideshowItem = SlideshowProps['items'][number]

export const Slideshow = (props: SlideshowProps) => {
  const [current, setCurrent] = React.useState(false)
  // FIXME: For some reason SSr isn't working with this component
  React.useEffect(() => {
    setCurrent(true)
  }, [])
  if (!current) {
    return <div></div>
  }
  const items = props.items

  return (
    <div>
      <div className="relative">
        <Navigation items={items} />
        {items?.map((item, index) => {
          const id = `slideshow-${item.title.replaceAll(' ', '')}-${index}`
          return (
            <div id={id} key={id}>
              <FullScreenHeaderWithBackground {...item} slideshow={true} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Navigation(props: { items: SlideshowItem[] }) {
  const [current, setCurrent] = React.useState('')

  React.useEffect(() => {
    window.addEventListener(
      'hashchange',
      (ev) => {
        setCurrent(window.location.hash)
      },
      false
    )
  }, [])
  return (
    <div className="absolute hidden md:block sm:left-12 xl:left-24 z-50 top-96 bottom-96">
      <div className="sticky top-96">
        <Nav items={props.items} current={current} />
      </div>
    </div>
  )
}

const Nav = ({
  items,
  current,
}: {
  items: SlideshowItem[]
  current: string
}) => {
  return (
    <nav className="space-y-1" aria-label="Sidebar">
      {items.map((item, index) => {
        const id = `#slideshow-${item.title.replaceAll(' ', '')}-${index}`
        return (
          <a
            key={id}
            href={id}
            className={classNames(
              current === id
                ? 'text-gray-200 active'
                : 'text-gray-100 hover:text-gray-200',
              'font-display text-lg tracking-wide font-medium flex items-center px-0 py-2 hover-smooth'
            )}
            aria-current={id === current ? 'page' : undefined}
          >
            <span className="truncate">{item.title}</span>
          </a>
        )
      })}
    </nav>
  )
}
