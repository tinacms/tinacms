import * as React from 'react';
import { createPortal } from 'react-dom';

export type FormPortal = React.FC<{
  children(props: { zIndexShift: number }): React.ReactNode | null;
}>;

const FormPortalContext = React.createContext<FormPortal>(() => {
  return null;
});

export function useFormPortal() {
  return React.useContext(FormPortalContext);
}

type FormPortalProviderProps = {
  children?: React.ReactNode;
};

export const FormPortalProvider: React.FC<FormPortalProviderProps> = ({
  children,
}) => {
  const wrapperRef = React.useRef<any | null>(null);
  const zIndexRef = React.useRef<number>(0);

  const FormPortal = React.useCallback(
    (props: any) => {
      if (!wrapperRef.current) return null;

      return createPortal(
        props.children({ zIndexShift: (zIndexRef.current += 1) }),
        wrapperRef.current
      );
    },
    [wrapperRef, zIndexRef]
  );

  return (
    <FormPortalContext.Provider value={FormPortal}>
      <div ref={wrapperRef} className='relative w-full flex-1 overflow-hidden'>
        {children}
      </div>
    </FormPortalContext.Provider>
  );
};
