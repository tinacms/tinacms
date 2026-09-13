import { definePlugin } from '@tinacms/tinacms';
import { defineClientPlugin } from '@tinacms/tinacms/client';
import {
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '@tinacms/tinacms/react';

// TODO: this won't be needed once we are building 't' from all plugins.
export const rating = (config: { name: string; label?: string }) => ({
  ...config,
  type: 'rating' as const,
});

export const ratingFieldPlugin = definePlugin({
  name: 'example:field:rating',
  provides: ['field'],
  field: { type: 'rating', contractVersion: 1 },
  client: async () => ({
    default: defineClientPlugin({
      field: {
        Component: function RatingField() {
          const address = useFieldAddress();
          const [value, setValue] = useFieldValue<number>(address);
          const errors = useFieldErrors(address);
          const current = value ?? 0;

          return (
            <div className='grid gap-1.5'>
              <div
                role='radiogroup'
                aria-label={address}
                className='flex gap-0.5'
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    role='radio'
                    aria-checked={star === current}
                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                    onClick={() => setValue(star === current ? 0 : star)}
                    className='text-xl leading-none text-amber-500'
                  >
                    {star <= current ? '★' : '☆'}
                  </button>
                ))}
              </div>
              {errors.map((error) => (
                <span
                  key={error}
                  role='alert'
                  className='text-sm text-destructive'
                >
                  {error}
                </span>
              ))}
            </div>
          );
        },
        defaultValue: 0,
        metadata: { layout: 'inline' },
        validate: (value) => {
          const stars = value as number | undefined;
          if (stars === undefined) return null;
          if (Number.isInteger(stars) && stars >= 0 && stars <= 5) return null;
          return 'A rating is 0 to 5 whole stars.';
        },
      },
    }),
  }),
});
