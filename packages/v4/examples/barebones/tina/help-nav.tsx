import { definePlugin } from '@tinacms/tinacms';
import { defineClientPlugin } from '@tinacms/tinacms/client';

// A sidebar entry for a screen of this project, and one for an external link.
// Both go in the `globalNav` slot of the client segment.
const HelpIcon = ({ className }: { className?: string }) => (
  <span aria-hidden className={className}>
    ?
  </span>
);

const DocsIcon = ({ className }: { className?: string }) => (
  <span aria-hidden className={className}>
    ↗
  </span>
);

function HelpScreen() {
  return (
    <div className='grid gap-2 p-4'>
      <h1 className='text-lg font-semibold'>Help</h1>
      <p className='text-sm text-muted-foreground'>
        Pick a collection on the left, then a document, to start editing.
      </p>
    </div>
  );
}

export const helpNavPlugin = definePlugin({
  name: 'example:help',
  client: async () => ({
    default: defineClientPlugin({
      screens: [{ name: 'help', label: 'Help', component: HelpScreen }],
      slots: {
        globalNav: [
          {
            label: 'Help',
            icon: HelpIcon,
            target: { kind: 'screen', screen: 'help' },
          },
          {
            label: 'TinaCMS docs',
            icon: DocsIcon,
            target: { kind: 'url', href: 'https://tina.io/docs' },
            order: 10,
          },
        ],
      },
    }),
  }),
});
