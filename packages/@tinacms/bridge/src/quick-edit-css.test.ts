import { describe, expect, it } from 'vitest';
import { QUICK_EDIT_CSS } from './quick-edit-css';

interface FlatRule {
  rule: CSSStyleRule;
  /** True when the rule sits inside an `@media (hover: hover)` block. */
  gatedToHover: boolean;
}

/**
 * Parse QUICK_EDIT_CSS through the DOM's CSSOM and flatten it into style rules
 * tagged with whether they are gated behind `@media (hover: hover)`, so we can
 * assert on *which declarations* reach touch devices rather than on brittle
 * substring matching of the raw source.
 */
function flatten(css: string): FlatRule[] {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  const rules = Array.from((style.sheet as CSSStyleSheet).cssRules);
  style.remove();

  const out: FlatRule[] = [];
  for (const r of rules) {
    if (r.type === CSSRule.STYLE_RULE) {
      out.push({ rule: r as CSSStyleRule, gatedToHover: false });
    } else if (r.type === CSSRule.MEDIA_RULE) {
      const media = r as CSSMediaRule;
      const isHoverGate =
        media.media.mediaText.replace(/\s+/g, '') === '(hover:hover)';
      for (const inner of Array.from(media.cssRules)) {
        if (inner.type === CSSRule.STYLE_RULE) {
          out.push({
            rule: inner as CSSStyleRule,
            gatedToHover: isHoverGate,
          });
        }
      }
    }
  }
  return out;
}

/** The full-bleed blue fill: an inset box-shadow wash. */
function paintsWash(style: CSSStyleDeclaration): boolean {
  return style.boxShadow.includes('inset');
}

/** Reveals the overlay's blue `::after` layer (opacity 0 -> 1). */
function revealsOverlay(rule: CSSStyleRule): boolean {
  return rule.selectorText.includes('::after') && rule.style.opacity === '1';
}

function hasSolidOutline(style: CSSStyleDeclaration): boolean {
  return (
    (style.outline || style.getPropertyValue('outline')).includes('solid') ||
    style.getPropertyValue('outline-style') === 'solid'
  );
}

describe('QUICK_EDIT_CSS', () => {
  it('gates the blue wash behind @media (hover: hover)', () => {
    const flat = flatten(QUICK_EDIT_CSS);

    // The wash floods the whole tapped element blue. On touch, :hover latches
    // after a tap and never clears, so an ungated wash stays stuck on screen.
    const washRules = flat.filter(
      ({ rule }) => paintsWash(rule.style) || revealsOverlay(rule)
    );
    // Sanity: we actually located the wash-producing rules.
    expect(washRules.length).toBeGreaterThan(0);
    for (const { rule, gatedToHover } of washRules) {
      expect(
        gatedToHover,
        `${rule.selectorText} paints the wash but is not gated behind (hover: hover)`
      ).toBe(true);
    }
  });

  it('keeps the solid outline available without hover (touch tap feedback)', () => {
    const flat = flatten(QUICK_EDIT_CSS);

    // A stuck solid outline is acceptable; it still tells a touch user which
    // element they selected. So the solid-outline hover rules must NOT be
    // gated to hover-capable devices.
    const solidOutline = flat.filter(
      ({ rule, gatedToHover }) =>
        !gatedToHover &&
        rule.selectorText.includes(':hover') &&
        hasSolidOutline(rule.style)
    );
    const selectors = solidOutline.map((f) => f.rule.selectorText);
    expect(selectors.some((s) => s.startsWith('[data-tina-field]'))).toBe(true);
    expect(selectors.some((s) => s.includes('data-tina-field-overlay'))).toBe(
      true
    );
  });

  it('keeps the resting dashed outline unconditional', () => {
    const flat = flatten(QUICK_EDIT_CSS);
    const topLevel = flat
      .filter((f) => !f.gatedToHover)
      .map((f) => f.rule.selectorText);
    expect(topLevel).toContain('[data-tina-field]');
    expect(topLevel).toContain('[data-tina-field-overlay]');
  });
});
