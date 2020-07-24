# react-tinacms-date

This package provides a [Field Plugin](https://tinacms.org/docs/plugins/fields) for editing dates on websites built with [TinaCMS](https://tinacms.org).

![tinacms-date-field](https://tinacms.org/img/fields/date.jpg)

## Installation


```
yarn add react-tinacms-date
```

### Registering the Date Field Plugin

The simplest approach is to simply import the package and add it to the CMS.

```js
import { DateFieldPlugin } from "react-tinacms-date"

cms.plugins.add(DateFieldPlugin)
```

However, to help reduce bundle size you may also import the plugin dynamically:

```js
import("react-tinacms-date").then(({ DateFieldPlugin }) => {
  cms.plugins.add(DateFieldPlugin)
})
```

Visit the [Plugin Docs](https://tinacms.org/docs/plugins/#adding-plugins) to learn more about efficiently loading and registering plugins.


## Using the Date Field Plugin

Once registered you will be able to use the Date Field in your [Forms](https://tinacms.org/docs/forms):

```js
const formConfig = {
  fields: [
    {
      name: "created_at",
      label: "Craeted At",
      component: "date",
      dateFormat: 'MMMM DD YYYY',
      timeFormat: false,
    }
  ]
}
```


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

 Visit the [Field Config](https://tinacms.org/docs/plugins/fields) docs for a complete list of options.

 ### DatetimepickerProps

 Any extra properties added to the the `date` field definition will be passed along to the [`react-datettime`](https://www.npmjs.com/package/react-datetime) component. [Moment.js](https://momentjs.com/docs/#/displaying/format/) format is used. See the full list of options [here](https://www.npmjs.com/package/react-datetime#api).

