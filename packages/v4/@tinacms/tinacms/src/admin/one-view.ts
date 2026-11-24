import { createContext } from 'react';

export type DocumentView = 'form' | 'preview';

/**
 * One view shows the form or the preview, never both. A phone is always in one view; a tablet
 * enters it with Maximise. The preview keeps its place in the page; the view that is not shown
 * is hidden, not unmounted.
 */
export interface OneView {
  active: boolean;
  view: DocumentView;
  setView: (view: DocumentView) => void;
  /** True at tablet width: the form header and the preview toolbar offer Maximise. */
  canMaximise: boolean;
  /** Enters one view from the side that asked, or restores the split. */
  toggleMaximise: (from: DocumentView) => void;
}

export const OneViewContext = createContext<OneView>({
  active: false,
  view: 'form',
  setView: () => {},
  canMaximise: false,
  toggleMaximise: () => {},
});
