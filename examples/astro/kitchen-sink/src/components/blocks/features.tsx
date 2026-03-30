import { Actions } from '@/components/layout/actions';
import { Container } from '@/components/layout/container';
import { Icon } from '@/components/layout/icon';
import { Section } from '@/components/layout/section';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { tinaField } from 'tinacms/dist/react';

interface FeatureProps {
  featuresColor: string | null | undefined;
  data: any;
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
  data: any;
}

export const Features = ({ data }: FeaturesProps) => {
  const normalizedItems =
    data.items?.map((item: any) => {
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

  const isSimpleLayout = data.items?.every(
    (item: any) => typeof item === 'string'
  );

  if (isSimpleLayout) {
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
              {normalizedItems.map((item: any, idx: number) => {
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

  return (
    <Section color={data.color}>
      <Container
        className='flex flex-wrap gap-x-10 gap-y-8 text-left'
        size='large'
      >
        {normalizedItems &&
          normalizedItems.map((block: any, i: number) => {
            if (!block) return null;
            return <Feature featuresColor={data.color} key={i} data={block} />;
          })}
      </Container>
    </Section>
  );
};
