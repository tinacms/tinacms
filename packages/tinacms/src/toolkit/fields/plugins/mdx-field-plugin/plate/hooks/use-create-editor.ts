'use client';

import type { Value } from '@udecode/plate';

import { usePlateEditor } from '@udecode/plate/react';

export const useCreateEditor = ({
  plugins,
  value,
  components = {},
}: {
  plugins: any[];
  value: Value;
  components?: Record<string, any>;
}) => {
  return usePlateEditor<Value, (typeof plugins)[number]>({
    plugins,
    value,
    components,
  });
};
