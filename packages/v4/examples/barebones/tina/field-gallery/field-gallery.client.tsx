import { defineClientPlugin } from '@tinacms/tinacms/client';
import { FieldGalleryScreen } from './gallery-screen';

const GalleryIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden='true'
    viewBox='0 0 16 16'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    className={className}
  >
    <rect x='2.5' y='2.5' width='4.5' height='4.5' rx='1' />
    <rect x='9' y='2.5' width='4.5' height='4.5' rx='1' />
    <rect x='2.5' y='9' width='4.5' height='4.5' rx='1' />
    <rect x='9' y='9' width='4.5' height='4.5' rx='1' />
  </svg>
);

export default defineClientPlugin({
  screens: [
    {
      name: 'field-gallery',
      label: 'Field gallery',
      component: FieldGalleryScreen,
    },
  ],
  slots: {
    globalNav: [
      {
        label: 'Field gallery',
        icon: GalleryIcon,
        target: { kind: 'screen', screen: 'field-gallery' },
        order: 6,
      },
    ],
  },
});
