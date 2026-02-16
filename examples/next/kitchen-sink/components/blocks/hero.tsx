'use client'
import Link from 'next/link'
import { Section, Container } from '../layout'
import RichText from '@/lib/richText'

export const Hero = ({ data, parentField = '' }) => {
  if (!data) {
    return <div className="p-6 bg-red-100 text-red-900 rounded">Hero block: no data</div>
  }
  
  return (
    <Section color={data.color}>
      <Container size="large">
        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
          {data.headline && (
            <h1
              data-tinafield={`${parentField}.headline`}
              className="text-balance text-5xl font-extrabold mb-6 text-inherit"
            >
              {data.headline}
            </h1>
          )}
          {data.description && (
            <div
              data-tinafield={`${parentField}.description`}
              className="mx-auto mt-8 max-w-2xl text-balance text-lg text-inherit opacity-90"
            >
              <RichText content={data.description} />
            </div>
          )}
          {data.actions && data.actions.length > 0 && (
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {data.actions.map((action, idx) => (
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
          )}
        </div>
      </Container>
    </Section>
  )
}

export const heroBlockSchema = {
  name: 'hero',
  label: 'Hero',
  ui: {
    previewSrc: '/blocks/hero.png',
  },
  fields: [
    {
      type: 'string',
      label: 'Headline',
      name: 'headline',
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
