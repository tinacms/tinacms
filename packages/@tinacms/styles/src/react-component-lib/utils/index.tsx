import React from 'react';

export const dashToPascalCase = (str: string) =>
  str
    .toLowerCase()
    .split('-')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

export interface ReactProps {
  class?: string;
}

export type IonicReactExternalProps<PropType, ElementType> = PropType & React.HTMLAttributes<ElementType> & ReactProps;

export const createForwardRef = <PropType, ElementType>(
  ReactComponent: any,
  displayName: string,
) => {
  const forwardRef = (
    props: IonicReactExternalProps<PropType, ElementType>,
    ref: React.Ref<ElementType>,
  ) => {
    return <ReactComponent {...props} forwardedRef={ref} />;
  };
  forwardRef.displayName = displayName;

  return React.forwardRef(forwardRef);
};

export * from './attachEventProps';
