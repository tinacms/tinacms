import * as React from 'react'
import { EllipsisVerticalIcon } from '@toolkit/icons'
import { useState, FC } from 'react'
import { Dismissible } from '@toolkit/react-dismissible'
import { Form } from '@toolkit/forms'

export interface FormActionMenuProps {
  form: Form
  actions: any[]
}

export const FormActionMenu: FC<FormActionMenuProps> = ({ actions, form }) => {
  const [actionMenuVisibility, setActionMenuVisibility] = useState(false)

  return (
    <>
      <MoreActionsButton onClick={() => setActionMenuVisibility((p) => !p)} />
      <ActionsOverlay open={actionMenuVisibility}>
        <Dismissible
          click
          escape
          disabled={!actionMenuVisibility}
          onDismiss={() => {
            setActionMenuVisibility((p) => !p)
          }}
        >
          {actions.map((Action, i) => (
            // TODO: `i` will suppress warnings but this indicates that maybe
            //        Actions should just be componets
            <Action form={form} key={i} />
          ))}
        </Dismissible>
      </ActionsOverlay>
    </>
  )
}

const MoreActionsButton = ({ className = '', ...props }) => (
  <button
    className={`h-16 w-10 self-stretch bg-transparent bg-center bg-[length:auto_18px] -mr-4 ml-2 outline-none cursor-pointer transition-opacity duration-100 ease-out flex justify-center items-center hover:bg-gray-50 hover:fill-gray-700 ${className}`}
    {...props}
  >
    <EllipsisVerticalIcon />
  </button>
)

const ActionsOverlay = ({ open, className = '', style = {}, ...props }) => (
  <div
    className={`min-w-[192px] rounded-3xl border border-solid border-[#efefef] block absolute bottom-5 right-5 ${
      open ? 'opacity-100' : 'opacity-0'
    } transition-all duration-100 ease-out origin-bottom-right shadow-[0_2px_3px_rgba(0,0,0,0.05)] bg-white overflow-hidden z-10 ${className}`}
    style={{
      transform: open
        ? 'translate3d(0, -28px, 0) scale3d(1, 1, 1)'
        : 'translate3d(0, 0, 0) scale3d(0.5, 0.5, 1)',
      pointerEvents: open ? 'all' : 'none',
      ...style,
    }}
    {...props}
  />
)

export const ActionButton = ({ className = '', ...props }) => (
  <button
    className={`relative text-center text-[13px] px-3 h-10 font-normal w-full bg-none cursor-pointer outline-none border-0 transition-all duration-[150ms] ease-out hover:text-blue-500 hover:bg-gray50 [&:not(:last-child)]: border-b-[1px] border-solid border-b-[#edecf3] ${className}`}
    {...props}
  />
)
