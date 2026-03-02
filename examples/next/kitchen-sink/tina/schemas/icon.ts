import { ColorPickerInput } from '../fields/color'
import { IconPickerInput } from '../fields/icon'

/**
 * Icon schema with the full custom field UI pickers wired in.
 * Import this wherever a Tina collection or block needs editable icon fields.
 */
export const iconSchemaWithPicker = {
  type: 'object',
  label: 'Icon',
  name: 'icon',
  fields: [
    {
      type: 'string',
      label: 'Icon',
      name: 'name',
      ui: {
        component: IconPickerInput,
      },
    },
    {
      type: 'string',
      label: 'Color',
      name: 'color',
      ui: {
        component: ColorPickerInput,
      },
    },
    {
      name: 'style',
      label: 'Style',
      type: 'string',
      options: [
        { label: 'Circle', value: 'circle' },
        { label: 'Float', value: 'float' },
      ],
    },
  ],
}
