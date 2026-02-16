'use client'
import { Section, Container } from '../layout'
import RichText from '@/lib/richText'

export const Content = ({ data, parentField = '' }) => {
  return (
    <Section color={data.color}>
      <Container
        className={`prose prose-lg ${
          data.color === 'primary' ? `prose-primary` : `dark:prose-dark`
        }`}
        size="large"
        width="medium"
        data-tinafield={`${parentField}.body`}
      >
        <RichText content={data.body} />
      </Container>
    </Section>
  )
}

export const contentBlockSchema = {
  name: 'content',
  label: 'Content',
  ui: {
    previewSrc: '/blocks/content.png',
    defaultItem: {
      body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.',
    },
  },
  fields: [
    {
      type: 'rich-text',
      label: 'Body',
      name: 'body',
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
