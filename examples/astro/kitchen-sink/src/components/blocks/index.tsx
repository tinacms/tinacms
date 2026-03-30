import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import { Content } from './content';
import { CTA } from './cta';
import { Features } from './features';
import { Hero } from './hero';
import { Testimonial } from './testimonial';

const typeNameMap: Record<string, string> = {
  PageBlocksHero: 'hero',
  PageBlocksFeatures: 'features',
  PageBlocksCta: 'cta',
  PageBlocksTestimonial: 'testimonial',
  PageBlocksContent: 'content',
};

export const Blocks = ({ blocks = [] }: { blocks?: Array<any | null> }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className='p-6 text-center text-gray-500'>No blocks to render</div>
    );
  }

  return (
    <>
      {blocks.map((block, i) => {
        if (!block) return null;
        const typename = block.__typename ?? '';
        const template = block._template || typeNameMap[typename] || typename;

        let content: React.ReactNode = null;
        switch (template) {
          case 'hero':
            content = <Hero data={block} />;
            break;
          case 'features':
            content = <Features data={block} />;
            break;
          case 'cta':
            content = <CTA data={block} />;
            break;
          case 'testimonial':
            content = <Testimonial data={block} />;
            break;
          case 'content':
            content = <Content data={block} />;
            break;
          default:
            return (
              <div
                key={i}
                className='p-4 bg-yellow-100 text-yellow-900 rounded'
              >
                Unknown block type: {template}
              </div>
            );
        }
        return (
          <div key={i} data-tina-field={tinaField(block)}>
            {content}
          </div>
        );
      })}
    </>
  );
};
