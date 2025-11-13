import React from 'react';
import { toast as sonnerToast, Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Helper to parse URLs in text and make them clickable
const parseUrlsInText = (text: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a
          key={index}
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='underline hover:opacity-80'
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Wrapper around sonner toast that handles URL parsing
const toast = {
  success: (message: string | React.ReactNode, options?: any) => {
    const content =
      typeof message === 'string' ? parseUrlsInText(message) : message;
    return sonnerToast.success(content, options);
  },
  error: (message: string | React.ReactNode, options?: any) => {
    const content =
      typeof message === 'string' ? parseUrlsInText(message) : message;
    return sonnerToast.error(content, options);
  },
  warning: (message: string | React.ReactNode, options?: any) => {
    const content =
      typeof message === 'string' ? parseUrlsInText(message) : message;
    return sonnerToast.warning(content, options);
  },
  info: (message: string | React.ReactNode, options?: any) => {
    const content =
      typeof message === 'string' ? parseUrlsInText(message) : message;
    return sonnerToast.info(content, options);
  },
  dismiss: sonnerToast.dismiss,
};

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className='toaster group'
      position='bottom-center'
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton:
            'group-[.toast]:bg-transparent group-[.toast]:text-current group-[.toast]:border-0',
          success:
            'group-[.toaster]:bg-green-100 group-[.toaster]:border-green-200 group-[.toaster]:text-green-600',
          error:
            'group-[.toaster]:bg-red-100 group-[.toaster]:border-red-200 group-[.toaster]:text-red-600',
          warning:
            'group-[.toaster]:bg-yellow-100 group-[.toaster]:border-yellow-200 group-[.toaster]:text-yellow-600',
          info: 'group-[.toaster]:bg-blue-100 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-600',
        },
      }}
      {...props}
    />
  );
};

export { toast, Toaster };
