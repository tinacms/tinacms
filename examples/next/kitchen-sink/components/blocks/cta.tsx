'use client';
import Link from 'next/link';
import { Section } from '../layout/section';

// Helper for tinaField markers
const tinaField = (data: any, fieldName?: string) => {
  return fieldName ? `${fieldName}` : '';
};

export interface CTABlock {
  _template: 'cta';
  title: string;
  description?: string;
  actions?: Array<{
    label: string;
    url: string;
    variant?: 'primary' | 'secondary' | 'simple';
  }>;
  background?: string;
}

export default function CTA({ data }: { data: CTABlock }) {
  return (
    <Section background={data.background || 'bg-indigo-50/80'}>
      <div className="text-center">
        <h2 data-tina-field={tinaField(data, 'title')} className="text-balance text-4xl font-semibold lg:text-5xl text-gray-900">
          {data.title}
        </h2>
        {data.description && (
          <p data-tina-field={tinaField(data, 'description')} className="mt-4 text-gray-600 max-w-2xl mx-auto">
            {data.description}
          </p>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {data.actions &&
            data.actions.map((action) => (
              <div
                key={action!.label}
                className="bg-white/10 rounded-lg border border-gray-200 p-0.5"
              >
                <Link
                  href={action!.url}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md font-medium text-base transition-colors ${
                    action!.variant === 'secondary'
                      ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {action!.label}
                </Link>
              </div>
            ))}
        </div>
      </div>
    </Section>
  );
}
