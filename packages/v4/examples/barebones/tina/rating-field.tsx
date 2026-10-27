import { type ValidatorRef, definePlugin } from '@tinacms/tinacms';
import { defineClientPlugin } from '@tinacms/tinacms/client';
import {
  useFieldAddress,
  useFieldFrame,
  useFieldValue,
} from '@tinacms/tinacms/react';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';

// TODO: this won't be needed once we are building 't' from all plugins.
export const rating = (config: {
  name: string;
  label?: string;
  validators?: ValidatorRef[];
}) => ({
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
          const frame = useFieldFrame();
          const current = value ?? 0;

          return (
            <FieldWrapper {...frame}>
              <div
                role='radiogroup'
                aria-labelledby={frame.labelId}
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
            </FieldWrapper>
          );
        },
        defaultValue: 0,
        metadata: { layout: 'inline', labelable: false },
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
