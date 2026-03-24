import { Actions } from '@/components/layout/actions';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { customComponents } from '@/components/markdown-components';
import { cn, sanitizeImageSrc } from '@/lib/utils';
import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface HeroProps {
  data: any;
}

export const Hero = ({ data }: HeroProps) => {
  return (
    <Section color={data.color}>
      <Container
        size='large'
        className='grid grid-cols-1 lg:grid-cols-5 gap-14 items-center justify-center'
      >
        <div className='row-start-2 lg:row-start-1 lg:col-span-3 text-center lg:text-left'>
          {data.tagline && (
            <h2
              data-tina-field={tinaField(data, 'tagline')}
              className='relative inline-block px-3 py-1 mb-8 text-md font-bold tracking-wide title-font z-20'
            >
              {data.tagline}
              <span className='absolute w-full h-full left-0 top-0 rounded-full -z-1 bg-current opacity-7'></span>
            </h2>
          )}
          {data.headline && (
            <h3
              data-tina-field={tinaField(data, 'headline')}
              className='w-full relative mb-10 text-5xl font-extrabold tracking-normal leading-tight title-font'
            >
              <span>{data.headline}</span>
            </h3>
          )}
          {data.text && (
            <div
              data-tina-field={tinaField(data, 'text')}
              className={cn(
                'prose prose-lg mx-auto lg:mx-0 mb-10',
                data.color === 'primary' ? 'prose-primary' : 'dark:prose-dark'
              )}
            >
              <TinaMarkdown content={data.text} components={customComponents} />
            </div>
          )}
          {data.actions && (
            <div data-tina-field={tinaField(data, 'actions')}>
              <Actions
                className='justify-center lg:justify-start py-2'
                parentColor={data.color}
                actions={data.actions}
              />
            </div>
          )}
        </div>
        {data.image &&
          (() => {
            const imgSrc = sanitizeImageSrc(data.image.src);
            if (!imgSrc) return null;
            return (
              <div
                data-tina-field={tinaField(data, 'image')}
                className='relative row-start-1 lg:col-span-2 flex justify-center'
              >
                <div
                  className='absolute w-full rounded-lg max-w-xs lg:max-w-none h-full blur-2xl opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-hard-light'
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--theme-400) 60%, transparent), color-mix(in srgb, var(--theme-600) 40%, transparent))`,
                  }}
                  aria-hidden='true'
                />
                <img
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
