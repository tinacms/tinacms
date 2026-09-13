import Image from 'next/image';
import React from 'react';
import { wrapFieldsWithMeta } from 'tinacms';

// PREBUILT_FIXTURE_NEXT_IMAGE — a component that pulls `next/image` (a CJS
// dependency that `require('react')`) into the admin bundle. If the production
// build hands next/image its own React copy instead of the deduped one, this
// field throws the classic "two copies of React" error at render time. A
// 1x1 transparent PNG data URI keeps next/image self-contained (no Next
// runtime image config needed).
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const FixtureField = wrapFieldsWithMeta(({ input }: any) => {
  return (
    <div>
      <input type='text' data-testid='fixture-field-input' {...input} />
      {/*
        Tailwind trap: `aspect-w-9` is a class the admin shell never uses (it
        only exists because the second Tailwind pass runs @tailwindcss/aspect-ratio
        over the co-located field code), and `bg-blue-500` must resolve to Tina's
        themed blue (rgb(0,132,255)), not stock Tailwind's.
      */}
      <div data-testid='tw-probe' className='aspect-w-9 bg-blue-500' />
      <Image
        data-testid='fixture-next-image'
        src={PIXEL}
        alt=''
        width={9}
        height={9}
        unoptimized
        loader={({ src }) => src}
      />
    </div>
  );
});
