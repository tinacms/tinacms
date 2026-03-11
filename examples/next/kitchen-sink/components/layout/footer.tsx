'use client';

import React from 'react';
import Link from 'next/link';
import {
  BiLogoGithub,
  BiLogoTwitter,
  BiLogoFacebook,
  BiLogoInstagram,
} from 'react-icons/bi';
import { useLayout } from './layout-context';
import { Container } from './container';
import { Icon } from './icon';
import { socialIconColorClasses } from '@/lib/utils';

export const Footer = () => {
  const { globalSettings, theme } = useLayout();

  const footer = globalSettings?.footer;
  const socialIconClasses = 'h-7 w-auto';

  const iconColorClass =
    socialIconColorClasses[theme.color] || socialIconColorClasses.blue;

  const socialIconMap: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    github: BiLogoGithub,
    twitter: BiLogoTwitter,
    facebook: BiLogoFacebook,
    instagram: BiLogoInstagram,
  };

  return (
    <footer className='bg-gradient-to-br text-gray-800 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000'>
      <Container className='relative' size='small'>
        <div className='flex justify-between items-center gap-6 flex-wrap'>
          <Link
            href='/'
            className='group mx-2 flex items-center font-bold tracking-tight text-gray-400 dark:text-gray-300 opacity-50 hover:opacity-100 transition duration-150 ease-out whitespace-nowrap'
          >
            <Icon
              parentColor='default'
              data={{
                name: 'Tina',
                color: theme.color,
                style: 'float',
              }}
              className='inline-block h-10 w-auto group-hover:text-orange-500'
            />
          </Link>
          <div className='flex gap-4'>
            {footer?.social?.map(
              (social: Record<string, unknown>, index: number) => {
                const SocialIcon =
                  socialIconMap[social.icon?.toLowerCase() || ''];
                if (!SocialIcon || !social.url) return null;
                return (
                  <a
                    key={index}
                    className='inline-block opacity-80 hover:opacity-100 transition ease-out duration-150'
                    href={social.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <SocialIcon
                      className={`${socialIconClasses} ${iconColorClass}`}
                    />
                  </a>
                );
              }
            )}
          </div>
        </div>
        <div className='absolute h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent top-0 left-4 right-4 opacity-5' />
      </Container>
    </footer>
  );
};
