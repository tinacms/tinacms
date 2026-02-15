'use client';
import { Card, CardHeader } from '../ui/card';
import { Section } from '../layout/section';

// Helper for tinaField markers
const tinaField = (data: any, fieldName?: string) => {
  return fieldName ? `${fieldName}` : '';
};

export interface FeatureItem {
  title: string;
  text?: string;
  icon?: {
    name?: string;
    color?: string;
  };
}

export interface FeaturesBlock {
  _template: 'features';
  title: string;
  description?: string;
  imageList?: string[];
  hidden?: string;
  booleanLabels?: boolean;
  boolean?: boolean;
  checkbox?: string[];
  checkboxInline?: string[];
  categoriesOther?: string[];
  radioGroup?: string;
  radioGroupInline?: string;
  buttonToggle?: string;
  buttonToggleIcon?: string;
  buttonToggleVertical?: string;
  select?: string;
  items?: (string | FeatureItem)[];
  background?: string;
}

export default function Features({ data }: { data: FeaturesBlock }) {
  return (
    <Section background={data.background}>
      <div className="@container mx-auto max-w-5xl">
        <div className="text-center">
          <h2 data-tina-field={tinaField(data, 'title')} className="text-balance text-4xl font-semibold lg:text-5xl">
            {data.title}
          </h2>
          {data.description && (
            <p data-tina-field={tinaField(data, 'description')} className="mt-4 text-gray-600">
              {data.description}
            </p>
          )}
        </div>
        <Card className="@min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden md:mt-16">
          {data.items?.map((item, idx) => {
            const isObject = typeof item === 'object' && item !== null;
            const title = isObject ? item.title : item;
            const text = isObject ? item.text : undefined;
            const icon = isObject ? item.icon : undefined;
            
            return (
              <div key={idx} data-tina-field={tinaField(item)} className="group text-center">
                <CardHeader className="pb-3">
                  {icon?.name && (
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold">
                      {icon.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  {text && (
                    <p className="mt-2 text-sm text-gray-600">{text}</p>
                  )}
                </CardHeader>
              </div>
            );
          })}
        </Card>

        {data.checkbox && data.checkbox.length > 0 && (
          <div className="mt-12 p-6 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">Checkbox Items</h3>
            <div className="space-y-2">
              {data.checkbox.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <input type="checkbox" disabled defaultChecked className="w-4 h-4" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {data.categoriesOther && data.categoriesOther.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {data.categoriesOther.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
