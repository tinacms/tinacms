import React from 'react';
import type { CloudConfigPlugin } from '@toolkit/react-cloud-config';

interface NavCloudLinkProps {
  config: CloudConfigPlugin;
}

/**
 * Shared component for rendering cloud configuration links
 * Used across both admin and sidebar navigation
 */
export const NavCloudLink: React.FC<NavCloudLinkProps> = ({ config }) => {
  if (config.text) {
    return (
      <span className='text-base tracking-wide text-gray-500 flex items-center opacity-90'>
        {config.text}{' '}
        <a
          target='_blank'
          className='ml-1 text-blue-600 hover:opacity-60'
          href={config.link.href}
        >
          {config.link.text}
        </a>
      </span>
    );
  }
  return (
    <span className='text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100'>
      <config.Icon className='mr-2 h-6 opacity-80 w-auto' />
      <a target='_blank' href={config.link.href}>
        {config.link.text}
      </a>
    </span>
  );
};
