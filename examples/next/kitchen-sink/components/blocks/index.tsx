'use client';

import Hero, { type HeroBlock } from './hero';
import Features, { type FeaturesBlock } from './features';
import CTA, { type CTABlock } from './cta';

type Block = HeroBlock | FeaturesBlock | CTABlock;

interface BlockRendererProps {
  blocks?: Block[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-900 rounded border border-yellow-200">
        No blocks to render
      </div>
    );
  }

  return (
    <>
      {blocks.map((block, idx) => {
        switch (block._template) {
          case 'hero':
            return <Hero key={idx} data={block as HeroBlock} />;
          case 'features':
            return <Features key={idx} data={block as FeaturesBlock} />;
          case 'cta':
            return <CTA key={idx} data={block as CTABlock} />;
          default:
            return (
              <div
                key={idx}
                className="p-6 bg-red-50 border border-red-200 rounded text-red-900 mx-6"
              >
                Unknown block type: {(block as any)._template}
              </div>
            );
        }
      })}
    </>
  );
}
