import { CMS } from '@forestryio/cms'
import { TextInput, TextAreaInput } from '@forestryio/xeditor-react'

export * from './markdownRemark'

export let cms = new CMS()

cms.forms.addFieldPlugin({ name: 'text', Component: TextInput })
cms.forms.addFieldPlugin({ name: 'textarea', Component: TextAreaInput })
