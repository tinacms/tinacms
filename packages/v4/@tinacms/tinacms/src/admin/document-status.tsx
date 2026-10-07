import { Badge } from '@tinacms/ui/components/badge';
import { cn } from '@tinacms/ui/lib/utils';
import { Check, CircleDot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormId } from '../editor/hooks';
import { type FormId, useFormStatus, useLastSaved } from '../form/form-store';

export const SAVED_CONFIRMATION_MS = 3000;
const FADE_MS = 400;

type Phase = 'fresh' | 'fading' | 'settled';

const phaseAt = (elapsed: number): Phase => {
  if (elapsed >= SAVED_CONFIRMATION_MS) return 'settled';
  return elapsed >= SAVED_CONFIRMATION_MS - FADE_MS ? 'fading' : 'fresh';
};

const savedTime = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

function SavedConfirmation({
  savedAt,
  showTime,
}: {
  savedAt: number;
  showTime: boolean;
}) {
  const [phase, setPhase] = useState(() => phaseAt(Date.now() - savedAt));
  useEffect(() => {
    const elapsed = Date.now() - savedAt;
    setPhase(phaseAt(elapsed));
    if (elapsed >= SAVED_CONFIRMATION_MS) return;
    const timers = [
      setTimeout(
        () => setPhase('fading'),
        Math.max(0, SAVED_CONFIRMATION_MS - FADE_MS - elapsed)
      ),
      setTimeout(
        () => setPhase('settled'),
        Math.max(0, SAVED_CONFIRMATION_MS - elapsed)
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, [savedAt]);

  if (phase !== 'settled') {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1 text-xs font-medium transition-opacity motion-reduce:transition-none',
          phase === 'fading' ? 'opacity-0' : null
        )}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        <Check className='size-3.5 text-status-published' aria-hidden='true' />
        Saved
      </span>
    );
  }
  if (!showTime) return null;
  return (
    // The status region already announced "Saved". The time is for reading.
    <span
      aria-live='off'
      className='inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground'
    >
      <Check className='size-3.5' aria-hidden='true' />
      Saved {savedTime(savedAt)}
    </span>
  );
}

export function FormStatusBadge({
  formId,
  showTime = false,
}: {
  formId: FormId;
  showTime?: boolean;
}) {
  const status = useFormStatus(formId);
  const savedAt = useLastSaved(formId);
  if (status === 'dirty') {
    return (
      <Badge variant='changed'>
        <CircleDot data-icon='inline-start' aria-hidden='true' />
        Unsaved
      </Badge>
    );
  }
  if (status === 'clean' && savedAt !== undefined) {
    return <SavedConfirmation savedAt={savedAt} showTime={showTime} />;
  }
  return null;
}

export function DocumentStatus() {
  return (
    <span role='status' className='flex'>
      <FormStatusBadge formId={useFormId()} showTime />
    </span>
  );
}
