import React from 'react';

export const LOADING_MESSAGES = [
  'Hang tight, TinaCMS is looking for llamas 🦙 🦙 🦙',
  'Reticulating llama splines 🦙',
  'Herding llamas into collections 🦙',
  'Brushing llama fur 🦙 🦙',
  'Teaching a llama to write frontmatter 🦙',
  'Feeding the GraphQL llama 🦙',
  'Counting llamas in your content folder 🦙',
  'Asking a llama what changed in git 🦙',
  'Llamas are proofreading your schema 🦙',
  'Untangling markdown with llama teeth 🦙',
  'Waking the llamas in the media library 🦙',
  'Alphabetising llamas by collection 🦙',
  'Convincing a llama that MDX is fine 🦙',
  'Saddling up the content layer 🦙',
  'Polishing the sidebar, llama style 🦙',
  'One more llama, almost there 🦙',
];

const CYCLE_MS = 1000;
const FADE_MS = 200;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const pickOther = (current: number, length: number) => {
  if (length < 2) return 0;
  const offset = 1 + Math.floor(Math.random() * (length - 1));
  return (current + offset) % length;
};

interface LoadingMessageProps {
  className?: string;
  style?: React.CSSProperties;
  messages?: string[];
}

export const LoadingMessage = ({
  className,
  style,
  messages = LOADING_MESSAGES,
}: LoadingMessageProps) => {
  const [index, setIndex] = React.useState(0);
  // Server and first client render must agree, so randomise once mounted.
  const [visible, setVisible] = React.useState(false);
  const [reducedMotion] = React.useState(prefersReducedMotion);

  React.useEffect(() => {
    setIndex((current) => pickOther(current, messages.length));
    setVisible(true);
  }, [messages.length]);

  React.useEffect(() => {
    const fadeOut = setTimeout(() => setVisible(false), CYCLE_MS - FADE_MS);
    const next = setTimeout(() => {
      setIndex((current) => pickOther(current, messages.length));
      setVisible(true);
    }, CYCLE_MS);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(next);
    };
  }, [index, messages.length]);

  return (
    <p
      className={className}
      aria-live='polite'
      style={{
        ...style,
        opacity: reducedMotion || visible ? 1 : 0,
        transform: reducedMotion || visible ? 'none' : 'translateY(4px)',
        transition: reducedMotion
          ? undefined
          : `opacity ${FADE_MS}ms ease-out, transform ${FADE_MS}ms ease-out`,
      }}
    >
      {messages[index]}
    </p>
  );
};
