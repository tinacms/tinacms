import * as React from 'react'
import { Form } from '../react-tinacms'

interface FormListProviderProps {
  children?: React.ReactNode
}

const FormListContext = React.createContext<{
  formList: FormListItem[]
  setFormList: React.Dispatch<React.SetStateAction<FormListItem[]>>
}>({
  formList: [],
  setFormList: () => {},
})

export type FormListItem =
  | { type: 'document'; path: string; form: Form; subItems: FormListItem[] }
  | { type: 'list'; label: string }

export const FormListProvider: React.FC<FormListProviderProps> = ({
  children,
}) => {
  const [formList, setFormList] = React.useState<FormListItem[]>([])

  // const groupedList = groupFormList(formList)

  return (
    <FormListContext.Provider value={{ formList, setFormList }}>
      {children}
    </FormListContext.Provider>
  )
}

export const useFormList = () => {
  return React.useContext(FormListContext)
}

export type FormItem = {
  type: 'item'
  path: string
  form: Form
  subItems: FormItem[]
  isConnection: boolean
}
export type GroupedListItem = {
  type: 'list'
  label: string
  items: FormItem[]
}
type GroupedList = (GroupedListItem | FormItem)[]

const groupFormList = (items: FormListItem[]): GroupedList => {
  const topLevelForms: FormItem[] = []
  const groupList: GroupedList = []
  // const globalForms: FormListItem[] = []
  items.forEach((item) => {
    if (
      items
        .filter(({ path }) => path !== item.path)
        .some(({ path }) => {
          return item.path.startsWith(path)
        })
    ) {
      let parent!: FormItem
      let longestParentPath = 0
      topLevelForms
        .filter(({ path }) => item.path.startsWith(path))
        .forEach((item) => {
          const itemLength = item.path.split('.').length
          if (longestParentPath < itemLength) {
            parent = item
            longestParentPath = itemLength
          }
        })
      if (parent) {
        parent.subItems.push({
          ...item,
          type: 'item',
          subItems: [],
        })
      } else {
        console.error('no parent found ', item)
      }
    } else {
      topLevelForms.push({ ...item, type: 'item', subItems: [] })
    }
  })
  console.log({ topLevelForms })
  topLevelForms.forEach((tlForm) => {})

  return []
}
