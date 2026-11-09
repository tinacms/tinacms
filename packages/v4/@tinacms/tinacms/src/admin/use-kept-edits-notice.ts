import { toast } from '@tinacms/ui/components/toast';
import { useEffect, useRef } from 'react';
import { useBranchView } from '../editor/branch';
import { toFieldAddress } from '../core/field/address';
import { formStatus, readFormStore, toFormId } from '../form/form-store';
import type { AdminRoute } from './routing';

const fileName = (path: string) => path.split('/').at(-1) ?? path;
const noticeId = (path: string) => `kept-edits:${path}`;

/**
 * Leaving a document that holds unsaved edits never asks and never blocks. A
 * notice says the edits stay in this browser and offers a way back to them.
 */
export function useKeptEditsNotice(
  route: AdminRoute,
  navigate: (route: AdminRoute) => void
) {
  const previous = useRef(route);
  const branch = useBranchView()?.name;
  useEffect(() => {
    const left = previous.current;
    previous.current = route;
    if (route.view === 'document') toast.dismiss(noticeId(route.path));
    if (left.view !== 'document') return;
    if (
      route.view === 'document' &&
      route.collection === left.collection &&
      route.path === left.path
    ) {
      return;
    }
    const scope = readFormStore().forms[toFormId(left.path)];
    if (formStatus(scope) !== 'dirty') return;
    if (readFormStore().unstored[toFormId(left.path)]) return;
    const named =
      scope?.status === 'edited' ? scope.values[toFieldAddress('title')] : null;
    const title =
      typeof named === 'string' && named.trim() !== ''
        ? named
        : fileName(left.path);
    toast({
      id: noticeId(left.path),
      tone: 'info',
      title: `Edits to “${title}” are kept in this browser`,
      text: branch ? `Still unsaved on ${branch}.` : undefined,
      dismissible: true,
      action: { label: 'Open', onClick: () => navigate(left) },
    });
  }, [route, branch, navigate]);
}
