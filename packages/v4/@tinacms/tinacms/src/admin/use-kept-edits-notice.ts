import { toast } from '@tinacms/ui/components/toast';
import { useEffect, useRef } from 'react';
import { useBranchView } from '../editor/branch';
import type { ReferenceStep } from '../editor/preview-activate';
import { formStatus, readFormStore, toFormId } from '../form/form-store';
import { documentTitle } from './document-title';
import type { AdminRoute } from './routing';

type DocumentRoute = Extract<AdminRoute, { view: 'document' }>;

const noticeId = (path: string) => `kept-edits:${path}`;

/**
 * Leaving a document that holds unsaved edits never asks and never blocks. A
 * notice says the edits stay in this browser and offers a way back to them.
 * Entering a reference step keeps the document it came from open, so it says
 * nothing until the step is left for somewhere other than that document.
 */
export function useKeptEditsNotice(
  route: AdminRoute,
  navigate: (route: AdminRoute) => void,
  step: ReferenceStep | null = null
) {
  const previous = useRef<{ route: AdminRoute; step: ReferenceStep | null }>({
    route,
    step,
  });
  const branch = useBranchView()?.name;
  useEffect(() => {
    const { route: left, step: leftStep } = previous.current;
    previous.current = { route, step };
    if (route.view === 'document') toast.dismiss(noticeId(route.path));
    if (left.view !== 'document') return;
    if (
      route.view === 'document' &&
      route.collection === left.collection &&
      route.path === left.path
    ) {
      return;
    }
    const notify = (target: DocumentRoute) => {
      const scope = readFormStore().forms[toFormId(target.path)];
      if (formStatus(scope) !== 'dirty') return;
      if (readFormStore().unstored[toFormId(target.path)]) return;
      const title = documentTitle(target.path, scope?.values);
      toast({
        id: noticeId(target.path),
        tone: 'info',
        title: `Edits to “${title}” are kept in this browser`,
        text: branch ? `Still unsaved on ${branch}.` : undefined,
        dismissible: true,
        action: { label: 'Open', onClick: () => navigate(target) },
      });
    };
    const enteringStepFromLeft =
      route.view === 'document' && step?.from.path === left.path;
    if (!enteringStepFromLeft) notify(left);
    const stillLeadsBack =
      step !== null &&
      route.view === 'document' &&
      step.from.path === leftStep?.from.path;
    if (
      leftStep &&
      !stillLeadsBack &&
      !(route.view === 'document' && route.path === leftStep.from.path)
    ) {
      notify({
        view: 'document',
        collection: leftStep.from.collection,
        path: leftStep.from.path,
      });
    }
  }, [route, step, branch, navigate]);
}
