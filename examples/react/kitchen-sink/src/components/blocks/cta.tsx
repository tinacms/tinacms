import React from 'react';
import { Section, Container } from '../layout';
import { Actions } from '../layout/actions';
import { tinaField } from 'tinacms/dist/react';
import {
  actionsFieldSchema,
  colorFieldSchema,
} from '@/tina/schemas/shared-fields';
import type { PageBlocksCta } from '@/tina/__generated__/types';

interface CTAProps {
  data: PageBlocksCta;
}

export const CTA = ({ data }: CTAProps) => {
  return (
    <Section color={data.color}>
      <Container size='large'>
        <div className='text-center'>
          <h2
            data-tina-field={tinaField(data, 'title')}
            className='text-balance text-4xl font-semibold lg:text-5xl text-inherit'
          >
            {data.title}
          </h2>
          {data.description && (
            <div
              data-tina-field={tinaField(data, 'description')}
              className='mt-4 text-inherit opacity-90 max-w-2xl mx-auto'
            >
              {data.description}
            </div>
          )}

          {data.actions && (
            <div className='mt-12' data-tina-field={tinaField(data, 'actions')}>
              <Actions
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
