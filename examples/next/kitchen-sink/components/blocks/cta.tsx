'use client'
import Link from 'next/link'
import { Section, Container } from '../layout'
import RichText from '@/lib/richText'

export const CTA = ({ data, parentField = '' }) => {
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

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {data.actions &&
              data.actions.map((action, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 rounded-lg border border-white/20 p-0.5"
                >
                  <Link
                    href={action.url}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md font-medium text-base transition-colors ${
                      action.variant === 'secondary'
                        ? 'border border-white/30 bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {action.label}
                  </Link>
                </div>
              ))}
          </div>
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
      type: 'string',
      label: 'Color',
      name: 'color',
      options: ['default', 'tint', 'primary'],
    },
  ],
}
