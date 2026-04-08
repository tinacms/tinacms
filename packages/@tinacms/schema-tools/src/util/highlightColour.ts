/**
 * Represents a rich-text highlight color as an RGBA value.
 *
 * Use this class for `overrides.highlightColors[].value` to define the
 * color applied by a custom highlight option in the editor toolbar.
 */
export class HighlightColour {
  private r: number;
  private g: number;
  private b: number;
  private a: number;
  constructor(r: number, g: number, b: number, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   * Creates a highlight color from a hex string in `RRGGBB` or `RRGGBBAA` format.
   * Invalid input falls back to opaque black.
   */
  static fromHex(hex: string) {
    if (!hex || typeof hex !== 'string') {
      return new HighlightColour(0, 0, 0, 1); // fallback
    }

    hex = hex.replace('#', '');
    let r = 0,
      g = 0,
      b = 0,
      a = 255;
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      a = parseInt(hex.slice(6, 8), 16);
    } else {
      return new HighlightColour(0, 0, 0, 1);
    }

    return new HighlightColour(r, g, b, a / 255);
  }

  /**
   * Returns the color as a CSS `rgba(...)` string.
   */
  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}
