import React from 'react';
import { cn } from '@utils/cn';

export const PopupModal = ({ className = '', style = {}, ...props }) => (
  <div
    className={cn(
      'block z-0 overflow-visible bg-gray-50 rounded-[5px] my-10 mx-auto w-[800px] max-w-[90%]',
      className
    )}
    style={{
      animation: 'popup-down 150ms ease-out 1',
      ...style,
    }}
    {...props}
  />
);

/**
 * @alias [PopupModal]
 * @deprecated
 */
export const ModalPopup = PopupModal;
