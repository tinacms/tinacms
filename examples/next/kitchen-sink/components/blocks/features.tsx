'use client';
import React from 'react';
import { Actions } from '../layout/actions';
import { Icon, iconSchema } from '../layout/icon';
import { Section, Container } from '../layout';
import { tinaField } from 'tinacms/dist/react';
import {
  actionsFieldSchema,
  colorFieldSchema,
} from '@/tina/schemas/shared-fields';
import { Card, CardHeader, CardTitle } from '../ui/card';
import type {
  PageBlocksFeatures,
  PageBlocksFeaturesItems,
} from '@/tina/__generated__/types';

interface FeatureProps {
  featuresColor: string | null | undefined;
  data: PageBlocksFeaturesItems;
}

export const Feature = ({ featuresColor, data }: FeatureProps) => {
  return (
    <div
      data-tina-field={tinaField(data)}
      className='flex-1 flex flex-col gap-6 text-center items-center lg:items-start lg:text-left max-w-xl mx-auto'
      style={{ flexBasis: '16rem' }}
    >
      {data.icon && (
        <div data-tina-field={tinaField(data, 'icon')}>
          <Icon data={{ size: 'large', ...data.icon }} />
        </div>
      )}
      {data.title && (
        <h3
          data-tina-field={tinaField(data, 'title')}
          className='text-2xl font-semibold title-font'
        >
          {data.title}
        </h3>
      )}
      {data.text && (
        <p
          data-tina-field={tinaField(data, 'text')}
          className='text-base opacity-80 leading-relaxed'
        >
          {data.text}
        </p>
      )}
      {data.actions && (
        <div data-tina-field={tinaField(data, 'actions')}>
          <Actions actions={data.actions} parentColor={featuresColor} />
        </div>
      )}
    </div>
  );
};

interface FeaturesProps {
  data: PageBlocksFeatures;
}

export const Features = ({ data }: FeaturesProps) => {
  // Handle both string and object item formats for backwards compatibility
  const normalizedItems =
    data.items?.map((item) => {
      if (typeof item === 'string') {
        return {
          title: item as string,
          text: undefined,
          icon: undefined,
          actions: undefined,
        };
      }
      return item;
    }) || [];

  // Check if items are simple strings (no icons/text/actions) for simple card layout
  const isSimpleLayout = data.items?.every((item) => typeof item === 'string');

  if (isSimpleLayout) {
    // Simple card grid layout
    return (
      <Section color={data.color}>
        <Container size='large'>
          <div className='@container mx-auto max-w-5xl'>
            {data.title && (
              <div className='text-center mb-12'>
                <h2
                  data-tina-field={tinaField(data, 'title')}
                  className='text-balance text-3xl font-semibold text-inherit'
                >
                  {data.title}
                </h2>
                {data.description && (
                  <p
                    data-tina-field={tinaField(data, 'description')}
                    className='mt-4 text-inherit opacity-90'
                  >
                    {data.description}
                  </p>
                )}
              </div>
            )}
            <Card className='@min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden'>
              {normalizedItems.map((item, idx) => {
                if (!item) return null;
                return (
                  <div
                    key={idx}
                    data-tina-field={tinaField(item)}
                    className='group text-center'
                  >
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-2xl font-semibold text-inherit'>
                        {item.title}
                      </CardTitle>
                      {item.text && (
                        <p className='mt-2 text-base text-inherit opacity-80'>
                          {item.text}
                        </p>
                      )}
                    </CardHeader>
                  </div>
                );
              })}
            </Card>
          </div>
        </Container>
      </Section>
    );
  }

  // Complex layout with icons/actions (similar to tina-self-hosted-demo)
  return (
    <Section color={data.color}>
      <Container
        className='flex flex-wrap gap-x-10 gap-y-8 text-left'
        size='large'
      >
        {normalizedItems &&
          normalizedItems.map(
            (block: PageBlocksFeaturesItems | null, i: number) => {
              if (!block) return null;
              return (
                <Feature featuresColor={data.color} key={i} data={block} />
              );
            }
          )}
      </Container>
    </Section>
  );
};

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
        itemProps: (item: Record<string, unknown>) => {
          return {
            label: typeof item === 'string' ? item : item?.title,
          };
        },
        defaultItem: 'New Feature',
      },
      fields: [
        iconSchema,
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
        actionsFieldSchema,
      ],
    },
    colorFieldSchema,
  ],
};
