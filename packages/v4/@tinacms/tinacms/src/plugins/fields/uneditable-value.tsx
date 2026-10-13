import { Button } from '@tinacms/ui/components/button';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { useFieldAddress, useFieldErrors, useFieldValue } from '../../editor';

/**
 * Shows a stored value of the wrong shape read-only, so the document still
 * opens and a save keeps the value as it is (ADR-012). Clear sets `cleared`,
 * the empty value of the field's own editor.
 */
export function UneditableValue({
  problem,
  cleared,
}: {
  problem: string;
  cleared: [] | null;
}) {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<unknown>(address);
  const errors = useFieldErrors(address);

  return (
    <FieldWrapper errors={errors}>
      <div
        role='group'
        aria-labelledby={`${address}-label`}
        className='flex flex-col gap-2 rounded-md border border-dashed p-2'
      >
        <span className='text-sm'>{problem}</span>
        <pre className='overflow-x-auto rounded bg-muted/50 p-2 text-xs text-muted-foreground'>
          {JSON.stringify(value, null, 2)}
        </pre>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='self-start'
          onClick={() => setValue(cleared)}
        >
          Clear
        </Button>
      </div>
    </FieldWrapper>
  );
}
