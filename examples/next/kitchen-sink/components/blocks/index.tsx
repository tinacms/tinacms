'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { tinaField } from 'tinacms/dist/react';
import type {
  PageBlocks,
  PageBlocksHero,
  PageBlocksFeatures,
  PageBlocksCta,
  PageBlocksTestimonial,
  PageBlocksContent,
} from '@/tina/__generated__/types';

const Hero = dynamic(() => import('./hero').then((m) => ({ default: m.Hero })));
const Features = dynamic(() =>
  import('./features').then((m) => ({ default: m.Features }))
);
const CTA = dynamic(() => import('./cta').then((m) => ({ default: m.CTA })));
const Testimonial = dynamic(() =>
  import('./testimonial').then((m) => ({ default: m.Testimonial }))
);
const Content = dynamic(() =>
  import('./content').then((m) => ({ default: m.Content }))
);

const typeNameMap: Record<string, string> = {
  // New schema typenames (page.blocks.*)
  PageBlocksHero: 'hero',
  PageBlocksFeatures: 'features',
  PageBlocksCta: 'cta',
  PageBlocksTestimonial: 'testimonial',
  PageBlocksContent: 'content',
  // Legacy typenames (kept for backward compatibility before schema regen)
  PageBlockPageBlocksHero: 'hero',
  PageBlockPageBlocksFeatures: 'features',
  PageBlockPageBlocksCta: 'cta',
  PageBlockPageBlocksTestimonial: 'testimonial',
  PageBlockPageBlocksContent: 'content',
};

export const Blocks = ({
  blocks = [],
}: { blocks?: Array<PageBlocks | null> }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className='p-6 text-center text-gray-500'>No blocks to render</div>
    );
  }

  return (
    <>
      {blocks.map((block, i) => {
        if (!block) return null;
        // _template is a TinaCMS runtime field for legacy inline-editing support (not in schema types)
        const blockWithMeta = block as PageBlocks & { _template?: string };
        const typename = block.__typename ?? '';
        const template =
          blockWithMeta._template || typeNameMap[typename] || typename;

        let content: React.ReactNode = null;
        switch (template) {
          case 'hero':
            content = <Hero data={block as PageBlocksHero} />;
            break;
          case 'features':
            content = <Features data={block as PageBlocksFeatures} />;
            break;
          case 'cta':
            content = <CTA data={block as PageBlocksCta} />;
            break;
          case 'testimonial':
            content = <Testimonial data={block as PageBlocksTestimonial} />;
            break;
          case 'content':
            content = <Content data={block as PageBlocksContent} />;
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
