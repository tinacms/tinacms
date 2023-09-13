import * as React from 'react'
import { BiEdit } from 'react-icons/bi'
import { Transition } from '@headlessui/react'
import { TinaState } from '@toolkit/tina-state'
import { useCMS } from '@toolkit/react-tinacms'

type FormListItem = TinaState['formLists'][number]['items'][number]

const Item = ({
  item,
  depth,
  setActiveFormId,
}: {
  item: Extract<FormListItem, { type: 'document' }>
  depth: number
  setActiveFormId: (id: string) => void
}) => {
  const cms = useCMS()
  const depths = ['pl-6', 'pl-10', 'pl-14']
  const form = React.useMemo(
    () => cms.state.forms.find(({ tinaForm }) => item.formId === tinaForm.id),
    [item.formId]
  )

  return (
    <button
      key={item.path}
      onClick={() => setActiveFormId(item.formId)}
      className={`${
        depths[depth] || 'pl-12'
      } pr-6 py-3 w-full h-full bg-transparent border-none text-lg text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center justify-between gap-2`}
    >
      <BiEdit className="opacity-70 w-5 h-auto text-blue-500 flex-none" />
      <div className="flex-1 flex flex-col gap-0.5 items-start">
        <div className="group-hover:text-blue-500 font-sans text-xs font-semibold text-gray-700 whitespace-normal">
          {form.tinaForm.label}
        </div>
        <div className="group-hover:text-blue-500 text-base truncate leading-tight text-gray-600">
          {form.tinaForm.id}
        </div>
      </div>
    </button>
  )
}
export interface FormsListProps {
  formList: FormListItem[]
  setActiveFormId(id: string): void
  isEditing: Boolean
  hidden?: boolean
}

const FormListItem = ({
  item,
  depth,
  setActiveFormId,
}: {
  item: Extract<FormListItem, { type: 'document' }>
  depth: number
  setActiveFormId: (id: string) => void
}) => {
  return (
    <div className={`divide-y divide-gray-200`}>
      <Item setActiveFormId={setActiveFormId} item={item} depth={depth} />
      {item.subItems && (
        <ul className="divide-y divide-gray-200">
          {item.subItems?.map((subItem) => {
            if (subItem.type === 'document') {
              return (
                <li key={subItem.formId}>
                  <Item
                    setActiveFormId={setActiveFormId}
                    depth={depth + 1}
                    item={subItem}
                  />
                </li>
              )
            }
          })}
        </ul>
      )}
    </div>
  )
}

export const FormLists = (props: { isEditing: boolean }) => {
  const cms = useCMS()
  return (
    <>
      <Transition
        appear={true}
        // show={props.isEditing}
        show={true}
        enter="transition-all ease-out duration-150"
        enterFrom="opacity-0 -translate-x-1/2"
        enterTo="opacity-100"
        leave="transition-all ease-out duration-150"
        className={'overflow-scroll'}
        leaveFrom="opacity-100"
        leaveTo="opacity-0 -translate-x-1/2"
      >
        {cms.state.formLists.map((formList) => (
          <div key={formList.id} className="pt-16">
            {/* TODO: add labels for each list */}
            <FormList
              isEditing={props.isEditing}
              setActiveFormId={(id) => {
                cms.dispatch({ type: 'forms:set-active-form-id', value: id })
              }}
              formList={formList}
            />
          </div>
        ))}
      </Transition>
    </>
  )
}

export const FormList = (props: {
  isEditing: boolean
  setActiveFormId: (id: string) => void
  formList: TinaState['formLists'][number]
}) => {
  const cms = useCMS()

  const listItems: TinaState['formLists'][number]['items'] =
    React.useMemo(() => {
      const orderedListItems: TinaState['formLists'][number]['items'] = []
      const globalItems: TinaState['formLists'][number]['items'] = []
      const topItems: TinaState['formLists'][number]['items'] = []
      // Always put global forms at the end
      props.formList.items.forEach((item) => {
        if (item.type === 'document') {
          const form = cms.state.forms.find(
            ({ tinaForm }) => tinaForm.id === item.formId
          )
          if (form.tinaForm.global) {
            globalItems.push(item)
          } else {
            orderedListItems.push(item)
          }
        } else {
          orderedListItems.push(item)
        }
      })
      if (orderedListItems[0]?.type === 'document') {
        topItems.push({ type: 'list', label: 'Documents' })
      }
      let extra = []
      if (globalItems.length) {
        extra = [{ type: 'list', label: 'Global Documents' }, ...globalItems]
      }
      return [...topItems, ...orderedListItems, ...extra]
    }, [JSON.stringify(props.formList.items)])

  return (
    <ul>
      <li className={`divide-y divide-gray-200`}>
        {listItems.map((item, index) => {
          if (item.type === 'list') {
            return (
              <div
                key={item.label}
                className={`relative group text-left w-full bg-white shadow-sm
   border-gray-100 px-6 -mt-px pb-3 ${
     index > 0
       ? 'pt-6 bg-gradient-to-b from-gray-50 via-white to-white'
       : 'pt-3'
   }`}
              >
                <span
                  className={
                    'text-sm tracking-wide font-bold text-gray-700 uppercase'
                  }
                >
                  {item.label}
                </span>
              </div>
            )
          }
          return (
            <FormListItem
              setActiveFormId={(id) => props.setActiveFormId(id)}
              key={item.formId}
              item={item}
              depth={0}
            />
          )
        })}
      </li>
    </ul>
  )
}
