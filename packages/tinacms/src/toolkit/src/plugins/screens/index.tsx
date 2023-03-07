/**



*/

import * as React from 'react'
import { MdOutlineSettings } from 'react-icons/md'
import { Form } from '../../packages/forms'
import { ScreenPlugin } from '../../packages/react-screens'
import { FormBuilder } from '../../packages/form-builder'

export class GlobalFormPlugin implements ScreenPlugin {
  __type: ScreenPlugin['__type'] = 'screen'
  name: ScreenPlugin['name']
  Component: ScreenPlugin['Component']
  Icon: ScreenPlugin['Icon']
  layout: ScreenPlugin['layout']

  constructor(
    public form: Form,
    icon?: ScreenPlugin['Icon'],
    layout?: ScreenPlugin['layout']
  ) {
    this.name = form.label
    this.Icon = icon || MdOutlineSettings
    this.layout = layout || 'popup'
    this.Component = () => {
      return <FormBuilder form={form as any} />
    }
  }
}
