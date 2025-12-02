import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, checkerboardStyle } from './color-utils';

describe('color-utils', () => {
  describe('hexToRgb', () => {
    it('converts valid hex to rgb', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('handles lowercase hex', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('converts black and white', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('')).toBeNull();
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GGG')).toBeNull();
      expect(hexToRgb('#12345')).toBeNull();
      expect(hexToRgb('FF0000')).toBeNull();
    });

    it('returns null for shorthand hex', () => {
      expect(hexToRgb('#F00')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('converts rgb to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    });

    it('converts black and white', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    it('pads single digit hex values', () => {
      expect(rgbToHex(1, 2, 3)).toBe('#010203');
    });
  });

  describe('hexToRgb and rgbToHex round-trip', () => {
    it('converts hex to rgb and back', () => {
      const originalHex = '#abc123';
      const rgb = hexToRgb(originalHex);
      expect(rgb).not.toBeNull();
      const resultHex = rgbToHex(rgb!.r, rgb!.g, rgb!.b);
      expect(resultHex).toBe(originalHex);
    });
  });

  describe('checkerboardStyle', () => {
    it('returns an object with background properties', () => {
      const style = checkerboardStyle();
      expect(style).toHaveProperty('backgroundImage');
      expect(style).toHaveProperty('backgroundSize');
      expect(style).toHaveProperty('backgroundPosition');
    });

    it('uses custom size parameter', () => {
      const style = checkerboardStyle(16);
      expect(style.backgroundSize).toContain('16px');
    });
  });
});
