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

  return (
    <FormListContext.Provider value={{ formList, setFormList }}>
      {children}
    </FormListContext.Provider>
  )
}

export const useFormList = () => {
  return React.useContext(FormListContext)
}
