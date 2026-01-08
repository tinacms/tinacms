import * as React from 'react';

export const ModalActions = ({ align = 'between', children }) => {
  return (
    <div
      className={`w-full flex flex-wrap-reverse justify-${align} gap-4 items-center px-5 pb-5 rounded-b-md`}
    >
      {children}
    </div>
  );
};
