'use client';
import Link from 'next/link';
import { Section } from '../layout/section';
import RichText from '@/lib/richText';
import { Button } from '../ui/button';

// Helper for tinaField markers
const tinaField = (data: any, fieldName?: string) => {
  return fieldName ? `${fieldName}` : '';
};

export interface HeroBlock {
  _template: 'hero';
  headline: string;
  description?: string;
  actions?: Array<{
    label: string;
    url: string;
    variant?: 'primary' | 'secondary' | 'simple';
  }>;
  background?: string;
}

export default function Hero({ data }: { data: HeroBlock }) {
  return (
    <Section background={data.background}>
      <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
        {data.headline && (
          <h1 data-tina-field={tinaField(data, 'headline')} className="text-balance text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            {data.headline}
          </h1>
        )}
        {data.description && (
          <div data-tina-field={tinaField(data, 'description')} className="mx-auto mt-8 max-w-2xl text-balance text-lg text-gray-700">
            <RichText content={data.description} />
          </div>
        )}
        {data.actions && data.actions.length > 0 && (
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {data.actions.map((action, idx) => (
              <div
                key={idx}
                className="bg-white/10 rounded-lg border border-gray-200 p-0.5"
              >
                <Link
                  href={action.url}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md font-medium text-base transition-colors ${
                    action.variant === 'secondary'
                      ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {action.label}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
