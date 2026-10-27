import { Button } from '@tinacms/ui/components/button';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import type { useDrillIn, useFieldFrame } from '../../editor';

interface DrillInFieldProps {
  frame: ReturnType<typeof useFieldFrame>;
  open: ReturnType<typeof useDrillIn>['open'];
}

export function DrillInField({ frame, open }: DrillInFieldProps) {
  return (
    <FieldWrapper {...frame}>
      <Button variant='secondary' iconEnd='chevron-right' onClick={open}>
        {`Open ${frame.label}`}
      </Button>
    </FieldWrapper>
  );
}
