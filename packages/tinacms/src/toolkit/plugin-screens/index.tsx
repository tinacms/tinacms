/**



*/

import * as React from 'react';
import { MdOutlineSettings } from 'react-icons/md';
import { Form } from '@toolkit/forms';
import { ScreenPlugin } from '@toolkit/react-screens';
import { FormBuilder } from '@toolkit/form-builder';
import { useCMS } from '@toolkit/react-tinacms';

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
    this.Icon = icon || MdOutlineSettings;
    this.layout = layout || 'popup';
    this.Component = () => {
      const cms = useCMS();

      const cmsForm = cms.state.forms.find(
        ({ tinaForm }) => tinaForm.id === form.id
      );

      // Global screen plugins can outlive cleared form state after navigation.
      // Re-add the stored form and restore it as active before rendering
      // FormBuilder. forms:add dedupes by id, so this is safe on repeated
      // navigation and only runs while the form is missing (no render loop).
      React.useEffect(() => {
        if (!cmsForm) {
          cms.dispatch({ type: 'forms:add', value: form });
          cms.dispatch({ type: 'forms:set-active-form-id', value: form.id });
        }
      }, [cms, cmsForm]);

      // Avoid passing an undefined form to FormBuilder until the re-add lands.
      if (!cmsForm) {
        return null;
      }

      return <FormBuilder form={cmsForm} />;
    };
  }
}
