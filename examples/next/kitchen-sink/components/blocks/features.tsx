'use client'
import { Actions } from '../layout/actions'
import { Icon, iconSchema } from '../layout/icon'
import { iconSchemaWithPicker } from '@/tina/schemas/icon'
import { Section, Container } from '../layout'
import RichText from '@/lib/richText'
import { Card, CardHeader, CardTitle } from '../ui/card'

export const Feature = ({ featuresColor, data, tinaField }: any) => {
  return (
    <div
      data-tinafield={tinaField}
      className="flex-1 flex flex-col gap-6 text-center items-center lg:items-start lg:text-left max-w-xl mx-auto"
      style={{ flexBasis: '16rem' }}
    >
      {data.icon && (
        <Icon
          tinaField={`${tinaField}.icon`}
          parentColor={featuresColor}
          data={{ size: 'large', ...data.icon }}
        />
      )}
      {data.title && (
        <h3
          data-tinafield={`${tinaField}.title`}
          className="text-2xl font-semibold title-font"
        >
          {data.title}
        </h3>
      )}
      {data.text && (
        <p
          data-tinafield={`${tinaField}.text`}
          className="text-base opacity-80 leading-relaxed"
        >
          {data.text}
        </p>
      )}
      {data.actions && (
        <Actions
          actions={data.actions}
          parentField={`${tinaField}.actions`}
          parentColor={featuresColor}
        />
      )}
    </div>
  )
}

export const Features = ({ data, parentField }: any) => {
  // Handle both string and object item formats for backwards compatibility
  const normalizedItems = data.items?.map((item: any) => {
    if (typeof item === 'string') {
      return { title: item, text: undefined, icon: undefined, actions: undefined }
    }
    return item
  }) || []

  // Check if items are simple strings (no icons/text/actions) for simple card layout
  const isSimpleLayout = data.items?.every((item: any) => typeof item === 'string')

  if (isSimpleLayout) {
    // Simple card grid layout
    return (
      <Section color={data.color}>
        <Container size="large">
          <div className="@container mx-auto max-w-5xl">
            {data.title && (
              <div className="text-center mb-12">
                <h2
                  data-tinafield={`${parentField}.title`}
                  className="text-balance text-3xl font-semibold text-inherit"
                >
                  {data.title}
                </h2>
                {data.description && (
                  <div
                    data-tinafield={`${parentField}.description`}
                    className="mt-4 text-inherit opacity-90"
                  >
                    <RichText content={data.description} />
                  </div>
                )}
              </div>
            )}
            <Card className="@min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden">
              {normalizedItems.map((item, idx) => (
                <div
                  key={idx}
                  data-tinafield={`${parentField}.items.${idx}`}
                  className="group text-center"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-semibold text-inherit">
                      {item.title}
                    </CardTitle>
                    {item.text && (
                      <p className="mt-2 text-base text-inherit opacity-80">
                        {item.text}
                      </p>
                    )}
                  </CardHeader>
                </div>
              ))}
            </Card>
          </div>
        </Container>
      </Section>
    )
  }

  // Complex layout with icons/actions (similar to tina-self-hosted-demo)
  return (
    <Section color={data.color}>
      <Container
        className={`flex flex-wrap gap-x-10 gap-y-8 text-left`}
        size="large"
      >
        {normalizedItems &&
          normalizedItems.map(function (block: any, i: number) {
            return (
              <Feature
                tinaField={`${parentField}.items.${i}`}
                featuresColor={data.color}
                key={i}
                data={block}
              />
            )
          })}
      </Container>
    </Section>
  )
}

export const featureBlockSchema = {
  name: 'features',
  label: 'Features',
  ui: {
    previewSrc: '/blocks/features.png',
    defaultItem: {
      title: 'Features',
      items: [],
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
    },
    {
      type: 'string',
      ui: {
        component: 'textarea',
      },
      label: 'Description',
      name: 'description',
    },
    {
      type: 'object',
      label: 'Feature Items',
      name: 'items',
      list: true,
      ui: {
        itemProps: (item: any) => {
          return {
            label: typeof item === 'string' ? item : item?.title,
          }
        },
        defaultItem: 'New Feature',
      },
      fields: [
        iconSchemaWithPicker,
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Text',
          name: 'text',
          ui: {
            component: 'textarea',
          },
        },
        {
          label: 'Actions',
          name: 'actions',
          type: 'object',
          list: true,
          ui: {
            defaultItem: {
              label: 'Action Label',
              type: 'button',
              icon: true,
              link: '/',
            },
            itemProps: (item: any) => ({ label: item.label }),
          },
          fields: [
            {
              label: 'Label',
              name: 'label',
              type: 'string',
            },
            {
              label: 'Type',
              name: 'type',
              type: 'string',
              options: [
                { label: 'Button', value: 'button' },
                { label: 'Link', value: 'link' },
              ],
            },
            {
              label: 'Link',
              name: 'link',
              type: 'string',
            },
            {
              label: 'Icon',
              name: 'icon',
              type: 'boolean',
            },
          ],
        },
      ],
    },
    {
      type: 'string',
      label: 'Color',
      name: 'color',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Tint', value: 'tint' },
        { label: 'Primary', value: 'primary' },
      ],
    },
  ],
}
