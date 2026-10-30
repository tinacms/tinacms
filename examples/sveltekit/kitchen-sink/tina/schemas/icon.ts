/**
 * Icon schema — extracted from the Next.js version's icon.tsx component.
 * Defines icon field configuration for block items (Features block).
 */
export const iconSchema = {
  type: 'object' as const,
  label: 'Icon',
  name: 'icon',
  fields: [
    {
      type: 'string' as const,
      label: 'Name',
      name: 'name',
      options: [
        { label: 'Tina', value: 'Tina' },
        { label: 'BiLayer', value: 'BiLayer' },
        { label: 'BiSearchAlt2', value: 'BiSearchAlt2' },
        { label: 'BiTerminal', value: 'BiTerminal' },
      ],
    },
    {
      type: 'string' as const,
      label: 'Color',
      name: 'color',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Teal', value: 'teal' },
        { label: 'Green', value: 'green' },
        { label: 'Red', value: 'red' },
        { label: 'Pink', value: 'pink' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'White', value: 'white' },
      ],
    },
    {
      type: 'string' as const,
      label: 'Style',
      name: 'style',
      options: [
        { label: 'Float', value: 'float' },
        { label: 'Circle', value: 'circle' },
      ],
    },
    {
      type: 'string' as const,
      label: 'Size',
      name: 'size',
      options: [
        { label: 'XS', value: 'xs' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'XL', value: 'xl' },
      ],
    },
  ],
};
