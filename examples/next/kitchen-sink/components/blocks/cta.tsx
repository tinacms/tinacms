'use client'
import Link from 'next/link'
import { Section, Container } from '../layout'
import RichText from '@/lib/richText'
import { Actions } from '../layout/actions'

export const CTA = ({ data, parentField = '' }: any) => {
  return (
    <Section color={data.color}>
      <Container size="large">
        <div className="text-center">
          <h2
            data-tinafield={`${parentField}.title`}
            className="text-balance text-4xl font-semibold lg:text-5xl text-inherit"
          >
            {data.title}
          </h2>
          {data.description && (
            <div
              data-tinafield={`${parentField}.description`}
              className="mt-4 text-inherit opacity-90 max-w-2xl mx-auto"
            >
              <RichText content={data.description} />
            </div>
          )}

          {data.actions && (
            <div className="mt-12">
              <Actions
                parentField={`${parentField}.actions`}
                className="justify-center py-2"
                parentColor={data.color}
                actions={data.actions}
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}

export const ctaBlockSchema = {
  name: 'cta',
  label: 'CTA',
  ui: {
    previewSrc: '/blocks/cta.png',
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
