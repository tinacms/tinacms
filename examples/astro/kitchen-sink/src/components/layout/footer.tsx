import React from 'react';
import {
  BiLogoGithub,
  BiLogoTwitter,
  BiLogoFacebook,
  BiLogoInstagram,
} from 'react-icons/bi';
import { Container } from './container';
import { Icon } from './icon';
import { cn } from '@/lib/utils';

interface SocialLink {
  icon?: string | null;
  url?: string | null;
}

interface FooterProps {
  social?: Array<SocialLink | null>;
}

export const Footer = ({ social = [] }: FooterProps) => {
  const socialIconClasses = 'h-7 w-auto';

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
          <a
            href='/'
            className='group mx-2 flex items-center font-bold tracking-tight text-gray-400 dark:text-gray-300 opacity-50 hover:opacity-100 transition duration-150 ease-out whitespace-nowrap'
          >
            <Icon
              data={{
                name: 'Tina',
                style: 'float',
              }}
              className='inline-block h-10 w-auto group-hover:text-orange-500'
            />
          </a>
          <div className='flex gap-4'>
            {social?.map((item, index) => {
              if (!item) return null;
              const SocialIcon = socialIconMap[item.icon?.toLowerCase() ?? ''];
              if (!SocialIcon || !item.url) return null;
              return (
                <a
                  key={index}
                  className='inline-block opacity-80 hover:opacity-100 transition ease-out duration-150'
                  href={item.url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <SocialIcon
                    className={cn(
                      socialIconClasses,
                      'text-theme-500 dark:text-theme-400 hover:text-theme-300'
                    )}
                  />
                </a>
              );
            })}
          </div>
        </div>
        <div className='absolute h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent top-0 left-4 right-4 opacity-5' />
      </Container>
    </footer>
  );
};
