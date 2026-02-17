'use client';

import type { Value } from 'platejs';

import { usePlateEditor } from 'platejs/react';

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
