import React from 'react'
import { TextNode } from 'lexical'
import { $isAtNodeEnd } from '@lexical/selection'
import { ElementNode, type RangeSelection } from 'lexical'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisIcon } from './icons'

type ToolbarItem = {
  key?: string
  active?: boolean
  onClick?: () => void
  label: string | JSX.Element
  icon?: JSX.Element
  children?: ToolbarItem[]
}

export function getSelectedNode(
  selection: RangeSelection
): TextNode | ElementNode {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode
  }
}

export const ToolbarComponent = ({ items }: { items: ToolbarItem[] }) => {
  const [itemsShown, setItemsShown] = React.useState(items.length)

  const showEmbed = true
  const EMBED_ICON_WIDTH = 100
  const ICON_WIDTH = 40
  const toolbarRef = React.useRef(null)
  useResize(toolbarRef, (entry) => {
    const width = entry.target.getBoundingClientRect().width
    const itemsShown = (width - (showEmbed ? EMBED_ICON_WIDTH : 0)) / ICON_WIDTH
    setItemsShown(Math.floor(itemsShown))
  })

  return (
    <div
      ref={toolbarRef}
      className="max-w-full w-full border shadow-sm isolate grid rounded-md shadow-sm divide-x"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${ICON_WIDTH}px, 1fr))`,
        gridTemplateRows: 'auto',
        gridAutoRows: 0,
      }}
    >
      {items.map((item, index) => {
        if (index > itemsShown) {
          return null
        }
        const isFirst = index === 0
        const isNotFirst = index !== 0
        // const isLast = index + 1 === items.length;
        const isLast = false
        return (
          <ToolbarButton
            isFirst={isFirst}
            isLast={isLast}
            isNotFirst={isNotFirst}
            {...item}
          />
        )
      })}
      <ToolbarButton
        label={''}
        isFirst={false}
        isLast={true}
        isNotFirst={true}
        expand={true}
        icon={<EllipsisIcon title="More" />}
        children={items.slice(itemsShown + 1)}
      />
    </div>
  )
}
export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const ToolbarButton = (
  props: ToolbarItem & {
    isFirst?: boolean
    isLast?: boolean
    isNotFirst?: boolean
    expand?: boolean
  }
) => {
  const { label, icon, children, isFirst, isLast, isNotFirst } = props
  const className = classNames(
    isFirst ? 'rounded-l-md' : '',
    isLast ? 'rounded-r-md' : '',
    // isNotFirst ? "-ml-px" : "",
    isNotFirst ? '' : '',
    props.expand ? 'w-full' : 'flex-1',
    props.expand ? 'w-full' : 'flex-1',
    props.active
      ? 'text-blue-600 hover:bg-gray-100'
      : 'text-gray-700 hover:bg-gray-50',
    'focus:outline-none relative inline-flex h-10 flex justify-center items-center bg-white p-1 text-xs font-bold uppercase focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
  )

  if (children && children?.length > 0) {
    return (
      <DropdownToolbarButton
        {...props}
        align="right"
        children={children}
        className={className}
      />
    )
  }

  return (
    <button type="button" className={className} onClick={props.onClick}>
      {icon || label}
    </button>
  )
}

export const useResize = (
  ref: React.MutableRefObject<null>,
  callback: (entry: ResizeObserverEntry) => void
) => {
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callback(entry)
      }
    })
    if (ref.current) {
      resizeObserver.observe(ref.current)
    }

    return () => resizeObserver.disconnect()
  }, [ref.current])
}

export function DropdownToolbarButton({
  label,
  icon,
  children,
  align,
  expand,
  className,
}: ToolbarItem & {
  className: string
  align?: string
  expand?: boolean
  children: ToolbarItem[]
}) {
  return (
    <Menu
      as="div"
      className={`relative inline-block text-center ${expand ? 'w-full' : ''}`}
    >
      <Menu.Button className={classNames(className, 'w-full')}>
        {icon || label}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1">
            {children.map((child) => {
              return (
                <Menu.Item key={child.key}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={child.onClick}
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'text-left w-full block px-4 py-2 text-sm'
                      )}
                    >
                      {child.label}
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
