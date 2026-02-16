'use client'
import { Card, CardHeader } from '../ui/card'
import { Section, Container } from '../layout'
import RichText from '@/lib/richText'

export const Features = ({ data, parentField = '' }) => {
  return (
    <Section color={data.color}>
      <Container size="large">
        <div className="@container mx-auto max-w-5xl">
          <div className="text-center">
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
          <Card className="@min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden md:mt-16">
            {data.items?.map((item, idx) => {
              const isObject = typeof item === 'object' && item !== null
              const title = isObject ? item.title : item
              const text = isObject ? item.text : undefined

              return (
                <div
                  key={idx}
                  data-tinafield={`${parentField}.items.${idx}`}
                  className="group text-center"
                >
                  <CardHeader className="pb-3">
                    <h3 className="text-2xl font-semibold text-inherit">{title}</h3>
                    {text && <p className="mt-2 text-base text-inherit opacity-80">{text}</p>}
                  </CardHeader>
                </div>
              )
            })}
          </Card>
        </div>
      </Container>
    </Section>
  )
}

export const featureBlockSchema = {
  name: 'features',
  label: 'Features',
  ui: {
    previewSrc: '/blocks/features.png',
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
      type: 'string',
      label: 'Color',
      name: 'color',
      options: ['default', 'tint', 'primary'],
    },
  ],
}
