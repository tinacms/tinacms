/**



*/

import { FormBuilder } from '@toolkit/form-builder';
import { Form } from '@toolkit/forms';
import { ScreenPlugin } from '@toolkit/react-screens';
import { useCMS } from '@toolkit/react-tinacms';
import * as React from 'react';
import { MdOutlineLanguage } from 'react-icons/md';

export class GlobalFormPlugin implements ScreenPlugin {
  __type: ScreenPlugin['__type'] = 'screen';
  name: ScreenPlugin['name'];
  Component: ScreenPlugin['Component'];
  Icon: ScreenPlugin['Icon'];
  layout: ScreenPlugin['layout'];

  constructor(
    public form: Form,
    icon?: ScreenPlugin['Icon'],
    layout?: ScreenPlugin['layout']
  ) {
    this.name = form.label;
    this.Icon = icon || MdOutlineLanguage;
    this.layout = layout || 'popup';
    this.Component = () => {
      const cms = useCMS();

      const cmsForm = cms.state.forms.find(
        ({ tinaForm }) => tinaForm.id === form.id
      );

      React.useEffect(() => {
        if (!cmsForm) {
          cms.dispatch({ type: 'forms:add', value: form });
          cms.dispatch({ type: 'forms:set-active-form-id', value: form.id });
        }
      }, [cms, cmsForm]);

      if (!cmsForm) {
        return null;
      }

      return <FormBuilder form={cmsForm} />;
    };
  }
}
