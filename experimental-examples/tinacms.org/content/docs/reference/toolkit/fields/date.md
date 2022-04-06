---
title: Date & Time Field
prev: /docs/reference/toolkit/fields/blocks
next: /docs/reference/toolkit/fields/markdown
consumes:
  - file: /packages/@tinacms/fields/src/plugins/DateFieldPlugin.tsx
    details: Documents how to use the date field plugin
  - file: /packages/@tinacms/fields/src/plugins/dateFormat.ts
    details: References date formatting specifics
---

{{ WarningCallout text="This is an advanced-use feature, and likely not something you'll need to configure. What you probably want is the [content types reference](/docs/reference/types/)" }}

The `date` field represents a date and time picker. It can be used for data values that are valid date strings.

![tinacms-date-field](/img/fields/date.jpg)

## Options

This field plugin uses [`react-datetime`](https://www.npmjs.com/package/react-datetime) under the hood.

```typescript
interface DateConfig extends FieldConfig, DatetimepickerProps {
  component: 'date'
  name: string
  label?: string
  description?: string
  dateFormat?: boolean | string // Extra properties from react-datetime
  timeFormat?: boolean | string // Moment date format
}
```

| Option        | Description                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component`   | The name of the plugin component. Always `'date'`.                                                                                                                                                                                                                                                                                                                                                                        |
| `name`        | The path to some value in the data being edited.                                                                                                                                                                                                                                                                                                                                                                          |
| `label`       | A human readable label for the field. Defaults to the `name`. _(Optional)_                                                                                                                                                                                                                                                                                                                                                |
| `description` | Description that expands on the purpose of the field or prompts a specific action. _(Optional)_                                                                                                                                                                                                                                                                                                                           |
| `dateFormat`  | Defines the format for the date. It accepts any [Moment.js date format](https://momentjs.com/docs/#/displaying/format/) (not in localized format). If true the date will be displayed using the defaults for the current locale. See [react-datetime docs](https://github.com/YouCanBookMe/react-datetime) for more details. _(Optional)_                                                                                 |
| `timeFormat`  | Defines the format for the time. It accepts any [Moment.js time format](https://momentjs.com/docs/#/displaying/format/) (not in localized format). If true the time will be displayed using the defaults for the current locale. If false the timepicker is disabled and the component can be used as datepicker. See [react-datetime docs](https://github.com/YouCanBookMe/react-datetime) for more details._(Optional)_ |

### FieldConfig

This interfaces only shows the keys unique to the date field.

Visit the [Field Config](https://tinacms.org/docs/reference/toolkit/fields) docs for a complete list of options.

### DatetimepickerProps

Any extra properties added to the the `date` field definition will be passed along to the [`react-datettime`](https://www.npmjs.com/package/react-datetime) component. [Moment.js](https://momentjs.com/docs/#/displaying/format/) format is used. See the full list of options [here](https://www.npmjs.com/package/react-datetime#api).

## Example: Add "Created At" to Form

```javascript
const formConfig = {
  fields: [
    {
      name: 'created_at',
      label: 'Created At',
      component: 'date',
      dateFormat: 'MMMM DD YYYY',
      timeFormat: false,
    },
  ],
}
```
