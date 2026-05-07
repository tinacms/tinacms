'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  color?: string | null;
  className?: string;
}

const sectionColorCss: Record<string, string> = {
  default:
    'text-gray-800 dark:text-gray-50 bg-gradient-to-tl from-gray-50 dark:from-gray-900 via-transparent to-transparent',
  tint: 'text-gray-900 dark:text-gray-100 bg-gradient-to-br from-gray-100 dark:from-gray-1000 to-transparent',
  primary:
    'text-theme-on bg-theme-500 bg-gradient-to-br from-theme-500 to-theme-600',
};

export const Section = ({
  children,
  color = '',
  className = '',
}: SectionProps) => {
  const colorCss = sectionColorCss[color ?? ''] ?? sectionColorCss.default;

  return (
    <section
      className={cn(
        'flex-1 relative transition duration-150 ease-out body-font overflow-hidden',
        colorCss,
        className
      )}
    >
      {children}
    </section>
  );
};
