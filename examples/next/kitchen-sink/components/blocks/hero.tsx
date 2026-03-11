'use client';
import React from 'react';
import Image from 'next/image';
import { Actions } from '../layout/actions';
import { Container } from '../layout';
import RichText from '@/lib/richText';
import { Section } from '../layout';
import { sanitizeImageSrc } from '@/lib/utils';
import {
  actionsFieldSchema,
  colorFieldSchema,
} from '@/tina/schemas/shared-fields';
import type { PageBlocksHero } from '@/tina/__generated__/types';

interface HeroProps {
  data: PageBlocksHero;
  parentField?: string;
}

export const Hero = ({ data, parentField }: HeroProps) => {
  return (
    <Section color={data.color}>
      <Container
        size='large'
        className='grid grid-cols-1 lg:grid-cols-5 gap-14 items-center justify-center'
      >
        <div className='row-start-2 lg:row-start-1 lg:col-span-3 text-center lg:text-left'>
          {data.tagline && (
            <h2
              data-tinafield={`${parentField}.tagline`}
              className='relative inline-block px-3 py-1 mb-8 text-md font-bold tracking-wide title-font z-20'
            >
              {data.tagline}
              <span className='absolute w-full h-full left-0 top-0 rounded-full -z-1 bg-current opacity-7'></span>
            </h2>
          )}
          {data.headline && (
            <h3
              data-tinafield={`${parentField}.headline`}
              className={`w-full relative mb-10 text-5xl font-extrabold tracking-normal leading-tight title-font`}
            >
              <span>{data.headline}</span>
            </h3>
          )}
          {data.text && (
            <div
              data-tinafield={`${parentField}.text`}
              className={`prose prose-lg mx-auto lg:mx-0 mb-10 ${
                data.color === 'primary' ? `prose-primary` : `dark:prose-dark`
              }`}
            >
              <RichText content={data.text} />
            </div>
          )}
          {data.actions && (
            <Actions
              parentField={`${parentField}.actions`}
              className='justify-center lg:justify-start py-2'
              parentColor={data.color}
              actions={data.actions}
            />
          )}
        </div>
        {data.image &&
          (() => {
            const imgSrc = sanitizeImageSrc(data.image.src);
            if (!imgSrc) return null;
            return (
              <div
                data-tinafield={`${parentField}.image`}
                className='relative row-start-1 lg:col-span-2 flex justify-center'
              >
                {/* Decorative gradient blur background instead of duplicate image */}
                <div
                  className='absolute w-full rounded-lg max-w-xs lg:max-w-none h-full blur-2xl opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-hard-light'
                  style={{
                    background: `linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(168, 85, 247, 0.4))`,
                  }}
                  aria-hidden='true'
                />
                <Image
                  className='relative z-10 w-full max-w-xs rounded-lg lg:max-w-none h-auto'
                  alt={data.image.alt || ''}
                  src={imgSrc}
                  width={800}
                  height={600}
                  style={{ height: 'auto' }}
                />
              </div>
            );
          })()}
      </Container>
    </Section>
  );
};

export const heroBlockSchema = {
  name: 'hero',
  label: 'Hero',
  ui: {
    previewSrc: '/blocks/hero.png',
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: 'This Big Text is Totally Awesome',
      text: 'Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.',
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Tagline',
      name: 'tagline',
    },
    {
      type: 'string',
      label: 'Headline',
      name: 'headline',
    },
    {
      label: 'Text',
      name: 'text',
      type: 'rich-text',
    },
    {
      type: 'object',
      label: 'Image',
      name: 'image',
      fields: [
        {
          type: 'string',
          label: 'Source',
          name: 'src',
          ui: {
            component: 'image',
          },
        },
        {
          type: 'string',
          label: 'Alt Text',
          name: 'alt',
        },
      ],
    },
    actionsFieldSchema,
    colorFieldSchema,
  ],
};
