import React from 'react';
import { toast as sonnerToast, Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Helper to parse URLs in text and make them clickable
// Ensures only links with allowed protocols get rendered as clickable links to avoid XSS.
const isSafeHref = (href: string) => {
  // Only allow http, https links -- can be expanded as needed
  return (
    /^https?:\/\//.test(href) &&
    !/^javascript:/i.test(href) &&
    !/^data:/i.test(href) &&
    !/^vbscript:/i.test(href)
  );
};

const parseUrlsInText = (text: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      if (isSafeHref(href)) {
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
      } else {
        // Render as plain text (not a link) if not safe
        return <span key={index}>{part}</span>;
      }
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
      position='top-left'
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-700',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton:
            'group-[.toast]:bg-transparent group-[.toast]:text-current group-[.toast]:border-0',
          success:
            'group-[.toaster]:border-green-500 [&_[data-icon]]:text-green-500 [&_[data-content]]:text-gray-700',
          error:
            'group-[.toaster]:border-red-500 [&_[data-icon]]:text-red-500 [&_[data-content]]:text-gray-700',
          warning:
            'group-[.toaster]:border-yellow-500 [&_[data-icon]]:text-yellow-500 [&_[data-content]]:text-gray-700',
          info: 'group-[.toaster]:border-blue-500 [&_[data-icon]]:text-blue-500 [&_[data-content]]:text-gray-700',
        },
      }}
      {...props}
    />
  );
};

export { toast, Toaster };
