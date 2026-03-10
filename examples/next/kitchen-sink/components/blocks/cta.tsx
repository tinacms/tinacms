'use client';
import { Section, Container } from '../layout';
import RichText from '@/lib/richText';
import { Actions } from '../layout/actions';
import {
  actionsFieldSchema,
  colorFieldSchema,
} from '@/tina/schemas/shared-fields';

interface CTAProps {
  data: Record<string, unknown>;
  parentField?: string;
}

export const CTA = ({ data, parentField = '' }: CTAProps) => {
  return (
    <Section color={data.color}>
      <Container size='large'>
        <div className='text-center'>
          <h2
            data-tinafield={`${parentField}.title`}
            className='text-balance text-4xl font-semibold lg:text-5xl text-inherit'
          >
            {data.title}
          </h2>
          {data.description && (
            <div
              data-tinafield={`${parentField}.description`}
              className='mt-4 text-inherit opacity-90 max-w-2xl mx-auto'
            >
              <RichText content={data.description} />
            </div>
          )}

          {data.actions && (
            <div className='mt-12'>
              <Actions
                parentField={`${parentField}.actions`}
                className='justify-center py-2'
                parentColor={data.color}
                actions={data.actions}
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

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
    actionsFieldSchema,
    colorFieldSchema,
  ],
};
