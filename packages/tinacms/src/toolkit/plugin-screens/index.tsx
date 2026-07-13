/**



*/

import { FormBuilder } from '@toolkit/form-builder';
import { Form } from '@toolkit/forms';
import { ScreenPlugin } from '@toolkit/react-screens';
import { useCMS } from '@toolkit/react-tinacms';
import { Globe } from 'lucide-react';
import * as React from 'react';

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
    this.Icon = icon || Globe;
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
