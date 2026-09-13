/**
 * Shared CSS for the quick-edit outline. Used by both the vanilla bridge
 * (click-to-focus.ts) and the React `useTina` hook (packages/tinacms/src/react.tsx),
 * so the visible affordance is identical regardless of which integration
 * the consumer is running.
 */
export const QUICK_EDIT_CSS = `
  [data-tina-field] {
    outline: 2px dashed rgba(34,150,254,0.5);
    transition: box-shadow ease-out 150ms;
  }
  [data-tina-field]:hover {
    outline: 2px solid rgba(34,150,254,1);
    cursor: pointer;
  }
  [data-tina-field-overlay] {
    outline: 2px dashed rgba(34,150,254,0.5);
    position: relative;
  }
  [data-tina-field-overlay]:hover {
    outline: 2px solid rgba(34,150,254,1);
    cursor: pointer;
  }
  [data-tina-field-overlay]::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 20;
    transition: opacity ease-out 150ms;
    background-color: rgba(34,150,254,0.3);
    opacity: 0;
  }
  /*
   * Only the blue fill/wash is gated to hover-capable pointers. On touch
   * screens (hover: none) :hover latches after a tap and never clears; a
   * stuck solid outline is acceptable tap feedback, but the full-bleed wash
   * flooding the tapped element is not. The solid outline above still applies
   * on touch; only the box-shadow wash and the overlay reveal are held back.
   */
  @media (hover: hover) {
    [data-tina-field]:hover {
      box-shadow: inset 100vi 100vh rgba(34,150,254,0.3);
    }
    [data-tina-field-overlay]:hover::after {
      opacity: 1;
    }
  }
`;

export const QUICK_EDIT_BODY_CLASS = '__tina-quick-editing-enabled';
export const QUICK_EDIT_STYLE_ID = '__tina-bridge-quick-edit-style';
