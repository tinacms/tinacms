import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionProps {
  background?: string;
  children: ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ className, children, background }) => {
  return (
    <div className={background || "bg-default"}>
      <section
        className={cn("py-12 mx-auto max-w-7xl px-6", className)}
      >
        {children}
      </section>
    </div>
  );
};

export const tailwindBackgroundOptions = [
  { label: "Default", value: "bg-default" },
  { label: "White", value: "bg-white/80" },
  { label: "Gray", value: "bg-gray-50/80" },
  { label: "Zinc", value: "bg-zinc-50" },
  { label: "Blue", value: "bg-blue-50/80" },
  { label: "Indigo", value: "bg-indigo-50/80" },
];

export const sectionBlockSchemaField = {
  type: "string",
  label: "Background",
  name: "background",
  options: tailwindBackgroundOptions,
};
