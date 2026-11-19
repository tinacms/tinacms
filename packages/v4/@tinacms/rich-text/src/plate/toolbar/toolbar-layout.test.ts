import { describe, expect, it } from 'vitest';
import { hasAnyTool, resolveToolbarLayout } from './toolbar-layout';

describe('resolveToolbarLayout', () => {
  it('places every tool with no override', () => {
    const layout = resolveToolbarLayout(undefined, 1);
    expect(layout.textStyle).toBe(true);
    expect(layout.inLine).toEqual([
      'bold',
      'italic',
      'link',
      'ul',
      'ol',
      'quote',
    ]);
    expect(layout.moreFormatting).toEqual([
      'strikethrough',
      'code',
      'highlight',
      'textColor',
    ]);
    expect(layout.inserts).toEqual([
      'image',
      'table',
      'codeBlock',
      'mermaid',
      'hr',
    ]);
    expect(layout.templates).toBe(true);
  });

  it('treats the override as an allow-list whose order is ignored', () => {
    const layout = resolveToolbarLayout(['hr', 'bold', 'quote'], 0);
    expect(layout.textStyle).toBe(false);
    expect(layout.inLine).toEqual(['bold', 'quote']);
    expect(layout.moreFormatting).toEqual([]);
    expect(layout.inserts).toEqual(['hr']);
    expect(layout.showInsert).toBe(true);
  });

  it('draws no Insert for Bold alone', () => {
    const layout = resolveToolbarLayout(['bold'], 0);
    expect(layout.showInsert).toBe(false);
    expect(layout.moreFormatting).toEqual([]);
  });

  it('draws no Insert whose only item is Image', () => {
    expect(resolveToolbarLayout(['image'], 0).showInsert).toBe(false);
  });

  it('ignores an unknown key and draws nothing for an empty list', () => {
    const layout = resolveToolbarLayout(['nope' as never, 'bold'], 0);
    expect(layout.inLine).toEqual(['bold']);
    expect(hasAnyTool(resolveToolbarLayout([], 3))).toBe(false);
  });

  it('shows templates only when embed is allowed', () => {
    expect(resolveToolbarLayout(['bold'], 2).templates).toBe(false);
    expect(resolveToolbarLayout(['embed'], 2).showInsert).toBe(true);
  });
});
